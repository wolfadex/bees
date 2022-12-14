module Main exposing (main)

import AStar.Generalised
import Angle
import Axis3d
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
import Float.Extra
import Frame3d
import Hexagons.Hex exposing (Direction(..), Hex(..))
import Hexagons.Layout
import Hexagons.Map
import Html exposing (Html)
import Html.Attributes
import Http
import Length exposing (Length, Meters)
import Obj.Decode
import Pixels
import Point3d exposing (Point3d)
import Quantity exposing (Unitless)
import Random exposing (Seed)
import Random.List
import Scene3d
import Scene3d.Material
import Scene3d.Mesh
import Set exposing (Set)
import Task
import TriangularMesh exposing (TriangularMesh)
import Vector3d exposing (Vector3d)
import Viewpoint3d


main : Program () Model Msg
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


animatedPositionSpec : Ecs.Component.Spec ( Hex, Pnt ) { world | animatedPositionComp : Ecs.Component ( Hex, Pnt ) }
animatedPositionSpec =
    { get = .animatedPositionComp
    , set = \comp world -> { world | animatedPositionComp = comp }
    }


type alias Pnt =
    ( Float, Float )



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


flowerSpec : Ecs.Component.Spec Flower { world | flowerComp : Ecs.Component Flower }
flowerSpec =
    { get = .flowerComp
    , set = \comp world -> { world | flowerComp = comp }
    }


type Flower
    = Flower


hiveSpec : Ecs.Component.Spec Hive { world | hiveComp : Ecs.Component Hive }
hiveSpec =
    { get = .hiveComp
    , set = \comp world -> { world | hiveComp = comp }
    }


type Hive
    = Hive


graphicsSpec : Ecs.Component.Spec Graphics { world | graphicsComp : Ecs.Component Graphics }
graphicsSpec =
    { get = .graphicsComp
    , set = \comp world -> { world | graphicsComp = comp }
    }


type Graphics
    = BeeG
    | FlowerG Color (Cylinder3d Meters WorldSpace)
    | HiveG


pollenSpec : Ecs.Component.Spec Int { world | pollenComp : Ecs.Component Int }
pollenSpec =
    { get = .pollenComp
    , set = \comp world -> { world | pollenComp = comp }
    }


type Model
    = Loading
    | Loaded World
    | FailedToLoad String


type alias World =
    { ecsConfig : Ecs.Config
    , seed : Seed
    , time : Float
    , board : Hexagons.Map.Map
    , hive : Maybe Ecs.Entity
    , hiveMesh : Scene3d.Entity WorldSpace
    , beeMesh : Scene3d.Entity WorldSpace

    -- Components
    , positionComp : Ecs.Component Hex
    , animatedPositionComp : Ecs.Component ( Hex, Pnt )
    , goalComp : Ecs.Component Hex
    , aiComp : Ecs.Component AI
    , graphicsComp : Ecs.Component Graphics
    , pollenComp : Ecs.Component Int
    , flowerComp : Ecs.Component Flower
    , hiveComp : Ecs.Component Hive
    }


type WorldSpace
    = WorldSpace Never


init : () -> ( Model, Cmd Msg )
init () =
    ( Loading
    , Task.map2 Tuple.pair
        (getMesh "hive")
        (getMesh "bee")
        |> Task.attempt GotMesh
    )


getMesh : String -> Task.Task Http.Error (TriangularMesh { position : Point3d Meters coordinates, normal : Vector3d Unitless coordinates })
getMesh meshName =
    Http.task
        { method = "GET"
        , headers = []
        , url = "assets/" ++ meshName ++ ".obj"
        , body = Http.emptyBody
        , resolver =
            Obj.Decode.facesIn Frame3d.atOrigin
                |> objResolver Length.meters
                |> Http.stringResolver
        , timeout = Nothing
        }


objResolver : (Float -> Length) -> Obj.Decode.Decoder a -> Http.Response String -> Result Http.Error a
objResolver toLength decoder response =
    case response of
        Http.BadUrl_ url ->
            Err (Http.BadUrl url)

        Http.Timeout_ ->
            Err Http.Timeout

        Http.NetworkError_ ->
            Err Http.NetworkError

        Http.BadStatus_ metadata _ ->
            Err (Http.BadStatus metadata.statusCode)

        Http.GoodStatus_ _ body ->
            case Obj.Decode.decodeString toLength decoder body of
                Ok a ->
                    Ok a

                Err err ->
                    Err (Http.BadBody ("Failed to decode with: " ++ err))


