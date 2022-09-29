module Main exposing (main)

import AStar.Generalised
import Angle
import Browser
import Browser.Events
import Camera3d
import Color exposing (Color)
import Cylinder3d exposing (Cylinder3d)
import Dict
import Direction3d
import Ecs
import Ecs.Component
import Ecs.Config
import Ecs.Entity
import Ecs.System
import Hexagons.Hex exposing (Direction(..), Hex(..))
import Hexagons.Layout
import Hexagons.Map
import Html
import Length exposing (Meters)
import Pixels
import Point3d
import Random exposing (Seed)
import Random.List
import Scene3d
import Scene3d.Material
import Set exposing (Set)
import Sphere3d exposing (Sphere3d)
import Vector3d
import Viewpoint3d


main : Program () World Msg
main =
    Browser.document
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }


ecsConfigSpec : Ecs.Config.Spec World
ecsConfigSpec =
    { get = .ecsConfig
    , set = \config world -> { world | ecsConfig = config }
    }


positionSpec : Ecs.Component.Spec Hex { world | positionComp : Ecs.Component Hex }
positionSpec =
    { get = .positionComp
    , set = \comp world -> { world | positionComp = comp }
    }



-- goalSpec : Ecs.Component.Spec Hex { world | goalComp : Ecs.Component Hex }
-- goalSpec =
--     { get = .goalComp
--     , set = \comp world -> { world | goalComp = comp }
--     }


aiSpec : Ecs.Component.Spec AI { world | aiComp : Ecs.Component AI }
aiSpec =
    { get = .aiComp
    , set = \comp world -> { world | aiComp = comp }
    }


type AI
    = BeeAI


graphicsSpec : Ecs.Component.Spec Graphics { world | graphicsComp : Ecs.Component Graphics }
graphicsSpec =
    { get = .graphicsComp
    , set = \comp world -> { world | graphicsComp = comp }
    }


type Graphics
    = BeeG Color (Sphere3d Meters WorldSpace)
    | FlowerG Color (Cylinder3d Meters WorldSpace)


type alias World =
    { ecsConfig : Ecs.Config
    , seed : Seed
    , time : Float
    , board : Hexagons.Map.Map
    , positionComp : Ecs.Component Hex
    , goalComp : Ecs.Component Hex
    , aiComp : Ecs.Component AI
    , graphicsComp : Ecs.Component Graphics
    }


type WorldSpace
    = WorldSpace Never


init : () -> ( World, Cmd Msg )
init () =
    ( { ecsConfig = Ecs.Config.init
      , seed = Random.initialSeed 0
      , time = 0
      , board =
            (hexOrigin
                :: Hexagons.Layout.drawCircle hexOrigin 1
                ++ Hexagons.Layout.drawCircle hexOrigin 2
                ++ Hexagons.Layout.drawCircle hexOrigin 3
            )
                |> List.map (\hex -> ( Hexagons.Map.hashHex hex, hex ))
                |> Dict.fromList
      , positionComp = Ecs.Component.empty
      , goalComp = Ecs.Component.empty
      , aiComp = Ecs.Component.empty
      , graphicsComp = Ecs.Component.empty
      }
        |> createBeeAt hexOrigin
        |> createBeeAt hexOrigin
        |> createFlowerAt hexOrigin Color.red
    , Cmd.none
    )


createBeeAt : Hex -> World -> World
createBeeAt startPos world =
    world
        |> Ecs.Entity.create ecsConfigSpec
        |> Ecs.Entity.with ( positionSpec, startPos )
        |> Ecs.Entity.with ( aiSpec, BeeAI )
        |> Ecs.Entity.with
            ( graphicsSpec
            , BeeG Color.lightBrown
                (Sphere3d.atPoint (Point3d.meters 0 0 1)
                    (Length.meters 0.25)
                )
            )
        |> Tuple.second


createFlowerAt : Hex -> Color -> World -> World
createFlowerAt startPos color world =
    world
        |> Ecs.Entity.create ecsConfigSpec
        |> Ecs.Entity.with ( positionSpec, startPos )
        |> Ecs.Entity.with
            ( graphicsSpec
            , FlowerG color
                (Cylinder3d.centeredOn (Point3d.meters 0 0 0.5)
                    Direction3d.positiveZ
                    { radius = Length.meters 0.5
                    , length = Length.meters 0.25
                    }
                )
            )
        |> Tuple.second


hexOrigin : Hex
hexOrigin =
    IntCubeHex ( 0, 0, 0 )


subscriptions : World -> Sub Msg
subscriptions _ =
    Browser.Events.onAnimationFrameDelta Tick


type Msg
    = NoOp
    | Tick Float


update : Msg -> World -> ( World, Cmd Msg )
update msg world =
    case msg of
        NoOp ->
            ( world, Cmd.none )

        Tick deltaMs ->
            let
                totalTime =
                    world.time + deltaMs

                ticksToRun =
                    floor (totalTime / tickTime)

                remainingTime =
                    totalTime - toFloat ticksToRun * tickTime
            in
            ( runTicks ticksToRun { world | time = remainingTime }
            , Cmd.none
            )


runTicks : Int -> World -> World
runTicks ticksToRun world =
    if ticksToRun < 1 then
        world

    else
        runTicks (ticksToRun - 1)
            (world
                |> navigate
                |> giveGoals
                |> spawnFlower
            )


tickTime =
    250


spawnFlower : Ecs.System.System World
spawnFlower world =
    let
        flowerCount =
            Ecs.System.foldl2
                (\_ graphics total ->
                    case graphics of
                        FlowerG _ _ ->
                            total + 1

                        _ ->
                            total
                )
                world.positionComp
                world.graphicsComp
                0
    in
    if flowerCount > 10 then
        world

    else
        let
            ( ( pos, color ), seed ) =
                Random.step
                    (Random.map2 Tuple.pair
                        (world.board
                            |> Dict.values
                            |> Random.List.choose
                            |> Random.map Tuple.first
                        )
                        (Random.uniform Color.red [ Color.blue ])
                    )
                    world.seed
        in
        case pos of
            Just position ->
                { world | seed = seed }
                    |> createFlowerAt position color

            Nothing ->
                { world | seed = seed }


navigate : Ecs.System.System World
navigate world =
    Ecs.System.indexedFoldl2
        (\entity position goal w ->
            if position == goal then
                { w | goalComp = Ecs.Component.remove entity w.goalComp }

            else
                let
                    path =
                        AStar.Generalised.findPath
                            hexCost
                            (hexNeighbors w.board)
                            (Hexagons.Map.hashHex position)
                            (Hexagons.Map.hashHex goal)
                in
                case path of
                    Just (next :: _) ->
                        let
                            nextPos : Hex
                            nextPos =
                                IntCubeHex next
                        in
                        if nextPos == goal then
                            { w | goalComp = Ecs.Component.remove entity w.goalComp }

                        else
                            { w | positionComp = Ecs.Component.set entity nextPos w.positionComp }

                    _ ->
                        w
        )
        world.positionComp
        world.goalComp
        world


hexCost : Hexagons.Map.Hash -> Hexagons.Map.Hash -> Float
hexCost from to =
    let
        fromHex : Hex
        fromHex =
            IntCubeHex from

        toHex : Hex
        toHex =
            IntCubeHex to
    in
    Hexagons.Hex.distance fromHex toHex
        |> toFloat


hexNeighbors : Hexagons.Map.Map -> Hexagons.Map.Hash -> Set Hexagons.Map.Hash
hexNeighbors board hash =
    let
        hex : Hex
        hex =
            IntCubeHex hash
    in
    [ NE, E, SE, SW, W, NW ]
        |> List.filterMap
            (\dir ->
                let
                    neighbor =
                        Hexagons.Hex.neighbor hex dir
                            |> Hexagons.Map.hashHex
                in
                case Dict.get neighbor board of
                    Nothing ->
                        Nothing

                    Just _ ->
                        Just neighbor
            )
        |> Set.fromList


giveGoals : Ecs.System.System World
giveGoals world =
    let
        needGoals : List Ecs.Entity
        needGoals =
            Ecs.System.indexedFoldl2
                (\entity _ ai result ->
                    case Ecs.Component.get entity world.goalComp of
                        Nothing ->
                            entity :: result

                        Just _ ->
                            result
                )
                world.positionComp
                world.aiComp
                []
    in
    needGoals
        |> List.foldl
            (\entity w ->
                let
                    ( goal, nextSeed ) =
                        Random.step
                            (w.board
                                |> Dict.values
                                |> Random.List.choose
                                |> Random.map Tuple.first
                            )
                            w.seed
                in
                { w
                    | goalComp =
                        case goal of
                            Nothing ->
                                w.goalComp

                            Just g ->
                                Ecs.Component.set entity g w.goalComp
                    , seed = nextSeed
                }
            )
            world


view : World -> Browser.Document Msg
view world =
    { title = "Bees!!"
    , body =
        [ Html.text "Bees!!"
        , Scene3d.sunny
            { upDirection = Direction3d.positiveZ
            , sunlightDirection = Direction3d.negativeZ
            , shadows = True
            , dimensions = ( Pixels.int 800, Pixels.int 600 )
            , camera =
                Camera3d.perspective
                    { viewpoint =
                        Viewpoint3d.lookAt
                            { eyePoint = Point3d.meters 2 0 8
                            , focalPoint = Point3d.origin
                            , upDirection = Direction3d.positiveZ
                            }
                    , verticalFieldOfView = Angle.degrees 90
                    }
            , clipDepth = Length.meters 0.001
            , background = Scene3d.backgroundColor Color.black
            , entities =
                Ecs.System.foldl2
                    (\pos graphics entities ->
                        let
                            ( x, y ) =
                                Hexagons.Layout.hexToPoint
                                    { orientation = Hexagons.Layout.orientationLayoutPointy
                                    , size = ( 1, 1 )
                                    , origin = ( 0, 0 )
                                    }
                                    pos

                            graphicsEntity =
                                case graphics of
                                    BeeG c s ->
                                        Scene3d.sphereWithShadow
                                            (Scene3d.Material.matte c)
                                            (s |> Sphere3d.translateBy (Vector3d.meters x y 0))

                                    FlowerG c s ->
                                        Scene3d.cylinderWithShadow
                                            (Scene3d.Material.matte c)
                                            (s |> Cylinder3d.translateBy (Vector3d.meters x y 0))
                        in
                        graphicsEntity :: entities
                    )
                    world.positionComp
                    world.graphicsComp
                    []
                    ++ (world.board
                            |> Dict.values
                            |> List.map
                                (Hexagons.Layout.hexToPoint
                                    { orientation = Hexagons.Layout.orientationLayoutPointy
                                    , size = ( 1, 1 )
                                    , origin = ( 0, 0 )
                                    }
                                )
                            |> List.map
                                (\( x, y ) ->
                                    Scene3d.cylinderWithShadow
                                        (Scene3d.Material.matte Color.yellow)
                                        (Cylinder3d.centeredOn (Point3d.meters x y 0)
                                            Direction3d.positiveZ
                                            { radius = Length.meters 0.85
                                            , length = Length.meters 0.25
                                            }
                                        )
                                )
                       )
            }
        ]
    }