initWorld : Scene3d.Entity WorldSpace -> Scene3d.Entity WorldSpace -> World
initWorld hiveMesh beeMesh =
    let
        baseWorld =
            { ecsConfig = Ecs.Config.init
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
            , hive = Nothing
            , hiveMesh = hiveMesh
            , beeMesh = beeMesh

            -- Components
            , positionComp = Ecs.Component.empty
            , animatedPositionComp = Ecs.Component.empty
            , goalComp = Ecs.Component.empty
            , aiComp = Ecs.Component.empty
            , graphicsComp = Ecs.Component.empty
            , pollenComp = Ecs.Component.empty
            , flowerComp = Ecs.Component.empty
            , hiveComp = Ecs.Component.empty
            }
                |> createBee hexOrigin
                |> createBee hexOrigin

        ( hive, worldWithHive ) =
            baseWorld
                |> Ecs.Entity.create ecsConfigSpec
                |> Ecs.Entity.with ( positionSpec, hexOrigin )
                |> Ecs.Entity.with ( hiveSpec, Hive )
                |> Ecs.Entity.with ( pollenSpec, 0 )
                |> Ecs.Entity.with ( graphicsSpec, HiveG )
    in
    { worldWithHive | hive = Just hive }


createBee : Hex -> World -> World
createBee startPos world =
    world
        |> Ecs.Entity.create ecsConfigSpec
        |> Ecs.Entity.with ( positionSpec, startPos )
        |> Ecs.Entity.with ( animatedPositionSpec, ( startPos, ( 0, 0 ) ) )
        |> Ecs.Entity.with ( aiSpec, BeeAI )
        |> Ecs.Entity.with ( pollenSpec, 0 )
        |> Ecs.Entity.with ( graphicsSpec, BeeG )
        |> Tuple.second


createFlower :
    Hex
    -> Color
    ->
        { x : Float
        , y : Float
        , angle : Float
        , radius : Float
        }
    -> World
    -> World
createFlower startPos color offsets world =
    world
        |> Ecs.Entity.create ecsConfigSpec
        |> Ecs.Entity.with ( positionSpec, startPos )
        |> Ecs.Entity.with ( pollenSpec, 10 )
        |> Ecs.Entity.with ( flowerSpec, Flower )
        |> Ecs.Entity.with
            ( graphicsSpec
            , FlowerG color
                (Cylinder3d.centeredOn (Point3d.meters 0 0 0.5)
                    Direction3d.positiveZ
                    { radius = Length.meters offsets.radius
                    , length = Length.meters 0.1
                    }
                    |> Cylinder3d.translateBy (Vector3d.meters offsets.x offsets.y 0)
                    |> Cylinder3d.rotateAround Axis3d.x (Angle.degrees offsets.angle)
                )
            )
        |> Tuple.second


removeFlower : Ecs.Entity -> World -> World
removeFlower entity world =
    ( entity, world )
        |> Ecs.Entity.remove positionSpec
        |> Ecs.Entity.remove pollenSpec
        |> Ecs.Entity.remove flowerSpec
        |> Ecs.Entity.remove graphicsSpec
        |> Ecs.Entity.delete ecsConfigSpec
        |> Tuple.second


hexOrigin : Hex
hexOrigin =
    IntCubeHex ( 0, 0, 0 )


subscriptions : Model -> Sub Msg
subscriptions model =
    case model of
        Loading ->
            Sub.none

        FailedToLoad _ ->
            Sub.none

        Loaded _ ->
            Browser.Events.onAnimationFrameDelta Tick


type Msg
    = Tick Float
    | GotMesh (Result Http.Error ( CustomMesh, CustomMesh ))


type alias CustomMesh =
    TriangularMesh { position : Point3d Meters WorldSpace, normal : Vector3d Unitless WorldSpace }


errorToString : Http.Error -> String
errorToString err =
    case err of
        Http.BadUrl url ->
            "BadUrl: " ++ url

        Http.Timeout ->
            "Timeout"

        Http.NetworkError ->
            "NetworkError"

        Http.BadStatus status ->
            "BadStatus: " ++ String.fromInt status

        Http.BadBody body ->
            "BadBody: " ++ body


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case ( msg, model ) of
        ( GotMesh (Err err), Loading ) ->
            ( FailedToLoad (errorToString err), Cmd.none )

        ( GotMesh (Ok ( hiveTris, beeTris )), Loading ) ->
            let
                hiveMeshUniform : Scene3d.Mesh.Uniform WorldSpace
                hiveMeshUniform =
                    Scene3d.Mesh.indexedFaces hiveTris

                hiveMesh : Scene3d.Entity WorldSpace
                hiveMesh =
                    Scene3d.meshWithShadow
                        (Scene3d.Material.matte Color.yellow)
                        hiveMeshUniform
                        (Scene3d.Mesh.shadow hiveMeshUniform)

                beeMeshUniform : Scene3d.Mesh.Uniform WorldSpace
                beeMeshUniform =
                    Scene3d.Mesh.indexedFaces beeTris

                beeShadow : Scene3d.Mesh.Shadow WorldSpace
                beeShadow =
                    Scene3d.Mesh.shadow hiveMeshUniform

                beeMesh : Scene3d.Entity WorldSpace
                beeMesh =
                    Scene3d.meshWithShadow
                        (Scene3d.Material.matte Color.yellow)
                        beeMeshUniform
                        beeShadow
            in
            ( Loaded (initWorld hiveMesh beeMesh), Cmd.none )

        ( Tick deltaMs, Loaded world ) ->
            let
                totalTime =
                    world.time + deltaMs

                ticksToRun =
                    floor (totalTime / tickTime)

                remainingTime =
                    totalTime - toFloat ticksToRun * tickTime

                interpolateDist =
                    min 1 (totalTime / tickTime)
            in
            ( { world | time = remainingTime }
                |> runAnimation interpolateDist
                |> runTicks ticksToRun
                |> Loaded
            , Cmd.none
            )

        _ ->
            ( model, Cmd.none )


runAnimation : Float -> World -> World
runAnimation t =
    Ecs.System.map2
        (\( currentPos, setPos ) ( ( nextPos, _ ), setAnimatedPosition ) ->
            let
                ( x, y ) =
                    gameHexToPoint
                        nextPos

                ( px, py ) =
                    gameHexToPoint
                        currentPos
            in
            if t >= 1 then
                setPos nextPos

            else
                setAnimatedPosition
                    ( nextPos
                    , ( Float.Extra.interpolateFrom px x t
                      , Float.Extra.interpolateFrom py y t
                      )
                    )
        )
        positionSpec
        animatedPositionSpec


gameHexToPoint : Hex -> Pnt
gameHexToPoint =
    Hexagons.Layout.hexToPoint
        { orientation = Hexagons.Layout.orientationLayoutPointy
        , size = ( 1, 1 )
        , origin = ( 0, 0 )
        }


runTicks : Int -> World -> World
runTicks ticksToRun world =
    if ticksToRun < 1 then
        world

    else
        runTicks (ticksToRun - 1)
            (world
                |> spawnFlower
                |> navigate
                |> assignGoal
                |> collectPollen
                |> spawnBees
                |> givePollen
            )


tickTime =
    1000


spawnBees : Ecs.System.System World
spawnBees world =
    case world.hive of
        Nothing ->
            world

        Just hive ->
            case Ecs.Component.get hive world.pollenComp of
                Nothing ->
                    world

                Just pollenCount ->
                    if pollenCount >= 1000 then
                        { world
                            | pollenComp = Ecs.Component.update hive (\p -> p - 1000) world.pollenComp
                        }
                            |> createBee hexOrigin

                    else
                        world


givePollen : Ecs.System.System World
givePollen world =
    Ecs.System.indexedFoldl3
        (\entity ai position _ w ->
            case ai of
                BeeAI ->
                    if position == hexOrigin then
                        case w.hive of
                            Nothing ->
                                w

                            Just hive ->
                                case Ecs.Component.get entity w.pollenComp of
                                    Nothing ->
                                        w

                                    Just pol ->
                                        { w
                                            | pollenComp =
                                                w.pollenComp
                                                    |> Ecs.Component.set entity 0
                                                    |> Ecs.Component.update hive (\p -> p + pol)
                                        }

                    else
                        w
        )
        world.aiComp
        world.positionComp
        world.pollenComp
        world


collectPollen : Ecs.System.System World
collectPollen world =
    Ecs.System.indexedFoldl3
        (\entity ai position _ w ->
            case ai of
                BeeAI ->
                    let
                        maybeFlower =
                            Ecs.System.indexedFoldl3
                                (\flower flowerPos flowerPollen _ result ->
                                    if position == flowerPos && flowerPollen > 0 then
                                        Just ( flower, flowerPollen )

                                    else
                                        result
                                )
                                w.positionComp
                                w.pollenComp
                                w.flowerComp
                                Nothing
                    in
                    case maybeFlower of
                        Just ( flower, flowerPollen ) ->
                            { w
                                | pollenComp =
                                    w.pollenComp
                                        |> Ecs.Component.update entity (\p -> p + flowerPollen)
                            }
                                |> removeFlower flower

                        Nothing ->
                            w
        )
        world.aiComp
        world.positionComp
        world.pollenComp
        world


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
            ( ( pos, color, offsets ), seed ) =
                Random.step
                    (Random.map3 (\p c o -> ( p, c, o ))
                        (world.board
                            |> Dict.remove ( 0, 0, 0 )
                            |> Dict.values
                            |> Random.List.choose
                            |> Random.map Tuple.first
                        )
                        (Random.float 0 0.74
                            |> Random.map
                                (\h ->
                                    let
                                        hue =
                                            h + 0.0392156863
                                    in
                                    Color.hsl
                                        (if hue > 1 then
                                            hue - 1

                                         else
                                            hue
                                        )
                                        1
                                        0.5
                                )
                        )
                        (Random.map4
                            (\x y angle radius ->
                                { x = x
                                , y = y
                                , angle = angle
                                , radius = radius
                                }
                            )
                            (Random.float -0.35 0.35)
                            (Random.float -0.35 0.35)
                            (Random.float -5 5)
                            (Random.float 0.25 0.4)
                        )
                    )
                    world.seed
        in
        case pos of
            Just position ->
                { world | seed = seed }
                    |> createFlower position color offsets

            Nothing ->
                { world | seed = seed }


navigate : Ecs.System.System World
navigate world =
    Ecs.System.indexedFoldl3
        (\entity ( _, animatedPos ) currentPos goal w ->
            if currentPos == goal then
                { w | goalComp = Ecs.Component.remove entity w.goalComp }

            else
                let
                    path =
                        AStar.Generalised.findPath
                            hexCost
                            (hexNeighbors w.board)
                            (Hexagons.Map.hashHex currentPos)
                            (Hexagons.Map.hashHex goal)
                in
                case path of
                    Just (next :: _) ->
                        let
                            nextPosition : Hex
                            nextPosition =
                                IntCubeHex next
                        in
                        { w
                            | animatedPositionComp =
                                Ecs.Component.set entity
                                    ( nextPosition, animatedPos )
                                    w.animatedPositionComp

                            -- , positionComp =
                            --     Ecs.Component.set entity
                            --         currentPos
                            --         w.positionComp
                        }

                    _ ->
                        w
        )
        world.animatedPositionComp
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


assignGoal : Ecs.System.System World
assignGoal world =
    let
        needGoals : List ( Ecs.Entity, AI )
        needGoals =
            Ecs.System.indexedFoldl2
                (\entity _ ai result ->
                    case Ecs.Component.get entity world.goalComp of
                        Nothing ->
                            ( entity, ai ) :: result

                        Just _ ->
                            result
                )
                world.positionComp
                world.aiComp
                []
    in
    needGoals
        |> List.foldl
            (\( entity, ai ) w ->
                case ai of
                    BeeAI ->
                        case Ecs.Component.get entity w.pollenComp of
                            Nothing ->
                                w

                            Just pollen ->
                                if pollen >= 100 then
                                    { w | goalComp = Ecs.Component.set entity hexOrigin w.goalComp }

                                else
                                    let
                                        flowersWithPollen =
                                            Ecs.System.foldl3
                                                (\position _ pollenCount result ->
                                                    if pollenCount > 0 then
                                                        position :: result

                                                    else
                                                        result
                                                )
                                                w.positionComp
                                                w.flowerComp
                                                w.pollenComp
                                                []

                                        ( goal, nextSeed ) =
                                            Random.step
                                                (flowersWithPollen
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


view : Model -> Browser.Document Msg
view model =
    { title = "Bees!!"
    , body =
        case model of
            Loading ->
                [ Html.text "Loading..." ]

            Loaded world ->
                viewWorld world

            FailedToLoad err ->
                [ Html.text err ]
    }


viewWorld : World -> List (Html Msg)
viewWorld world =
    [ Scene3d.sunny
        { upDirection = Direction3d.positiveZ
        , sunlightDirection = Direction3d.negativeZ
        , shadows = True
        , dimensions = ( Pixels.int 800, Pixels.int 600 )
        , camera =
            -- Camera3d.perspective
            --     { viewpoint =
            --         Viewpoint3d.lookAt
            --             { eyePoint = Point3d.meters 0 -5 5
            --             , focalPoint = Point3d.origin
            --             , upDirection = Direction3d.positiveZ
            --             }
            --     , verticalFieldOfView = Angle.degrees 90
            --     }
            Camera3d.orthographic
                { viewpoint =
                    Viewpoint3d.lookAt
                        { eyePoint = Point3d.meters 0 -5 5
                        , focalPoint = Point3d.origin
                        , upDirection = Direction3d.positiveZ
                        }
                , viewportHeight = Length.meters 12
                }
        , clipDepth = Length.meters 0.001
        , background = Scene3d.backgroundColor Color.black
        , entities =
            Scene3d.cylinderWithShadow
                (Scene3d.Material.matte Color.green)
                (Cylinder3d.centeredOn (Point3d.meters 0 0 -1.5)
                    Direction3d.positiveZ
                    { radius = Length.meters 7
                    , length = Length.meters 3
                    }
                )
                :: Ecs.System.foldl2
                    (\pos graphics entities ->
                        let
                            ( x, y ) =
                                gameHexToPoint
                                    pos
                        in
                        case graphics of
                            BeeG ->
                                entities

                            FlowerG c s ->
                                Scene3d.cylinderWithShadow
                                    (Scene3d.Material.matte c)
                                    (s |> Cylinder3d.translateBy (Vector3d.meters x y 0))
                                    :: entities

                            HiveG ->
                                world.hiveMesh :: entities
                    )
                    world.positionComp
                    world.graphicsComp
                    []
                ++ Ecs.System.foldl2
                    (\( _, ( x, y ) ) graphics entities ->
                        case graphics of
                            BeeG ->
                                (world.beeMesh
                                    |> Scene3d.scaleAbout Point3d.origin 0.5
                                    |> Scene3d.translateBy (Vector3d.meters x y 1)
                                )
                                    :: entities

                            FlowerG _ _ ->
                                entities

                            HiveG ->
                                entities
                    )
                    world.animatedPositionComp
                    world.graphicsComp
                    []
        }
    , Ecs.System.foldl2
        (\pollen _ res ->
            Html.span
                []
                [ Html.text ("Hive pollen count: " ++ String.fromInt pollen) ]
                :: res
        )
        world.pollenComp
        world.hiveComp
        []
        |> Html.div
            [ Html.Attributes.style "display" "flex"
            , Html.Attributes.style "flex-direction" "column"
            ]
    , Ecs.System.foldl2
        (\pollen ai res ->
            case ai of
                BeeAI ->
                    Html.span
                        []
                        [ Html.text ("Bee pollen count: " ++ String.fromInt pollen) ]
                        :: res
        )
        world.pollenComp
        world.aiComp
        []
        |> Html.div
            [ Html.Attributes.style "display" "flex"
            , Html.Attributes.style "flex-direction" "column"
            ]
    ]
