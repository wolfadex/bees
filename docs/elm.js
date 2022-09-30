// elm-watch hot {"version":"1.0.2","webSocketPort":57312}
"use strict";
(() => {
  // node_modules/tiny-decoders/index.mjs
  function number(value) {
    if (typeof value !== "number") {
      throw new DecoderError({ tag: "number", got: value });
    }
    return value;
  }
  function string(value) {
    if (typeof value !== "string") {
      throw new DecoderError({ tag: "string", got: value });
    }
    return value;
  }
  function stringUnion(mapping) {
    return function stringUnionDecoder(value) {
      const str = string(value);
      if (!Object.prototype.hasOwnProperty.call(mapping, str)) {
        throw new DecoderError({
          tag: "unknown stringUnion variant",
          knownVariants: Object.keys(mapping),
          got: str
        });
      }
      return str;
    };
  }
  function unknownArray(value) {
    if (!Array.isArray(value)) {
      throw new DecoderError({ tag: "array", got: value });
    }
    return value;
  }
  function unknownRecord(value) {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      throw new DecoderError({ tag: "object", got: value });
    }
    return value;
  }
  function array(decoder) {
    return function arrayDecoder(value) {
      const arr = unknownArray(value);
      const result = [];
      for (let index = 0; index < arr.length; index++) {
        try {
          result.push(decoder(arr[index]));
        } catch (error) {
          throw DecoderError.at(error, index);
        }
      }
      return result;
    };
  }
  function record(decoder) {
    return function recordDecoder(value) {
      const object = unknownRecord(value);
      const keys = Object.keys(object);
      const result = {};
      for (const key of keys) {
        if (key === "__proto__") {
          continue;
        }
        try {
          result[key] = decoder(object[key]);
        } catch (error) {
          throw DecoderError.at(error, key);
        }
      }
      return result;
    };
  }
  function fields(callback, { exact = "allow extra", allow = "object" } = {}) {
    return function fieldsDecoder(value) {
      const object = allow === "array" ? unknownArray(value) : unknownRecord(value);
      const knownFields = /* @__PURE__ */ Object.create(null);
      function field(key, decoder) {
        try {
          const result2 = decoder(object[key]);
          knownFields[key] = null;
          return result2;
        } catch (error) {
          throw DecoderError.at(error, key);
        }
      }
      const result = callback(field, object);
      if (exact !== "allow extra") {
        const unknownFields = Object.keys(object).filter((key) => !Object.prototype.hasOwnProperty.call(knownFields, key));
        if (unknownFields.length > 0) {
          throw new DecoderError({
            tag: "exact fields",
            knownFields: Object.keys(knownFields),
            got: unknownFields
          });
        }
      }
      return result;
    };
  }
  function fieldsAuto(mapping, { exact = "allow extra" } = {}) {
    return function fieldsAutoDecoder(value) {
      const object = unknownRecord(value);
      const keys = Object.keys(mapping);
      const result = {};
      for (const key of keys) {
        if (key === "__proto__") {
          continue;
        }
        const decoder = mapping[key];
        try {
          result[key] = decoder(object[key]);
        } catch (error) {
          throw DecoderError.at(error, key);
        }
      }
      if (exact !== "allow extra") {
        const unknownFields = Object.keys(object).filter((key) => !Object.prototype.hasOwnProperty.call(mapping, key));
        if (unknownFields.length > 0) {
          throw new DecoderError({
            tag: "exact fields",
            knownFields: keys,
            got: unknownFields
          });
        }
      }
      return result;
    };
  }
  function fieldsUnion(key, mapping) {
    return fields(function fieldsUnionFields(field, object) {
      const tag = field(key, string);
      if (Object.prototype.hasOwnProperty.call(mapping, tag)) {
        const decoder = mapping[tag];
        return decoder(object);
      }
      throw new DecoderError({
        tag: "unknown fieldsUnion tag",
        knownTags: Object.keys(mapping),
        got: tag,
        key
      });
    });
  }
  function multi(mapping) {
    return function multiDecoder(value) {
      if (value === void 0) {
        if (mapping.undefined !== void 0) {
          return mapping.undefined(value);
        }
      } else if (value === null) {
        if (mapping.null !== void 0) {
          return mapping.null(value);
        }
      } else if (typeof value === "boolean") {
        if (mapping.boolean !== void 0) {
          return mapping.boolean(value);
        }
      } else if (typeof value === "number") {
        if (mapping.number !== void 0) {
          return mapping.number(value);
        }
      } else if (typeof value === "string") {
        if (mapping.string !== void 0) {
          return mapping.string(value);
        }
      } else if (Array.isArray(value)) {
        if (mapping.array !== void 0) {
          return mapping.array(value);
        }
      } else {
        if (mapping.object !== void 0) {
          return mapping.object(value);
        }
      }
      throw new DecoderError({
        tag: "unknown multi type",
        knownTypes: Object.keys(mapping),
        got: value
      });
    };
  }
  function chain(decoder, next) {
    return function chainDecoder(value) {
      return next(decoder(value));
    };
  }
  function formatDecoderErrorVariant(variant, options) {
    const formatGot = (value) => {
      const formatted = repr(value, options);
      return (options === null || options === void 0 ? void 0 : options.sensitive) === true ? `${formatted}
(Actual values are hidden in sensitive mode.)` : formatted;
    };
    const stringList = (strings) => strings.length === 0 ? "(none)" : strings.map((s) => JSON.stringify(s)).join(", ");
    const got = (message, value) => value === DecoderError.MISSING_VALUE ? message : `${message}
Got: ${formatGot(value)}`;
    switch (variant.tag) {
      case "boolean":
      case "number":
      case "string":
        return got(`Expected a ${variant.tag}`, variant.got);
      case "array":
      case "object":
        return got(`Expected an ${variant.tag}`, variant.got);
      case "unknown multi type":
        return `Expected one of these types: ${variant.knownTypes.length === 0 ? "never" : variant.knownTypes.join(", ")}
Got: ${formatGot(variant.got)}`;
      case "unknown fieldsUnion tag":
        return `Expected one of these tags: ${stringList(variant.knownTags)}
Got: ${formatGot(variant.got)}`;
      case "unknown stringUnion variant":
        return `Expected one of these variants: ${stringList(variant.knownVariants)}
Got: ${formatGot(variant.got)}`;
      case "exact fields":
        return `Expected only these fields: ${stringList(variant.knownFields)}
Found extra fields: ${formatGot(variant.got).replace(/^\[|\]$/g, "")}`;
      case "tuple size":
        return `Expected ${variant.expected} items
Got: ${variant.got}`;
      case "custom":
        return got(variant.message, variant.got);
    }
  }
  var DecoderError = class extends TypeError {
    constructor({ key, ...params }) {
      const variant = "tag" in params ? params : { tag: "custom", message: params.message, got: params.value };
      super(`${formatDecoderErrorVariant(
        variant,
        { sensitive: true }
      )}

For better error messages, see https://github.com/lydell/tiny-decoders#error-messages`);
      this.path = key === void 0 ? [] : [key];
      this.variant = variant;
      this.nullable = false;
      this.optional = false;
    }
    static at(error, key) {
      if (error instanceof DecoderError) {
        if (key !== void 0) {
          error.path.unshift(key);
        }
        return error;
      }
      return new DecoderError({
        tag: "custom",
        message: error instanceof Error ? error.message : String(error),
        got: DecoderError.MISSING_VALUE,
        key
      });
    }
    format(options) {
      const path = this.path.map((part) => `[${JSON.stringify(part)}]`).join("");
      const nullableString = this.nullable ? " (nullable)" : "";
      const optionalString = this.optional ? " (optional)" : "";
      const variant = formatDecoderErrorVariant(this.variant, options);
      return `At root${path}${nullableString}${optionalString}:
${variant}`;
    }
  };
  DecoderError.MISSING_VALUE = Symbol("DecoderError.MISSING_VALUE");
  function repr(value, { recurse = true, maxArrayChildren = 5, maxObjectChildren = 3, maxLength = 100, recurseMaxLength = 20, sensitive = false } = {}) {
    const type = typeof value;
    const toStringType = Object.prototype.toString.call(value).replace(/^\[object\s+(.+)\]$/, "$1");
    try {
      if (value == null || type === "number" || type === "boolean" || type === "symbol" || toStringType === "RegExp") {
        return sensitive ? toStringType.toLowerCase() : truncate(String(value), maxLength);
      }
      if (type === "string") {
        return sensitive ? type : truncate(JSON.stringify(value), maxLength);
      }
      if (typeof value === "function") {
        return `function ${truncate(JSON.stringify(value.name), maxLength)}`;
      }
      if (Array.isArray(value)) {
        const arr = value;
        if (!recurse && arr.length > 0) {
          return `${toStringType}(${arr.length})`;
        }
        const lastIndex = arr.length - 1;
        const items = [];
        const end = Math.min(maxArrayChildren - 1, lastIndex);
        for (let index = 0; index <= end; index++) {
          const item = index in arr ? repr(arr[index], {
            recurse: false,
            maxLength: recurseMaxLength,
            sensitive
          }) : "<empty>";
          items.push(item);
        }
        if (end < lastIndex) {
          items.push(`(${lastIndex - end} more)`);
        }
        return `[${items.join(", ")}]`;
      }
      if (toStringType === "Object") {
        const object = value;
        const keys = Object.keys(object);
        const { name } = object.constructor;
        if (!recurse && keys.length > 0) {
          return `${name}(${keys.length})`;
        }
        const numHidden = Math.max(0, keys.length - maxObjectChildren);
        const items = keys.slice(0, maxObjectChildren).map((key2) => `${truncate(JSON.stringify(key2), recurseMaxLength)}: ${repr(object[key2], {
          recurse: false,
          maxLength: recurseMaxLength,
          sensitive
        })}`).concat(numHidden > 0 ? `(${numHidden} more)` : []);
        const prefix = name === "Object" ? "" : `${name} `;
        return `${prefix}{${items.join(", ")}}`;
      }
      return toStringType;
    } catch (_error) {
      return toStringType;
    }
  }
  function truncate(str, maxLength) {
    const half = Math.floor(maxLength / 2);
    return str.length <= maxLength ? str : `${str.slice(0, half)}\u2026${str.slice(-half)}`;
  }

  // src/Helpers.ts
  function join(array2, separator) {
    return array2.join(separator);
  }
  function pad(number2) {
    return number2.toString().padStart(2, "0");
  }
  function formatDate(date) {
    return join(
      [pad(date.getFullYear()), pad(date.getMonth() + 1), pad(date.getDate())],
      "-"
    );
  }
  function formatTime(date) {
    return join(
      [pad(date.getHours()), pad(date.getMinutes()), pad(date.getSeconds())],
      ":"
    );
  }

  // src/TeaProgram.ts
  async function runTeaProgram(options) {
    return new Promise((resolve, reject) => {
      const [initialModel, initialCmds] = options.init;
      let model = initialModel;
      const msgQueue = [];
      let killed = false;
      const dispatch = (dispatchedMsg) => {
        if (killed) {
          return;
        }
        const alreadyRunning = msgQueue.length > 0;
        msgQueue.push(dispatchedMsg);
        if (alreadyRunning) {
          return;
        }
        for (const msg of msgQueue) {
          const [newModel, cmds] = options.update(msg, model);
          model = newModel;
          runCmds(cmds);
        }
        msgQueue.length = 0;
      };
      const runCmds = (cmds) => {
        for (const cmd of cmds) {
          options.runCmd(
            cmd,
            mutable,
            dispatch,
            (result) => {
              cmds.length = 0;
              killed = true;
              resolve(result);
            },
            (error) => {
              cmds.length = 0;
              killed = true;
              reject(error);
            }
          );
          if (killed) {
            break;
          }
        }
      };
      const mutable = options.initMutable(
        dispatch,
        (result) => {
          killed = true;
          resolve(result);
        },
        (error) => {
          killed = true;
          reject(error);
        }
      );
      runCmds(initialCmds);
    });
  }

  // src/Types.ts
  var CompilationMode = stringUnion({
    debug: null,
    standard: null,
    optimize: null
  });

  // client/WebSocketMessages.ts
  var FocusedTabAcknowledged = fieldsAuto({
    tag: () => "FocusedTabAcknowledged"
  });
  var StatusChanged = fieldsAuto({
    tag: () => "StatusChanged",
    status: fieldsUnion("tag", {
      AlreadyUpToDate: fieldsAuto({
        tag: () => "AlreadyUpToDate",
        compilationMode: CompilationMode
      }),
      Busy: fieldsAuto({
        tag: () => "Busy",
        compilationMode: CompilationMode
      }),
      CompileError: fieldsAuto({
        tag: () => "CompileError",
        compilationMode: CompilationMode
      }),
      ClientError: fieldsAuto({
        tag: () => "ClientError",
        message: string
      })
    })
  });
  var SuccessfullyCompiled = fieldsAuto({
    tag: () => "SuccessfullyCompiled",
    code: string,
    elmCompiledTimestamp: number,
    compilationMode: CompilationMode
  });
  var SuccessfullyCompiledButRecordFieldsChanged = fieldsAuto({
    tag: () => "SuccessfullyCompiledButRecordFieldsChanged"
  });
  var WebSocketToClientMessage = fieldsUnion("tag", {
    FocusedTabAcknowledged,
    StatusChanged,
    SuccessfullyCompiled,
    SuccessfullyCompiledButRecordFieldsChanged
  });
  var WebSocketToServerMessage = fieldsUnion("tag", {
    ChangedCompilationMode: fieldsAuto({
      tag: () => "ChangedCompilationMode",
      compilationMode: CompilationMode
    }),
    FocusedTab: fieldsAuto({
      tag: () => "FocusedTab"
    })
  });
  function decodeWebSocketToClientMessage(message) {
    if (message.startsWith("//")) {
      const newlineIndexRaw = message.indexOf("\n");
      const newlineIndex = newlineIndexRaw === -1 ? message.length : newlineIndexRaw;
      const jsonString = message.slice(2, newlineIndex);
      const parsed = SuccessfullyCompiled(JSON.parse(jsonString));
      return { ...parsed, code: message };
    } else {
      return WebSocketToClientMessage(JSON.parse(message));
    }
  }

  // client/client.ts
  window.__ELM_WATCH_MOCKED_TIMINGS ?? (window.__ELM_WATCH_MOCKED_TIMINGS = false);
  window.__ELM_WATCH_WEBSOCKET_TIMEOUT ?? (window.__ELM_WATCH_WEBSOCKET_TIMEOUT = 1e3);
  window.__ELM_WATCH_ON_INIT ?? (window.__ELM_WATCH_ON_INIT = () => {
  });
  window.__ELM_WATCH_ON_RENDER ?? (window.__ELM_WATCH_ON_RENDER = () => {
  });
  window.__ELM_WATCH_ON_REACHED_IDLE_STATE ?? (window.__ELM_WATCH_ON_REACHED_IDLE_STATE = () => {
  });
  window.__ELM_WATCH_RELOAD_STATUSES ?? (window.__ELM_WATCH_RELOAD_STATUSES = {});
  var RELOAD_MESSAGE_KEY = "__elmWatchReloadMessage";
  window.__ELM_WATCH_RELOAD_PAGE ?? (window.__ELM_WATCH_RELOAD_PAGE = (message) => {
    if (message !== void 0) {
      try {
        window.sessionStorage.setItem(RELOAD_MESSAGE_KEY, message);
      } catch {
      }
    }
    window.location.reload();
  });
  window.__ELM_WATCH_KILL_MATCHING ?? (window.__ELM_WATCH_KILL_MATCHING = () => Promise.resolve());
  window.__ELM_WATCH_DISCONNECT ?? (window.__ELM_WATCH_DISCONNECT = () => {
  });
  window.__ELM_WATCH_LOG_DEBUG ?? (window.__ELM_WATCH_LOG_DEBUG = console.debug);
  var VERSION = "1.0.2";
  var TARGET_NAME = "bee simulation";
  var INITIAL_ELM_COMPILED_TIMESTAMP = Number(
    "1664513168882"
  );
  var ORIGINAL_COMPILATION_MODE = "optimize";
  var WEBSOCKET_PORT = "57312";
  var CONTAINER_ID = "elm-watch";
  var DEBUG = String("false") === "true";
  var SEND_KEY_DO_NOT_USE_ALL_THE_TIME = Symbol(
    "This value is supposed to only be obtained via `Status`."
  );
  function logDebug(...args) {
    if (DEBUG) {
      window.__ELM_WATCH_LOG_DEBUG(...args);
    }
  }
  function run() {
    try {
      const message = window.sessionStorage.getItem(RELOAD_MESSAGE_KEY);
      if (message !== null) {
        console.info(message);
        window.sessionStorage.removeItem(RELOAD_MESSAGE_KEY);
      }
    } catch {
    }
    const container = getOrCreateContainer();
    const { shadowRoot } = container;
    if (shadowRoot === null) {
      throw new Error(
        `elm-watch: Cannot set up hot reload, because an element with ID ${CONTAINER_ID} exists, but \`.shadowRoot\` is null!`
      );
    }
    let root = shadowRoot.querySelector(`.${CLASS.root}`);
    if (root === null) {
      root = h(HTMLDivElement, { className: CLASS.root });
      shadowRoot.append(root);
    }
    const existingTargetRoot = Array.from(root.children).find(
      (element) => element.getAttribute("data-target") === TARGET_NAME
    );
    if (existingTargetRoot !== void 0) {
      return;
    }
    const targetRoot = createTargetRoot(TARGET_NAME);
    root.append(targetRoot);
    const getNow = () => new Date();
    runTeaProgram({
      initMutable: initMutable(getNow, targetRoot),
      init: init(getNow()),
      update: (msg, model) => {
        const [updatedModel, cmds] = update(msg, model);
        const modelChanged = updatedModel !== model;
        const newModel = modelChanged ? {
          ...updatedModel,
          previousStatusTag: model.status.tag
        } : model;
        const allCmds = modelChanged ? [
          ...cmds,
          {
            tag: "UpdateGlobalStatus",
            reloadStatus: statusToReloadStatus(newModel.status)
          },
          {
            tag: "Render",
            model: newModel,
            manageFocus: msg.tag === "UiMsg"
          }
        ] : cmds;
        logDebug(`${msg.tag} (${TARGET_NAME})`, msg, newModel, allCmds);
        return [newModel, allCmds];
      },
      runCmd: runCmd(getNow, targetRoot)
    }).catch((error) => {
      console.error("elm-watch: Unexpectedly exited with error:", error);
    });
  }
  function statusToReloadStatus(status) {
    switch (status.tag) {
      case "Busy":
      case "Connecting":
        return { tag: "MightWantToReload" };
      case "CompileError":
      case "EvalError":
      case "Idle":
      case "SleepingBeforeReconnect":
      case "UnexpectedError":
        return { tag: "NoReloadWanted" };
      case "WaitingForReload":
        return { tag: "ReloadRequested", reasons: status.reasons };
    }
  }
  function statusToStatusType(statusTag) {
    switch (statusTag) {
      case "Idle":
        return "Success";
      case "Busy":
      case "Connecting":
      case "SleepingBeforeReconnect":
      case "WaitingForReload":
        return "Waiting";
      case "CompileError":
      case "EvalError":
      case "UnexpectedError":
        return "Error";
    }
  }
  function getOrCreateContainer() {
    const existing = document.getElementById(CONTAINER_ID);
    if (existing !== null) {
      return existing;
    }
    const container = h(HTMLDivElement, { id: CONTAINER_ID });
    container.style.all = "unset";
    container.style.position = "fixed";
    container.style.zIndex = "2147483647";
    container.style.left = "-1px";
    container.style.bottom = "-1px";
    const shadowRoot = container.attachShadow({ mode: "open" });
    shadowRoot.append(h(HTMLStyleElement, {}, CSS));
    document.documentElement.append(container);
    return container;
  }
  function createTargetRoot(targetName) {
    return h(HTMLDivElement, {
      className: CLASS.targetRoot,
      attrs: { "data-target": targetName }
    });
  }
  var initMutable = (getNow, targetRoot) => (dispatch, resolvePromise) => {
    const removeListeners = [
      addEventListener(window, "focus", (event) => {
        if (event instanceof CustomEvent && event.detail !== TARGET_NAME) {
          return;
        }
        dispatch({ tag: "FocusedTab" });
      }),
      addEventListener(window, "visibilitychange", () => {
        if (document.visibilityState === "visible") {
          dispatch({ tag: "PageVisibilityChangedToVisible", date: getNow() });
        }
      })
    ];
    const mutable = {
      removeListeners: () => {
        for (const removeListener of removeListeners) {
          removeListener();
        }
      },
      webSocket: initWebSocket(
        getNow,
        INITIAL_ELM_COMPILED_TIMESTAMP,
        dispatch
      ),
      webSocketTimeoutId: void 0
    };
    window.__ELM_WATCH_RELOAD_STATUSES[TARGET_NAME] = {
      tag: "MightWantToReload"
    };
    const originalOnInit = window.__ELM_WATCH_ON_INIT;
    window.__ELM_WATCH_ON_INIT = () => {
      dispatch({ tag: "AppInit" });
      originalOnInit();
    };
    const originalKillMatching = window.__ELM_WATCH_KILL_MATCHING;
    window.__ELM_WATCH_KILL_MATCHING = (targetName) => new Promise((resolve, reject) => {
      if (targetName.test(TARGET_NAME) && mutable.webSocket.readyState !== WebSocket.CLOSED) {
        mutable.webSocket.addEventListener("close", () => {
          originalKillMatching(targetName).then(resolve).catch(reject);
        });
        mutable.removeListeners();
        mutable.webSocket.close();
        if (mutable.webSocketTimeoutId !== void 0) {
          clearTimeout(mutable.webSocketTimeoutId);
          mutable.webSocketTimeoutId = void 0;
        }
        targetRoot.remove();
        resolvePromise(void 0);
      } else {
        originalKillMatching(targetName).then(resolve).catch(reject);
      }
    });
    const originalDisconnect = window.__ELM_WATCH_DISCONNECT;
    window.__ELM_WATCH_DISCONNECT = (targetName) => {
      if (targetName.test(TARGET_NAME) && mutable.webSocket.readyState !== WebSocket.CLOSED) {
        mutable.webSocket.close();
      } else {
        originalDisconnect(targetName);
      }
    };
    return mutable;
  };
  function addEventListener(target, eventName, listener) {
    target.addEventListener(eventName, listener);
    return () => {
      target.removeEventListener(eventName, listener);
    };
  }
  function initWebSocket(getNow, elmCompiledTimestamp, dispatch) {
    const hostname = window.location.hostname === "" ? "localhost" : window.location.hostname;
    const url = new URL(`ws://${hostname}:${WEBSOCKET_PORT}/`);
    url.searchParams.set("elmWatchVersion", VERSION);
    url.searchParams.set("targetName", TARGET_NAME);
    url.searchParams.set("elmCompiledTimestamp", elmCompiledTimestamp.toString());
    const webSocket = new WebSocket(url);
    webSocket.addEventListener("open", () => {
      dispatch({ tag: "WebSocketConnected", date: getNow() });
    });
    webSocket.addEventListener("close", () => {
      dispatch({
        tag: "WebSocketClosed",
        date: getNow()
      });
    });
    webSocket.addEventListener("message", (event) => {
      dispatch({
        tag: "WebSocketMessageReceived",
        date: getNow(),
        data: event.data
      });
    });
    return webSocket;
  }
  var init = (date) => {
    const status = { tag: "Connecting", date, attemptNumber: 1 };
    const model = {
      status,
      previousStatusTag: status.tag,
      compilationMode: ORIGINAL_COMPILATION_MODE,
      elmCompiledTimestamp: INITIAL_ELM_COMPILED_TIMESTAMP,
      uiExpanded: false
    };
    return [model, [{ tag: "Render", model, manageFocus: false }]];
  };
  function update(msg, model) {
    switch (msg.tag) {
      case "AppInit":
        return [{ ...model }, []];
      case "EvalErrored":
        return [
          {
            ...model,
            status: { tag: "EvalError", date: msg.date },
            uiExpanded: true
          },
          [
            {
              tag: "TriggerReachedIdleState",
              reason: "EvalErrored"
            }
          ]
        ];
      case "EvalNeedsReload":
        return [
          {
            ...model,
            status: {
              tag: "WaitingForReload",
              date: msg.date,
              reasons: msg.reasons
            },
            uiExpanded: true
          },
          []
        ];
      case "EvalSucceeded":
        return [
          {
            ...model,
            status: {
              tag: "Idle",
              date: msg.date,
              sendKey: SEND_KEY_DO_NOT_USE_ALL_THE_TIME
            }
          },
          [
            {
              tag: "TriggerReachedIdleState",
              reason: "EvalSucceeded"
            }
          ]
        ];
      case "FocusedTab":
        return [
          statusToStatusType(model.status.tag) === "Error" ? { ...model } : model,
          model.status.tag === "Idle" ? [
            {
              tag: "SendMessage",
              message: { tag: "FocusedTab" },
              sendKey: model.status.sendKey
            },
            {
              tag: "WebSocketTimeoutBegin"
            }
          ] : []
        ];
      case "PageVisibilityChangedToVisible":
        return reconnect(model, msg.date, { force: true });
      case "SleepBeforeReconnectDone":
        return reconnect(model, msg.date, { force: false });
      case "UiMsg":
        return onUiMsg(msg.date, msg.msg, model);
      case "WebSocketClosed": {
        const attemptNumber = "attemptNumber" in model.status ? model.status.attemptNumber + 1 : 1;
        return [
          {
            ...model,
            status: {
              tag: "SleepingBeforeReconnect",
              date: msg.date,
              attemptNumber
            }
          },
          [{ tag: "SleepBeforeReconnect", attemptNumber }]
        ];
      }
      case "WebSocketConnected":
        return [{ ...model, status: { tag: "Busy", date: msg.date } }, []];
      case "WebSocketMessageReceived": {
        const result = parseWebSocketMessageData(msg.data);
        switch (result.tag) {
          case "Success":
            return onWebSocketToClientMessage(msg.date, result.message, model);
          case "Error":
            return [
              {
                ...model,
                status: {
                  tag: "UnexpectedError",
                  date: msg.date,
                  message: result.message
                },
                uiExpanded: true
              },
              []
            ];
        }
      }
    }
  }
  function onUiMsg(date, msg, model) {
    switch (msg.tag) {
      case "ChangedCompilationMode":
        return [
          {
            ...model,
            status: { tag: "Busy", date },
            compilationMode: msg.compilationMode
          },
          [
            {
              tag: "SendMessage",
              message: {
                tag: "ChangedCompilationMode",
                compilationMode: msg.compilationMode
              },
              sendKey: msg.sendKey
            }
          ]
        ];
      case "PressedChevron":
        return [{ ...model, uiExpanded: !model.uiExpanded }, []];
      case "PressedReconnectNow":
        return reconnect(model, date, { force: true });
    }
  }
  function onWebSocketToClientMessage(date, msg, model) {
    switch (msg.tag) {
      case "FocusedTabAcknowledged":
        return [model, [{ tag: "WebSocketTimeoutClear" }]];
      case "StatusChanged":
        return statusChanged(date, msg, model);
      case "SuccessfullyCompiled":
        return msg.compilationMode !== ORIGINAL_COMPILATION_MODE ? [
          {
            ...model,
            status: {
              tag: "WaitingForReload",
              date,
              reasons: ORIGINAL_COMPILATION_MODE === "proxy" ? [] : [
                `compilation mode changed from ${ORIGINAL_COMPILATION_MODE} to ${msg.compilationMode}.`
              ]
            },
            compilationMode: msg.compilationMode
          },
          []
        ] : [
          {
            ...model,
            compilationMode: msg.compilationMode,
            elmCompiledTimestamp: msg.elmCompiledTimestamp
          },
          [{ tag: "Eval", code: msg.code }]
        ];
      case "SuccessfullyCompiledButRecordFieldsChanged":
        return [
          {
            ...model,
            status: {
              tag: "WaitingForReload",
              date,
              reasons: [
                `record field mangling in optimize mode was different than last time.`
              ]
            }
          },
          []
        ];
    }
  }
  function statusChanged(date, { status }, model) {
    switch (status.tag) {
      case "AlreadyUpToDate":
        return [
          {
            ...model,
            status: {
              tag: "Idle",
              date,
              sendKey: SEND_KEY_DO_NOT_USE_ALL_THE_TIME
            },
            compilationMode: status.compilationMode
          },
          [
            {
              tag: "TriggerReachedIdleState",
              reason: "AlreadyUpToDate"
            }
          ]
        ];
      case "Busy":
        return [
          {
            ...model,
            status: {
              tag: "Busy",
              date
            },
            compilationMode: status.compilationMode
          },
          []
        ];
      case "ClientError":
        return [
          {
            ...model,
            status: { tag: "UnexpectedError", date, message: status.message },
            uiExpanded: true
          },
          [
            {
              tag: "TriggerReachedIdleState",
              reason: "ClientError"
            }
          ]
        ];
      case "CompileError":
        return [
          {
            ...model,
            status: {
              tag: "CompileError",
              date,
              sendKey: SEND_KEY_DO_NOT_USE_ALL_THE_TIME
            },
            compilationMode: status.compilationMode
          },
          [
            {
              tag: "TriggerReachedIdleState",
              reason: "CompileError"
            }
          ]
        ];
    }
  }
  function reconnect(model, date, { force }) {
    return model.status.tag === "SleepingBeforeReconnect" && (date.getTime() - model.status.date.getTime() >= retryWaitMs(model.status.attemptNumber) || force) ? [
      {
        ...model,
        status: {
          tag: "Connecting",
          date,
          attemptNumber: model.status.attemptNumber
        }
      },
      [
        {
          tag: "Reconnect",
          elmCompiledTimestamp: model.elmCompiledTimestamp
        }
      ]
    ] : [model, []];
  }
  function retryWaitMs(attemptNumber) {
    return Math.min(1e3 + 10 * attemptNumber ** 2, 1e3 * 60);
  }
  function printRetryWaitMs(attemptNumber) {
    return `${retryWaitMs(attemptNumber) / 1e3} seconds`;
  }
  var runCmd = (getNow, targetRoot) => (cmd, mutable, dispatch, _resolvePromise, rejectPromise) => {
    switch (cmd.tag) {
      case "Eval": {
        const f = new Function(cmd.code);
        try {
          f();
          dispatch({ tag: "EvalSucceeded", date: getNow() });
        } catch (unknownError) {
          if (unknownError instanceof Error && unknownError.message.startsWith("ELM_WATCH_RELOAD_NEEDED")) {
            dispatch({
              tag: "EvalNeedsReload",
              date: getNow(),
              reasons: unknownError.message.split("\n\n---\n\n").slice(1)
            });
          } else {
            void Promise.reject(unknownError);
            dispatch({ tag: "EvalErrored", date: getNow() });
          }
        }
        return;
      }
      case "Reconnect":
        mutable.webSocket = initWebSocket(
          getNow,
          cmd.elmCompiledTimestamp,
          dispatch
        );
        return;
      case "Render":
        render(
          getNow,
          targetRoot,
          dispatch,
          cmd.model,
          {
            version: VERSION,
            webSocketUrl: mutable.webSocket.url,
            targetName: TARGET_NAME,
            originalCompilationMode: ORIGINAL_COMPILATION_MODE,
            initializedElmAppsStatus: checkInitializedElmAppsStatus()
          },
          cmd.manageFocus
        );
        return;
      case "SendMessage":
        mutable.webSocket.send(JSON.stringify(cmd.message));
        return;
      case "SleepBeforeReconnect":
        setTimeout(() => {
          if (document.visibilityState === "visible") {
            dispatch({ tag: "SleepBeforeReconnectDone", date: getNow() });
          }
        }, retryWaitMs(cmd.attemptNumber));
        return;
      case "TriggerReachedIdleState":
        Promise.resolve().then(() => {
          window.__ELM_WATCH_ON_REACHED_IDLE_STATE(cmd.reason);
        }).catch(rejectPromise);
        return;
      case "UpdateGlobalStatus":
        window.__ELM_WATCH_RELOAD_STATUSES[TARGET_NAME] = cmd.reloadStatus;
        reloadPageIfNeeded();
        return;
      case "WebSocketTimeoutBegin":
        if (mutable.webSocketTimeoutId === void 0) {
          mutable.webSocketTimeoutId = setTimeout(() => {
            mutable.webSocketTimeoutId = void 0;
            mutable.webSocket.close();
            dispatch({
              tag: "WebSocketClosed",
              date: getNow()
            });
          }, window.__ELM_WATCH_WEBSOCKET_TIMEOUT);
        }
        return;
      case "WebSocketTimeoutClear":
        if (mutable.webSocketTimeoutId !== void 0) {
          clearTimeout(mutable.webSocketTimeoutId);
          mutable.webSocketTimeoutId = void 0;
        }
        return;
    }
  };
  function parseWebSocketMessageData(data) {
    try {
      return {
        tag: "Success",
        message: decodeWebSocketToClientMessage(string(data))
      };
    } catch (unknownError) {
      return {
        tag: "Error",
        message: `Failed to decode web socket message sent from the server:
${possiblyDecodeErrorToString(
          unknownError
        )}`
      };
    }
  }
  function possiblyDecodeErrorToString(unknownError) {
    return unknownError instanceof DecoderError ? unknownError.format() : unknownError instanceof Error ? unknownError.message : repr(unknownError);
  }
  function functionToNull(value) {
    return typeof value === "function" ? null : value;
  }
  var ProgramType = stringUnion({
    "Platform.worker": null,
    "Browser.sandbox": null,
    "Browser.element": null,
    "Browser.document": null,
    "Browser.application": null,
    Html: null
  });
  var ElmModule = chain(
    record(
      chain(
        functionToNull,
        multi({
          null: () => [],
          array: array(
            fields((field) => field("__elmWatchProgramType", ProgramType))
          ),
          object: (value) => ElmModule(value)
        })
      )
    ),
    (record2) => Object.values(record2).flat()
  );
  var ProgramTypes = fields((field) => field("Elm", ElmModule));
  function checkInitializedElmAppsStatus() {
    if (window.Elm !== void 0 && "__elmWatchProxy" in window.Elm) {
      return {
        tag: "DebuggerModeStatus",
        status: {
          tag: "Disabled",
          reason: noDebuggerYetReason
        }
      };
    }
    let programTypes;
    try {
      programTypes = ProgramTypes(window);
    } catch (unknownError) {
      return {
        tag: "DecodeError",
        message: possiblyDecodeErrorToString(unknownError)
      };
    }
    if (programTypes.length === 0) {
      return { tag: "NoProgramsAtAll" };
    }
    const noDebugger = programTypes.filter((programType) => {
      switch (programType) {
        case "Platform.worker":
        case "Html":
          return true;
        case "Browser.sandbox":
        case "Browser.element":
        case "Browser.document":
        case "Browser.application":
          return false;
      }
    });
    return {
      tag: "DebuggerModeStatus",
      status: noDebugger.length === programTypes.length ? {
        tag: "Disabled",
        reason: noDebuggerReason(new Set(noDebugger))
      } : { tag: "Enabled" }
    };
  }
  function reloadPageIfNeeded() {
    let shouldReload = false;
    const reasons = [];
    for (const [targetName, reloadStatus] of Object.entries(
      window.__ELM_WATCH_RELOAD_STATUSES
    )) {
      switch (reloadStatus.tag) {
        case "MightWantToReload":
          return;
        case "NoReloadWanted":
          break;
        case "ReloadRequested":
          shouldReload = true;
          if (reloadStatus.reasons.length > 0) {
            reasons.push([targetName, reloadStatus.reasons]);
          }
          break;
      }
    }
    if (!shouldReload) {
      return;
    }
    const first = reasons[0];
    const [separator, reasonString] = reasons.length === 1 && first !== void 0 && first[1].length === 1 ? [" ", `${first[1].join("")}
(target: ${first[0]})`] : [
      ":\n\n",
      reasons.map(
        ([targetName, subReasons]) => [
          targetName,
          ...subReasons.map((subReason) => `- ${subReason}`)
        ].join("\n")
      ).join("\n\n")
    ];
    const message = reasons.length === 0 ? void 0 : `elm-watch: I did a full page reload because${separator}${reasonString}`;
    window.__ELM_WATCH_RELOAD_STATUSES = {};
    window.__ELM_WATCH_RELOAD_PAGE(message);
  }
  function h(t, {
    attrs,
    localName,
    ...props
  }, ...children) {
    const element = document.createElement(
      localName ?? t.name.replace(/^HTML(\w+)Element$/, "$1").replace("Anchor", "a").replace("Paragraph", "p").replace(/^([DOU])List$/, "$1l").toLowerCase()
    );
    Object.assign(element, props);
    if (attrs !== void 0) {
      for (const [key, value] of Object.entries(attrs)) {
        element.setAttribute(key, value);
      }
    }
    for (const child of children) {
      if (child !== void 0) {
        element.append(
          typeof child === "string" ? document.createTextNode(child) : child
        );
      }
    }
    return element;
  }
  function render(getNow, targetRoot, dispatch, model, info, manageFocus) {
    targetRoot.classList.toggle(
      CLASS.targetRootBottomHalf,
      getIsPositionedInBottomHalf(targetRoot)
    );
    targetRoot.replaceChildren(
      view(
        (msg) => {
          dispatch({ tag: "UiMsg", date: getNow(), msg });
        },
        model,
        info,
        manageFocus
      )
    );
    const firstFocusableElement = targetRoot.querySelector(`button, [tabindex]`);
    if (manageFocus && firstFocusableElement instanceof HTMLElement) {
      firstFocusableElement.focus();
    }
    window.__ELM_WATCH_ON_RENDER(TARGET_NAME);
  }
  function getIsPositionedInBottomHalf(targetRoot) {
    const { top, height } = targetRoot.getBoundingClientRect();
    return top + height / 2 > window.innerHeight / 2;
  }
  var CLASS = {
    chevronButton: "chevronButton",
    compilationModeWithIcon: "compilationModeWithIcon",
    container: "container",
    debugModeIcon: "debugModeIcon",
    expandedUiContainer: "expandedUiContainer",
    flashError: "flashError",
    flashSuccess: "flashSuccess",
    root: "root",
    shortStatusContainer: "shortStatusContainer",
    targetName: "targetName",
    targetRoot: "targetRoot",
    targetRootBottomHalf: "targetRootBottomHalf"
  };
  function getStatusClass({
    statusType,
    statusTypeChanged,
    hasReceivedHotReload,
    uiRelatedUpdate
  }) {
    switch (statusType) {
      case "Success":
        return statusTypeChanged && hasReceivedHotReload ? CLASS.flashSuccess : void 0;
      case "Error":
        return uiRelatedUpdate ? void 0 : CLASS.flashError;
      case "Waiting":
        return void 0;
    }
  }
  var CSS = `
pre {
  margin: 0;
  white-space: pre-wrap;
  border-left: 0.25em solid var(--grey);
  padding-left: 0.5em;
}

input,
button,
select,
textarea {
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  letter-spacing: inherit;
  line-height: inherit;
  margin: 0;
}

fieldset {
  display: grid;
  gap: 0.25em;
  margin: 0;
  border: 1px solid var(--grey);
  padding: 0.25em 0.75em 0.5em;
}

fieldset:disabled {
  color: var(--grey);
}

p,
dd {
  margin: 0;
}

dl {
  display: grid;
  grid-template-columns: auto auto;
  gap: 0.25em 1em;
  margin: 0;
  white-space: nowrap;
}

dt {
  text-align: right;
  color: var(--grey);
}

time {
  display: inline-grid;
  overflow: hidden;
}

time::after {
  content: attr(data-format);
  visibility: hidden;
  height: 0;
}

.${CLASS.root} {
  --grey: #767676;
  display: flex;
  align-items: start;
  overflow: auto;
  max-height: 100vh;
  max-width: 100vw;
  color: black;
  font-family: system-ui;
}

.${CLASS.targetRootBottomHalf} {
  align-self: end;
}

.${CLASS.targetRoot} + .${CLASS.targetRoot} {
  margin-left: -1px;
}

.${CLASS.targetRoot}:only-of-type .${CLASS.debugModeIcon},
.${CLASS.targetRoot}:only-of-type .${CLASS.targetName} {
  display: none;
}

.${CLASS.container} {
  display: flex;
  flex-direction: column-reverse;
  background-color: white;
  border: 1px solid var(--grey);
}

.${CLASS.targetRootBottomHalf} .${CLASS.container} {
  flex-direction: column;
}

.${CLASS.expandedUiContainer} {
  padding: 0.75em 1em;
  display: grid;
  gap: 0.75em;
  outline: none;
}

.${CLASS.expandedUiContainer}:is(.length0, .length1) {
  grid-template-columns: min-content;
}

.${CLASS.expandedUiContainer} > dl {
  justify-self: start;
}

.${CLASS.expandedUiContainer} label {
  display: grid;
  grid-template-columns: min-content auto;
  align-items: center;
  gap: 0.25em;
}

.${CLASS.expandedUiContainer} label.Disabled {
  color: var(--grey);
}

.${CLASS.expandedUiContainer} label > small {
  grid-column: 2;
}

.${CLASS.compilationModeWithIcon} {
  display: flex;
  align-items: center;
  gap: 0.25em;
}

.${CLASS.shortStatusContainer} {
  line-height: 1;
  padding: 0.25em;
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 0.25em;
}

.${CLASS.flashError}::before,
.${CLASS.flashSuccess}::before {
  content: "";
  position: absolute;
  margin-top: 0.5em;
  margin-left: 0.5em;
  --size: min(500px, 100vmin);
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  animation: flash 0.7s 0.05s ease-out both;
  pointer-events: none;
}

.${CLASS.flashError}::before {
  background-color: #eb0000;
}

.${CLASS.flashSuccess}::before {
  background-color: #00b600;
}

@keyframes flash {
  from {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0.9;
  }

  to {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0;
  }
}

@keyframes nudge {
  from {
    opacity: 0;
  }

  to {
    opacity: 0.8;
  }
}

@media (prefers-reduced-motion: reduce) {
  .${CLASS.flashError}::before,
  .${CLASS.flashSuccess}::before {
    transform: translate(-50%, -50%);
    width: 2em;
    height: 2em;
    animation: nudge 0.25s ease-in-out 4 alternate forwards;
  }
}

.${CLASS.chevronButton} {
  appearance: none;
  border: none;
  border-radius: 0;
  background: none;
  padding: 0;
  cursor: pointer;
}
`;
  function view(dispatch, passedModel, info, manageFocus) {
    const model = window.__ELM_WATCH_MOCKED_TIMINGS ? {
      ...passedModel,
      status: {
        ...passedModel.status,
        date: new Date("2022-02-05T13:10:05Z")
      }
    } : passedModel;
    const statusData = viewStatus(
      dispatch,
      model.status,
      model.compilationMode,
      info
    );
    const statusType = statusToStatusType(model.status.tag);
    const statusTypeChanged = statusType !== statusToStatusType(model.previousStatusTag);
    const statusClass = getStatusClass({
      statusType,
      statusTypeChanged,
      hasReceivedHotReload: model.elmCompiledTimestamp !== INITIAL_ELM_COMPILED_TIMESTAMP,
      uiRelatedUpdate: manageFocus
    });
    return h(
      HTMLDivElement,
      { className: CLASS.container },
      model.uiExpanded ? viewExpandedUi(model.status, statusData, info) : void 0,
      h(
        HTMLDivElement,
        {
          className: CLASS.shortStatusContainer,
          onclick: () => {
            dispatch({ tag: "PressedChevron" });
          }
        },
        h(
          HTMLButtonElement,
          {
            className: CLASS.chevronButton,
            attrs: { "aria-expanded": model.uiExpanded.toString() }
          },
          icon(
            model.uiExpanded ? "\u25B2" : "\u25BC",
            model.uiExpanded ? "Collapse elm-watch" : "Expand elm-watch"
          )
        ),
        compilationModeIcon(model.compilationMode),
        icon(
          statusData.icon,
          statusData.status,
          statusClass === void 0 ? {} : {
            className: statusClass,
            onanimationend: (event) => {
              if (event.currentTarget instanceof HTMLElement) {
                event.currentTarget.classList.remove(statusClass);
              }
            }
          }
        ),
        h(
          HTMLTimeElement,
          { dateTime: model.status.date.toISOString() },
          formatTime(model.status.date)
        ),
        h(HTMLSpanElement, { className: CLASS.targetName }, TARGET_NAME)
      )
    );
  }
  function icon(emoji, alt, props) {
    return h(
      HTMLSpanElement,
      { attrs: { "aria-label": alt }, ...props },
      h(HTMLSpanElement, { attrs: { "aria-hidden": "true" } }, emoji)
    );
  }
  function viewExpandedUi(status, statusData, info) {
    const items = [
      ["target", info.targetName],
      ["elm-watch", info.version],
      ["web socket", new URL(info.webSocketUrl).origin],
      [
        "updated",
        h(
          HTMLTimeElement,
          {
            dateTime: status.date.toISOString(),
            attrs: { "data-format": "2044-04-30 04:44:44" }
          },
          `${formatDate(status.date)} ${formatTime(status.date)}`
        )
      ],
      ["status", statusData.status],
      ...statusData.dl
    ];
    return h(
      HTMLDivElement,
      {
        className: `${CLASS.expandedUiContainer} length${statusData.content.length}`,
        attrs: {
          tabindex: "-1"
        }
      },
      h(
        HTMLDListElement,
        {},
        ...items.flatMap(([key, value]) => [
          h(HTMLElement, { localName: "dt" }, key),
          h(HTMLElement, { localName: "dd" }, value)
        ])
      ),
      ...statusData.content
    );
  }
  function viewStatus(dispatch, status, compilationMode, info) {
    switch (status.tag) {
      case "Busy":
        return {
          icon: "\u23F3",
          status: "Waiting for compilation",
          dl: [],
          content: viewCompilationModeChooser({
            dispatch,
            sendKey: void 0,
            compilationMode,
            warnAboutCompilationModeMismatch: false,
            info
          })
        };
      case "CompileError":
        return {
          icon: "\u{1F6A8}",
          status: "Compilation error",
          dl: [],
          content: [
            ...viewCompilationModeChooser({
              dispatch,
              sendKey: status.sendKey,
              compilationMode,
              warnAboutCompilationModeMismatch: true,
              info
            }),
            h(
              HTMLParagraphElement,
              {},
              h(
                HTMLElement,
                { localName: "strong" },
                "Check the terminal to see errors!"
              )
            )
          ]
        };
      case "Connecting":
        return {
          icon: "\u{1F50C}",
          status: "Connecting",
          dl: [
            ["attempt", status.attemptNumber.toString()],
            ["sleep", printRetryWaitMs(status.attemptNumber)]
          ],
          content: [
            h(HTMLButtonElement, { disabled: true }, "Connecting web socket\u2026")
          ]
        };
      case "EvalError":
        return {
          icon: "\u26D4\uFE0F",
          status: "Eval error",
          dl: [],
          content: [
            h(
              HTMLParagraphElement,
              {},
              "Check the console in the browser developer tools to see errors!"
            )
          ]
        };
      case "Idle":
        return {
          icon: idleIcon(info.initializedElmAppsStatus),
          status: "Successfully compiled",
          dl: [],
          content: viewCompilationModeChooser({
            dispatch,
            sendKey: status.sendKey,
            compilationMode,
            warnAboutCompilationModeMismatch: true,
            info
          })
        };
      case "SleepingBeforeReconnect":
        return {
          icon: "\u{1F50C}",
          status: "Sleeping",
          dl: [
            ["attempt", status.attemptNumber.toString()],
            ["sleep", printRetryWaitMs(status.attemptNumber)]
          ],
          content: [
            h(
              HTMLButtonElement,
              {
                onclick: () => {
                  dispatch({ tag: "PressedReconnectNow" });
                }
              },
              "Reconnect web socket now"
            )
          ]
        };
      case "UnexpectedError":
        return {
          icon: "\u274C",
          status: "Unexpected error",
          dl: [],
          content: [
            h(
              HTMLParagraphElement,
              {},
              "I ran into an unexpected error! This is the error message:"
            ),
            h(HTMLPreElement, {}, status.message)
          ]
        };
      case "WaitingForReload":
        return {
          icon: "\u23F3",
          status: "Waiting for reload",
          dl: [],
          content: [
            h(
              HTMLParagraphElement,
              {},
              "Waiting for other targets to finish compiling\u2026"
            )
          ]
        };
    }
  }
  function idleIcon(status) {
    switch (status.tag) {
      case "DecodeError":
        return "\u274C";
      case "NoProgramsAtAll":
        return "\u2753";
      case "DebuggerModeStatus":
        return "\u2705";
    }
  }
  function compilationModeIcon(compilationMode) {
    switch (compilationMode) {
      case "proxy":
        return void 0;
      case "debug":
        return icon("\u{1F41B}", "Debug mode", { className: CLASS.debugModeIcon });
      case "standard":
        return void 0;
      case "optimize":
        return icon("\u{1F680}", "Optimize mode");
    }
  }
  var noDebuggerYetReason = "The Elm debugger isn't available at this point.";
  function noDebuggerReason(noDebuggerProgramTypes) {
    return `The Elm debugger isn't supported by ${humanList(
      Array.from(noDebuggerProgramTypes, (programType) => `\`${programType}\``),
      "and"
    )} programs.`;
  }
  function humanList(list, joinWord) {
    const { length } = list;
    return length <= 1 ? list.join("") : length === 2 ? list.join(` ${joinWord} `) : `${list.slice(0, length - 2).join(", ")}, ${list.slice(-2).join(` ${joinWord} `)}`;
  }
  function viewCompilationModeChooser({
    dispatch,
    sendKey,
    compilationMode: selectedMode,
    warnAboutCompilationModeMismatch,
    info
  }) {
    switch (info.initializedElmAppsStatus.tag) {
      case "DecodeError":
        return [
          h(
            HTMLParagraphElement,
            {},
            "window.Elm does not look like expected! This is the error message:"
          ),
          h(HTMLPreElement, {}, info.initializedElmAppsStatus.message)
        ];
      case "NoProgramsAtAll":
        return [
          h(
            HTMLParagraphElement,
            {},
            "It looks like no Elm apps were initialized by elm-watch. Check the console in the browser developer tools to see potential errors!"
          )
        ];
      case "DebuggerModeStatus": {
        const compilationModes = [
          {
            mode: "debug",
            name: "Debug",
            status: info.initializedElmAppsStatus.status
          },
          { mode: "standard", name: "Standard", status: { tag: "Enabled" } },
          { mode: "optimize", name: "Optimize", status: { tag: "Enabled" } }
        ];
        return [
          h(
            HTMLFieldSetElement,
            { disabled: sendKey === void 0 },
            h(HTMLLegendElement, {}, "Compilation mode"),
            ...compilationModes.map(({ mode, name, status }) => {
              const nameWithIcon = h(
                HTMLSpanElement,
                { className: CLASS.compilationModeWithIcon },
                name,
                mode === selectedMode ? compilationModeIcon(mode) : void 0
              );
              return h(
                HTMLLabelElement,
                { className: status.tag },
                h(HTMLInputElement, {
                  type: "radio",
                  name: `CompilationMode-${info.targetName}`,
                  value: mode,
                  checked: mode === selectedMode,
                  disabled: sendKey === void 0 || status.tag === "Disabled",
                  onchange: sendKey === void 0 ? void 0 : () => {
                    dispatch({
                      tag: "ChangedCompilationMode",
                      compilationMode: mode,
                      sendKey
                    });
                  }
                }),
                ...status.tag === "Enabled" ? [
                  nameWithIcon,
                  warnAboutCompilationModeMismatch && mode === selectedMode && selectedMode !== info.originalCompilationMode && info.originalCompilationMode !== "proxy" ? h(
                    HTMLElement,
                    { localName: "small" },
                    `Note: The code currently running is in ${ORIGINAL_COMPILATION_MODE} mode.`
                  ) : void 0
                ] : [
                  nameWithIcon,
                  h(HTMLElement, { localName: "small" }, status.reason)
                ]
              );
            })
          )
        ];
      }
    }
  }
  run();
})();
(function(scope){
'use strict';

var _Platform_effectManagers = {}, _Scheduler_enqueue; // added by elm-watch

function F(arity, fun, wrapper) {
  wrapper.a = arity;
  wrapper.f = fun;
  return wrapper;
}

function F2(fun) {
  return F(2, fun, function(a) { return function(b) { return fun(a,b); }; })
}
function F3(fun) {
  return F(3, fun, function(a) {
    return function(b) { return function(c) { return fun(a, b, c); }; };
  });
}
function F4(fun) {
  return F(4, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return fun(a, b, c, d); }; }; };
  });
}
function F5(fun) {
  return F(5, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return fun(a, b, c, d, e); }; }; }; };
  });
}
function F6(fun) {
  return F(6, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return fun(a, b, c, d, e, f); }; }; }; }; };
  });
}
function F7(fun) {
  return F(7, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return fun(a, b, c, d, e, f, g); }; }; }; }; }; };
  });
}
function F8(fun) {
  return F(8, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) {
    return fun(a, b, c, d, e, f, g, h); }; }; }; }; }; }; };
  });
}
function F9(fun) {
  return F(9, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) { return function(i) {
    return fun(a, b, c, d, e, f, g, h, i); }; }; }; }; }; }; }; };
  });
}

function A2(fun, a, b) {
  return fun.a === 2 ? fun.f(a, b) : fun(a)(b);
}
function A3(fun, a, b, c) {
  return fun.a === 3 ? fun.f(a, b, c) : fun(a)(b)(c);
}
function A4(fun, a, b, c, d) {
  return fun.a === 4 ? fun.f(a, b, c, d) : fun(a)(b)(c)(d);
}
function A5(fun, a, b, c, d, e) {
  return fun.a === 5 ? fun.f(a, b, c, d, e) : fun(a)(b)(c)(d)(e);
}
function A6(fun, a, b, c, d, e, f) {
  return fun.a === 6 ? fun.f(a, b, c, d, e, f) : fun(a)(b)(c)(d)(e)(f);
}
function A7(fun, a, b, c, d, e, f, g) {
  return fun.a === 7 ? fun.f(a, b, c, d, e, f, g) : fun(a)(b)(c)(d)(e)(f)(g);
}
function A8(fun, a, b, c, d, e, f, g, h) {
  return fun.a === 8 ? fun.f(a, b, c, d, e, f, g, h) : fun(a)(b)(c)(d)(e)(f)(g)(h);
}
function A9(fun, a, b, c, d, e, f, g, h, i) {
  return fun.a === 9 ? fun.f(a, b, c, d, e, f, g, h, i) : fun(a)(b)(c)(d)(e)(f)(g)(h)(i);
}




// EQUALITY

function _Utils_eq(x, y)
{
	for (
		var pair, stack = [], isEqual = _Utils_eqHelp(x, y, 0, stack);
		isEqual && (pair = stack.pop());
		isEqual = _Utils_eqHelp(pair.a, pair.b, 0, stack)
		)
	{}

	return isEqual;
}

function _Utils_eqHelp(x, y, depth, stack)
{
	if (x === y)
	{
		return true;
	}

	if (typeof x !== 'object' || x === null || y === null)
	{
		typeof x === 'function' && _Debug_crash(5);
		return false;
	}

	if (depth > 100)
	{
		stack.push(_Utils_Tuple2(x,y));
		return true;
	}

	/**_UNUSED/
	if (x.$ === 'Set_elm_builtin')
	{
		x = $elm$core$Set$toList(x);
		y = $elm$core$Set$toList(y);
	}
	if (x.$ === 'RBNode_elm_builtin' || x.$ === 'RBEmpty_elm_builtin')
	{
		x = $elm$core$Dict$toList(x);
		y = $elm$core$Dict$toList(y);
	}
	//*/

	/**/
	if (x.$ < 0)
	{
		x = $elm$core$Dict$toList(x);
		y = $elm$core$Dict$toList(y);
	}
	//*/

	for (var key in x)
	{
		if (!_Utils_eqHelp(x[key], y[key], depth + 1, stack))
		{
			return false;
		}
	}
	return true;
}

var _Utils_equal = F2(_Utils_eq);
var _Utils_notEqual = F2(function(a, b) { return !_Utils_eq(a,b); });



// COMPARISONS

// Code in Generate/JavaScript.hs, Basics.js, and List.js depends on
// the particular integer values assigned to LT, EQ, and GT.

function _Utils_cmp(x, y, ord)
{
	if (typeof x !== 'object')
	{
		return x === y ? /*EQ*/ 0 : x < y ? /*LT*/ -1 : /*GT*/ 1;
	}

	/**_UNUSED/
	if (x instanceof String)
	{
		var a = x.valueOf();
		var b = y.valueOf();
		return a === b ? 0 : a < b ? -1 : 1;
	}
	//*/

	/**/
	if (typeof x.$ === 'undefined')
	//*/
	/**_UNUSED/
	if (x.$[0] === '#')
	//*/
	{
		return (ord = _Utils_cmp(x.a, y.a))
			? ord
			: (ord = _Utils_cmp(x.b, y.b))
				? ord
				: _Utils_cmp(x.c, y.c);
	}

	// traverse conses until end of a list or a mismatch
	for (; x.b && y.b && !(ord = _Utils_cmp(x.a, y.a)); x = x.b, y = y.b) {} // WHILE_CONSES
	return ord || (x.b ? /*GT*/ 1 : y.b ? /*LT*/ -1 : /*EQ*/ 0);
}

var _Utils_lt = F2(function(a, b) { return _Utils_cmp(a, b) < 0; });
var _Utils_le = F2(function(a, b) { return _Utils_cmp(a, b) < 1; });
var _Utils_gt = F2(function(a, b) { return _Utils_cmp(a, b) > 0; });
var _Utils_ge = F2(function(a, b) { return _Utils_cmp(a, b) >= 0; });

var _Utils_compare = F2(function(x, y)
{
	var n = _Utils_cmp(x, y);
	return n < 0 ? $elm$core$Basics$LT : n ? $elm$core$Basics$GT : $elm$core$Basics$EQ;
});


// COMMON VALUES

var _Utils_Tuple0 = 0;
var _Utils_Tuple0_UNUSED = { $: '#0' };

function _Utils_Tuple2(a, b) { return { a: a, b: b }; }
function _Utils_Tuple2_UNUSED(a, b) { return { $: '#2', a: a, b: b }; }

function _Utils_Tuple3(a, b, c) { return { a: a, b: b, c: c }; }
function _Utils_Tuple3_UNUSED(a, b, c) { return { $: '#3', a: a, b: b, c: c }; }

function _Utils_chr(c) { return c; }
function _Utils_chr_UNUSED(c) { return new String(c); }


// RECORDS

function _Utils_update(oldRecord, updatedFields)
{
	var newRecord = {};

	for (var key in oldRecord)
	{
		newRecord[key] = oldRecord[key];
	}

	for (var key in updatedFields)
	{
		newRecord[key] = updatedFields[key];
	}

	return newRecord;
}


// APPEND

var _Utils_append = F2(_Utils_ap);

function _Utils_ap(xs, ys)
{
	// append Strings
	if (typeof xs === 'string')
	{
		return xs + ys;
	}

	// append Lists
	if (!xs.b)
	{
		return ys;
	}
	var root = _List_Cons(xs.a, ys);
	xs = xs.b
	for (var curr = root; xs.b; xs = xs.b) // WHILE_CONS
	{
		curr = curr.b = _List_Cons(xs.a, ys);
	}
	return root;
}



var _List_Nil = { $: 0 };
var _List_Nil_UNUSED = { $: '[]' };

function _List_Cons(hd, tl) { return { $: 1, a: hd, b: tl }; }
function _List_Cons_UNUSED(hd, tl) { return { $: '::', a: hd, b: tl }; }


var _List_cons = F2(_List_Cons);

function _List_fromArray(arr)
{
	var out = _List_Nil;
	for (var i = arr.length; i--; )
	{
		out = _List_Cons(arr[i], out);
	}
	return out;
}

function _List_toArray(xs)
{
	for (var out = []; xs.b; xs = xs.b) // WHILE_CONS
	{
		out.push(xs.a);
	}
	return out;
}

var _List_map2 = F3(function(f, xs, ys)
{
	for (var arr = []; xs.b && ys.b; xs = xs.b, ys = ys.b) // WHILE_CONSES
	{
		arr.push(A2(f, xs.a, ys.a));
	}
	return _List_fromArray(arr);
});

var _List_map3 = F4(function(f, xs, ys, zs)
{
	for (var arr = []; xs.b && ys.b && zs.b; xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A3(f, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_map4 = F5(function(f, ws, xs, ys, zs)
{
	for (var arr = []; ws.b && xs.b && ys.b && zs.b; ws = ws.b, xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A4(f, ws.a, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_map5 = F6(function(f, vs, ws, xs, ys, zs)
{
	for (var arr = []; vs.b && ws.b && xs.b && ys.b && zs.b; vs = vs.b, ws = ws.b, xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A5(f, vs.a, ws.a, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_sortBy = F2(function(f, xs)
{
	return _List_fromArray(_List_toArray(xs).sort(function(a, b) {
		return _Utils_cmp(f(a), f(b));
	}));
});

var _List_sortWith = F2(function(f, xs)
{
	return _List_fromArray(_List_toArray(xs).sort(function(a, b) {
		var ord = A2(f, a, b);
		return ord === $elm$core$Basics$EQ ? 0 : ord === $elm$core$Basics$LT ? -1 : 1;
	}));
});



var _JsArray_empty = [];

function _JsArray_singleton(value)
{
    return [value];
}

function _JsArray_length(array)
{
    return array.length;
}

var _JsArray_initialize = F3(function(size, offset, func)
{
    var result = new Array(size);

    for (var i = 0; i < size; i++)
    {
        result[i] = func(offset + i);
    }

    return result;
});

var _JsArray_initializeFromList = F2(function (max, ls)
{
    var result = new Array(max);

    for (var i = 0; i < max && ls.b; i++)
    {
        result[i] = ls.a;
        ls = ls.b;
    }

    result.length = i;
    return _Utils_Tuple2(result, ls);
});

var _JsArray_unsafeGet = F2(function(index, array)
{
    return array[index];
});

var _JsArray_unsafeSet = F3(function(index, value, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = array[i];
    }

    result[index] = value;
    return result;
});

var _JsArray_push = F2(function(value, array)
{
    var length = array.length;
    var result = new Array(length + 1);

    for (var i = 0; i < length; i++)
    {
        result[i] = array[i];
    }

    result[length] = value;
    return result;
});

var _JsArray_foldl = F3(function(func, acc, array)
{
    var length = array.length;

    for (var i = 0; i < length; i++)
    {
        acc = A2(func, array[i], acc);
    }

    return acc;
});

var _JsArray_foldr = F3(function(func, acc, array)
{
    for (var i = array.length - 1; i >= 0; i--)
    {
        acc = A2(func, array[i], acc);
    }

    return acc;
});

var _JsArray_map = F2(function(func, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = func(array[i]);
    }

    return result;
});

var _JsArray_indexedMap = F3(function(func, offset, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = A2(func, offset + i, array[i]);
    }

    return result;
});

var _JsArray_slice = F3(function(from, to, array)
{
    return array.slice(from, to);
});

var _JsArray_appendN = F3(function(n, dest, source)
{
    var destLen = dest.length;
    var itemsToCopy = n - destLen;

    if (itemsToCopy > source.length)
    {
        itemsToCopy = source.length;
    }

    var size = destLen + itemsToCopy;
    var result = new Array(size);

    for (var i = 0; i < destLen; i++)
    {
        result[i] = dest[i];
    }

    for (var i = 0; i < itemsToCopy; i++)
    {
        result[i + destLen] = source[i];
    }

    return result;
});



// LOG

var _Debug_log = F2(function(tag, value)
{
	return value;
});

var _Debug_log_UNUSED = F2(function(tag, value)
{
	console.log(tag + ': ' + _Debug_toString(value));
	return value;
});


// TODOS

function _Debug_todo(moduleName, region)
{
	return function(message) {
		_Debug_crash(8, moduleName, region, message);
	};
}

function _Debug_todoCase(moduleName, region, value)
{
	return function(message) {
		_Debug_crash(9, moduleName, region, value, message);
	};
}


// TO STRING

function _Debug_toString(value)
{
	return '<internals>';
}

function _Debug_toString_UNUSED(value)
{
	return _Debug_toAnsiString(false, value);
}

function _Debug_toAnsiString(ansi, value)
{
	if (typeof value === 'function')
	{
		return _Debug_internalColor(ansi, '<function>');
	}

	if (typeof value === 'boolean')
	{
		return _Debug_ctorColor(ansi, value ? 'True' : 'False');
	}

	if (typeof value === 'number')
	{
		return _Debug_numberColor(ansi, value + '');
	}

	if (value instanceof String)
	{
		return _Debug_charColor(ansi, "'" + _Debug_addSlashes(value, true) + "'");
	}

	if (typeof value === 'string')
	{
		return _Debug_stringColor(ansi, '"' + _Debug_addSlashes(value, false) + '"');
	}

	if (typeof value === 'object' && '$' in value)
	{
		var tag = value.$;

		if (typeof tag === 'number')
		{
			return _Debug_internalColor(ansi, '<internals>');
		}

		if (tag[0] === '#')
		{
			var output = [];
			for (var k in value)
			{
				if (k === '$') continue;
				output.push(_Debug_toAnsiString(ansi, value[k]));
			}
			return '(' + output.join(',') + ')';
		}

		if (tag === 'Set_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Set')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Set$toList(value));
		}

		if (tag === 'RBNode_elm_builtin' || tag === 'RBEmpty_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Dict')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Dict$toList(value));
		}

		if (tag === 'Array_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Array')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Array$toList(value));
		}

		if (tag === '::' || tag === '[]')
		{
			var output = '[';

			value.b && (output += _Debug_toAnsiString(ansi, value.a), value = value.b)

			for (; value.b; value = value.b) // WHILE_CONS
			{
				output += ',' + _Debug_toAnsiString(ansi, value.a);
			}
			return output + ']';
		}

		var output = '';
		for (var i in value)
		{
			if (i === '$') continue;
			var str = _Debug_toAnsiString(ansi, value[i]);
			var c0 = str[0];
			var parenless = c0 === '{' || c0 === '(' || c0 === '[' || c0 === '<' || c0 === '"' || str.indexOf(' ') < 0;
			output += ' ' + (parenless ? str : '(' + str + ')');
		}
		return _Debug_ctorColor(ansi, tag) + output;
	}

	if (typeof DataView === 'function' && value instanceof DataView)
	{
		return _Debug_stringColor(ansi, '<' + value.byteLength + ' bytes>');
	}

	if (typeof File !== 'undefined' && value instanceof File)
	{
		return _Debug_internalColor(ansi, '<' + value.name + '>');
	}

	if (typeof value === 'object')
	{
		var output = [];
		for (var key in value)
		{
			var field = key[0] === '_' ? key.slice(1) : key;
			output.push(_Debug_fadeColor(ansi, field) + ' = ' + _Debug_toAnsiString(ansi, value[key]));
		}
		if (output.length === 0)
		{
			return '{}';
		}
		return '{ ' + output.join(', ') + ' }';
	}

	return _Debug_internalColor(ansi, '<internals>');
}

function _Debug_addSlashes(str, isChar)
{
	var s = str
		.replace(/\\/g, '\\\\')
		.replace(/\n/g, '\\n')
		.replace(/\t/g, '\\t')
		.replace(/\r/g, '\\r')
		.replace(/\v/g, '\\v')
		.replace(/\0/g, '\\0');

	if (isChar)
	{
		return s.replace(/\'/g, '\\\'');
	}
	else
	{
		return s.replace(/\"/g, '\\"');
	}
}

function _Debug_ctorColor(ansi, string)
{
	return ansi ? '\x1b[96m' + string + '\x1b[0m' : string;
}

function _Debug_numberColor(ansi, string)
{
	return ansi ? '\x1b[95m' + string + '\x1b[0m' : string;
}

function _Debug_stringColor(ansi, string)
{
	return ansi ? '\x1b[93m' + string + '\x1b[0m' : string;
}

function _Debug_charColor(ansi, string)
{
	return ansi ? '\x1b[92m' + string + '\x1b[0m' : string;
}

function _Debug_fadeColor(ansi, string)
{
	return ansi ? '\x1b[37m' + string + '\x1b[0m' : string;
}

function _Debug_internalColor(ansi, string)
{
	return ansi ? '\x1b[36m' + string + '\x1b[0m' : string;
}

function _Debug_toHexDigit(n)
{
	return String.fromCharCode(n < 10 ? 48 + n : 55 + n);
}


// CRASH


function _Debug_crash(identifier)
{
	throw new Error('https://github.com/elm/core/blob/1.0.0/hints/' + identifier + '.md');
}


function _Debug_crash_UNUSED(identifier, fact1, fact2, fact3, fact4)
{
	switch(identifier)
	{
		case 0:
			throw new Error('What node should I take over? In JavaScript I need something like:\n\n    Elm.Main.init({\n        node: document.getElementById("elm-node")\n    })\n\nYou need to do this with any Browser.sandbox or Browser.element program.');

		case 1:
			throw new Error('Browser.application programs cannot handle URLs like this:\n\n    ' + document.location.href + '\n\nWhat is the root? The root of your file system? Try looking at this program with `elm reactor` or some other server.');

		case 2:
			var jsonErrorString = fact1;
			throw new Error('Problem with the flags given to your Elm program on initialization.\n\n' + jsonErrorString);

		case 3:
			var portName = fact1;
			throw new Error('There can only be one port named `' + portName + '`, but your program has multiple.');

		case 4:
			var portName = fact1;
			var problem = fact2;
			throw new Error('Trying to send an unexpected type of value through port `' + portName + '`:\n' + problem);

		case 5:
			throw new Error('Trying to use `(==)` on functions.\nThere is no way to know if functions are "the same" in the Elm sense.\nRead more about this at https://package.elm-lang.org/packages/elm/core/latest/Basics#== which describes why it is this way and what the better version will look like.');

		case 6:
			var moduleName = fact1;
			throw new Error('Your page is loading multiple Elm scripts with a module named ' + moduleName + '. Maybe a duplicate script is getting loaded accidentally? If not, rename one of them so I know which is which!');

		case 8:
			var moduleName = fact1;
			var region = fact2;
			var message = fact3;
			throw new Error('TODO in module `' + moduleName + '` ' + _Debug_regionToString(region) + '\n\n' + message);

		case 9:
			var moduleName = fact1;
			var region = fact2;
			var value = fact3;
			var message = fact4;
			throw new Error(
				'TODO in module `' + moduleName + '` from the `case` expression '
				+ _Debug_regionToString(region) + '\n\nIt received the following value:\n\n    '
				+ _Debug_toString(value).replace('\n', '\n    ')
				+ '\n\nBut the branch that handles it says:\n\n    ' + message.replace('\n', '\n    ')
			);

		case 10:
			throw new Error('Bug in https://github.com/elm/virtual-dom/issues');

		case 11:
			throw new Error('Cannot perform mod 0. Division by zero error.');
	}
}

function _Debug_regionToString(region)
{
	if (region.dk.bF === region.dB.bF)
	{
		return 'on line ' + region.dk.bF;
	}
	return 'on lines ' + region.dk.bF + ' through ' + region.dB.bF;
}



// MATH

var _Basics_add = F2(function(a, b) { return a + b; });
var _Basics_sub = F2(function(a, b) { return a - b; });
var _Basics_mul = F2(function(a, b) { return a * b; });
var _Basics_fdiv = F2(function(a, b) { return a / b; });
var _Basics_idiv = F2(function(a, b) { return (a / b) | 0; });
var _Basics_pow = F2(Math.pow);

var _Basics_remainderBy = F2(function(b, a) { return a % b; });

// https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/divmodnote-letter.pdf
var _Basics_modBy = F2(function(modulus, x)
{
	var answer = x % modulus;
	return modulus === 0
		? _Debug_crash(11)
		:
	((answer > 0 && modulus < 0) || (answer < 0 && modulus > 0))
		? answer + modulus
		: answer;
});


// TRIGONOMETRY

var _Basics_pi = Math.PI;
var _Basics_e = Math.E;
var _Basics_cos = Math.cos;
var _Basics_sin = Math.sin;
var _Basics_tan = Math.tan;
var _Basics_acos = Math.acos;
var _Basics_asin = Math.asin;
var _Basics_atan = Math.atan;
var _Basics_atan2 = F2(Math.atan2);


// MORE MATH

function _Basics_toFloat(x) { return x; }
function _Basics_truncate(n) { return n | 0; }
function _Basics_isInfinite(n) { return n === Infinity || n === -Infinity; }

var _Basics_ceiling = Math.ceil;
var _Basics_floor = Math.floor;
var _Basics_round = Math.round;
var _Basics_sqrt = Math.sqrt;
var _Basics_log = Math.log;
var _Basics_isNaN = isNaN;


// BOOLEANS

function _Basics_not(bool) { return !bool; }
var _Basics_and = F2(function(a, b) { return a && b; });
var _Basics_or  = F2(function(a, b) { return a || b; });
var _Basics_xor = F2(function(a, b) { return a !== b; });



var _String_cons = F2(function(chr, str)
{
	return chr + str;
});

function _String_uncons(string)
{
	var word = string.charCodeAt(0);
	return !isNaN(word)
		? $elm$core$Maybe$Just(
			0xD800 <= word && word <= 0xDBFF
				? _Utils_Tuple2(_Utils_chr(string[0] + string[1]), string.slice(2))
				: _Utils_Tuple2(_Utils_chr(string[0]), string.slice(1))
		)
		: $elm$core$Maybe$Nothing;
}

var _String_append = F2(function(a, b)
{
	return a + b;
});

function _String_length(str)
{
	return str.length;
}

var _String_map = F2(function(func, string)
{
	var len = string.length;
	var array = new Array(len);
	var i = 0;
	while (i < len)
	{
		var word = string.charCodeAt(i);
		if (0xD800 <= word && word <= 0xDBFF)
		{
			array[i] = func(_Utils_chr(string[i] + string[i+1]));
			i += 2;
			continue;
		}
		array[i] = func(_Utils_chr(string[i]));
		i++;
	}
	return array.join('');
});

var _String_filter = F2(function(isGood, str)
{
	var arr = [];
	var len = str.length;
	var i = 0;
	while (i < len)
	{
		var char = str[i];
		var word = str.charCodeAt(i);
		i++;
		if (0xD800 <= word && word <= 0xDBFF)
		{
			char += str[i];
			i++;
		}

		if (isGood(_Utils_chr(char)))
		{
			arr.push(char);
		}
	}
	return arr.join('');
});

function _String_reverse(str)
{
	var len = str.length;
	var arr = new Array(len);
	var i = 0;
	while (i < len)
	{
		var word = str.charCodeAt(i);
		if (0xD800 <= word && word <= 0xDBFF)
		{
			arr[len - i] = str[i + 1];
			i++;
			arr[len - i] = str[i - 1];
			i++;
		}
		else
		{
			arr[len - i] = str[i];
			i++;
		}
	}
	return arr.join('');
}

var _String_foldl = F3(function(func, state, string)
{
	var len = string.length;
	var i = 0;
	while (i < len)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		i++;
		if (0xD800 <= word && word <= 0xDBFF)
		{
			char += string[i];
			i++;
		}
		state = A2(func, _Utils_chr(char), state);
	}
	return state;
});

var _String_foldr = F3(function(func, state, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		state = A2(func, _Utils_chr(char), state);
	}
	return state;
});

var _String_split = F2(function(sep, str)
{
	return str.split(sep);
});

var _String_join = F2(function(sep, strs)
{
	return strs.join(sep);
});

var _String_slice = F3(function(start, end, str) {
	return str.slice(start, end);
});

function _String_trim(str)
{
	return str.trim();
}

function _String_trimLeft(str)
{
	return str.replace(/^\s+/, '');
}

function _String_trimRight(str)
{
	return str.replace(/\s+$/, '');
}

function _String_words(str)
{
	return _List_fromArray(str.trim().split(/\s+/g));
}

function _String_lines(str)
{
	return _List_fromArray(str.split(/\r\n|\r|\n/g));
}

function _String_toUpper(str)
{
	return str.toUpperCase();
}

function _String_toLower(str)
{
	return str.toLowerCase();
}

var _String_any = F2(function(isGood, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		if (isGood(_Utils_chr(char)))
		{
			return true;
		}
	}
	return false;
});

var _String_all = F2(function(isGood, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		if (!isGood(_Utils_chr(char)))
		{
			return false;
		}
	}
	return true;
});

var _String_contains = F2(function(sub, str)
{
	return str.indexOf(sub) > -1;
});

var _String_startsWith = F2(function(sub, str)
{
	return str.indexOf(sub) === 0;
});

var _String_endsWith = F2(function(sub, str)
{
	return str.length >= sub.length &&
		str.lastIndexOf(sub) === str.length - sub.length;
});

var _String_indexes = F2(function(sub, str)
{
	var subLen = sub.length;

	if (subLen < 1)
	{
		return _List_Nil;
	}

	var i = 0;
	var is = [];

	while ((i = str.indexOf(sub, i)) > -1)
	{
		is.push(i);
		i = i + subLen;
	}

	return _List_fromArray(is);
});


// TO STRING

function _String_fromNumber(number)
{
	return number + '';
}


// INT CONVERSIONS

function _String_toInt(str)
{
	var total = 0;
	var code0 = str.charCodeAt(0);
	var start = code0 == 0x2B /* + */ || code0 == 0x2D /* - */ ? 1 : 0;

	for (var i = start; i < str.length; ++i)
	{
		var code = str.charCodeAt(i);
		if (code < 0x30 || 0x39 < code)
		{
			return $elm$core$Maybe$Nothing;
		}
		total = 10 * total + code - 0x30;
	}

	return i == start
		? $elm$core$Maybe$Nothing
		: $elm$core$Maybe$Just(code0 == 0x2D ? -total : total);
}


// FLOAT CONVERSIONS

function _String_toFloat(s)
{
	// check if it is a hex, octal, or binary number
	if (s.length === 0 || /[\sxbo]/.test(s))
	{
		return $elm$core$Maybe$Nothing;
	}
	var n = +s;
	// faster isNaN check
	return n === n ? $elm$core$Maybe$Just(n) : $elm$core$Maybe$Nothing;
}

function _String_fromList(chars)
{
	return _List_toArray(chars).join('');
}




function _Char_toCode(char)
{
	var code = char.charCodeAt(0);
	if (0xD800 <= code && code <= 0xDBFF)
	{
		return (code - 0xD800) * 0x400 + char.charCodeAt(1) - 0xDC00 + 0x10000
	}
	return code;
}

function _Char_fromCode(code)
{
	return _Utils_chr(
		(code < 0 || 0x10FFFF < code)
			? '\uFFFD'
			:
		(code <= 0xFFFF)
			? String.fromCharCode(code)
			:
		(code -= 0x10000,
			String.fromCharCode(Math.floor(code / 0x400) + 0xD800, code % 0x400 + 0xDC00)
		)
	);
}

function _Char_toUpper(char)
{
	return _Utils_chr(char.toUpperCase());
}

function _Char_toLower(char)
{
	return _Utils_chr(char.toLowerCase());
}

function _Char_toLocaleUpper(char)
{
	return _Utils_chr(char.toLocaleUpperCase());
}

function _Char_toLocaleLower(char)
{
	return _Utils_chr(char.toLocaleLowerCase());
}



/**_UNUSED/
function _Json_errorToString(error)
{
	return $elm$json$Json$Decode$errorToString(error);
}
//*/


// CORE DECODERS

function _Json_succeed(msg)
{
	return {
		$: 0,
		a: msg
	};
}

function _Json_fail(msg)
{
	return {
		$: 1,
		a: msg
	};
}

function _Json_decodePrim(decoder)
{
	return { $: 2, b: decoder };
}

var _Json_decodeInt = _Json_decodePrim(function(value) {
	return (typeof value !== 'number')
		? _Json_expecting('an INT', value)
		:
	(-2147483647 < value && value < 2147483647 && (value | 0) === value)
		? $elm$core$Result$Ok(value)
		:
	(isFinite(value) && !(value % 1))
		? $elm$core$Result$Ok(value)
		: _Json_expecting('an INT', value);
});

var _Json_decodeBool = _Json_decodePrim(function(value) {
	return (typeof value === 'boolean')
		? $elm$core$Result$Ok(value)
		: _Json_expecting('a BOOL', value);
});

var _Json_decodeFloat = _Json_decodePrim(function(value) {
	return (typeof value === 'number')
		? $elm$core$Result$Ok(value)
		: _Json_expecting('a FLOAT', value);
});

var _Json_decodeValue = _Json_decodePrim(function(value) {
	return $elm$core$Result$Ok(_Json_wrap(value));
});

var _Json_decodeString = _Json_decodePrim(function(value) {
	return (typeof value === 'string')
		? $elm$core$Result$Ok(value)
		: (value instanceof String)
			? $elm$core$Result$Ok(value + '')
			: _Json_expecting('a STRING', value);
});

function _Json_decodeList(decoder) { return { $: 3, b: decoder }; }
function _Json_decodeArray(decoder) { return { $: 4, b: decoder }; }

function _Json_decodeNull(value) { return { $: 5, c: value }; }

var _Json_decodeField = F2(function(field, decoder)
{
	return {
		$: 6,
		d: field,
		b: decoder
	};
});

var _Json_decodeIndex = F2(function(index, decoder)
{
	return {
		$: 7,
		e: index,
		b: decoder
	};
});

function _Json_decodeKeyValuePairs(decoder)
{
	return {
		$: 8,
		b: decoder
	};
}

function _Json_mapMany(f, decoders)
{
	return {
		$: 9,
		f: f,
		g: decoders
	};
}

var _Json_andThen = F2(function(callback, decoder)
{
	return {
		$: 10,
		b: decoder,
		h: callback
	};
});

function _Json_oneOf(decoders)
{
	return {
		$: 11,
		g: decoders
	};
}


// DECODING OBJECTS

var _Json_map1 = F2(function(f, d1)
{
	return _Json_mapMany(f, [d1]);
});

var _Json_map2 = F3(function(f, d1, d2)
{
	return _Json_mapMany(f, [d1, d2]);
});

var _Json_map3 = F4(function(f, d1, d2, d3)
{
	return _Json_mapMany(f, [d1, d2, d3]);
});

var _Json_map4 = F5(function(f, d1, d2, d3, d4)
{
	return _Json_mapMany(f, [d1, d2, d3, d4]);
});

var _Json_map5 = F6(function(f, d1, d2, d3, d4, d5)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5]);
});

var _Json_map6 = F7(function(f, d1, d2, d3, d4, d5, d6)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6]);
});

var _Json_map7 = F8(function(f, d1, d2, d3, d4, d5, d6, d7)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6, d7]);
});

var _Json_map8 = F9(function(f, d1, d2, d3, d4, d5, d6, d7, d8)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6, d7, d8]);
});


// DECODE

var _Json_runOnString = F2(function(decoder, string)
{
	try
	{
		var value = JSON.parse(string);
		return _Json_runHelp(decoder, value);
	}
	catch (e)
	{
		return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, 'This is not valid JSON! ' + e.message, _Json_wrap(string)));
	}
});

var _Json_run = F2(function(decoder, value)
{
	return _Json_runHelp(decoder, _Json_unwrap(value));
});

function _Json_runHelp(decoder, value)
{
	switch (decoder.$)
	{
		case 2:
			return decoder.b(value);

		case 5:
			return (value === null)
				? $elm$core$Result$Ok(decoder.c)
				: _Json_expecting('null', value);

		case 3:
			if (!_Json_isArray(value))
			{
				return _Json_expecting('a LIST', value);
			}
			return _Json_runArrayDecoder(decoder.b, value, _List_fromArray);

		case 4:
			if (!_Json_isArray(value))
			{
				return _Json_expecting('an ARRAY', value);
			}
			return _Json_runArrayDecoder(decoder.b, value, _Json_toElmArray);

		case 6:
			var field = decoder.d;
			if (typeof value !== 'object' || value === null || !(field in value))
			{
				return _Json_expecting('an OBJECT with a field named `' + field + '`', value);
			}
			var result = _Json_runHelp(decoder.b, value[field]);
			return ($elm$core$Result$isOk(result)) ? result : $elm$core$Result$Err(A2($elm$json$Json$Decode$Field, field, result.a));

		case 7:
			var index = decoder.e;
			if (!_Json_isArray(value))
			{
				return _Json_expecting('an ARRAY', value);
			}
			if (index >= value.length)
			{
				return _Json_expecting('a LONGER array. Need index ' + index + ' but only see ' + value.length + ' entries', value);
			}
			var result = _Json_runHelp(decoder.b, value[index]);
			return ($elm$core$Result$isOk(result)) ? result : $elm$core$Result$Err(A2($elm$json$Json$Decode$Index, index, result.a));

		case 8:
			if (typeof value !== 'object' || value === null || _Json_isArray(value))
			{
				return _Json_expecting('an OBJECT', value);
			}

			var keyValuePairs = _List_Nil;
			// TODO test perf of Object.keys and switch when support is good enough
			for (var key in value)
			{
				if (value.hasOwnProperty(key))
				{
					var result = _Json_runHelp(decoder.b, value[key]);
					if (!$elm$core$Result$isOk(result))
					{
						return $elm$core$Result$Err(A2($elm$json$Json$Decode$Field, key, result.a));
					}
					keyValuePairs = _List_Cons(_Utils_Tuple2(key, result.a), keyValuePairs);
				}
			}
			return $elm$core$Result$Ok($elm$core$List$reverse(keyValuePairs));

		case 9:
			var answer = decoder.f;
			var decoders = decoder.g;
			for (var i = 0; i < decoders.length; i++)
			{
				var result = _Json_runHelp(decoders[i], value);
				if (!$elm$core$Result$isOk(result))
				{
					return result;
				}
				answer = answer(result.a);
			}
			return $elm$core$Result$Ok(answer);

		case 10:
			var result = _Json_runHelp(decoder.b, value);
			return (!$elm$core$Result$isOk(result))
				? result
				: _Json_runHelp(decoder.h(result.a), value);

		case 11:
			var errors = _List_Nil;
			for (var temp = decoder.g; temp.b; temp = temp.b) // WHILE_CONS
			{
				var result = _Json_runHelp(temp.a, value);
				if ($elm$core$Result$isOk(result))
				{
					return result;
				}
				errors = _List_Cons(result.a, errors);
			}
			return $elm$core$Result$Err($elm$json$Json$Decode$OneOf($elm$core$List$reverse(errors)));

		case 1:
			return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, decoder.a, _Json_wrap(value)));

		case 0:
			return $elm$core$Result$Ok(decoder.a);
	}
}

function _Json_runArrayDecoder(decoder, value, toElmValue)
{
	var len = value.length;
	var array = new Array(len);
	for (var i = 0; i < len; i++)
	{
		var result = _Json_runHelp(decoder, value[i]);
		if (!$elm$core$Result$isOk(result))
		{
			return $elm$core$Result$Err(A2($elm$json$Json$Decode$Index, i, result.a));
		}
		array[i] = result.a;
	}
	return $elm$core$Result$Ok(toElmValue(array));
}

function _Json_isArray(value)
{
	return Array.isArray(value) || (typeof FileList !== 'undefined' && value instanceof FileList);
}

function _Json_toElmArray(array)
{
	return A2($elm$core$Array$initialize, array.length, function(i) { return array[i]; });
}

function _Json_expecting(type, value)
{
	return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, 'Expecting ' + type, _Json_wrap(value)));
}


// EQUALITY

function _Json_equality(x, y)
{
	if (x === y)
	{
		return true;
	}

	if (x.$ !== y.$)
	{
		return false;
	}

	switch (x.$)
	{
		case 0:
		case 1:
			return x.a === y.a;

		case 2:
			return x.b === y.b;

		case 5:
			return x.c === y.c;

		case 3:
		case 4:
		case 8:
			return _Json_equality(x.b, y.b);

		case 6:
			return x.d === y.d && _Json_equality(x.b, y.b);

		case 7:
			return x.e === y.e && _Json_equality(x.b, y.b);

		case 9:
			return x.f === y.f && _Json_listEquality(x.g, y.g);

		case 10:
			return x.h === y.h && _Json_equality(x.b, y.b);

		case 11:
			return _Json_listEquality(x.g, y.g);
	}
}

function _Json_listEquality(aDecoders, bDecoders)
{
	var len = aDecoders.length;
	if (len !== bDecoders.length)
	{
		return false;
	}
	for (var i = 0; i < len; i++)
	{
		if (!_Json_equality(aDecoders[i], bDecoders[i]))
		{
			return false;
		}
	}
	return true;
}


// ENCODE

var _Json_encode = F2(function(indentLevel, value)
{
	return JSON.stringify(_Json_unwrap(value), null, indentLevel) + '';
});

function _Json_wrap_UNUSED(value) { return { $: 0, a: value }; }
function _Json_unwrap_UNUSED(value) { return value.a; }

function _Json_wrap(value) { return value; }
function _Json_unwrap(value) { return value; }

function _Json_emptyArray() { return []; }
function _Json_emptyObject() { return {}; }

var _Json_addField = F3(function(key, value, object)
{
	object[key] = _Json_unwrap(value);
	return object;
});

function _Json_addEntry(func)
{
	return F2(function(entry, array)
	{
		array.push(_Json_unwrap(func(entry)));
		return array;
	});
}

var _Json_encodeNull = _Json_wrap(null);



// TASKS

function _Scheduler_succeed(value)
{
	return {
		$: 0,
		a: value
	};
}

function _Scheduler_fail(error)
{
	return {
		$: 1,
		a: error
	};
}

// This function was slightly modified by elm-watch.
function _Scheduler_binding(callback)
{
	return {
		$: 2,
		b: callback,
		// c: null // commented out by elm-watch
		c: Function.prototype // added by elm-watch
	};
}

var _Scheduler_andThen = F2(function(callback, task)
{
	return {
		$: 3,
		b: callback,
		d: task
	};
});

var _Scheduler_onError = F2(function(callback, task)
{
	return {
		$: 4,
		b: callback,
		d: task
	};
});

function _Scheduler_receive(callback)
{
	return {
		$: 5,
		b: callback
	};
}


// PROCESSES

var _Scheduler_guid = 0;

function _Scheduler_rawSpawn(task)
{
	var proc = {
		$: 0,
		e: _Scheduler_guid++,
		f: task,
		g: null,
		h: []
	};

	_Scheduler_enqueue(proc);

	return proc;
}

function _Scheduler_spawn(task)
{
	return _Scheduler_binding(function(callback) {
		callback(_Scheduler_succeed(_Scheduler_rawSpawn(task)));
	});
}

function _Scheduler_rawSend(proc, msg)
{
	proc.h.push(msg);
	_Scheduler_enqueue(proc);
}

var _Scheduler_send = F2(function(proc, msg)
{
	return _Scheduler_binding(function(callback) {
		_Scheduler_rawSend(proc, msg);
		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
});

function _Scheduler_kill(proc)
{
	return _Scheduler_binding(function(callback) {
		var task = proc.f;
		if (task.$ === 2 && task.c)
		{
			task.c();
		}

		proc.f = null;

		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
}


/* STEP PROCESSES

type alias Process =
  { $ : tag
  , id : unique_id
  , root : Task
  , stack : null | { $: SUCCEED | FAIL, a: callback, b: stack }
  , mailbox : [msg]
  }

*/


var _Scheduler_working = false;
var _Scheduler_queue = [];


function _Scheduler_enqueue(proc)
{
	_Scheduler_queue.push(proc);
	if (_Scheduler_working)
	{
		return;
	}
	_Scheduler_working = true;
	while (proc = _Scheduler_queue.shift())
	{
		_Scheduler_step(proc);
	}
	_Scheduler_working = false;
}


function _Scheduler_step(proc)
{
	while (proc.f)
	{
		var rootTag = proc.f.$;
		if (rootTag === 0 || rootTag === 1)
		{
			while (proc.g && proc.g.$ !== rootTag)
			{
				proc.g = proc.g.i;
			}
			if (!proc.g)
			{
				return;
			}
			proc.f = proc.g.b(proc.f.a);
			proc.g = proc.g.i;
		}
		else if (rootTag === 2)
		{
			proc.f.c = proc.f.b(function(newRoot) {
				proc.f = newRoot;
				_Scheduler_enqueue(proc);
			// }); // commented out by elm-watch
			}) || Function.prototype; // added by elm-watch
			return;
		}
		else if (rootTag === 5)
		{
			if (proc.h.length === 0)
			{
				return;
			}
			proc.f = proc.f.b(proc.h.shift());
		}
		else // if (rootTag === 3 || rootTag === 4)
		{
			proc.g = {
				$: rootTag === 3 ? 0 : 1,
				b: proc.f.b,
				i: proc.g
			};
			proc.f = proc.f.d;
		}
	}
}



function _Process_sleep(time)
{
	return _Scheduler_binding(function(callback) {
		var id = setTimeout(function() {
			callback(_Scheduler_succeed(_Utils_Tuple0));
		}, time);

		return function() { clearTimeout(id); };
	});
}




// PROGRAMS


// This function was slightly modified by elm-watch.
var _Platform_worker = F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		"Platform.worker", // added by elm-watch
		debugMetadata, // added by elm-watch
		flagDecoder,
		args,
		impl.fi,
		// impl.update, // commented out by elm-watch
		// impl.subscriptions, // commented out by elm-watch
		impl, // added by elm-watch
		function() { return function() {} }
	);
});



// INITIALIZE A PROGRAM


// This whole function was changed by elm-watch.
function _Platform_initialize(programType, debugMetadata, flagDecoder, args, init, impl, stepperBuilder)
{
	if (args === "__elmWatchReturnData") {
		return { impl: impl, debugMetadata: debugMetadata, flagDecoder : flagDecoder, programType: programType };
	}

	var flags = _Json_wrap(args ? args['flags'] : undefined);
	var flagResult = A2(_Json_run, flagDecoder, flags);
	$elm$core$Result$isOk(flagResult) || _Debug_crash(2 /**/, _Json_errorToString(flagResult.a) /**/);
	var managers = {};
	var initUrl = programType === "Browser.application" ? _Browser_getUrl() : undefined;
	window.__ELM_WATCH_INIT_URL = initUrl;
	var initPair = init(flagResult.a);
	var model = initPair.a;
	var stepper = stepperBuilder(sendToApp, model);
	var ports = _Platform_setupEffects(managers, sendToApp);
	var update;
	var subscriptions;

	function setUpdateAndSubscriptions() {
		update = impl.fM || impl._impl.fM;
		subscriptions = impl.fI || impl._impl.fI;
		if (typeof $elm$browser$Debugger$Main$wrapUpdate !== "undefined") {
			update = $elm$browser$Debugger$Main$wrapUpdate(update);
			subscriptions = $elm$browser$Debugger$Main$wrapSubs(subscriptions);
		}
	}

	function sendToApp(msg, viewMetadata) {
		var pair = A2(update, msg, model);
		stepper(model = pair.a, viewMetadata);
		_Platform_enqueueEffects(managers, pair.b, subscriptions(model));
	}

	setUpdateAndSubscriptions();
	_Platform_enqueueEffects(managers, initPair.b, subscriptions(model));

	function __elmWatchHotReload(newData, new_Platform_effectManagers, new_Scheduler_enqueue, moduleName) {
		_Platform_enqueueEffects(managers, _Platform_batch(_List_Nil), _Platform_batch(_List_Nil));
		_Scheduler_enqueue = new_Scheduler_enqueue;

		for (var key in new_Platform_effectManagers) {
			var manager = new_Platform_effectManagers[key];
			if (!(key in _Platform_effectManagers)) {
				_Platform_effectManagers[key] = manager;
				managers[key] = _Platform_instantiateManager(manager, sendToApp);
				if (manager.a) {
					console.info("elm-watch: A new port '" + key + "' was added. You might want to reload the page!");
					manager.a(key, sendToApp)
				}
			}
		}

		for (var key in newData.impl) {
			if (key === "_impl" && impl._impl) {
				for (var subKey in newData.impl[key]) {
					impl._impl[subKey] = newData.impl[key][subKey];
				}
			} else {
				impl[key] = newData.impl[key];
			}
		}

		var newFlagResult = A2(_Json_run, newData.flagDecoder, flags);
		if (!$elm$core$Result$isOk(newFlagResult)) {
			return { tag: "ReloadPage", reason: "the flags type in `" + moduleName + "` changed and now the passed flags aren't correct anymore. The idea is to try to run with new flags!\nThis is the error:\n" + _Json_errorToString(newFlagResult.a) };
		}
		if (!_Utils_eq_elmWatchInternal(debugMetadata, newData.debugMetadata)) {
			return { tag: "ReloadPage", reason: "the message type in `" + moduleName + '` changed in debug mode ("debug metadata" changed).' };
		}
		init = impl.fi || impl._impl.fi;
		if (typeof $elm$browser$Debugger$Main$wrapInit !== "undefined") {
			init = A3($elm$browser$Debugger$Main$wrapInit, _Json_wrap(newData.debugMetadata), initPair.a.popout, init);
		}
		window.__ELM_WATCH_INIT_URL = initUrl;
		var newInitPair = init(newFlagResult.a);
		if (!_Utils_eq_elmWatchInternal(initPair, newInitPair)) {
			return { tag: "ReloadPage", reason: "`" + moduleName + ".init` returned something different than last time. Let's start fresh!" };
		}

		setUpdateAndSubscriptions();
		stepper(model, true /* isSync */);
		_Platform_enqueueEffects(managers, _Platform_batch(_List_Nil), subscriptions(model));
		return { tag: "Success" };
	}

	return Object.defineProperties(
		ports ? { ports: ports } : {},
		{
			__elmWatchHotReload: { value: __elmWatchHotReload },
			__elmWatchProgramType: { value: programType },
		}
	);
}

// This whole function was added by elm-watch.
// Copy-paste of _Utils_eq but does not assume that x and y have the same type,
// and considers functions to always be equal.
function _Utils_eq_elmWatchInternal(x, y)
{
	for (
		var pair, stack = [], isEqual = _Utils_eqHelp_elmWatchInternal(x, y, 0, stack);
		isEqual && (pair = stack.pop());
		isEqual = _Utils_eqHelp_elmWatchInternal(pair.a, pair.b, 0, stack)
		)
	{}

	return isEqual;
}

// This whole function was added by elm-watch.
function _Utils_eqHelp_elmWatchInternal(x, y, depth, stack)
{
	if (x === y) {
		return true;
	}

	var xType = _Utils_typeof_elmWatchInternal(x);
	var yType = _Utils_typeof_elmWatchInternal(y);

	if (xType !== yType) {
		return false;
	}

	switch (xType) {
		case "primitive":
			return false;
		case "function":
			return true;
	}

	if (x.$ !== y.$) {
		return false;
	}

	if (x.$ === 'Set_elm_builtin') {
		x = $elm$core$Set$toList(x);
		y = $elm$core$Set$toList(y);
	} else if (x.$ === 'RBNode_elm_builtin' || x.$ === 'RBEmpty_elm_builtin' || x.$ < 0) {
		x = $elm$core$Dict$toList(x);
		y = $elm$core$Dict$toList(y);
	}

	if (Object.keys(x).length !== Object.keys(y).length) {
		return false;
	}

	if (depth > 100) {
		stack.push(_Utils_Tuple2(x, y));
		return true;
	}

	for (var key in x) {
		if (!_Utils_eqHelp_elmWatchInternal(x[key], y[key], depth + 1, stack)) {
			return false;
		}
	}
	return true;
}

// This whole function was added by elm-watch.
function _Utils_typeof_elmWatchInternal(x)
{
	var type = typeof x;
	return type === "function"
		? "function"
		: type !== "object" || type === null
		? "primitive"
		: "objectOrArray";
}



// TRACK PRELOADS
//
// This is used by code in elm/browser and elm/http
// to register any HTTP requests that are triggered by init.
//


var _Platform_preload;


function _Platform_registerPreload(url)
{
	_Platform_preload.add(url);
}



// EFFECT MANAGERS


var _Platform_effectManagers = {};


function _Platform_setupEffects(managers, sendToApp)
{
	var ports;

	// setup all necessary effect managers
	for (var key in _Platform_effectManagers)
	{
		var manager = _Platform_effectManagers[key];

		if (manager.a)
		{
			ports = ports || {};
			ports[key] = manager.a(key, sendToApp);
		}

		managers[key] = _Platform_instantiateManager(manager, sendToApp);
	}

	return ports;
}


function _Platform_createManager(init, onEffects, onSelfMsg, cmdMap, subMap)
{
	return {
		b: init,
		c: onEffects,
		d: onSelfMsg,
		e: cmdMap,
		f: subMap
	};
}


function _Platform_instantiateManager(info, sendToApp)
{
	var router = {
		g: sendToApp,
		h: undefined
	};

	var onEffects = info.c;
	var onSelfMsg = info.d;
	var cmdMap = info.e;
	var subMap = info.f;

	function loop(state)
	{
		return A2(_Scheduler_andThen, loop, _Scheduler_receive(function(msg)
		{
			var value = msg.a;

			if (msg.$ === 0)
			{
				return A3(onSelfMsg, router, value, state);
			}

			return cmdMap && subMap
				? A4(onEffects, router, value.i, value.j, state)
				: A3(onEffects, router, cmdMap ? value.i : value.j, state);
		}));
	}

	return router.h = _Scheduler_rawSpawn(A2(_Scheduler_andThen, loop, info.b));
}



// ROUTING


var _Platform_sendToApp = F2(function(router, msg)
{
	return _Scheduler_binding(function(callback)
	{
		router.g(msg);
		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
});


var _Platform_sendToSelf = F2(function(router, msg)
{
	return A2(_Scheduler_send, router.h, {
		$: 0,
		a: msg
	});
});



// BAGS


function _Platform_leaf(home)
{
	return function(value)
	{
		return {
			$: 1,
			k: home,
			l: value
		};
	};
}


function _Platform_batch(list)
{
	return {
		$: 2,
		m: list
	};
}


var _Platform_map = F2(function(tagger, bag)
{
	return {
		$: 3,
		n: tagger,
		o: bag
	}
});



// PIPE BAGS INTO EFFECT MANAGERS
//
// Effects must be queued!
//
// Say your init contains a synchronous command, like Time.now or Time.here
//
//   - This will produce a batch of effects (FX_1)
//   - The synchronous task triggers the subsequent `update` call
//   - This will produce a batch of effects (FX_2)
//
// If we just start dispatching FX_2, subscriptions from FX_2 can be processed
// before subscriptions from FX_1. No good! Earlier versions of this code had
// this problem, leading to these reports:
//
//   https://github.com/elm/core/issues/980
//   https://github.com/elm/core/pull/981
//   https://github.com/elm/compiler/issues/1776
//
// The queue is necessary to avoid ordering issues for synchronous commands.


// Why use true/false here? Why not just check the length of the queue?
// The goal is to detect "are we currently dispatching effects?" If we
// are, we need to bail and let the ongoing while loop handle things.
//
// Now say the queue has 1 element. When we dequeue the final element,
// the queue will be empty, but we are still actively dispatching effects.
// So you could get queue jumping in a really tricky category of cases.
//
var _Platform_effectsQueue = [];
var _Platform_effectsActive = false;


function _Platform_enqueueEffects(managers, cmdBag, subBag)
{
	_Platform_effectsQueue.push({ p: managers, q: cmdBag, r: subBag });

	if (_Platform_effectsActive) return;

	_Platform_effectsActive = true;
	for (var fx; fx = _Platform_effectsQueue.shift(); )
	{
		_Platform_dispatchEffects(fx.p, fx.q, fx.r);
	}
	_Platform_effectsActive = false;
}


function _Platform_dispatchEffects(managers, cmdBag, subBag)
{
	var effectsDict = {};
	_Platform_gatherEffects(true, cmdBag, effectsDict, null);
	_Platform_gatherEffects(false, subBag, effectsDict, null);

	for (var home in managers)
	{
		_Scheduler_rawSend(managers[home], {
			$: 'fx',
			a: effectsDict[home] || { i: _List_Nil, j: _List_Nil }
		});
	}
}


function _Platform_gatherEffects(isCmd, bag, effectsDict, taggers)
{
	switch (bag.$)
	{
		case 1:
			var home = bag.k;
			var effect = _Platform_toEffect(isCmd, home, taggers, bag.l);
			effectsDict[home] = _Platform_insert(isCmd, effect, effectsDict[home]);
			return;

		case 2:
			for (var list = bag.m; list.b; list = list.b) // WHILE_CONS
			{
				_Platform_gatherEffects(isCmd, list.a, effectsDict, taggers);
			}
			return;

		case 3:
			_Platform_gatherEffects(isCmd, bag.o, effectsDict, {
				s: bag.n,
				t: taggers
			});
			return;
	}
}


function _Platform_toEffect(isCmd, home, taggers, value)
{
	function applyTaggers(x)
	{
		for (var temp = taggers; temp; temp = temp.t)
		{
			x = temp.s(x);
		}
		return x;
	}

	var map = isCmd
		? _Platform_effectManagers[home].e
		: _Platform_effectManagers[home].f;

	return A2(map, applyTaggers, value)
}


function _Platform_insert(isCmd, newEffect, effects)
{
	effects = effects || { i: _List_Nil, j: _List_Nil };

	isCmd
		? (effects.i = _List_Cons(newEffect, effects.i))
		: (effects.j = _List_Cons(newEffect, effects.j));

	return effects;
}



// PORTS


function _Platform_checkPortName(name)
{
	if (_Platform_effectManagers[name])
	{
		_Debug_crash(3, name)
	}
}



// OUTGOING PORTS


function _Platform_outgoingPort(name, converter)
{
	_Platform_checkPortName(name);
	_Platform_effectManagers[name] = {
		e: _Platform_outgoingPortMap,
		u: converter,
		a: _Platform_setupOutgoingPort
	};
	return _Platform_leaf(name);
}


var _Platform_outgoingPortMap = F2(function(tagger, value) { return value; });


function _Platform_setupOutgoingPort(name)
{
	var subs = [];
	var converter = _Platform_effectManagers[name].u;

	// CREATE MANAGER

	var init = _Process_sleep(0);

	_Platform_effectManagers[name].b = init;
	_Platform_effectManagers[name].c = F3(function(router, cmdList, state)
	{
		for ( ; cmdList.b; cmdList = cmdList.b) // WHILE_CONS
		{
			// grab a separate reference to subs in case unsubscribe is called
			var currentSubs = subs;
			var value = _Json_unwrap(converter(cmdList.a));
			for (var i = 0; i < currentSubs.length; i++)
			{
				currentSubs[i](value);
			}
		}
		return init;
	});

	// PUBLIC API

	function subscribe(callback)
	{
		subs.push(callback);
	}

	function unsubscribe(callback)
	{
		// copy subs into a new array in case unsubscribe is called within a
		// subscribed callback
		subs = subs.slice();
		var index = subs.indexOf(callback);
		if (index >= 0)
		{
			subs.splice(index, 1);
		}
	}

	return {
		subscribe: subscribe,
		unsubscribe: unsubscribe
	};
}



// INCOMING PORTS


function _Platform_incomingPort(name, converter)
{
	_Platform_checkPortName(name);
	_Platform_effectManagers[name] = {
		f: _Platform_incomingPortMap,
		u: converter,
		a: _Platform_setupIncomingPort
	};
	return _Platform_leaf(name);
}


var _Platform_incomingPortMap = F2(function(tagger, finalTagger)
{
	return function(value)
	{
		return tagger(finalTagger(value));
	};
});


function _Platform_setupIncomingPort(name, sendToApp)
{
	var subs = _List_Nil;
	var converter = _Platform_effectManagers[name].u;

	// CREATE MANAGER

	var init = _Scheduler_succeed(null);

	_Platform_effectManagers[name].b = init;
	_Platform_effectManagers[name].c = F3(function(router, subList, state)
	{
		subs = subList;
		return init;
	});

	// PUBLIC API

	function send(incomingValue)
	{
		var result = A2(_Json_run, converter, _Json_wrap(incomingValue));

		$elm$core$Result$isOk(result) || _Debug_crash(4, name, result.a);

		var value = result.a;
		for (var temp = subs; temp.b; temp = temp.b) // WHILE_CONS
		{
			sendToApp(temp.a(value));
		}
	}

	return { send: send };
}



// EXPORT ELM MODULES
//
// Have DEBUG and PROD versions so that we can (1) give nicer errors in
// debug mode and (2) not pay for the bits needed for that in prod mode.
//


// This whole function was changed by elm-watch.
function _Platform_export(exports)
{
	var reloadReasons = _Platform_mergeExportsElmWatch('Elm', scope['Elm'] || (scope['Elm'] = {}), exports);
	if (reloadReasons.length > 0) {
		throw new Error(["ELM_WATCH_RELOAD_NEEDED"].concat(Array.from(new Set(reloadReasons))).join("\n\n---\n\n"));
	}
}

// This whole function was added by elm-watch.
function _Platform_mergeExportsElmWatch(moduleName, obj, exports)
{
	var reloadReasons = [];
	for (var name in exports) {
		if (name === "init") {
			if ("init" in obj) {
				if ("__elmWatchApps" in obj) {
					var data = exports.init("__elmWatchReturnData");
					for (var index = 0; index < obj.__elmWatchApps.length; index++) {
						var app = obj.__elmWatchApps[index];
						if (app.__elmWatchProgramType !== data.programType) {
							reloadReasons.push("`" + moduleName + ".main` changed from `" + app.__elmWatchProgramType + "` to `" + data.programType + "`.");
						} else {
							var result;
							try {
								result = app.__elmWatchHotReload(data, _Platform_effectManagers, _Scheduler_enqueue, moduleName);
								switch (result.tag) {
									case "Success":
										break;
									case "ReloadPage":
										reloadReasons.push(result.reason);
										break;
								}
							} catch (error) {
								reloadReasons.push("hot reload for `" + moduleName + "` failed, probably because of incompatible model changes.\nThis is the error:\n" + error + "\n" + (error ? error.stack : ""));
							}
						}
					}
				} else {
					throw new Error("elm-watch: I'm trying to create `" + moduleName + ".init`, but it already exists and wasn't created by elm-watch. Maybe a duplicate script is getting loaded accidentally?");
				}
			} else {
				obj.__elmWatchApps = [];
				obj.init = function() {
					var app = exports.init.apply(exports, arguments);
					obj.__elmWatchApps.push(app);
					window.__ELM_WATCH_ON_INIT();
					return app;
				};
			}
		} else {
			var innerReasons = _Platform_mergeExportsElmWatch(moduleName + "." + name, obj[name] || (obj[name] = {}), exports[name]);
			reloadReasons = reloadReasons.concat(innerReasons);
		}
	}
	return reloadReasons;
}


function _Platform_mergeExportsProd(obj, exports)
{
	for (var name in exports)
	{
		(name in obj)
			? (name == 'init')
				? _Debug_crash(6)
				: _Platform_mergeExportsProd(obj[name], exports[name])
			: (obj[name] = exports[name]);
	}
}


function _Platform_export_UNUSED(exports)
{
	scope['Elm']
		? _Platform_mergeExportsDebug('Elm', scope['Elm'], exports)
		: scope['Elm'] = exports;
}


function _Platform_mergeExportsDebug(moduleName, obj, exports)
{
	for (var name in exports)
	{
		(name in obj)
			? (name == 'init')
				? _Debug_crash(6, moduleName)
				: _Platform_mergeExportsDebug(moduleName + '.' + name, obj[name], exports[name])
			: (obj[name] = exports[name]);
	}
}




// HELPERS


var _VirtualDom_divertHrefToApp;

var _VirtualDom_doc = typeof document !== 'undefined' ? document : {};


function _VirtualDom_appendChild(parent, child)
{
	parent.appendChild(child);
}

// This whole function was changed by elm-watch.
var _VirtualDom_init = F4(function(virtualNode, flagDecoder, debugMetadata, args)
{
	var programType = "Html";

	if (args === "__elmWatchReturnData") {
		return { virtualNode: virtualNode, programType: programType };
	}

	/**_UNUSED/ // always UNUSED with elm-watch
	var node = args['node'];
	//*/
	/**/
	var node = args && args['node'] ? args['node'] : _Debug_crash(0);
	//*/

	var nextNode = _VirtualDom_render(virtualNode, function() {});
	node.parentNode.replaceChild(nextNode, node);
	node = nextNode;
	var sendToApp = function() {};

	function __elmWatchHotReload(newData) {
		var patches = _VirtualDom_diff(virtualNode, newData.virtualNode);
		node = _VirtualDom_applyPatches(node, virtualNode, patches, sendToApp);
		virtualNode = newData.virtualNode;
		return { tag: "Success" };
	}

	return Object.defineProperties(
		{},
		{
			__elmWatchHotReload: { value: __elmWatchHotReload },
			__elmWatchProgramType: { value: programType },
		}
	);
});



// TEXT


function _VirtualDom_text(string)
{
	return {
		$: 0,
		a: string
	};
}



// NODE


var _VirtualDom_nodeNS = F2(function(namespace, tag)
{
	return F2(function(factList, kidList)
	{
		for (var kids = [], descendantsCount = 0; kidList.b; kidList = kidList.b) // WHILE_CONS
		{
			var kid = kidList.a;
			descendantsCount += (kid.b || 0);
			kids.push(kid);
		}
		descendantsCount += kids.length;

		return {
			$: 1,
			c: tag,
			d: _VirtualDom_organizeFacts(factList),
			e: kids,
			f: namespace,
			b: descendantsCount
		};
	});
});


var _VirtualDom_node = _VirtualDom_nodeNS(undefined);



// KEYED NODE


var _VirtualDom_keyedNodeNS = F2(function(namespace, tag)
{
	return F2(function(factList, kidList)
	{
		for (var kids = [], descendantsCount = 0; kidList.b; kidList = kidList.b) // WHILE_CONS
		{
			var kid = kidList.a;
			descendantsCount += (kid.b.b || 0);
			kids.push(kid);
		}
		descendantsCount += kids.length;

		return {
			$: 2,
			c: tag,
			d: _VirtualDom_organizeFacts(factList),
			e: kids,
			f: namespace,
			b: descendantsCount
		};
	});
});


var _VirtualDom_keyedNode = _VirtualDom_keyedNodeNS(undefined);



// CUSTOM


function _VirtualDom_custom(factList, model, render, diff)
{
	return {
		$: 3,
		d: _VirtualDom_organizeFacts(factList),
		g: model,
		h: render,
		i: diff
	};
}



// MAP


var _VirtualDom_map = F2(function(tagger, node)
{
	return {
		$: 4,
		j: tagger,
		k: node,
		b: 1 + (node.b || 0)
	};
});



// LAZY


function _VirtualDom_thunk(refs, thunk)
{
	return {
		$: 5,
		l: refs,
		m: thunk,
		k: undefined
	};
}

var _VirtualDom_lazy = F2(function(func, a)
{
	return _VirtualDom_thunk([func, a], function() {
		return func(a);
	});
});

var _VirtualDom_lazy2 = F3(function(func, a, b)
{
	return _VirtualDom_thunk([func, a, b], function() {
		return A2(func, a, b);
	});
});

var _VirtualDom_lazy3 = F4(function(func, a, b, c)
{
	return _VirtualDom_thunk([func, a, b, c], function() {
		return A3(func, a, b, c);
	});
});

var _VirtualDom_lazy4 = F5(function(func, a, b, c, d)
{
	return _VirtualDom_thunk([func, a, b, c, d], function() {
		return A4(func, a, b, c, d);
	});
});

var _VirtualDom_lazy5 = F6(function(func, a, b, c, d, e)
{
	return _VirtualDom_thunk([func, a, b, c, d, e], function() {
		return A5(func, a, b, c, d, e);
	});
});

var _VirtualDom_lazy6 = F7(function(func, a, b, c, d, e, f)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f], function() {
		return A6(func, a, b, c, d, e, f);
	});
});

var _VirtualDom_lazy7 = F8(function(func, a, b, c, d, e, f, g)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f, g], function() {
		return A7(func, a, b, c, d, e, f, g);
	});
});

var _VirtualDom_lazy8 = F9(function(func, a, b, c, d, e, f, g, h)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f, g, h], function() {
		return A8(func, a, b, c, d, e, f, g, h);
	});
});



// FACTS


var _VirtualDom_on = F2(function(key, handler)
{
	return {
		$: 'a0',
		n: key,
		o: handler
	};
});
var _VirtualDom_style = F2(function(key, value)
{
	return {
		$: 'a1',
		n: key,
		o: value
	};
});
var _VirtualDom_property = F2(function(key, value)
{
	return {
		$: 'a2',
		n: key,
		o: value
	};
});
var _VirtualDom_attribute = F2(function(key, value)
{
	return {
		$: 'a3',
		n: key,
		o: value
	};
});
var _VirtualDom_attributeNS = F3(function(namespace, key, value)
{
	return {
		$: 'a4',
		n: key,
		o: { f: namespace, o: value }
	};
});



// XSS ATTACK VECTOR CHECKS
//
// For some reason, tabs can appear in href protocols and it still works.
// So '\tjava\tSCRIPT:alert("!!!")' and 'javascript:alert("!!!")' are the same
// in practice. That is why _VirtualDom_RE_js and _VirtualDom_RE_js_html look
// so freaky.
//
// Pulling the regular expressions out to the top level gives a slight speed
// boost in small benchmarks (4-10%) but hoisting values to reduce allocation
// can be unpredictable in large programs where JIT may have a harder time with
// functions are not fully self-contained. The benefit is more that the js and
// js_html ones are so weird that I prefer to see them near each other.


var _VirtualDom_RE_script = /^script$/i;
var _VirtualDom_RE_on_formAction = /^(on|formAction$)/i;
var _VirtualDom_RE_js = /^\s*j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:/i;
var _VirtualDom_RE_js_html = /^\s*(j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:|d\s*a\s*t\s*a\s*:\s*t\s*e\s*x\s*t\s*\/\s*h\s*t\s*m\s*l\s*(,|;))/i;


function _VirtualDom_noScript(tag)
{
	return _VirtualDom_RE_script.test(tag) ? 'p' : tag;
}

function _VirtualDom_noOnOrFormAction(key)
{
	return _VirtualDom_RE_on_formAction.test(key) ? 'data-' + key : key;
}

function _VirtualDom_noInnerHtmlOrFormAction(key)
{
	return key == 'innerHTML' || key == 'formAction' ? 'data-' + key : key;
}

function _VirtualDom_noJavaScriptUri(value)
{
	return _VirtualDom_RE_js.test(value)
		? /**/''//*//**_UNUSED/'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'//*/
		: value;
}

function _VirtualDom_noJavaScriptOrHtmlUri(value)
{
	return _VirtualDom_RE_js_html.test(value)
		? /**/''//*//**_UNUSED/'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'//*/
		: value;
}

function _VirtualDom_noJavaScriptOrHtmlJson(value)
{
	return (typeof _Json_unwrap(value) === 'string' && _VirtualDom_RE_js_html.test(_Json_unwrap(value)))
		? _Json_wrap(
			/**/''//*//**_UNUSED/'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'//*/
		) : value;
}



// MAP FACTS


var _VirtualDom_mapAttribute = F2(function(func, attr)
{
	return (attr.$ === 'a0')
		? A2(_VirtualDom_on, attr.n, _VirtualDom_mapHandler(func, attr.o))
		: attr;
});

function _VirtualDom_mapHandler(func, handler)
{
	var tag = $elm$virtual_dom$VirtualDom$toHandlerInt(handler);

	// 0 = Normal
	// 1 = MayStopPropagation
	// 2 = MayPreventDefault
	// 3 = Custom

	return {
		$: handler.$,
		a:
			!tag
				? A2($elm$json$Json$Decode$map, func, handler.a)
				:
			A3($elm$json$Json$Decode$map2,
				tag < 3
					? _VirtualDom_mapEventTuple
					: _VirtualDom_mapEventRecord,
				$elm$json$Json$Decode$succeed(func),
				handler.a
			)
	};
}

var _VirtualDom_mapEventTuple = F2(function(func, tuple)
{
	return _Utils_Tuple2(func(tuple.a), tuple.b);
});

var _VirtualDom_mapEventRecord = F2(function(func, record)
{
	return {
		aB: func(record.aB),
		dl: record.dl,
		db: record.db
	}
});



// ORGANIZE FACTS


function _VirtualDom_organizeFacts(factList)
{
	for (var facts = {}; factList.b; factList = factList.b) // WHILE_CONS
	{
		var entry = factList.a;

		var tag = entry.$;
		var key = entry.n;
		var value = entry.o;

		if (tag === 'a2')
		{
			(key === 'className')
				? _VirtualDom_addClass(facts, key, _Json_unwrap(value))
				: facts[key] = _Json_unwrap(value);

			continue;
		}

		var subFacts = facts[tag] || (facts[tag] = {});
		(tag === 'a3' && key === 'class')
			? _VirtualDom_addClass(subFacts, key, value)
			: subFacts[key] = value;
	}

	return facts;
}

function _VirtualDom_addClass(object, key, newClass)
{
	var classes = object[key];
	object[key] = classes ? classes + ' ' + newClass : newClass;
}



// RENDER


function _VirtualDom_render(vNode, eventNode)
{
	var tag = vNode.$;

	if (tag === 5)
	{
		return _VirtualDom_render(vNode.k || (vNode.k = vNode.m()), eventNode);
	}

	if (tag === 0)
	{
		return _VirtualDom_doc.createTextNode(vNode.a);
	}

	if (tag === 4)
	{
		var subNode = vNode.k;
		var tagger = vNode.j;

		while (subNode.$ === 4)
		{
			typeof tagger !== 'object'
				? tagger = [tagger, subNode.j]
				: tagger.push(subNode.j);

			subNode = subNode.k;
		}

		var subEventRoot = { j: tagger, p: eventNode };
		var domNode = _VirtualDom_render(subNode, subEventRoot);
		domNode.elm_event_node_ref = subEventRoot;
		return domNode;
	}

	if (tag === 3)
	{
		var domNode = vNode.h(vNode.g);
		_VirtualDom_applyFacts(domNode, eventNode, vNode.d);
		return domNode;
	}

	// at this point `tag` must be 1 or 2

	var domNode = vNode.f
		? _VirtualDom_doc.createElementNS(vNode.f, vNode.c)
		: _VirtualDom_doc.createElement(vNode.c);

	if (_VirtualDom_divertHrefToApp && vNode.c == 'a')
	{
		domNode.addEventListener('click', _VirtualDom_divertHrefToApp(domNode));
	}

	_VirtualDom_applyFacts(domNode, eventNode, vNode.d);

	for (var kids = vNode.e, i = 0; i < kids.length; i++)
	{
		_VirtualDom_appendChild(domNode, _VirtualDom_render(tag === 1 ? kids[i] : kids[i].b, eventNode));
	}

	return domNode;
}



// APPLY FACTS


function _VirtualDom_applyFacts(domNode, eventNode, facts)
{
	for (var key in facts)
	{
		var value = facts[key];

		key === 'a1'
			? _VirtualDom_applyStyles(domNode, value)
			:
		key === 'a0'
			? _VirtualDom_applyEvents(domNode, eventNode, value)
			:
		key === 'a3'
			? _VirtualDom_applyAttrs(domNode, value)
			:
		key === 'a4'
			? _VirtualDom_applyAttrsNS(domNode, value)
			:
		((key !== 'value' && key !== 'checked') || domNode[key] !== value) && (domNode[key] = value);
	}
}



// APPLY STYLES


function _VirtualDom_applyStyles(domNode, styles)
{
	var domNodeStyle = domNode.style;

	for (var key in styles)
	{
		domNodeStyle[key] = styles[key];
	}
}



// APPLY ATTRS


function _VirtualDom_applyAttrs(domNode, attrs)
{
	for (var key in attrs)
	{
		var value = attrs[key];
		typeof value !== 'undefined'
			? domNode.setAttribute(key, value)
			: domNode.removeAttribute(key);
	}
}



// APPLY NAMESPACED ATTRS


function _VirtualDom_applyAttrsNS(domNode, nsAttrs)
{
	for (var key in nsAttrs)
	{
		var pair = nsAttrs[key];
		var namespace = pair.f;
		var value = pair.o;

		typeof value !== 'undefined'
			? domNode.setAttributeNS(namespace, key, value)
			: domNode.removeAttributeNS(namespace, key);
	}
}



// APPLY EVENTS


function _VirtualDom_applyEvents(domNode, eventNode, events)
{
	var allCallbacks = domNode.elmFs || (domNode.elmFs = {});

	for (var key in events)
	{
		var newHandler = events[key];
		var oldCallback = allCallbacks[key];

		if (!newHandler)
		{
			domNode.removeEventListener(key, oldCallback);
			allCallbacks[key] = undefined;
			continue;
		}

		if (oldCallback)
		{
			var oldHandler = oldCallback.q;
			if (oldHandler.$ === newHandler.$)
			{
				oldCallback.q = newHandler;
				continue;
			}
			domNode.removeEventListener(key, oldCallback);
		}

		oldCallback = _VirtualDom_makeCallback(eventNode, newHandler);
		domNode.addEventListener(key, oldCallback,
			_VirtualDom_passiveSupported
			&& { passive: $elm$virtual_dom$VirtualDom$toHandlerInt(newHandler) < 2 }
		);
		allCallbacks[key] = oldCallback;
	}
}



// PASSIVE EVENTS


var _VirtualDom_passiveSupported;

try
{
	window.addEventListener('t', null, Object.defineProperty({}, 'passive', {
		get: function() { _VirtualDom_passiveSupported = true; }
	}));
}
catch(e) {}



// EVENT HANDLERS


function _VirtualDom_makeCallback(eventNode, initialHandler)
{
	function callback(event)
	{
		var handler = callback.q;
		var result = _Json_runHelp(handler.a, event);

		if (!$elm$core$Result$isOk(result))
		{
			return;
		}

		var tag = $elm$virtual_dom$VirtualDom$toHandlerInt(handler);

		// 0 = Normal
		// 1 = MayStopPropagation
		// 2 = MayPreventDefault
		// 3 = Custom

		var value = result.a;
		var message = !tag ? value : tag < 3 ? value.a : value.aB;
		var stopPropagation = tag == 1 ? value.b : tag == 3 && value.dl;
		var currentEventNode = (
			stopPropagation && event.stopPropagation(),
			(tag == 2 ? value.b : tag == 3 && value.db) && event.preventDefault(),
			eventNode
		);
		var tagger;
		var i;
		while (tagger = currentEventNode.j)
		{
			if (typeof tagger == 'function')
			{
				message = tagger(message);
			}
			else
			{
				for (var i = tagger.length; i--; )
				{
					message = tagger[i](message);
				}
			}
			currentEventNode = currentEventNode.p;
		}
		currentEventNode(message, stopPropagation); // stopPropagation implies isSync
	}

	callback.q = initialHandler;

	return callback;
}

function _VirtualDom_equalEvents(x, y)
{
	return x.$ == y.$ && _Json_equality(x.a, y.a);
}



// DIFF


// TODO: Should we do patches like in iOS?
//
// type Patch
//   = At Int Patch
//   | Batch (List Patch)
//   | Change ...
//
// How could it not be better?
//
function _VirtualDom_diff(x, y)
{
	var patches = [];
	_VirtualDom_diffHelp(x, y, patches, 0);
	return patches;
}


function _VirtualDom_pushPatch(patches, type, index, data)
{
	var patch = {
		$: type,
		r: index,
		s: data,
		t: undefined,
		u: undefined
	};
	patches.push(patch);
	return patch;
}


function _VirtualDom_diffHelp(x, y, patches, index)
{
	if (x === y)
	{
		return;
	}

	var xType = x.$;
	var yType = y.$;

	// Bail if you run into different types of nodes. Implies that the
	// structure has changed significantly and it's not worth a diff.
	if (xType !== yType)
	{
		if (xType === 1 && yType === 2)
		{
			y = _VirtualDom_dekey(y);
			yType = 1;
		}
		else
		{
			_VirtualDom_pushPatch(patches, 0, index, y);
			return;
		}
	}

	// Now we know that both nodes are the same $.
	switch (yType)
	{
		case 5:
			var xRefs = x.l;
			var yRefs = y.l;
			var i = xRefs.length;
			var same = i === yRefs.length;
			while (same && i--)
			{
				same = xRefs[i] === yRefs[i];
			}
			if (same)
			{
				y.k = x.k;
				return;
			}
			y.k = y.m();
			var subPatches = [];
			_VirtualDom_diffHelp(x.k, y.k, subPatches, 0);
			subPatches.length > 0 && _VirtualDom_pushPatch(patches, 1, index, subPatches);
			return;

		case 4:
			// gather nested taggers
			var xTaggers = x.j;
			var yTaggers = y.j;
			var nesting = false;

			var xSubNode = x.k;
			while (xSubNode.$ === 4)
			{
				nesting = true;

				typeof xTaggers !== 'object'
					? xTaggers = [xTaggers, xSubNode.j]
					: xTaggers.push(xSubNode.j);

				xSubNode = xSubNode.k;
			}

			var ySubNode = y.k;
			while (ySubNode.$ === 4)
			{
				nesting = true;

				typeof yTaggers !== 'object'
					? yTaggers = [yTaggers, ySubNode.j]
					: yTaggers.push(ySubNode.j);

				ySubNode = ySubNode.k;
			}

			// Just bail if different numbers of taggers. This implies the
			// structure of the virtual DOM has changed.
			if (nesting && xTaggers.length !== yTaggers.length)
			{
				_VirtualDom_pushPatch(patches, 0, index, y);
				return;
			}

			// check if taggers are "the same"
			if (nesting ? !_VirtualDom_pairwiseRefEqual(xTaggers, yTaggers) : xTaggers !== yTaggers)
			{
				_VirtualDom_pushPatch(patches, 2, index, yTaggers);
			}

			// diff everything below the taggers
			_VirtualDom_diffHelp(xSubNode, ySubNode, patches, index + 1);
			return;

		case 0:
			if (x.a !== y.a)
			{
				_VirtualDom_pushPatch(patches, 3, index, y.a);
			}
			return;

		case 1:
			_VirtualDom_diffNodes(x, y, patches, index, _VirtualDom_diffKids);
			return;

		case 2:
			_VirtualDom_diffNodes(x, y, patches, index, _VirtualDom_diffKeyedKids);
			return;

		case 3:
			if (x.h !== y.h)
			{
				_VirtualDom_pushPatch(patches, 0, index, y);
				return;
			}

			var factsDiff = _VirtualDom_diffFacts(x.d, y.d);
			factsDiff && _VirtualDom_pushPatch(patches, 4, index, factsDiff);

			var patch = y.i(x.g, y.g);
			patch && _VirtualDom_pushPatch(patches, 5, index, patch);

			return;
	}
}

// assumes the incoming arrays are the same length
function _VirtualDom_pairwiseRefEqual(as, bs)
{
	for (var i = 0; i < as.length; i++)
	{
		if (as[i] !== bs[i])
		{
			return false;
		}
	}

	return true;
}

function _VirtualDom_diffNodes(x, y, patches, index, diffKids)
{
	// Bail if obvious indicators have changed. Implies more serious
	// structural changes such that it's not worth it to diff.
	if (x.c !== y.c || x.f !== y.f)
	{
		_VirtualDom_pushPatch(patches, 0, index, y);
		return;
	}

	var factsDiff = _VirtualDom_diffFacts(x.d, y.d);
	factsDiff && _VirtualDom_pushPatch(patches, 4, index, factsDiff);

	diffKids(x, y, patches, index);
}



// DIFF FACTS


// TODO Instead of creating a new diff object, it's possible to just test if
// there *is* a diff. During the actual patch, do the diff again and make the
// modifications directly. This way, there's no new allocations. Worth it?
function _VirtualDom_diffFacts(x, y, category)
{
	var diff;

	// look for changes and removals
	for (var xKey in x)
	{
		if (xKey === 'a1' || xKey === 'a0' || xKey === 'a3' || xKey === 'a4')
		{
			var subDiff = _VirtualDom_diffFacts(x[xKey], y[xKey] || {}, xKey);
			if (subDiff)
			{
				diff = diff || {};
				diff[xKey] = subDiff;
			}
			continue;
		}

		// remove if not in the new facts
		if (!(xKey in y))
		{
			diff = diff || {};
			diff[xKey] =
				!category
					? (typeof x[xKey] === 'string' ? '' : null)
					:
				(category === 'a1')
					? ''
					:
				(category === 'a0' || category === 'a3')
					? undefined
					:
				{ f: x[xKey].f, o: undefined };

			continue;
		}

		var xValue = x[xKey];
		var yValue = y[xKey];

		// reference equal, so don't worry about it
		if (xValue === yValue && xKey !== 'value' && xKey !== 'checked'
			|| category === 'a0' && _VirtualDom_equalEvents(xValue, yValue))
		{
			continue;
		}

		diff = diff || {};
		diff[xKey] = yValue;
	}

	// add new stuff
	for (var yKey in y)
	{
		if (!(yKey in x))
		{
			diff = diff || {};
			diff[yKey] = y[yKey];
		}
	}

	return diff;
}



// DIFF KIDS


function _VirtualDom_diffKids(xParent, yParent, patches, index)
{
	var xKids = xParent.e;
	var yKids = yParent.e;

	var xLen = xKids.length;
	var yLen = yKids.length;

	// FIGURE OUT IF THERE ARE INSERTS OR REMOVALS

	if (xLen > yLen)
	{
		_VirtualDom_pushPatch(patches, 6, index, {
			v: yLen,
			i: xLen - yLen
		});
	}
	else if (xLen < yLen)
	{
		_VirtualDom_pushPatch(patches, 7, index, {
			v: xLen,
			e: yKids
		});
	}

	// PAIRWISE DIFF EVERYTHING ELSE

	for (var minLen = xLen < yLen ? xLen : yLen, i = 0; i < minLen; i++)
	{
		var xKid = xKids[i];
		_VirtualDom_diffHelp(xKid, yKids[i], patches, ++index);
		index += xKid.b || 0;
	}
}



// KEYED DIFF


function _VirtualDom_diffKeyedKids(xParent, yParent, patches, rootIndex)
{
	var localPatches = [];

	var changes = {}; // Dict String Entry
	var inserts = []; // Array { index : Int, entry : Entry }
	// type Entry = { tag : String, vnode : VNode, index : Int, data : _ }

	var xKids = xParent.e;
	var yKids = yParent.e;
	var xLen = xKids.length;
	var yLen = yKids.length;
	var xIndex = 0;
	var yIndex = 0;

	var index = rootIndex;

	while (xIndex < xLen && yIndex < yLen)
	{
		var x = xKids[xIndex];
		var y = yKids[yIndex];

		var xKey = x.a;
		var yKey = y.a;
		var xNode = x.b;
		var yNode = y.b;

		var newMatch = undefined;
		var oldMatch = undefined;

		// check if keys match

		if (xKey === yKey)
		{
			index++;
			_VirtualDom_diffHelp(xNode, yNode, localPatches, index);
			index += xNode.b || 0;

			xIndex++;
			yIndex++;
			continue;
		}

		// look ahead 1 to detect insertions and removals.

		var xNext = xKids[xIndex + 1];
		var yNext = yKids[yIndex + 1];

		if (xNext)
		{
			var xNextKey = xNext.a;
			var xNextNode = xNext.b;
			oldMatch = yKey === xNextKey;
		}

		if (yNext)
		{
			var yNextKey = yNext.a;
			var yNextNode = yNext.b;
			newMatch = xKey === yNextKey;
		}


		// swap x and y
		if (newMatch && oldMatch)
		{
			index++;
			_VirtualDom_diffHelp(xNode, yNextNode, localPatches, index);
			_VirtualDom_insertNode(changes, localPatches, xKey, yNode, yIndex, inserts);
			index += xNode.b || 0;

			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNextNode, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 2;
			continue;
		}

		// insert y
		if (newMatch)
		{
			index++;
			_VirtualDom_insertNode(changes, localPatches, yKey, yNode, yIndex, inserts);
			_VirtualDom_diffHelp(xNode, yNextNode, localPatches, index);
			index += xNode.b || 0;

			xIndex += 1;
			yIndex += 2;
			continue;
		}

		// remove x
		if (oldMatch)
		{
			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNode, index);
			index += xNode.b || 0;

			index++;
			_VirtualDom_diffHelp(xNextNode, yNode, localPatches, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 1;
			continue;
		}

		// remove x, insert y
		if (xNext && xNextKey === yNextKey)
		{
			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNode, index);
			_VirtualDom_insertNode(changes, localPatches, yKey, yNode, yIndex, inserts);
			index += xNode.b || 0;

			index++;
			_VirtualDom_diffHelp(xNextNode, yNextNode, localPatches, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 2;
			continue;
		}

		break;
	}

	// eat up any remaining nodes with removeNode and insertNode

	while (xIndex < xLen)
	{
		index++;
		var x = xKids[xIndex];
		var xNode = x.b;
		_VirtualDom_removeNode(changes, localPatches, x.a, xNode, index);
		index += xNode.b || 0;
		xIndex++;
	}

	while (yIndex < yLen)
	{
		var endInserts = endInserts || [];
		var y = yKids[yIndex];
		_VirtualDom_insertNode(changes, localPatches, y.a, y.b, undefined, endInserts);
		yIndex++;
	}

	if (localPatches.length > 0 || inserts.length > 0 || endInserts)
	{
		_VirtualDom_pushPatch(patches, 8, rootIndex, {
			w: localPatches,
			x: inserts,
			y: endInserts
		});
	}
}



// CHANGES FROM KEYED DIFF


var _VirtualDom_POSTFIX = '_elmW6BL';


function _VirtualDom_insertNode(changes, localPatches, key, vnode, yIndex, inserts)
{
	var entry = changes[key];

	// never seen this key before
	if (!entry)
	{
		entry = {
			c: 0,
			z: vnode,
			r: yIndex,
			s: undefined
		};

		inserts.push({ r: yIndex, A: entry });
		changes[key] = entry;

		return;
	}

	// this key was removed earlier, a match!
	if (entry.c === 1)
	{
		inserts.push({ r: yIndex, A: entry });

		entry.c = 2;
		var subPatches = [];
		_VirtualDom_diffHelp(entry.z, vnode, subPatches, entry.r);
		entry.r = yIndex;
		entry.s.s = {
			w: subPatches,
			A: entry
		};

		return;
	}

	// this key has already been inserted or moved, a duplicate!
	_VirtualDom_insertNode(changes, localPatches, key + _VirtualDom_POSTFIX, vnode, yIndex, inserts);
}


function _VirtualDom_removeNode(changes, localPatches, key, vnode, index)
{
	var entry = changes[key];

	// never seen this key before
	if (!entry)
	{
		var patch = _VirtualDom_pushPatch(localPatches, 9, index, undefined);

		changes[key] = {
			c: 1,
			z: vnode,
			r: index,
			s: patch
		};

		return;
	}

	// this key was inserted earlier, a match!
	if (entry.c === 0)
	{
		entry.c = 2;
		var subPatches = [];
		_VirtualDom_diffHelp(vnode, entry.z, subPatches, index);

		_VirtualDom_pushPatch(localPatches, 9, index, {
			w: subPatches,
			A: entry
		});

		return;
	}

	// this key has already been removed or moved, a duplicate!
	_VirtualDom_removeNode(changes, localPatches, key + _VirtualDom_POSTFIX, vnode, index);
}



// ADD DOM NODES
//
// Each DOM node has an "index" assigned in order of traversal. It is important
// to minimize our crawl over the actual DOM, so these indexes (along with the
// descendantsCount of virtual nodes) let us skip touching entire subtrees of
// the DOM if we know there are no patches there.


function _VirtualDom_addDomNodes(domNode, vNode, patches, eventNode)
{
	_VirtualDom_addDomNodesHelp(domNode, vNode, patches, 0, 0, vNode.b, eventNode);
}


// assumes `patches` is non-empty and indexes increase monotonically.
function _VirtualDom_addDomNodesHelp(domNode, vNode, patches, i, low, high, eventNode)
{
	var patch = patches[i];
	var index = patch.r;

	while (index === low)
	{
		var patchType = patch.$;

		if (patchType === 1)
		{
			_VirtualDom_addDomNodes(domNode, vNode.k, patch.s, eventNode);
		}
		else if (patchType === 8)
		{
			patch.t = domNode;
			patch.u = eventNode;

			var subPatches = patch.s.w;
			if (subPatches.length > 0)
			{
				_VirtualDom_addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
			}
		}
		else if (patchType === 9)
		{
			patch.t = domNode;
			patch.u = eventNode;

			var data = patch.s;
			if (data)
			{
				data.A.s = domNode;
				var subPatches = data.w;
				if (subPatches.length > 0)
				{
					_VirtualDom_addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
				}
			}
		}
		else
		{
			patch.t = domNode;
			patch.u = eventNode;
		}

		i++;

		if (!(patch = patches[i]) || (index = patch.r) > high)
		{
			return i;
		}
	}

	var tag = vNode.$;

	if (tag === 4)
	{
		var subNode = vNode.k;

		while (subNode.$ === 4)
		{
			subNode = subNode.k;
		}

		return _VirtualDom_addDomNodesHelp(domNode, subNode, patches, i, low + 1, high, domNode.elm_event_node_ref);
	}

	// tag must be 1 or 2 at this point

	var vKids = vNode.e;
	var childNodes = domNode.childNodes;
	for (var j = 0; j < vKids.length; j++)
	{
		low++;
		var vKid = tag === 1 ? vKids[j] : vKids[j].b;
		var nextLow = low + (vKid.b || 0);
		if (low <= index && index <= nextLow)
		{
			i = _VirtualDom_addDomNodesHelp(childNodes[j], vKid, patches, i, low, nextLow, eventNode);
			if (!(patch = patches[i]) || (index = patch.r) > high)
			{
				return i;
			}
		}
		low = nextLow;
	}
	return i;
}



// APPLY PATCHES


function _VirtualDom_applyPatches(rootDomNode, oldVirtualNode, patches, eventNode)
{
	if (patches.length === 0)
	{
		return rootDomNode;
	}

	_VirtualDom_addDomNodes(rootDomNode, oldVirtualNode, patches, eventNode);
	return _VirtualDom_applyPatchesHelp(rootDomNode, patches);
}

function _VirtualDom_applyPatchesHelp(rootDomNode, patches)
{
	for (var i = 0; i < patches.length; i++)
	{
		var patch = patches[i];
		var localDomNode = patch.t
		var newNode = _VirtualDom_applyPatch(localDomNode, patch);
		if (localDomNode === rootDomNode)
		{
			rootDomNode = newNode;
		}
	}
	return rootDomNode;
}

function _VirtualDom_applyPatch(domNode, patch)
{
	switch (patch.$)
	{
		case 0:
			return _VirtualDom_applyPatchRedraw(domNode, patch.s, patch.u);

		case 4:
			_VirtualDom_applyFacts(domNode, patch.u, patch.s);
			return domNode;

		case 3:
			domNode.replaceData(0, domNode.length, patch.s);
			return domNode;

		case 1:
			return _VirtualDom_applyPatchesHelp(domNode, patch.s);

		case 2:
			if (domNode.elm_event_node_ref)
			{
				domNode.elm_event_node_ref.j = patch.s;
			}
			else
			{
				domNode.elm_event_node_ref = { j: patch.s, p: patch.u };
			}
			return domNode;

		case 6:
			var data = patch.s;
			for (var i = 0; i < data.i; i++)
			{
				domNode.removeChild(domNode.childNodes[data.v]);
			}
			return domNode;

		case 7:
			var data = patch.s;
			var kids = data.e;
			var i = data.v;
			var theEnd = domNode.childNodes[i];
			for (; i < kids.length; i++)
			{
				domNode.insertBefore(_VirtualDom_render(kids[i], patch.u), theEnd);
			}
			return domNode;

		case 9:
			var data = patch.s;
			if (!data)
			{
				domNode.parentNode.removeChild(domNode);
				return domNode;
			}
			var entry = data.A;
			if (typeof entry.r !== 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
			}
			entry.s = _VirtualDom_applyPatchesHelp(domNode, data.w);
			return domNode;

		case 8:
			return _VirtualDom_applyPatchReorder(domNode, patch);

		case 5:
			return patch.s(domNode);

		default:
			_Debug_crash(10); // 'Ran into an unknown patch!'
	}
}


function _VirtualDom_applyPatchRedraw(domNode, vNode, eventNode)
{
	var parentNode = domNode.parentNode;
	var newNode = _VirtualDom_render(vNode, eventNode);

	if (!newNode.elm_event_node_ref)
	{
		newNode.elm_event_node_ref = domNode.elm_event_node_ref;
	}

	if (parentNode && newNode !== domNode)
	{
		parentNode.replaceChild(newNode, domNode);
	}
	return newNode;
}


function _VirtualDom_applyPatchReorder(domNode, patch)
{
	var data = patch.s;

	// remove end inserts
	var frag = _VirtualDom_applyPatchReorderEndInsertsHelp(data.y, patch);

	// removals
	domNode = _VirtualDom_applyPatchesHelp(domNode, data.w);

	// inserts
	var inserts = data.x;
	for (var i = 0; i < inserts.length; i++)
	{
		var insert = inserts[i];
		var entry = insert.A;
		var node = entry.c === 2
			? entry.s
			: _VirtualDom_render(entry.z, patch.u);
		domNode.insertBefore(node, domNode.childNodes[insert.r]);
	}

	// add end inserts
	if (frag)
	{
		_VirtualDom_appendChild(domNode, frag);
	}

	return domNode;
}


function _VirtualDom_applyPatchReorderEndInsertsHelp(endInserts, patch)
{
	if (!endInserts)
	{
		return;
	}

	var frag = _VirtualDom_doc.createDocumentFragment();
	for (var i = 0; i < endInserts.length; i++)
	{
		var insert = endInserts[i];
		var entry = insert.A;
		_VirtualDom_appendChild(frag, entry.c === 2
			? entry.s
			: _VirtualDom_render(entry.z, patch.u)
		);
	}
	return frag;
}


function _VirtualDom_virtualize(node)
{
	// TEXT NODES

	if (node.nodeType === 3)
	{
		return _VirtualDom_text(node.textContent);
	}


	// WEIRD NODES

	if (node.nodeType !== 1)
	{
		return _VirtualDom_text('');
	}


	// ELEMENT NODES

	var attrList = _List_Nil;
	var attrs = node.attributes;
	for (var i = attrs.length; i--; )
	{
		var attr = attrs[i];
		var name = attr.name;
		var value = attr.value;
		attrList = _List_Cons( A2(_VirtualDom_attribute, name, value), attrList );
	}

	var tag = node.tagName.toLowerCase();
	var kidList = _List_Nil;
	var kids = node.childNodes;

	for (var i = kids.length; i--; )
	{
		kidList = _List_Cons(_VirtualDom_virtualize(kids[i]), kidList);
	}
	return A3(_VirtualDom_node, tag, attrList, kidList);
}

function _VirtualDom_dekey(keyedNode)
{
	var keyedKids = keyedNode.e;
	var len = keyedKids.length;
	var kids = new Array(len);
	for (var i = 0; i < len; i++)
	{
		kids[i] = keyedKids[i].b;
	}

	return {
		$: 1,
		c: keyedNode.c,
		d: keyedNode.d,
		e: kids,
		f: keyedNode.f,
		b: keyedNode.b
	};
}




// ELEMENT


var _Debugger_element;

// This function was slightly modified by elm-watch.
var _Browser_element = _Debugger_element || F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		impl._impl ? "Browser.sandbox" : "Browser.element", // added by elm-watch
		debugMetadata, // added by elm-watch
		flagDecoder,
		args,
		impl.fi,
		// impl.update, // commented out by elm-watch
		// impl.subscriptions, // commented out by elm-watch
		impl, // added by elm-watch
		function(sendToApp, initialModel) {
			// var view = impl.view; // commented out by elm-watch
			/**_UNUSED/ // always UNUSED with elm-watch
			var domNode = args['node'];
			//*/
			/**/
			var domNode = args && args['node'] ? args['node'] : _Debug_crash(0);
			//*/
			var currNode = _VirtualDom_virtualize(domNode);

			return _Browser_makeAnimator(initialModel, function(model)
			{
				// var nextNode = view(model); // commented out by elm-watch
				var nextNode = impl.fP(model); // added by elm-watch
				var patches = _VirtualDom_diff(currNode, nextNode);
				domNode = _VirtualDom_applyPatches(domNode, currNode, patches, sendToApp);
				currNode = nextNode;
			});
		}
	);
});



// DOCUMENT


var _Debugger_document;

// This function was slightly modified by elm-watch.
var _Browser_document = _Debugger_document || F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		impl._impl ? "Browser.application" : "Browser.document", // added by elm-watch
		debugMetadata, // added by elm-watch
		flagDecoder,
		args,
		impl.fi,
		// impl.update, // commented out by elm-watch
		// impl.subscriptions, // commented out by elm-watch
		impl, // added by elm-watch
		function(sendToApp, initialModel) {
			var divertHrefToApp = impl.dj && impl.dj(sendToApp)
			// var view = impl.view; // commented out by elm-watch
			var title = _VirtualDom_doc.title;
			var bodyNode = _VirtualDom_doc.body;
			var currNode = _VirtualDom_virtualize(bodyNode);
			return _Browser_makeAnimator(initialModel, function(model)
			{
				_VirtualDom_divertHrefToApp = divertHrefToApp;
				// var doc = view(model); // commented out by elm-watch
				var doc = impl.fP(model); // added by elm-watch
				var nextNode = _VirtualDom_node('body')(_List_Nil)(doc.eS);
				var patches = _VirtualDom_diff(currNode, nextNode);
				bodyNode = _VirtualDom_applyPatches(bodyNode, currNode, patches, sendToApp);
				currNode = nextNode;
				_VirtualDom_divertHrefToApp = 0;
				(title !== doc.fL) && (_VirtualDom_doc.title = title = doc.fL);
			});
		}
	);
});



// ANIMATION


var _Browser_cancelAnimationFrame =
	typeof cancelAnimationFrame !== 'undefined'
		? cancelAnimationFrame
		: function(id) { clearTimeout(id); };

var _Browser_requestAnimationFrame =
	typeof requestAnimationFrame !== 'undefined'
		? requestAnimationFrame
		: function(callback) { return setTimeout(callback, 1000 / 60); };


function _Browser_makeAnimator(model, draw)
{
	draw(model);

	var state = 0;

	function updateIfNeeded()
	{
		state = state === 1
			? 0
			: ( _Browser_requestAnimationFrame(updateIfNeeded), draw(model), 1 );
	}

	return function(nextModel, isSync)
	{
		model = nextModel;

		isSync
			? ( draw(model),
				state === 2 && (state = 1)
				)
			: ( state === 0 && _Browser_requestAnimationFrame(updateIfNeeded),
				state = 2
				);
	};
}



// APPLICATION


// This function was slightly modified by elm-watch.
function _Browser_application(impl)
{
	// var onUrlChange = impl.onUrlChange; // commented out by elm-watch
	// var onUrlRequest = impl.onUrlRequest; // commented out by elm-watch
	// var key = function() { key.a(onUrlChange(_Browser_getUrl())); }; // commented out by elm-watch
	var key = function() { key.a(impl.fr(_Browser_getUrl())); }; // added by elm-watch

	return _Browser_document({
		dj: function(sendToApp)
		{
			key.a = sendToApp;
			_Browser_window.addEventListener('popstate', key);
			_Browser_window.navigator.userAgent.indexOf('Trident') < 0 || _Browser_window.addEventListener('hashchange', key);

			return F2(function(domNode, event)
			{
				if (!event.ctrlKey && !event.metaKey && !event.shiftKey && event.button < 1 && !domNode.target && !domNode.hasAttribute('download'))
				{
					event.preventDefault();
					var href = domNode.href;
					var curr = _Browser_getUrl();
					var next = $elm$url$Url$fromString(href).a;
					sendToApp(impl.fs(
						(next
							&& curr.ep === next.ep
							&& curr.dH === next.dH
							&& curr.em.a === next.em.a
						)
							? $elm$browser$Browser$Internal(next)
							: $elm$browser$Browser$External(href)
					));
				}
			});
		},
		fi: function(flags)
		{
			// return A3(impl.init, flags, _Browser_getUrl(), key); // commented out by elm-watch
			return A3(impl.fi, flags, window.__ELM_WATCH_INIT_URL, key); // added by elm-watch
		},
		// view: impl.view, // commented out by elm-watch
		// update: impl.update, // commented out by elm-watch
		// subscriptions: impl.subscriptions // commented out by elm-watch
		fP: function(model) { return impl.fP(model); }, // added by elm-watch
		_impl: impl // added by elm-watch
	});
}

function _Browser_getUrl()
{
	return $elm$url$Url$fromString(_VirtualDom_doc.location.href).a || _Debug_crash(1);
}

var _Browser_go = F2(function(key, n)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		n && history.go(n);
		key();
	}));
});

var _Browser_pushUrl = F2(function(key, url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		history.pushState({}, '', url);
		key();
	}));
});

var _Browser_replaceUrl = F2(function(key, url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		history.replaceState({}, '', url);
		key();
	}));
});



// GLOBAL EVENTS


var _Browser_fakeNode = { addEventListener: function() {}, removeEventListener: function() {} };
var _Browser_doc = typeof document !== 'undefined' ? document : _Browser_fakeNode;
var _Browser_window = typeof window !== 'undefined' ? window : _Browser_fakeNode;

var _Browser_on = F3(function(node, eventName, sendToSelf)
{
	return _Scheduler_spawn(_Scheduler_binding(function(callback)
	{
		function handler(event)	{ _Scheduler_rawSpawn(sendToSelf(event)); }
		node.addEventListener(eventName, handler, _VirtualDom_passiveSupported && { passive: true });
		return function() { node.removeEventListener(eventName, handler); };
	}));
});

var _Browser_decodeEvent = F2(function(decoder, event)
{
	var result = _Json_runHelp(decoder, event);
	return $elm$core$Result$isOk(result) ? $elm$core$Maybe$Just(result.a) : $elm$core$Maybe$Nothing;
});



// PAGE VISIBILITY


function _Browser_visibilityInfo()
{
	return (typeof _VirtualDom_doc.hidden !== 'undefined')
		? { fg: 'hidden', eW: 'visibilitychange' }
		:
	(typeof _VirtualDom_doc.mozHidden !== 'undefined')
		? { fg: 'mozHidden', eW: 'mozvisibilitychange' }
		:
	(typeof _VirtualDom_doc.msHidden !== 'undefined')
		? { fg: 'msHidden', eW: 'msvisibilitychange' }
		:
	(typeof _VirtualDom_doc.webkitHidden !== 'undefined')
		? { fg: 'webkitHidden', eW: 'webkitvisibilitychange' }
		: { fg: 'hidden', eW: 'visibilitychange' };
}



// ANIMATION FRAMES


function _Browser_rAF()
{
	return _Scheduler_binding(function(callback)
	{
		var id = _Browser_requestAnimationFrame(function() {
			callback(_Scheduler_succeed(Date.now()));
		});

		return function() {
			_Browser_cancelAnimationFrame(id);
		};
	});
}


function _Browser_now()
{
	return _Scheduler_binding(function(callback)
	{
		callback(_Scheduler_succeed(Date.now()));
	});
}



// DOM STUFF


function _Browser_withNode(id, doStuff)
{
	return _Scheduler_binding(function(callback)
	{
		_Browser_requestAnimationFrame(function() {
			var node = document.getElementById(id);
			callback(node
				? _Scheduler_succeed(doStuff(node))
				: _Scheduler_fail($elm$browser$Browser$Dom$NotFound(id))
			);
		});
	});
}


function _Browser_withWindow(doStuff)
{
	return _Scheduler_binding(function(callback)
	{
		_Browser_requestAnimationFrame(function() {
			callback(_Scheduler_succeed(doStuff()));
		});
	});
}


// FOCUS and BLUR


var _Browser_call = F2(function(functionName, id)
{
	return _Browser_withNode(id, function(node) {
		node[functionName]();
		return _Utils_Tuple0;
	});
});



// WINDOW VIEWPORT


function _Browser_getViewport()
{
	return {
		ew: _Browser_getScene(),
		eH: {
			eK: _Browser_window.pageXOffset,
			eL: _Browser_window.pageYOffset,
			eJ: _Browser_doc.documentElement.clientWidth,
			dG: _Browser_doc.documentElement.clientHeight
		}
	};
}

function _Browser_getScene()
{
	var body = _Browser_doc.body;
	var elem = _Browser_doc.documentElement;
	return {
		eJ: Math.max(body.scrollWidth, body.offsetWidth, elem.scrollWidth, elem.offsetWidth, elem.clientWidth),
		dG: Math.max(body.scrollHeight, body.offsetHeight, elem.scrollHeight, elem.offsetHeight, elem.clientHeight)
	};
}

var _Browser_setViewport = F2(function(x, y)
{
	return _Browser_withWindow(function()
	{
		_Browser_window.scroll(x, y);
		return _Utils_Tuple0;
	});
});



// ELEMENT VIEWPORT


function _Browser_getViewportOf(id)
{
	return _Browser_withNode(id, function(node)
	{
		return {
			ew: {
				eJ: node.scrollWidth,
				dG: node.scrollHeight
			},
			eH: {
				eK: node.scrollLeft,
				eL: node.scrollTop,
				eJ: node.clientWidth,
				dG: node.clientHeight
			}
		};
	});
}


var _Browser_setViewportOf = F3(function(id, x, y)
{
	return _Browser_withNode(id, function(node)
	{
		node.scrollLeft = x;
		node.scrollTop = y;
		return _Utils_Tuple0;
	});
});



// ELEMENT


function _Browser_getElement(id)
{
	return _Browser_withNode(id, function(node)
	{
		var rect = node.getBoundingClientRect();
		var x = _Browser_window.pageXOffset;
		var y = _Browser_window.pageYOffset;
		return {
			ew: _Browser_getScene(),
			eH: {
				eK: x,
				eL: y,
				eJ: _Browser_doc.documentElement.clientWidth,
				dG: _Browser_doc.documentElement.clientHeight
			},
			e2: {
				eK: x + rect.left,
				eL: y + rect.top,
				eJ: rect.width,
				dG: rect.height
			}
		};
	});
}



// LOAD and RELOAD


function _Browser_reload(skipCache)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function(callback)
	{
		_VirtualDom_doc.location.reload(skipCache);
	}));
}

function _Browser_load(url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function(callback)
	{
		try
		{
			_Browser_window.location = url;
		}
		catch(err)
		{
			// Only Firefox can throw a NS_ERROR_MALFORMED_URI exception here.
			// Other browsers reload the page, so let's be consistent about that.
			_VirtualDom_doc.location.reload(false);
		}
	}));
}



// SEND REQUEST

var _Http_toTask = F3(function(router, toTask, request)
{
	return _Scheduler_binding(function(callback)
	{
		function done(response) {
			callback(toTask(request.e5.a(response)));
		}

		var xhr = new XMLHttpRequest();
		xhr.addEventListener('error', function() { done($elm$http$Http$NetworkError_); });
		xhr.addEventListener('timeout', function() { done($elm$http$Http$Timeout_); });
		xhr.addEventListener('load', function() { done(_Http_toResponse(request.e5.b, xhr)); });
		$elm$core$Maybe$isJust(request.eE) && _Http_track(router, xhr, request.eE.a);

		try {
			xhr.open(request.fn, request.fN, true);
		} catch (e) {
			return done($elm$http$Http$BadUrl_(request.fN));
		}

		_Http_configureRequest(xhr, request);

		request.eS.a && xhr.setRequestHeader('Content-Type', request.eS.a);
		xhr.send(request.eS.b);

		return function() { xhr.c = true; xhr.abort(); };
	});
});


// CONFIGURE

function _Http_configureRequest(xhr, request)
{
	for (var headers = request.dF; headers.b; headers = headers.b) // WHILE_CONS
	{
		xhr.setRequestHeader(headers.a.a, headers.a.b);
	}
	xhr.timeout = request.fK.a || 0;
	xhr.responseType = request.e5.d;
	xhr.withCredentials = request.eN;
}


// RESPONSES

function _Http_toResponse(toBody, xhr)
{
	return A2(
		200 <= xhr.status && xhr.status < 300 ? $elm$http$Http$GoodStatus_ : $elm$http$Http$BadStatus_,
		_Http_toMetadata(xhr),
		toBody(xhr.response)
	);
}


// METADATA

function _Http_toMetadata(xhr)
{
	return {
		fN: xhr.responseURL,
		fF: xhr.status,
		fG: xhr.statusText,
		dF: _Http_parseHeaders(xhr.getAllResponseHeaders())
	};
}


// HEADERS

function _Http_parseHeaders(rawHeaders)
{
	if (!rawHeaders)
	{
		return $elm$core$Dict$empty;
	}

	var headers = $elm$core$Dict$empty;
	var headerPairs = rawHeaders.split('\r\n');
	for (var i = headerPairs.length; i--; )
	{
		var headerPair = headerPairs[i];
		var index = headerPair.indexOf(': ');
		if (index > 0)
		{
			var key = headerPair.substring(0, index);
			var value = headerPair.substring(index + 2);

			headers = A3($elm$core$Dict$update, key, function(oldValue) {
				return $elm$core$Maybe$Just($elm$core$Maybe$isJust(oldValue)
					? value + ', ' + oldValue.a
					: value
				);
			}, headers);
		}
	}
	return headers;
}


// EXPECT

var _Http_expect = F3(function(type, toBody, toValue)
{
	return {
		$: 0,
		d: type,
		b: toBody,
		a: toValue
	};
});

var _Http_mapExpect = F2(function(func, expect)
{
	return {
		$: 0,
		d: expect.d,
		b: expect.b,
		a: function(x) { return func(expect.a(x)); }
	};
});

function _Http_toDataView(arrayBuffer)
{
	return new DataView(arrayBuffer);
}


// BODY and PARTS

var _Http_emptyBody = { $: 0 };
var _Http_pair = F2(function(a, b) { return { $: 0, a: a, b: b }; });

function _Http_toFormData(parts)
{
	for (var formData = new FormData(); parts.b; parts = parts.b) // WHILE_CONS
	{
		var part = parts.a;
		formData.append(part.a, part.b);
	}
	return formData;
}

var _Http_bytesToBlob = F2(function(mime, bytes)
{
	return new Blob([bytes], { type: mime });
});


// PROGRESS

function _Http_track(router, xhr, tracker)
{
	// TODO check out lengthComputable on loadstart event

	xhr.upload.addEventListener('progress', function(event) {
		if (xhr.c) { return; }
		_Scheduler_rawSpawn(A2($elm$core$Platform$sendToSelf, router, _Utils_Tuple2(tracker, $elm$http$Http$Sending({
			fz: event.loaded,
			fD: event.total
		}))));
	});
	xhr.addEventListener('progress', function(event) {
		if (xhr.c) { return; }
		_Scheduler_rawSpawn(A2($elm$core$Platform$sendToSelf, router, _Utils_Tuple2(tracker, $elm$http$Http$Receiving({
			fx: event.loaded,
			fD: event.lengthComputable ? $elm$core$Maybe$Just(event.total) : $elm$core$Maybe$Nothing
		}))));
	});
}


var _Bitwise_and = F2(function(a, b)
{
	return a & b;
});

var _Bitwise_or = F2(function(a, b)
{
	return a | b;
});

var _Bitwise_xor = F2(function(a, b)
{
	return a ^ b;
});

function _Bitwise_complement(a)
{
	return ~a;
};

var _Bitwise_shiftLeftBy = F2(function(offset, a)
{
	return a << offset;
});

var _Bitwise_shiftRightBy = F2(function(offset, a)
{
	return a >> offset;
});

var _Bitwise_shiftRightZfBy = F2(function(offset, a)
{
	return a >>> offset;
});


/*
 * Copyright (c) 2010 Mozilla Corporation
 * Copyright (c) 2010 Vladimir Vukicevic
 * Copyright (c) 2013 John Mayer
 * Copyright (c) 2018 Andrey Kuzmin
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

// Vector2

var _MJS_v2 = F2(function(x, y) {
    return new Float64Array([x, y]);
});

var _MJS_v2getX = function(a) {
    return a[0];
};

var _MJS_v2getY = function(a) {
    return a[1];
};

var _MJS_v2setX = F2(function(x, a) {
    return new Float64Array([x, a[1]]);
});

var _MJS_v2setY = F2(function(y, a) {
    return new Float64Array([a[0], y]);
});

var _MJS_v2toRecord = function(a) {
    return { eK: a[0], eL: a[1] };
};

var _MJS_v2fromRecord = function(r) {
    return new Float64Array([r.eK, r.eL]);
};

var _MJS_v2add = F2(function(a, b) {
    var r = new Float64Array(2);
    r[0] = a[0] + b[0];
    r[1] = a[1] + b[1];
    return r;
});

var _MJS_v2sub = F2(function(a, b) {
    var r = new Float64Array(2);
    r[0] = a[0] - b[0];
    r[1] = a[1] - b[1];
    return r;
});

var _MJS_v2negate = function(a) {
    var r = new Float64Array(2);
    r[0] = -a[0];
    r[1] = -a[1];
    return r;
};

var _MJS_v2direction = F2(function(a, b) {
    var r = new Float64Array(2);
    r[0] = a[0] - b[0];
    r[1] = a[1] - b[1];
    var im = 1.0 / _MJS_v2lengthLocal(r);
    r[0] = r[0] * im;
    r[1] = r[1] * im;
    return r;
});

function _MJS_v2lengthLocal(a) {
    return Math.sqrt(a[0] * a[0] + a[1] * a[1]);
}
var _MJS_v2length = _MJS_v2lengthLocal;

var _MJS_v2lengthSquared = function(a) {
    return a[0] * a[0] + a[1] * a[1];
};

var _MJS_v2distance = F2(function(a, b) {
    var dx = a[0] - b[0];
    var dy = a[1] - b[1];
    return Math.sqrt(dx * dx + dy * dy);
});

var _MJS_v2distanceSquared = F2(function(a, b) {
    var dx = a[0] - b[0];
    var dy = a[1] - b[1];
    return dx * dx + dy * dy;
});

var _MJS_v2normalize = function(a) {
    var r = new Float64Array(2);
    var im = 1.0 / _MJS_v2lengthLocal(a);
    r[0] = a[0] * im;
    r[1] = a[1] * im;
    return r;
};

var _MJS_v2scale = F2(function(k, a) {
    var r = new Float64Array(2);
    r[0] = a[0] * k;
    r[1] = a[1] * k;
    return r;
});

var _MJS_v2dot = F2(function(a, b) {
    return a[0] * b[0] + a[1] * b[1];
});

// Vector3

var _MJS_v3temp1Local = new Float64Array(3);
var _MJS_v3temp2Local = new Float64Array(3);
var _MJS_v3temp3Local = new Float64Array(3);

var _MJS_v3 = F3(function(x, y, z) {
    return new Float64Array([x, y, z]);
});

var _MJS_v3getX = function(a) {
    return a[0];
};

var _MJS_v3getY = function(a) {
    return a[1];
};

var _MJS_v3getZ = function(a) {
    return a[2];
};

var _MJS_v3setX = F2(function(x, a) {
    return new Float64Array([x, a[1], a[2]]);
});

var _MJS_v3setY = F2(function(y, a) {
    return new Float64Array([a[0], y, a[2]]);
});

var _MJS_v3setZ = F2(function(z, a) {
    return new Float64Array([a[0], a[1], z]);
});

var _MJS_v3toRecord = function(a) {
    return { eK: a[0], eL: a[1], cz: a[2] };
};

var _MJS_v3fromRecord = function(r) {
    return new Float64Array([r.eK, r.eL, r.cz]);
};

var _MJS_v3add = F2(function(a, b) {
    var r = new Float64Array(3);
    r[0] = a[0] + b[0];
    r[1] = a[1] + b[1];
    r[2] = a[2] + b[2];
    return r;
});

function _MJS_v3subLocal(a, b, r) {
    if (r === undefined) {
        r = new Float64Array(3);
    }
    r[0] = a[0] - b[0];
    r[1] = a[1] - b[1];
    r[2] = a[2] - b[2];
    return r;
}
var _MJS_v3sub = F2(_MJS_v3subLocal);

var _MJS_v3negate = function(a) {
    var r = new Float64Array(3);
    r[0] = -a[0];
    r[1] = -a[1];
    r[2] = -a[2];
    return r;
};

function _MJS_v3directionLocal(a, b, r) {
    if (r === undefined) {
        r = new Float64Array(3);
    }
    return _MJS_v3normalizeLocal(_MJS_v3subLocal(a, b, r), r);
}
var _MJS_v3direction = F2(_MJS_v3directionLocal);

function _MJS_v3lengthLocal(a) {
    return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
}
var _MJS_v3length = _MJS_v3lengthLocal;

var _MJS_v3lengthSquared = function(a) {
    return a[0] * a[0] + a[1] * a[1] + a[2] * a[2];
};

var _MJS_v3distance = F2(function(a, b) {
    var dx = a[0] - b[0];
    var dy = a[1] - b[1];
    var dz = a[2] - b[2];
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
});

var _MJS_v3distanceSquared = F2(function(a, b) {
    var dx = a[0] - b[0];
    var dy = a[1] - b[1];
    var dz = a[2] - b[2];
    return dx * dx + dy * dy + dz * dz;
});

function _MJS_v3normalizeLocal(a, r) {
    if (r === undefined) {
        r = new Float64Array(3);
    }
    var im = 1.0 / _MJS_v3lengthLocal(a);
    r[0] = a[0] * im;
    r[1] = a[1] * im;
    r[2] = a[2] * im;
    return r;
}
var _MJS_v3normalize = _MJS_v3normalizeLocal;

var _MJS_v3scale = F2(function(k, a) {
    return new Float64Array([a[0] * k, a[1] * k, a[2] * k]);
});

var _MJS_v3dotLocal = function(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
};
var _MJS_v3dot = F2(_MJS_v3dotLocal);

function _MJS_v3crossLocal(a, b, r) {
    if (r === undefined) {
        r = new Float64Array(3);
    }
    r[0] = a[1] * b[2] - a[2] * b[1];
    r[1] = a[2] * b[0] - a[0] * b[2];
    r[2] = a[0] * b[1] - a[1] * b[0];
    return r;
}
var _MJS_v3cross = F2(_MJS_v3crossLocal);

var _MJS_v3mul4x4 = F2(function(m, v) {
    var w;
    var tmp = _MJS_v3temp1Local;
    var r = new Float64Array(3);

    tmp[0] = m[3];
    tmp[1] = m[7];
    tmp[2] = m[11];
    w = _MJS_v3dotLocal(v, tmp) + m[15];
    tmp[0] = m[0];
    tmp[1] = m[4];
    tmp[2] = m[8];
    r[0] = (_MJS_v3dotLocal(v, tmp) + m[12]) / w;
    tmp[0] = m[1];
    tmp[1] = m[5];
    tmp[2] = m[9];
    r[1] = (_MJS_v3dotLocal(v, tmp) + m[13]) / w;
    tmp[0] = m[2];
    tmp[1] = m[6];
    tmp[2] = m[10];
    r[2] = (_MJS_v3dotLocal(v, tmp) + m[14]) / w;
    return r;
});

// Vector4

var _MJS_v4 = F4(function(x, y, z, w) {
    return new Float64Array([x, y, z, w]);
});

var _MJS_v4getX = function(a) {
    return a[0];
};

var _MJS_v4getY = function(a) {
    return a[1];
};

var _MJS_v4getZ = function(a) {
    return a[2];
};

var _MJS_v4getW = function(a) {
    return a[3];
};

var _MJS_v4setX = F2(function(x, a) {
    return new Float64Array([x, a[1], a[2], a[3]]);
});

var _MJS_v4setY = F2(function(y, a) {
    return new Float64Array([a[0], y, a[2], a[3]]);
});

var _MJS_v4setZ = F2(function(z, a) {
    return new Float64Array([a[0], a[1], z, a[3]]);
});

var _MJS_v4setW = F2(function(w, a) {
    return new Float64Array([a[0], a[1], a[2], w]);
});

var _MJS_v4toRecord = function(a) {
    return { eK: a[0], eL: a[1], cz: a[2], eI: a[3] };
};

var _MJS_v4fromRecord = function(r) {
    return new Float64Array([r.eK, r.eL, r.cz, r.eI]);
};

var _MJS_v4add = F2(function(a, b) {
    var r = new Float64Array(4);
    r[0] = a[0] + b[0];
    r[1] = a[1] + b[1];
    r[2] = a[2] + b[2];
    r[3] = a[3] + b[3];
    return r;
});

var _MJS_v4sub = F2(function(a, b) {
    var r = new Float64Array(4);
    r[0] = a[0] - b[0];
    r[1] = a[1] - b[1];
    r[2] = a[2] - b[2];
    r[3] = a[3] - b[3];
    return r;
});

var _MJS_v4negate = function(a) {
    var r = new Float64Array(4);
    r[0] = -a[0];
    r[1] = -a[1];
    r[2] = -a[2];
    r[3] = -a[3];
    return r;
};

var _MJS_v4direction = F2(function(a, b) {
    var r = new Float64Array(4);
    r[0] = a[0] - b[0];
    r[1] = a[1] - b[1];
    r[2] = a[2] - b[2];
    r[3] = a[3] - b[3];
    var im = 1.0 / _MJS_v4lengthLocal(r);
    r[0] = r[0] * im;
    r[1] = r[1] * im;
    r[2] = r[2] * im;
    r[3] = r[3] * im;
    return r;
});

function _MJS_v4lengthLocal(a) {
    return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2] + a[3] * a[3]);
}
var _MJS_v4length = _MJS_v4lengthLocal;

var _MJS_v4lengthSquared = function(a) {
    return a[0] * a[0] + a[1] * a[1] + a[2] * a[2] + a[3] * a[3];
};

var _MJS_v4distance = F2(function(a, b) {
    var dx = a[0] - b[0];
    var dy = a[1] - b[1];
    var dz = a[2] - b[2];
    var dw = a[3] - b[3];
    return Math.sqrt(dx * dx + dy * dy + dz * dz + dw * dw);
});

var _MJS_v4distanceSquared = F2(function(a, b) {
    var dx = a[0] - b[0];
    var dy = a[1] - b[1];
    var dz = a[2] - b[2];
    var dw = a[3] - b[3];
    return dx * dx + dy * dy + dz * dz + dw * dw;
});

var _MJS_v4normalize = function(a) {
    var r = new Float64Array(4);
    var im = 1.0 / _MJS_v4lengthLocal(a);
    r[0] = a[0] * im;
    r[1] = a[1] * im;
    r[2] = a[2] * im;
    r[3] = a[3] * im;
    return r;
};

var _MJS_v4scale = F2(function(k, a) {
    var r = new Float64Array(4);
    r[0] = a[0] * k;
    r[1] = a[1] * k;
    r[2] = a[2] * k;
    r[3] = a[3] * k;
    return r;
});

var _MJS_v4dot = F2(function(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
});

// Matrix4

var _MJS_m4x4temp1Local = new Float64Array(16);
var _MJS_m4x4temp2Local = new Float64Array(16);

var _MJS_m4x4identity = new Float64Array([
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0
]);

var _MJS_m4x4fromRecord = function(r) {
    var m = new Float64Array(16);
    m[0] = r.dT;
    m[1] = r.dX;
    m[2] = r.d$;
    m[3] = r.d3;
    m[4] = r.dU;
    m[5] = r.dY;
    m[6] = r.d0;
    m[7] = r.d4;
    m[8] = r.dV;
    m[9] = r.dZ;
    m[10] = r.d1;
    m[11] = r.d5;
    m[12] = r.dW;
    m[13] = r.d_;
    m[14] = r.d2;
    m[15] = r.d6;
    return m;
};

var _MJS_m4x4toRecord = function(m) {
    return {
        dT: m[0], dX: m[1], d$: m[2], d3: m[3],
        dU: m[4], dY: m[5], d0: m[6], d4: m[7],
        dV: m[8], dZ: m[9], d1: m[10], d5: m[11],
        dW: m[12], d_: m[13], d2: m[14], d6: m[15]
    };
};

var _MJS_m4x4inverse = function(m) {
    var r = new Float64Array(16);

    r[0] = m[5] * m[10] * m[15] - m[5] * m[11] * m[14] - m[9] * m[6] * m[15] +
        m[9] * m[7] * m[14] + m[13] * m[6] * m[11] - m[13] * m[7] * m[10];
    r[4] = -m[4] * m[10] * m[15] + m[4] * m[11] * m[14] + m[8] * m[6] * m[15] -
        m[8] * m[7] * m[14] - m[12] * m[6] * m[11] + m[12] * m[7] * m[10];
    r[8] = m[4] * m[9] * m[15] - m[4] * m[11] * m[13] - m[8] * m[5] * m[15] +
        m[8] * m[7] * m[13] + m[12] * m[5] * m[11] - m[12] * m[7] * m[9];
    r[12] = -m[4] * m[9] * m[14] + m[4] * m[10] * m[13] + m[8] * m[5] * m[14] -
        m[8] * m[6] * m[13] - m[12] * m[5] * m[10] + m[12] * m[6] * m[9];
    r[1] = -m[1] * m[10] * m[15] + m[1] * m[11] * m[14] + m[9] * m[2] * m[15] -
        m[9] * m[3] * m[14] - m[13] * m[2] * m[11] + m[13] * m[3] * m[10];
    r[5] = m[0] * m[10] * m[15] - m[0] * m[11] * m[14] - m[8] * m[2] * m[15] +
        m[8] * m[3] * m[14] + m[12] * m[2] * m[11] - m[12] * m[3] * m[10];
    r[9] = -m[0] * m[9] * m[15] + m[0] * m[11] * m[13] + m[8] * m[1] * m[15] -
        m[8] * m[3] * m[13] - m[12] * m[1] * m[11] + m[12] * m[3] * m[9];
    r[13] = m[0] * m[9] * m[14] - m[0] * m[10] * m[13] - m[8] * m[1] * m[14] +
        m[8] * m[2] * m[13] + m[12] * m[1] * m[10] - m[12] * m[2] * m[9];
    r[2] = m[1] * m[6] * m[15] - m[1] * m[7] * m[14] - m[5] * m[2] * m[15] +
        m[5] * m[3] * m[14] + m[13] * m[2] * m[7] - m[13] * m[3] * m[6];
    r[6] = -m[0] * m[6] * m[15] + m[0] * m[7] * m[14] + m[4] * m[2] * m[15] -
        m[4] * m[3] * m[14] - m[12] * m[2] * m[7] + m[12] * m[3] * m[6];
    r[10] = m[0] * m[5] * m[15] - m[0] * m[7] * m[13] - m[4] * m[1] * m[15] +
        m[4] * m[3] * m[13] + m[12] * m[1] * m[7] - m[12] * m[3] * m[5];
    r[14] = -m[0] * m[5] * m[14] + m[0] * m[6] * m[13] + m[4] * m[1] * m[14] -
        m[4] * m[2] * m[13] - m[12] * m[1] * m[6] + m[12] * m[2] * m[5];
    r[3] = -m[1] * m[6] * m[11] + m[1] * m[7] * m[10] + m[5] * m[2] * m[11] -
        m[5] * m[3] * m[10] - m[9] * m[2] * m[7] + m[9] * m[3] * m[6];
    r[7] = m[0] * m[6] * m[11] - m[0] * m[7] * m[10] - m[4] * m[2] * m[11] +
        m[4] * m[3] * m[10] + m[8] * m[2] * m[7] - m[8] * m[3] * m[6];
    r[11] = -m[0] * m[5] * m[11] + m[0] * m[7] * m[9] + m[4] * m[1] * m[11] -
        m[4] * m[3] * m[9] - m[8] * m[1] * m[7] + m[8] * m[3] * m[5];
    r[15] = m[0] * m[5] * m[10] - m[0] * m[6] * m[9] - m[4] * m[1] * m[10] +
        m[4] * m[2] * m[9] + m[8] * m[1] * m[6] - m[8] * m[2] * m[5];

    var det = m[0] * r[0] + m[1] * r[4] + m[2] * r[8] + m[3] * r[12];

    if (det === 0) {
        return $elm$core$Maybe$Nothing;
    }

    det = 1.0 / det;

    for (var i = 0; i < 16; i = i + 1) {
        r[i] = r[i] * det;
    }

    return $elm$core$Maybe$Just(r);
};

var _MJS_m4x4inverseOrthonormal = function(m) {
    var r = _MJS_m4x4transposeLocal(m);
    var t = [m[12], m[13], m[14]];
    r[3] = r[7] = r[11] = 0;
    r[12] = -_MJS_v3dotLocal([r[0], r[4], r[8]], t);
    r[13] = -_MJS_v3dotLocal([r[1], r[5], r[9]], t);
    r[14] = -_MJS_v3dotLocal([r[2], r[6], r[10]], t);
    return r;
};

function _MJS_m4x4makeFrustumLocal(left, right, bottom, top, znear, zfar) {
    var r = new Float64Array(16);

    r[0] = 2 * znear / (right - left);
    r[1] = 0;
    r[2] = 0;
    r[3] = 0;
    r[4] = 0;
    r[5] = 2 * znear / (top - bottom);
    r[6] = 0;
    r[7] = 0;
    r[8] = (right + left) / (right - left);
    r[9] = (top + bottom) / (top - bottom);
    r[10] = -(zfar + znear) / (zfar - znear);
    r[11] = -1;
    r[12] = 0;
    r[13] = 0;
    r[14] = -2 * zfar * znear / (zfar - znear);
    r[15] = 0;

    return r;
}
var _MJS_m4x4makeFrustum = F6(_MJS_m4x4makeFrustumLocal);

var _MJS_m4x4makePerspective = F4(function(fovy, aspect, znear, zfar) {
    var ymax = znear * Math.tan(fovy * Math.PI / 360.0);
    var ymin = -ymax;
    var xmin = ymin * aspect;
    var xmax = ymax * aspect;

    return _MJS_m4x4makeFrustumLocal(xmin, xmax, ymin, ymax, znear, zfar);
});

function _MJS_m4x4makeOrthoLocal(left, right, bottom, top, znear, zfar) {
    var r = new Float64Array(16);

    r[0] = 2 / (right - left);
    r[1] = 0;
    r[2] = 0;
    r[3] = 0;
    r[4] = 0;
    r[5] = 2 / (top - bottom);
    r[6] = 0;
    r[7] = 0;
    r[8] = 0;
    r[9] = 0;
    r[10] = -2 / (zfar - znear);
    r[11] = 0;
    r[12] = -(right + left) / (right - left);
    r[13] = -(top + bottom) / (top - bottom);
    r[14] = -(zfar + znear) / (zfar - znear);
    r[15] = 1;

    return r;
}
var _MJS_m4x4makeOrtho = F6(_MJS_m4x4makeOrthoLocal);

var _MJS_m4x4makeOrtho2D = F4(function(left, right, bottom, top) {
    return _MJS_m4x4makeOrthoLocal(left, right, bottom, top, -1, 1);
});

function _MJS_m4x4mulLocal(a, b) {
    var r = new Float64Array(16);
    var a11 = a[0];
    var a21 = a[1];
    var a31 = a[2];
    var a41 = a[3];
    var a12 = a[4];
    var a22 = a[5];
    var a32 = a[6];
    var a42 = a[7];
    var a13 = a[8];
    var a23 = a[9];
    var a33 = a[10];
    var a43 = a[11];
    var a14 = a[12];
    var a24 = a[13];
    var a34 = a[14];
    var a44 = a[15];
    var b11 = b[0];
    var b21 = b[1];
    var b31 = b[2];
    var b41 = b[3];
    var b12 = b[4];
    var b22 = b[5];
    var b32 = b[6];
    var b42 = b[7];
    var b13 = b[8];
    var b23 = b[9];
    var b33 = b[10];
    var b43 = b[11];
    var b14 = b[12];
    var b24 = b[13];
    var b34 = b[14];
    var b44 = b[15];

    r[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
    r[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
    r[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
    r[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
    r[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
    r[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
    r[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
    r[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
    r[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
    r[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
    r[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
    r[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
    r[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;
    r[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;
    r[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;
    r[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

    return r;
}
var _MJS_m4x4mul = F2(_MJS_m4x4mulLocal);

var _MJS_m4x4mulAffine = F2(function(a, b) {
    var r = new Float64Array(16);
    var a11 = a[0];
    var a21 = a[1];
    var a31 = a[2];
    var a12 = a[4];
    var a22 = a[5];
    var a32 = a[6];
    var a13 = a[8];
    var a23 = a[9];
    var a33 = a[10];
    var a14 = a[12];
    var a24 = a[13];
    var a34 = a[14];

    var b11 = b[0];
    var b21 = b[1];
    var b31 = b[2];
    var b12 = b[4];
    var b22 = b[5];
    var b32 = b[6];
    var b13 = b[8];
    var b23 = b[9];
    var b33 = b[10];
    var b14 = b[12];
    var b24 = b[13];
    var b34 = b[14];

    r[0] = a11 * b11 + a12 * b21 + a13 * b31;
    r[1] = a21 * b11 + a22 * b21 + a23 * b31;
    r[2] = a31 * b11 + a32 * b21 + a33 * b31;
    r[3] = 0;
    r[4] = a11 * b12 + a12 * b22 + a13 * b32;
    r[5] = a21 * b12 + a22 * b22 + a23 * b32;
    r[6] = a31 * b12 + a32 * b22 + a33 * b32;
    r[7] = 0;
    r[8] = a11 * b13 + a12 * b23 + a13 * b33;
    r[9] = a21 * b13 + a22 * b23 + a23 * b33;
    r[10] = a31 * b13 + a32 * b23 + a33 * b33;
    r[11] = 0;
    r[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14;
    r[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24;
    r[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34;
    r[15] = 1;

    return r;
});

var _MJS_m4x4makeRotate = F2(function(angle, axis) {
    var r = new Float64Array(16);
    axis = _MJS_v3normalizeLocal(axis, _MJS_v3temp1Local);
    var x = axis[0];
    var y = axis[1];
    var z = axis[2];
    var c = Math.cos(angle);
    var c1 = 1 - c;
    var s = Math.sin(angle);

    r[0] = x * x * c1 + c;
    r[1] = y * x * c1 + z * s;
    r[2] = z * x * c1 - y * s;
    r[3] = 0;
    r[4] = x * y * c1 - z * s;
    r[5] = y * y * c1 + c;
    r[6] = y * z * c1 + x * s;
    r[7] = 0;
    r[8] = x * z * c1 + y * s;
    r[9] = y * z * c1 - x * s;
    r[10] = z * z * c1 + c;
    r[11] = 0;
    r[12] = 0;
    r[13] = 0;
    r[14] = 0;
    r[15] = 1;

    return r;
});

var _MJS_m4x4rotate = F3(function(angle, axis, m) {
    var r = new Float64Array(16);
    var im = 1.0 / _MJS_v3lengthLocal(axis);
    var x = axis[0] * im;
    var y = axis[1] * im;
    var z = axis[2] * im;
    var c = Math.cos(angle);
    var c1 = 1 - c;
    var s = Math.sin(angle);
    var xs = x * s;
    var ys = y * s;
    var zs = z * s;
    var xyc1 = x * y * c1;
    var xzc1 = x * z * c1;
    var yzc1 = y * z * c1;
    var t11 = x * x * c1 + c;
    var t21 = xyc1 + zs;
    var t31 = xzc1 - ys;
    var t12 = xyc1 - zs;
    var t22 = y * y * c1 + c;
    var t32 = yzc1 + xs;
    var t13 = xzc1 + ys;
    var t23 = yzc1 - xs;
    var t33 = z * z * c1 + c;
    var m11 = m[0], m21 = m[1], m31 = m[2], m41 = m[3];
    var m12 = m[4], m22 = m[5], m32 = m[6], m42 = m[7];
    var m13 = m[8], m23 = m[9], m33 = m[10], m43 = m[11];
    var m14 = m[12], m24 = m[13], m34 = m[14], m44 = m[15];

    r[0] = m11 * t11 + m12 * t21 + m13 * t31;
    r[1] = m21 * t11 + m22 * t21 + m23 * t31;
    r[2] = m31 * t11 + m32 * t21 + m33 * t31;
    r[3] = m41 * t11 + m42 * t21 + m43 * t31;
    r[4] = m11 * t12 + m12 * t22 + m13 * t32;
    r[5] = m21 * t12 + m22 * t22 + m23 * t32;
    r[6] = m31 * t12 + m32 * t22 + m33 * t32;
    r[7] = m41 * t12 + m42 * t22 + m43 * t32;
    r[8] = m11 * t13 + m12 * t23 + m13 * t33;
    r[9] = m21 * t13 + m22 * t23 + m23 * t33;
    r[10] = m31 * t13 + m32 * t23 + m33 * t33;
    r[11] = m41 * t13 + m42 * t23 + m43 * t33;
    r[12] = m14,
    r[13] = m24;
    r[14] = m34;
    r[15] = m44;

    return r;
});

function _MJS_m4x4makeScale3Local(x, y, z) {
    var r = new Float64Array(16);

    r[0] = x;
    r[1] = 0;
    r[2] = 0;
    r[3] = 0;
    r[4] = 0;
    r[5] = y;
    r[6] = 0;
    r[7] = 0;
    r[8] = 0;
    r[9] = 0;
    r[10] = z;
    r[11] = 0;
    r[12] = 0;
    r[13] = 0;
    r[14] = 0;
    r[15] = 1;

    return r;
}
var _MJS_m4x4makeScale3 = F3(_MJS_m4x4makeScale3Local);

var _MJS_m4x4makeScale = function(v) {
    return _MJS_m4x4makeScale3Local(v[0], v[1], v[2]);
};

var _MJS_m4x4scale3 = F4(function(x, y, z, m) {
    var r = new Float64Array(16);

    r[0] = m[0] * x;
    r[1] = m[1] * x;
    r[2] = m[2] * x;
    r[3] = m[3] * x;
    r[4] = m[4] * y;
    r[5] = m[5] * y;
    r[6] = m[6] * y;
    r[7] = m[7] * y;
    r[8] = m[8] * z;
    r[9] = m[9] * z;
    r[10] = m[10] * z;
    r[11] = m[11] * z;
    r[12] = m[12];
    r[13] = m[13];
    r[14] = m[14];
    r[15] = m[15];

    return r;
});

var _MJS_m4x4scale = F2(function(v, m) {
    var r = new Float64Array(16);
    var x = v[0];
    var y = v[1];
    var z = v[2];

    r[0] = m[0] * x;
    r[1] = m[1] * x;
    r[2] = m[2] * x;
    r[3] = m[3] * x;
    r[4] = m[4] * y;
    r[5] = m[5] * y;
    r[6] = m[6] * y;
    r[7] = m[7] * y;
    r[8] = m[8] * z;
    r[9] = m[9] * z;
    r[10] = m[10] * z;
    r[11] = m[11] * z;
    r[12] = m[12];
    r[13] = m[13];
    r[14] = m[14];
    r[15] = m[15];

    return r;
});

function _MJS_m4x4makeTranslate3Local(x, y, z) {
    var r = new Float64Array(16);

    r[0] = 1;
    r[1] = 0;
    r[2] = 0;
    r[3] = 0;
    r[4] = 0;
    r[5] = 1;
    r[6] = 0;
    r[7] = 0;
    r[8] = 0;
    r[9] = 0;
    r[10] = 1;
    r[11] = 0;
    r[12] = x;
    r[13] = y;
    r[14] = z;
    r[15] = 1;

    return r;
}
var _MJS_m4x4makeTranslate3 = F3(_MJS_m4x4makeTranslate3Local);

var _MJS_m4x4makeTranslate = function(v) {
    return _MJS_m4x4makeTranslate3Local(v[0], v[1], v[2]);
};

var _MJS_m4x4translate3 = F4(function(x, y, z, m) {
    var r = new Float64Array(16);
    var m11 = m[0];
    var m21 = m[1];
    var m31 = m[2];
    var m41 = m[3];
    var m12 = m[4];
    var m22 = m[5];
    var m32 = m[6];
    var m42 = m[7];
    var m13 = m[8];
    var m23 = m[9];
    var m33 = m[10];
    var m43 = m[11];

    r[0] = m11;
    r[1] = m21;
    r[2] = m31;
    r[3] = m41;
    r[4] = m12;
    r[5] = m22;
    r[6] = m32;
    r[7] = m42;
    r[8] = m13;
    r[9] = m23;
    r[10] = m33;
    r[11] = m43;
    r[12] = m11 * x + m12 * y + m13 * z + m[12];
    r[13] = m21 * x + m22 * y + m23 * z + m[13];
    r[14] = m31 * x + m32 * y + m33 * z + m[14];
    r[15] = m41 * x + m42 * y + m43 * z + m[15];

    return r;
});

var _MJS_m4x4translate = F2(function(v, m) {
    var r = new Float64Array(16);
    var x = v[0];
    var y = v[1];
    var z = v[2];
    var m11 = m[0];
    var m21 = m[1];
    var m31 = m[2];
    var m41 = m[3];
    var m12 = m[4];
    var m22 = m[5];
    var m32 = m[6];
    var m42 = m[7];
    var m13 = m[8];
    var m23 = m[9];
    var m33 = m[10];
    var m43 = m[11];

    r[0] = m11;
    r[1] = m21;
    r[2] = m31;
    r[3] = m41;
    r[4] = m12;
    r[5] = m22;
    r[6] = m32;
    r[7] = m42;
    r[8] = m13;
    r[9] = m23;
    r[10] = m33;
    r[11] = m43;
    r[12] = m11 * x + m12 * y + m13 * z + m[12];
    r[13] = m21 * x + m22 * y + m23 * z + m[13];
    r[14] = m31 * x + m32 * y + m33 * z + m[14];
    r[15] = m41 * x + m42 * y + m43 * z + m[15];

    return r;
});

var _MJS_m4x4makeLookAt = F3(function(eye, center, up) {
    var z = _MJS_v3directionLocal(eye, center, _MJS_v3temp1Local);
    var x = _MJS_v3normalizeLocal(_MJS_v3crossLocal(up, z, _MJS_v3temp2Local), _MJS_v3temp2Local);
    var y = _MJS_v3normalizeLocal(_MJS_v3crossLocal(z, x, _MJS_v3temp3Local), _MJS_v3temp3Local);
    var tm1 = _MJS_m4x4temp1Local;
    var tm2 = _MJS_m4x4temp2Local;

    tm1[0] = x[0];
    tm1[1] = y[0];
    tm1[2] = z[0];
    tm1[3] = 0;
    tm1[4] = x[1];
    tm1[5] = y[1];
    tm1[6] = z[1];
    tm1[7] = 0;
    tm1[8] = x[2];
    tm1[9] = y[2];
    tm1[10] = z[2];
    tm1[11] = 0;
    tm1[12] = 0;
    tm1[13] = 0;
    tm1[14] = 0;
    tm1[15] = 1;

    tm2[0] = 1; tm2[1] = 0; tm2[2] = 0; tm2[3] = 0;
    tm2[4] = 0; tm2[5] = 1; tm2[6] = 0; tm2[7] = 0;
    tm2[8] = 0; tm2[9] = 0; tm2[10] = 1; tm2[11] = 0;
    tm2[12] = -eye[0]; tm2[13] = -eye[1]; tm2[14] = -eye[2]; tm2[15] = 1;

    return _MJS_m4x4mulLocal(tm1, tm2);
});


function _MJS_m4x4transposeLocal(m) {
    var r = new Float64Array(16);

    r[0] = m[0]; r[1] = m[4]; r[2] = m[8]; r[3] = m[12];
    r[4] = m[1]; r[5] = m[5]; r[6] = m[9]; r[7] = m[13];
    r[8] = m[2]; r[9] = m[6]; r[10] = m[10]; r[11] = m[14];
    r[12] = m[3]; r[13] = m[7]; r[14] = m[11]; r[15] = m[15];

    return r;
}
var _MJS_m4x4transpose = _MJS_m4x4transposeLocal;

var _MJS_m4x4makeBasis = F3(function(vx, vy, vz) {
    var r = new Float64Array(16);

    r[0] = vx[0];
    r[1] = vx[1];
    r[2] = vx[2];
    r[3] = 0;
    r[4] = vy[0];
    r[5] = vy[1];
    r[6] = vy[2];
    r[7] = 0;
    r[8] = vz[0];
    r[9] = vz[1];
    r[10] = vz[2];
    r[11] = 0;
    r[12] = 0;
    r[13] = 0;
    r[14] = 0;
    r[15] = 1;

    return r;
});


var _WebGL_guid = 0;

function _WebGL_listEach(fn, list) {
  for (; list.b; list = list.b) {
    fn(list.a);
  }
}

function _WebGL_listLength(list) {
  var length = 0;
  for (; list.b; list = list.b) {
    length++;
  }
  return length;
}

var _WebGL_rAF = typeof requestAnimationFrame !== 'undefined' ?
  requestAnimationFrame :
  function (cb) { setTimeout(cb, 1000 / 60); };

// eslint-disable-next-line no-unused-vars
var _WebGL_entity = F5(function (settings, vert, frag, mesh, uniforms) {
  return {
    $: 0,
    a: settings,
    b: vert,
    c: frag,
    d: mesh,
    e: uniforms
  };
});

// eslint-disable-next-line no-unused-vars
var _WebGL_enableBlend = F2(function (cache, setting) {
  var blend = cache.blend;
  blend.toggle = cache.toggle;

  if (!blend.enabled) {
    cache.gl.enable(cache.gl.BLEND);
    blend.enabled = true;
  }

  // a   b   c   d   e   f   g h i j
  // eq1 f11 f12 eq2 f21 f22 r g b a
  if (blend.a !== setting.a || blend.d !== setting.d) {
    cache.gl.blendEquationSeparate(setting.a, setting.d);
    blend.a = setting.a;
    blend.d = setting.d;
  }
  if (blend.b !== setting.b || blend.c !== setting.c || blend.e !== setting.e || blend.f !== setting.f) {
    cache.gl.blendFuncSeparate(setting.b, setting.c, setting.e, setting.f);
    blend.b = setting.b;
    blend.c = setting.c;
    blend.e = setting.e;
    blend.f = setting.f;
  }
  if (blend.g !== setting.g || blend.h !== setting.h || blend.i !== setting.i || blend.j !== setting.j) {
    cache.gl.blendColor(setting.g, setting.h, setting.i, setting.j);
    blend.g = setting.g;
    blend.h = setting.h;
    blend.i = setting.i;
    blend.j = setting.j;
  }
});

// eslint-disable-next-line no-unused-vars
var _WebGL_enableDepthTest = F2(function (cache, setting) {
  var depthTest = cache.depthTest;
  depthTest.toggle = cache.toggle;

  if (!depthTest.enabled) {
    cache.gl.enable(cache.gl.DEPTH_TEST);
    depthTest.enabled = true;
  }

  // a    b    c    d
  // func mask near far
  if (depthTest.a !== setting.a) {
    cache.gl.depthFunc(setting.a);
    depthTest.a = setting.a;
  }
  if (depthTest.b !== setting.b) {
    cache.gl.depthMask(setting.b);
    depthTest.b = setting.b;
  }
  if (depthTest.c !== setting.c || depthTest.d !== setting.d) {
    cache.gl.depthRange(setting.c, setting.d);
    depthTest.c = setting.c;
    depthTest.d = setting.d;
  }
});

// eslint-disable-next-line no-unused-vars
var _WebGL_enableStencilTest = F2(function (cache, setting) {
  var stencilTest = cache.stencilTest;
  stencilTest.toggle = cache.toggle;

  if (!stencilTest.enabled) {
    cache.gl.enable(cache.gl.STENCIL_TEST);
    stencilTest.enabled = true;
  }

  // a   b    c         d     e     f      g      h     i     j      k
  // ref mask writeMask test1 fail1 zfail1 zpass1 test2 fail2 zfail2 zpass2
  if (stencilTest.d !== setting.d || stencilTest.a !== setting.a || stencilTest.b !== setting.b) {
    cache.gl.stencilFuncSeparate(cache.gl.FRONT, setting.d, setting.a, setting.b);
    stencilTest.d = setting.d;
    // a and b are set in the cache.gl.BACK diffing because they should be the same
  }
  if (stencilTest.e !== setting.e || stencilTest.f !== setting.f || stencilTest.g !== setting.g) {
    cache.gl.stencilOpSeparate(cache.gl.FRONT, setting.e, setting.f, setting.g);
    stencilTest.e = setting.e;
    stencilTest.f = setting.f;
    stencilTest.g = setting.g;
  }
  if (stencilTest.c !== setting.c) {
    cache.gl.stencilMask(setting.c);
    stencilTest.c = setting.c;
  }
  if (stencilTest.h !== setting.h || stencilTest.a !== setting.a || stencilTest.b !== setting.b) {
    cache.gl.stencilFuncSeparate(cache.gl.BACK, setting.h, setting.a, setting.b);
    stencilTest.h = setting.h;
    stencilTest.a = setting.a;
    stencilTest.b = setting.b;
  }
  if (stencilTest.i !== setting.i || stencilTest.j !== setting.j || stencilTest.k !== setting.k) {
    cache.gl.stencilOpSeparate(cache.gl.BACK, setting.i, setting.j, setting.k);
    stencilTest.i = setting.i;
    stencilTest.j = setting.j;
    stencilTest.k = setting.k;
  }
});

// eslint-disable-next-line no-unused-vars
var _WebGL_enableScissor = F2(function (cache, setting) {
  var scissor = cache.scissor;
  scissor.toggle = cache.toggle;

  if (!scissor.enabled) {
    cache.gl.enable(cache.gl.SCISSOR_TEST);
    scissor.enabled = true;
  }

  if (scissor.a !== setting.a || scissor.b !== setting.b || scissor.c !== setting.c || scissor.d !== setting.d) {
    cache.gl.scissor(setting.a, setting.b, setting.c, setting.d);
    scissor.a = setting.a;
    scissor.b = setting.b;
    scissor.c = setting.c;
    scissor.d = setting.d;
  }
});

// eslint-disable-next-line no-unused-vars
var _WebGL_enableColorMask = F2(function (cache, setting) {
  var colorMask = cache.colorMask;
  colorMask.toggle = cache.toggle;
  colorMask.enabled = true;

  if (colorMask.a !== setting.a || colorMask.b !== setting.b || colorMask.c !== setting.c || colorMask.d !== setting.d) {
    cache.gl.colorMask(setting.a, setting.b, setting.c, setting.d);
    colorMask.a = setting.a;
    colorMask.b = setting.b;
    colorMask.c = setting.c;
    colorMask.d = setting.d;
  }
});

// eslint-disable-next-line no-unused-vars
var _WebGL_enableCullFace = F2(function (cache, setting) {
  var cullFace = cache.cullFace;
  cullFace.toggle = cache.toggle;

  if (!cullFace.enabled) {
    cache.gl.enable(cache.gl.CULL_FACE);
    cullFace.enabled = true;
  }

  if (cullFace.a !== setting.a) {
    cache.gl.cullFace(setting.a);
    cullFace.a = setting.a;
  }
});

// eslint-disable-next-line no-unused-vars
var _WebGL_enablePolygonOffset = F2(function (cache, setting) {
  var polygonOffset = cache.polygonOffset;
  polygonOffset.toggle = cache.toggle;

  if (!polygonOffset.enabled) {
    cache.gl.enable(cache.gl.POLYGON_OFFSET_FILL);
    polygonOffset.enabled = true;
  }

  if (polygonOffset.a !== setting.a || polygonOffset.b !== setting.b) {
    cache.gl.polygonOffset(setting.a, setting.b);
    polygonOffset.a = setting.a;
    polygonOffset.b = setting.b;
  }
});

// eslint-disable-next-line no-unused-vars
var _WebGL_enableSampleCoverage = F2(function (cache, setting) {
  var sampleCoverage = cache.sampleCoverage;
  sampleCoverage.toggle = cache.toggle;

  if (!sampleCoverage.enabled) {
    cache.gl.enable(cache.gl.SAMPLE_COVERAGE);
    sampleCoverage.enabled = true;
  }

  if (sampleCoverage.a !== setting.a || sampleCoverage.b !== setting.b) {
    cache.gl.sampleCoverage(setting.a, setting.b);
    sampleCoverage.a = setting.a;
    sampleCoverage.b = setting.b;
  }
});

// eslint-disable-next-line no-unused-vars
var _WebGL_enableSampleAlphaToCoverage = function (cache) {
  var sampleAlphaToCoverage = cache.sampleAlphaToCoverage;
  sampleAlphaToCoverage.toggle = cache.toggle;

  if (!sampleAlphaToCoverage.enabled) {
    cache.gl.enable(cache.gl.SAMPLE_ALPHA_TO_COVERAGE);
    sampleAlphaToCoverage.enabled = true;
  }
};

var _WebGL_disableBlend = function (cache) {
  if (cache.blend.enabled) {
    cache.gl.disable(cache.gl.BLEND);
    cache.blend.enabled = false;
  }
};

var _WebGL_disableDepthTest = function (cache) {
  if (cache.depthTest.enabled) {
    cache.gl.disable(cache.gl.DEPTH_TEST);
    cache.depthTest.enabled = false;
  }
};

var _WebGL_disableStencilTest = function (cache) {
  if (cache.stencilTest.enabled) {
    cache.gl.disable(cache.gl.STENCIL_TEST);
    cache.stencilTest.enabled = false;
  }
};

var _WebGL_disableScissor = function (cache) {
  if (cache.scissor.enabled) {
    cache.gl.disable(cache.gl.SCISSOR_TEST);
    cache.scissor.enabled = false;
  }
};

var _WebGL_disableColorMask = function (cache) {
  var colorMask = cache.colorMask;
  if (!colorMask.a || !colorMask.b || !colorMask.c || !colorMask.d) {
    cache.gl.colorMask(true, true, true, true);
    colorMask.a = true;
    colorMask.b = true;
    colorMask.c = true;
    colorMask.d = true;
  }
};

var _WebGL_disableCullFace = function (cache) {
  cache.gl.disable(cache.gl.CULL_FACE);
};

var _WebGL_disablePolygonOffset = function (cache) {
  cache.gl.disable(cache.gl.POLYGON_OFFSET_FILL);
};

var _WebGL_disableSampleCoverage = function (cache) {
  cache.gl.disable(cache.gl.SAMPLE_COVERAGE);
};

var _WebGL_disableSampleAlphaToCoverage = function (cache) {
  cache.gl.disable(cache.gl.SAMPLE_ALPHA_TO_COVERAGE);
};

var _WebGL_settings = ['blend', 'depthTest', 'stencilTest', 'scissor', 'colorMask', 'cullFace', 'polygonOffset', 'sampleCoverage', 'sampleAlphaToCoverage'];
var _WebGL_disableFunctions = [_WebGL_disableBlend, _WebGL_disableDepthTest, _WebGL_disableStencilTest, _WebGL_disableScissor, _WebGL_disableColorMask, _WebGL_disableCullFace, _WebGL_disablePolygonOffset, _WebGL_disableSampleCoverage, _WebGL_disableSampleAlphaToCoverage];

function _WebGL_doCompile(gl, src, type) {
  var shader = gl.createShader(type);
  // Enable OES_standard_derivatives extension
  gl.shaderSource(shader, '#extension GL_OES_standard_derivatives : enable\n' + src);
  gl.compileShader(shader);
  return shader;
}

function _WebGL_doLink(gl, vshader, fshader) {
  var program = gl.createProgram();

  gl.attachShader(program, vshader);
  gl.attachShader(program, fshader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw ('Link failed: ' + gl.getProgramInfoLog(program) +
      '\nvs info-log: ' + gl.getShaderInfoLog(vshader) +
      '\nfs info-log: ' + gl.getShaderInfoLog(fshader));
  }

  return program;
}

function _WebGL_getAttributeInfo(gl, type) {
  switch (type) {
    case gl.FLOAT:
      return { size: 1, arraySize: 1, type: Float32Array, baseType: gl.FLOAT };
    case gl.FLOAT_VEC2:
      return { size: 2, arraySize: 1, type: Float32Array, baseType: gl.FLOAT };
    case gl.FLOAT_VEC3:
      return { size: 3, arraySize: 1, type: Float32Array, baseType: gl.FLOAT };
    case gl.FLOAT_VEC4:
      return { size: 4, arraySize: 1, type: Float32Array, baseType: gl.FLOAT };
    case gl.FLOAT_MAT4:
      return { size: 4, arraySize: 4, type: Float32Array, baseType: gl.FLOAT };
    case gl.INT:
      return { size: 1, arraySize: 1, type: Int32Array, baseType: gl.INT };
  }
}

/**
 *  Form the buffer for a given attribute.
 *
 *  @param {WebGLRenderingContext} gl context
 *  @param {WebGLActiveInfo} attribute the attribute to bind to.
 *         We use its name to grab the record by name and also to know
 *         how many elements we need to grab.
 *  @param {Mesh} mesh The mesh coming in from Elm.
 *  @param {Object} attributes The mapping between the attribute names and Elm fields
 *  @return {WebGLBuffer}
 */
function _WebGL_doBindAttribute(gl, attribute, mesh, attributes) {
  // The length of the number of vertices that
  // complete one 'thing' based on the drawing mode.
  // ie, 2 for Lines, 3 for Triangles, etc.
  var elemSize = mesh.a.dA;

  var idxKeys = [];
  for (var i = 0; i < elemSize; i++) {
    idxKeys.push(String.fromCharCode(97 + i));
  }

  function dataFill(data, cnt, fillOffset, elem, key) {
    var i;
    if (elemSize === 1) {
      for (i = 0; i < cnt; i++) {
        data[fillOffset++] = cnt === 1 ? elem[key] : elem[key][i];
      }
    } else {
      idxKeys.forEach(function (idx) {
        for (i = 0; i < cnt; i++) {
          data[fillOffset++] = cnt === 1 ? elem[idx][key] : elem[idx][key][i];
        }
      });
    }
  }

  var attributeInfo = _WebGL_getAttributeInfo(gl, attribute.type);

  if (attributeInfo === undefined) {
    throw new Error('No info available for: ' + attribute.type);
  }

  var dataIdx = 0;
  var dataOffset = attributeInfo.size * attributeInfo.arraySize * elemSize;
  var array = new attributeInfo.type(_WebGL_listLength(mesh.b) * dataOffset);

  _WebGL_listEach(function (elem) {
    dataFill(array, attributeInfo.size * attributeInfo.arraySize, dataIdx, elem, attributes[attribute.name] || attribute.name);
    dataIdx += dataOffset;
  }, mesh.b);

  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW);
  return buffer;
}

/**
 *  This sets up the binding caching buffers.
 *
 *  We don't actually bind any buffers now except for the indices buffer.
 *  The problem with filling the buffers here is that it is possible to
 *  have a buffer shared between two webgl shaders;
 *  which could have different active attributes. If we bind it here against
 *  a particular program, we might not bind them all. That final bind is now
 *  done right before drawing.
 *
 *  @param {WebGLRenderingContext} gl context
 *  @param {Mesh} mesh a mesh object from Elm
 *  @return {Object} buffer - an object with the following properties
 *  @return {Number} buffer.numIndices
 *  @return {WebGLBuffer|null} buffer.indexBuffer - optional index buffer
 *  @return {Object} buffer.buffers - will be used to buffer attributes
 */
function _WebGL_doBindSetup(gl, mesh) {
  if (mesh.a.dJ > 0) {
    var indexBuffer = gl.createBuffer();
    var indices = _WebGL_makeIndexedBuffer(mesh.c, mesh.a.dJ);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    return {
      numIndices: indices.length,
      indexBuffer: indexBuffer,
      buffers: {}
    };
  } else {
    return {
      numIndices: mesh.a.dA * _WebGL_listLength(mesh.b),
      indexBuffer: null,
      buffers: {}
    };
  }
}

/**
 *  Create an indices array and fill it from indices
 *  based on the size of the index
 *
 *  @param {List} indicesList the list of indices
 *  @param {Number} indexSize the size of the index
 *  @return {Uint32Array} indices
 */
function _WebGL_makeIndexedBuffer(indicesList, indexSize) {
  var indices = new Uint32Array(_WebGL_listLength(indicesList) * indexSize);
  var fillOffset = 0;
  var i;
  _WebGL_listEach(function (elem) {
    if (indexSize === 1) {
      indices[fillOffset++] = elem;
    } else {
      for (i = 0; i < indexSize; i++) {
        indices[fillOffset++] = elem[String.fromCharCode(97 + i)];
      }
    }
  }, indicesList);
  return indices;
}

function _WebGL_getProgID(vertID, fragID) {
  return vertID + '#' + fragID;
}

var _WebGL_drawGL = F2(function (model, domNode) {
  var cache = model.f;
  var gl = cache.gl;

  if (!gl) {
    return domNode;
  }

  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

  if (!cache.depthTest.b) {
    gl.depthMask(true);
    cache.depthTest.b = true;
  }
  if (cache.stencilTest.c !== cache.STENCIL_WRITEMASK) {
    gl.stencilMask(cache.STENCIL_WRITEMASK);
    cache.stencilTest.c = cache.STENCIL_WRITEMASK;
  }
  _WebGL_disableScissor(cache);
  _WebGL_disableColorMask(cache);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

  function drawEntity(entity) {
    if (!entity.d.b.b) {
      return; // Empty list
    }

    var progid;
    var program;
    var i;

    if (entity.b.id && entity.c.id) {
      progid = _WebGL_getProgID(entity.b.id, entity.c.id);
      program = cache.programs[progid];
    }

    if (!program) {

      var vshader;
      if (entity.b.id) {
        vshader = cache.shaders[entity.b.id];
      } else {
        entity.b.id = _WebGL_guid++;
      }

      if (!vshader) {
        vshader = _WebGL_doCompile(gl, entity.b.src, gl.VERTEX_SHADER);
        cache.shaders[entity.b.id] = vshader;
      }

      var fshader;
      if (entity.c.id) {
        fshader = cache.shaders[entity.c.id];
      } else {
        entity.c.id = _WebGL_guid++;
      }

      if (!fshader) {
        fshader = _WebGL_doCompile(gl, entity.c.src, gl.FRAGMENT_SHADER);
        cache.shaders[entity.c.id] = fshader;
      }

      var glProgram = _WebGL_doLink(gl, vshader, fshader);

      program = {
        glProgram: glProgram,
        attributes: Object.assign({}, entity.b.attributes, entity.c.attributes),
        currentUniforms: {},
        activeAttributes: [],
        activeAttributeLocations: []
      };

      program.uniformSetters = _WebGL_createUniformSetters(
        gl,
        model,
        program,
        Object.assign({}, entity.b.uniforms, entity.c.uniforms)
      );

      var numActiveAttributes = gl.getProgramParameter(glProgram, gl.ACTIVE_ATTRIBUTES);
      for (i = 0; i < numActiveAttributes; i++) {
        var attribute = gl.getActiveAttrib(glProgram, i);
        var attribLocation = gl.getAttribLocation(glProgram, attribute.name);
        program.activeAttributes.push(attribute);
        program.activeAttributeLocations.push(attribLocation);
      }

      progid = _WebGL_getProgID(entity.b.id, entity.c.id);
      cache.programs[progid] = program;
    }

    if (cache.lastProgId !== progid) {
      gl.useProgram(program.glProgram);
      cache.lastProgId = progid;
    }

    _WebGL_setUniforms(program.uniformSetters, entity.e);

    var buffer = cache.buffers.get(entity.d);

    if (!buffer) {
      buffer = _WebGL_doBindSetup(gl, entity.d);
      cache.buffers.set(entity.d, buffer);
    }

    for (i = 0; i < program.activeAttributes.length; i++) {
      attribute = program.activeAttributes[i];
      attribLocation = program.activeAttributeLocations[i];

      if (buffer.buffers[attribute.name] === undefined) {
        buffer.buffers[attribute.name] = _WebGL_doBindAttribute(gl, attribute, entity.d, program.attributes);
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer.buffers[attribute.name]);

      var attributeInfo = _WebGL_getAttributeInfo(gl, attribute.type);
      if (attributeInfo.arraySize === 1) {
        gl.enableVertexAttribArray(attribLocation);
        gl.vertexAttribPointer(attribLocation, attributeInfo.size, attributeInfo.baseType, false, 0, 0);
      } else {
        // Point to four vec4 in case of mat4
        var offset = attributeInfo.size * 4; // float32 takes 4 bytes
        var stride = offset * attributeInfo.arraySize;
        for (var m = 0; m < attributeInfo.arraySize; m++) {
          gl.enableVertexAttribArray(attribLocation + m);
          gl.vertexAttribPointer(attribLocation + m, attributeInfo.size, attributeInfo.baseType, false, stride, offset * m);
        }
      }
    }

    // Apply all the new settings
    cache.toggle = !cache.toggle;
    _WebGL_listEach($elm_explorations$webgl$WebGL$Internal$enableSetting(cache), entity.a);
    // Disable the settings that were applied in the previous draw call
    for (i = 0; i < _WebGL_settings.length; i++) {
      var setting = cache[_WebGL_settings[i]];
      if (setting.toggle !== cache.toggle && setting.enabled) {
        _WebGL_disableFunctions[i](cache);
        setting.enabled = false;
        setting.toggle = cache.toggle;
      }
    }

    if (buffer.indexBuffer) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indexBuffer);
      gl.drawElements(entity.d.a.ef, buffer.numIndices, gl.UNSIGNED_INT, 0);
    } else {
      gl.drawArrays(entity.d.a.ef, 0, buffer.numIndices);
    }
  }

  _WebGL_listEach(drawEntity, model.g);
  return domNode;
});

function _WebGL_createUniformSetters(gl, model, program, uniformsMap) {
  var glProgram = program.glProgram;
  var currentUniforms = program.currentUniforms;
  var textureCounter = 0;
  var cache = model.f;
  function createUniformSetter(glProgram, uniform) {
    var uniformName = uniform.name;
    var uniformLocation = gl.getUniformLocation(glProgram, uniformName);
    switch (uniform.type) {
      case gl.INT:
        return function (value) {
          if (currentUniforms[uniformName] !== value) {
            gl.uniform1i(uniformLocation, value);
            currentUniforms[uniformName] = value;
          }
        };
      case gl.FLOAT:
        return function (value) {
          if (currentUniforms[uniformName] !== value) {
            gl.uniform1f(uniformLocation, value);
            currentUniforms[uniformName] = value;
          }
        };
      case gl.FLOAT_VEC2:
        return function (value) {
          if (currentUniforms[uniformName] !== value) {
            gl.uniform2f(uniformLocation, value[0], value[1]);
            currentUniforms[uniformName] = value;
          }
        };
      case gl.FLOAT_VEC3:
        return function (value) {
          if (currentUniforms[uniformName] !== value) {
            gl.uniform3f(uniformLocation, value[0], value[1], value[2]);
            currentUniforms[uniformName] = value;
          }
        };
      case gl.FLOAT_VEC4:
        return function (value) {
          if (currentUniforms[uniformName] !== value) {
            gl.uniform4f(uniformLocation, value[0], value[1], value[2], value[3]);
            currentUniforms[uniformName] = value;
          }
        };
      case gl.FLOAT_MAT4:
        return function (value) {
          if (currentUniforms[uniformName] !== value) {
            gl.uniformMatrix4fv(uniformLocation, false, new Float32Array(value));
            currentUniforms[uniformName] = value;
          }
        };
      case gl.SAMPLER_2D:
        var currentTexture = textureCounter++;
        return function (texture) {
          gl.activeTexture(gl.TEXTURE0 + currentTexture);
          var tex = cache.textures.get(texture);
          if (!tex) {
            tex = texture.eY(gl);
            cache.textures.set(texture, tex);
          }
          gl.bindTexture(gl.TEXTURE_2D, tex);
          if (currentUniforms[uniformName] !== texture) {
            gl.uniform1i(uniformLocation, currentTexture);
            currentUniforms[uniformName] = texture;
          }
        };
      case gl.BOOL:
        return function (value) {
          if (currentUniforms[uniformName] !== value) {
            gl.uniform1i(uniformLocation, value);
            currentUniforms[uniformName] = value;
          }
        };
      default:
        return function () { };
    }
  }

  var uniformSetters = {};
  var numUniforms = gl.getProgramParameter(glProgram, gl.ACTIVE_UNIFORMS);
  for (var i = 0; i < numUniforms; i++) {
    var uniform = gl.getActiveUniform(glProgram, i);
    uniformSetters[uniformsMap[uniform.name] || uniform.name] = createUniformSetter(glProgram, uniform);
  }

  return uniformSetters;
}

function _WebGL_setUniforms(setters, values) {
  Object.keys(values).forEach(function (name) {
    var setter = setters[name];
    if (setter) {
      setter(values[name]);
    }
  });
}

// VIRTUAL-DOM WIDGET

// eslint-disable-next-line no-unused-vars
var _WebGL_toHtml = F3(function (options, factList, entities) {
  return _VirtualDom_custom(
    factList,
    {
      g: entities,
      f: {},
      h: options
    },
    _WebGL_render,
    _WebGL_diff
  );
});

// eslint-disable-next-line no-unused-vars
var _WebGL_enableAlpha = F2(function (options, option) {
  options.contextAttributes.alpha = true;
  options.contextAttributes.premultipliedAlpha = option.a;
});

// eslint-disable-next-line no-unused-vars
var _WebGL_enableDepth = F2(function (options, option) {
  options.contextAttributes.depth = true;
  options.sceneSettings.push(function (gl) {
    gl.clearDepth(option.a);
  });
});

// eslint-disable-next-line no-unused-vars
var _WebGL_enableStencil = F2(function (options, option) {
  options.contextAttributes.stencil = true;
  options.sceneSettings.push(function (gl) {
    gl.clearStencil(option.a);
  });
});

// eslint-disable-next-line no-unused-vars
var _WebGL_enableAntialias = F2(function (options, option) {
  options.contextAttributes.antialias = true;
});

// eslint-disable-next-line no-unused-vars
var _WebGL_enableClearColor = F2(function (options, option) {
  options.sceneSettings.push(function (gl) {
    gl.clearColor(option.a, option.b, option.c, option.d);
  });
});

// eslint-disable-next-line no-unused-vars
var _WebGL_enablePreserveDrawingBuffer = F2(function (options, option) {
  options.contextAttributes.preserveDrawingBuffer = true;
});

/**
 *  Creates canvas and schedules initial _WebGL_drawGL
 *  @param {Object} model
 *  @param {Object} model.f that may contain the following properties:
           gl, shaders, programs, buffers, textures
 *  @param {List<Option>} model.h list of options coming from Elm
 *  @param {List<Entity>} model.g list of entities coming from Elm
 *  @return {HTMLElement} <canvas> if WebGL is supported, otherwise a <div>
 */
function _WebGL_render(model) {
  var options = {
    contextAttributes: {
      alpha: false,
      depth: false,
      stencil: false,
      antialias: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false
    },
    sceneSettings: []
  };

  _WebGL_listEach(function (option) {
    return A2($elm_explorations$webgl$WebGL$Internal$enableOption, options, option);
  }, model.h);

  var canvas = _VirtualDom_doc.createElement('canvas');
  var gl = canvas.getContext && (
    canvas.getContext('webgl', options.contextAttributes) ||
    canvas.getContext('experimental-webgl', options.contextAttributes)
  );

  if (gl && typeof WeakMap !== 'undefined') {
    options.sceneSettings.forEach(function (sceneSetting) {
      sceneSetting(gl);
    });

    // Activate extensions
    gl.getExtension('OES_standard_derivatives');
    gl.getExtension('OES_element_index_uint');

    model.f.gl = gl;

    // Cache the current settings in order to diff them to avoid redundant calls
    // https://emscripten.org/docs/optimizing/Optimizing-WebGL.html#avoid-redundant-calls
    model.f.toggle = false; // used to diff the settings from the previous and current draw calls
    model.f.blend = { enabled: false, toggle: false };
    model.f.depthTest = { enabled: false, toggle: false };
    model.f.stencilTest = { enabled: false, toggle: false };
    model.f.scissor = { enabled: false, toggle: false };
    model.f.colorMask = { enabled: false, toggle: false };
    model.f.cullFace = { enabled: false, toggle: false };
    model.f.polygonOffset = { enabled: false, toggle: false };
    model.f.sampleCoverage = { enabled: false, toggle: false };
    model.f.sampleAlphaToCoverage = { enabled: false, toggle: false };

    model.f.shaders = [];
    model.f.programs = {};
    model.f.lastProgId = null;
    model.f.buffers = new WeakMap();
    model.f.textures = new WeakMap();
    // Memorize the initial stencil write mask, because
    // browsers may have different number of stencil bits
    model.f.STENCIL_WRITEMASK = gl.getParameter(gl.STENCIL_WRITEMASK);

    // Render for the first time.
    // This has to be done in animation frame,
    // because the canvas is not in the DOM yet
    _WebGL_rAF(function () {
      return A2(_WebGL_drawGL, model, canvas);
    });

  } else {
    canvas = _VirtualDom_doc.createElement('div');
    canvas.innerHTML = '<a href="https://get.webgl.org/">Enable WebGL</a> to see this content!';
  }

  return canvas;
}

function _WebGL_diff(oldModel, newModel) {
  newModel.f = oldModel.f;
  return _WebGL_drawGL(newModel);
}
var $elm$core$Basics$EQ = 1;
var $elm$core$Basics$GT = 2;
var $elm$core$Basics$LT = 0;
var $elm$core$List$cons = _List_cons;
var $elm$core$Dict$foldr = F3(
	function (func, acc, t) {
		foldr:
		while (true) {
			if (t.$ === -2) {
				return acc;
			} else {
				var key = t.b;
				var value = t.c;
				var left = t.d;
				var right = t.e;
				var $temp$func = func,
					$temp$acc = A3(
					func,
					key,
					value,
					A3($elm$core$Dict$foldr, func, acc, right)),
					$temp$t = left;
				func = $temp$func;
				acc = $temp$acc;
				t = $temp$t;
				continue foldr;
			}
		}
	});
var $elm$core$Dict$toList = function (dict) {
	return A3(
		$elm$core$Dict$foldr,
		F3(
			function (key, value, list) {
				return A2(
					$elm$core$List$cons,
					_Utils_Tuple2(key, value),
					list);
			}),
		_List_Nil,
		dict);
};
var $elm$core$Dict$keys = function (dict) {
	return A3(
		$elm$core$Dict$foldr,
		F3(
			function (key, value, keyList) {
				return A2($elm$core$List$cons, key, keyList);
			}),
		_List_Nil,
		dict);
};
var $elm$core$Set$toList = function (_v0) {
	var dict = _v0;
	return $elm$core$Dict$keys(dict);
};
var $elm$core$Elm$JsArray$foldr = _JsArray_foldr;
var $elm$core$Array$foldr = F3(
	function (func, baseCase, _v0) {
		var tree = _v0.c;
		var tail = _v0.d;
		var helper = F2(
			function (node, acc) {
				if (!node.$) {
					var subTree = node.a;
					return A3($elm$core$Elm$JsArray$foldr, helper, acc, subTree);
				} else {
					var values = node.a;
					return A3($elm$core$Elm$JsArray$foldr, func, acc, values);
				}
			});
		return A3(
			$elm$core$Elm$JsArray$foldr,
			helper,
			A3($elm$core$Elm$JsArray$foldr, func, baseCase, tail),
			tree);
	});
var $elm$core$Array$toList = function (array) {
	return A3($elm$core$Array$foldr, $elm$core$List$cons, _List_Nil, array);
};
var $elm$core$Result$Err = function (a) {
	return {$: 1, a: a};
};
var $elm$json$Json$Decode$Failure = F2(
	function (a, b) {
		return {$: 3, a: a, b: b};
	});
var $elm$json$Json$Decode$Field = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $elm$json$Json$Decode$Index = F2(
	function (a, b) {
		return {$: 1, a: a, b: b};
	});
var $elm$core$Result$Ok = function (a) {
	return {$: 0, a: a};
};
var $elm$json$Json$Decode$OneOf = function (a) {
	return {$: 2, a: a};
};
var $elm$core$Basics$False = 1;
var $elm$core$Basics$add = _Basics_add;
var $elm$core$Maybe$Just = function (a) {
	return {$: 0, a: a};
};
var $elm$core$Maybe$Nothing = {$: 1};
var $elm$core$String$all = _String_all;
var $elm$core$Basics$and = _Basics_and;
var $elm$core$Basics$append = _Utils_append;
var $elm$json$Json$Encode$encode = _Json_encode;
var $elm$core$String$fromInt = _String_fromNumber;
var $elm$core$String$join = F2(
	function (sep, chunks) {
		return A2(
			_String_join,
			sep,
			_List_toArray(chunks));
	});
var $elm$core$String$split = F2(
	function (sep, string) {
		return _List_fromArray(
			A2(_String_split, sep, string));
	});
var $elm$json$Json$Decode$indent = function (str) {
	return A2(
		$elm$core$String$join,
		'\n    ',
		A2($elm$core$String$split, '\n', str));
};
var $elm$core$List$foldl = F3(
	function (func, acc, list) {
		foldl:
		while (true) {
			if (!list.b) {
				return acc;
			} else {
				var x = list.a;
				var xs = list.b;
				var $temp$func = func,
					$temp$acc = A2(func, x, acc),
					$temp$list = xs;
				func = $temp$func;
				acc = $temp$acc;
				list = $temp$list;
				continue foldl;
			}
		}
	});
var $elm$core$List$length = function (xs) {
	return A3(
		$elm$core$List$foldl,
		F2(
			function (_v0, i) {
				return i + 1;
			}),
		0,
		xs);
};
var $elm$core$List$map2 = _List_map2;
var $elm$core$Basics$le = _Utils_le;
var $elm$core$Basics$sub = _Basics_sub;
var $elm$core$List$rangeHelp = F3(
	function (lo, hi, list) {
		rangeHelp:
		while (true) {
			if (_Utils_cmp(lo, hi) < 1) {
				var $temp$lo = lo,
					$temp$hi = hi - 1,
					$temp$list = A2($elm$core$List$cons, hi, list);
				lo = $temp$lo;
				hi = $temp$hi;
				list = $temp$list;
				continue rangeHelp;
			} else {
				return list;
			}
		}
	});
var $elm$core$List$range = F2(
	function (lo, hi) {
		return A3($elm$core$List$rangeHelp, lo, hi, _List_Nil);
	});
var $elm$core$List$indexedMap = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$map2,
			f,
			A2(
				$elm$core$List$range,
				0,
				$elm$core$List$length(xs) - 1),
			xs);
	});
var $elm$core$Char$toCode = _Char_toCode;
var $elm$core$Char$isLower = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (97 <= code) && (code <= 122);
};
var $elm$core$Char$isUpper = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (code <= 90) && (65 <= code);
};
var $elm$core$Basics$or = _Basics_or;
var $elm$core$Char$isAlpha = function (_char) {
	return $elm$core$Char$isLower(_char) || $elm$core$Char$isUpper(_char);
};
var $elm$core$Char$isDigit = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (code <= 57) && (48 <= code);
};
var $elm$core$Char$isAlphaNum = function (_char) {
	return $elm$core$Char$isLower(_char) || ($elm$core$Char$isUpper(_char) || $elm$core$Char$isDigit(_char));
};
var $elm$core$List$reverse = function (list) {
	return A3($elm$core$List$foldl, $elm$core$List$cons, _List_Nil, list);
};
var $elm$core$String$uncons = _String_uncons;
var $elm$json$Json$Decode$errorOneOf = F2(
	function (i, error) {
		return '\n\n(' + ($elm$core$String$fromInt(i + 1) + (') ' + $elm$json$Json$Decode$indent(
			$elm$json$Json$Decode$errorToString(error))));
	});
var $elm$json$Json$Decode$errorToString = function (error) {
	return A2($elm$json$Json$Decode$errorToStringHelp, error, _List_Nil);
};
var $elm$json$Json$Decode$errorToStringHelp = F2(
	function (error, context) {
		errorToStringHelp:
		while (true) {
			switch (error.$) {
				case 0:
					var f = error.a;
					var err = error.b;
					var isSimple = function () {
						var _v1 = $elm$core$String$uncons(f);
						if (_v1.$ === 1) {
							return false;
						} else {
							var _v2 = _v1.a;
							var _char = _v2.a;
							var rest = _v2.b;
							return $elm$core$Char$isAlpha(_char) && A2($elm$core$String$all, $elm$core$Char$isAlphaNum, rest);
						}
					}();
					var fieldName = isSimple ? ('.' + f) : ('[\'' + (f + '\']'));
					var $temp$error = err,
						$temp$context = A2($elm$core$List$cons, fieldName, context);
					error = $temp$error;
					context = $temp$context;
					continue errorToStringHelp;
				case 1:
					var i = error.a;
					var err = error.b;
					var indexName = '[' + ($elm$core$String$fromInt(i) + ']');
					var $temp$error = err,
						$temp$context = A2($elm$core$List$cons, indexName, context);
					error = $temp$error;
					context = $temp$context;
					continue errorToStringHelp;
				case 2:
					var errors = error.a;
					if (!errors.b) {
						return 'Ran into a Json.Decode.oneOf with no possibilities' + function () {
							if (!context.b) {
								return '!';
							} else {
								return ' at json' + A2(
									$elm$core$String$join,
									'',
									$elm$core$List$reverse(context));
							}
						}();
					} else {
						if (!errors.b.b) {
							var err = errors.a;
							var $temp$error = err,
								$temp$context = context;
							error = $temp$error;
							context = $temp$context;
							continue errorToStringHelp;
						} else {
							var starter = function () {
								if (!context.b) {
									return 'Json.Decode.oneOf';
								} else {
									return 'The Json.Decode.oneOf at json' + A2(
										$elm$core$String$join,
										'',
										$elm$core$List$reverse(context));
								}
							}();
							var introduction = starter + (' failed in the following ' + ($elm$core$String$fromInt(
								$elm$core$List$length(errors)) + ' ways:'));
							return A2(
								$elm$core$String$join,
								'\n\n',
								A2(
									$elm$core$List$cons,
									introduction,
									A2($elm$core$List$indexedMap, $elm$json$Json$Decode$errorOneOf, errors)));
						}
					}
				default:
					var msg = error.a;
					var json = error.b;
					var introduction = function () {
						if (!context.b) {
							return 'Problem with the given value:\n\n';
						} else {
							return 'Problem with the value at json' + (A2(
								$elm$core$String$join,
								'',
								$elm$core$List$reverse(context)) + ':\n\n    ');
						}
					}();
					return introduction + ($elm$json$Json$Decode$indent(
						A2($elm$json$Json$Encode$encode, 4, json)) + ('\n\n' + msg));
			}
		}
	});
var $elm$core$Array$branchFactor = 32;
var $elm$core$Array$Array_elm_builtin = F4(
	function (a, b, c, d) {
		return {$: 0, a: a, b: b, c: c, d: d};
	});
var $elm$core$Elm$JsArray$empty = _JsArray_empty;
var $elm$core$Basics$ceiling = _Basics_ceiling;
var $elm$core$Basics$fdiv = _Basics_fdiv;
var $elm$core$Basics$logBase = F2(
	function (base, number) {
		return _Basics_log(number) / _Basics_log(base);
	});
var $elm$core$Basics$toFloat = _Basics_toFloat;
var $elm$core$Array$shiftStep = $elm$core$Basics$ceiling(
	A2($elm$core$Basics$logBase, 2, $elm$core$Array$branchFactor));
var $elm$core$Array$empty = A4($elm$core$Array$Array_elm_builtin, 0, $elm$core$Array$shiftStep, $elm$core$Elm$JsArray$empty, $elm$core$Elm$JsArray$empty);
var $elm$core$Elm$JsArray$initialize = _JsArray_initialize;
var $elm$core$Array$Leaf = function (a) {
	return {$: 1, a: a};
};
var $elm$core$Basics$apL = F2(
	function (f, x) {
		return f(x);
	});
var $elm$core$Basics$apR = F2(
	function (x, f) {
		return f(x);
	});
var $elm$core$Basics$eq = _Utils_equal;
var $elm$core$Basics$floor = _Basics_floor;
var $elm$core$Elm$JsArray$length = _JsArray_length;
var $elm$core$Basics$gt = _Utils_gt;
var $elm$core$Basics$max = F2(
	function (x, y) {
		return (_Utils_cmp(x, y) > 0) ? x : y;
	});
var $elm$core$Basics$mul = _Basics_mul;
var $elm$core$Array$SubTree = function (a) {
	return {$: 0, a: a};
};
var $elm$core$Elm$JsArray$initializeFromList = _JsArray_initializeFromList;
var $elm$core$Array$compressNodes = F2(
	function (nodes, acc) {
		compressNodes:
		while (true) {
			var _v0 = A2($elm$core$Elm$JsArray$initializeFromList, $elm$core$Array$branchFactor, nodes);
			var node = _v0.a;
			var remainingNodes = _v0.b;
			var newAcc = A2(
				$elm$core$List$cons,
				$elm$core$Array$SubTree(node),
				acc);
			if (!remainingNodes.b) {
				return $elm$core$List$reverse(newAcc);
			} else {
				var $temp$nodes = remainingNodes,
					$temp$acc = newAcc;
				nodes = $temp$nodes;
				acc = $temp$acc;
				continue compressNodes;
			}
		}
	});
var $elm$core$Tuple$first = function (_v0) {
	var x = _v0.a;
	return x;
};
var $elm$core$Array$treeFromBuilder = F2(
	function (nodeList, nodeListSize) {
		treeFromBuilder:
		while (true) {
			var newNodeSize = $elm$core$Basics$ceiling(nodeListSize / $elm$core$Array$branchFactor);
			if (newNodeSize === 1) {
				return A2($elm$core$Elm$JsArray$initializeFromList, $elm$core$Array$branchFactor, nodeList).a;
			} else {
				var $temp$nodeList = A2($elm$core$Array$compressNodes, nodeList, _List_Nil),
					$temp$nodeListSize = newNodeSize;
				nodeList = $temp$nodeList;
				nodeListSize = $temp$nodeListSize;
				continue treeFromBuilder;
			}
		}
	});
var $elm$core$Array$builderToArray = F2(
	function (reverseNodeList, builder) {
		if (!builder.o) {
			return A4(
				$elm$core$Array$Array_elm_builtin,
				$elm$core$Elm$JsArray$length(builder.t),
				$elm$core$Array$shiftStep,
				$elm$core$Elm$JsArray$empty,
				builder.t);
		} else {
			var treeLen = builder.o * $elm$core$Array$branchFactor;
			var depth = $elm$core$Basics$floor(
				A2($elm$core$Basics$logBase, $elm$core$Array$branchFactor, treeLen - 1));
			var correctNodeList = reverseNodeList ? $elm$core$List$reverse(builder.D) : builder.D;
			var tree = A2($elm$core$Array$treeFromBuilder, correctNodeList, builder.o);
			return A4(
				$elm$core$Array$Array_elm_builtin,
				$elm$core$Elm$JsArray$length(builder.t) + treeLen,
				A2($elm$core$Basics$max, 5, depth * $elm$core$Array$shiftStep),
				tree,
				builder.t);
		}
	});
var $elm$core$Basics$idiv = _Basics_idiv;
var $elm$core$Basics$lt = _Utils_lt;
var $elm$core$Array$initializeHelp = F5(
	function (fn, fromIndex, len, nodeList, tail) {
		initializeHelp:
		while (true) {
			if (fromIndex < 0) {
				return A2(
					$elm$core$Array$builderToArray,
					false,
					{D: nodeList, o: (len / $elm$core$Array$branchFactor) | 0, t: tail});
			} else {
				var leaf = $elm$core$Array$Leaf(
					A3($elm$core$Elm$JsArray$initialize, $elm$core$Array$branchFactor, fromIndex, fn));
				var $temp$fn = fn,
					$temp$fromIndex = fromIndex - $elm$core$Array$branchFactor,
					$temp$len = len,
					$temp$nodeList = A2($elm$core$List$cons, leaf, nodeList),
					$temp$tail = tail;
				fn = $temp$fn;
				fromIndex = $temp$fromIndex;
				len = $temp$len;
				nodeList = $temp$nodeList;
				tail = $temp$tail;
				continue initializeHelp;
			}
		}
	});
var $elm$core$Basics$remainderBy = _Basics_remainderBy;
var $elm$core$Array$initialize = F2(
	function (len, fn) {
		if (len <= 0) {
			return $elm$core$Array$empty;
		} else {
			var tailLen = len % $elm$core$Array$branchFactor;
			var tail = A3($elm$core$Elm$JsArray$initialize, tailLen, len - tailLen, fn);
			var initialFromIndex = (len - tailLen) - $elm$core$Array$branchFactor;
			return A5($elm$core$Array$initializeHelp, fn, initialFromIndex, len, _List_Nil, tail);
		}
	});
var $elm$core$Basics$True = 0;
var $elm$core$Result$isOk = function (result) {
	if (!result.$) {
		return true;
	} else {
		return false;
	}
};
var $elm$json$Json$Decode$map = _Json_map1;
var $elm$json$Json$Decode$map2 = _Json_map2;
var $elm$json$Json$Decode$succeed = _Json_succeed;
var $elm$virtual_dom$VirtualDom$toHandlerInt = function (handler) {
	switch (handler.$) {
		case 0:
			return 0;
		case 1:
			return 1;
		case 2:
			return 2;
		default:
			return 3;
	}
};
var $elm$browser$Browser$External = function (a) {
	return {$: 1, a: a};
};
var $elm$browser$Browser$Internal = function (a) {
	return {$: 0, a: a};
};
var $elm$core$Basics$identity = function (x) {
	return x;
};
var $elm$browser$Browser$Dom$NotFound = $elm$core$Basics$identity;
var $elm$url$Url$Http = 0;
var $elm$url$Url$Https = 1;
var $elm$url$Url$Url = F6(
	function (protocol, host, port_, path, query, fragment) {
		return {dE: fragment, dH: host, ej: path, em: port_, ep: protocol, eq: query};
	});
var $elm$core$String$contains = _String_contains;
var $elm$core$String$length = _String_length;
var $elm$core$String$slice = _String_slice;
var $elm$core$String$dropLeft = F2(
	function (n, string) {
		return (n < 1) ? string : A3(
			$elm$core$String$slice,
			n,
			$elm$core$String$length(string),
			string);
	});
var $elm$core$String$indexes = _String_indexes;
var $elm$core$String$isEmpty = function (string) {
	return string === '';
};
var $elm$core$String$left = F2(
	function (n, string) {
		return (n < 1) ? '' : A3($elm$core$String$slice, 0, n, string);
	});
var $elm$core$String$toInt = _String_toInt;
var $elm$url$Url$chompBeforePath = F5(
	function (protocol, path, params, frag, str) {
		if ($elm$core$String$isEmpty(str) || A2($elm$core$String$contains, '@', str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, ':', str);
			if (!_v0.b) {
				return $elm$core$Maybe$Just(
					A6($elm$url$Url$Url, protocol, str, $elm$core$Maybe$Nothing, path, params, frag));
			} else {
				if (!_v0.b.b) {
					var i = _v0.a;
					var _v1 = $elm$core$String$toInt(
						A2($elm$core$String$dropLeft, i + 1, str));
					if (_v1.$ === 1) {
						return $elm$core$Maybe$Nothing;
					} else {
						var port_ = _v1;
						return $elm$core$Maybe$Just(
							A6(
								$elm$url$Url$Url,
								protocol,
								A2($elm$core$String$left, i, str),
								port_,
								path,
								params,
								frag));
					}
				} else {
					return $elm$core$Maybe$Nothing;
				}
			}
		}
	});
var $elm$url$Url$chompBeforeQuery = F4(
	function (protocol, params, frag, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '/', str);
			if (!_v0.b) {
				return A5($elm$url$Url$chompBeforePath, protocol, '/', params, frag, str);
			} else {
				var i = _v0.a;
				return A5(
					$elm$url$Url$chompBeforePath,
					protocol,
					A2($elm$core$String$dropLeft, i, str),
					params,
					frag,
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$url$Url$chompBeforeFragment = F3(
	function (protocol, frag, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '?', str);
			if (!_v0.b) {
				return A4($elm$url$Url$chompBeforeQuery, protocol, $elm$core$Maybe$Nothing, frag, str);
			} else {
				var i = _v0.a;
				return A4(
					$elm$url$Url$chompBeforeQuery,
					protocol,
					$elm$core$Maybe$Just(
						A2($elm$core$String$dropLeft, i + 1, str)),
					frag,
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$url$Url$chompAfterProtocol = F2(
	function (protocol, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '#', str);
			if (!_v0.b) {
				return A3($elm$url$Url$chompBeforeFragment, protocol, $elm$core$Maybe$Nothing, str);
			} else {
				var i = _v0.a;
				return A3(
					$elm$url$Url$chompBeforeFragment,
					protocol,
					$elm$core$Maybe$Just(
						A2($elm$core$String$dropLeft, i + 1, str)),
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$core$String$startsWith = _String_startsWith;
var $elm$url$Url$fromString = function (str) {
	return A2($elm$core$String$startsWith, 'http://', str) ? A2(
		$elm$url$Url$chompAfterProtocol,
		0,
		A2($elm$core$String$dropLeft, 7, str)) : (A2($elm$core$String$startsWith, 'https://', str) ? A2(
		$elm$url$Url$chompAfterProtocol,
		1,
		A2($elm$core$String$dropLeft, 8, str)) : $elm$core$Maybe$Nothing);
};
var $elm$core$Basics$never = function (_v0) {
	never:
	while (true) {
		var nvr = _v0;
		var $temp$_v0 = nvr;
		_v0 = $temp$_v0;
		continue never;
	}
};
var $elm$core$Task$Perform = $elm$core$Basics$identity;
var $elm$core$Task$succeed = _Scheduler_succeed;
var $elm$core$Task$init = $elm$core$Task$succeed(0);
var $elm$core$List$foldrHelper = F4(
	function (fn, acc, ctr, ls) {
		if (!ls.b) {
			return acc;
		} else {
			var a = ls.a;
			var r1 = ls.b;
			if (!r1.b) {
				return A2(fn, a, acc);
			} else {
				var b = r1.a;
				var r2 = r1.b;
				if (!r2.b) {
					return A2(
						fn,
						a,
						A2(fn, b, acc));
				} else {
					var c = r2.a;
					var r3 = r2.b;
					if (!r3.b) {
						return A2(
							fn,
							a,
							A2(
								fn,
								b,
								A2(fn, c, acc)));
					} else {
						var d = r3.a;
						var r4 = r3.b;
						var res = (ctr > 500) ? A3(
							$elm$core$List$foldl,
							fn,
							acc,
							$elm$core$List$reverse(r4)) : A4($elm$core$List$foldrHelper, fn, acc, ctr + 1, r4);
						return A2(
							fn,
							a,
							A2(
								fn,
								b,
								A2(
									fn,
									c,
									A2(fn, d, res))));
					}
				}
			}
		}
	});
var $elm$core$List$foldr = F3(
	function (fn, acc, ls) {
		return A4($elm$core$List$foldrHelper, fn, acc, 0, ls);
	});
var $elm$core$List$map = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$foldr,
			F2(
				function (x, acc) {
					return A2(
						$elm$core$List$cons,
						f(x),
						acc);
				}),
			_List_Nil,
			xs);
	});
var $elm$core$Task$andThen = _Scheduler_andThen;
var $elm$core$Task$map = F2(
	function (func, taskA) {
		return A2(
			$elm$core$Task$andThen,
			function (a) {
				return $elm$core$Task$succeed(
					func(a));
			},
			taskA);
	});
var $elm$core$Task$map2 = F3(
	function (func, taskA, taskB) {
		return A2(
			$elm$core$Task$andThen,
			function (a) {
				return A2(
					$elm$core$Task$andThen,
					function (b) {
						return $elm$core$Task$succeed(
							A2(func, a, b));
					},
					taskB);
			},
			taskA);
	});
var $elm$core$Task$sequence = function (tasks) {
	return A3(
		$elm$core$List$foldr,
		$elm$core$Task$map2($elm$core$List$cons),
		$elm$core$Task$succeed(_List_Nil),
		tasks);
};
var $elm$core$Platform$sendToApp = _Platform_sendToApp;
var $elm$core$Task$spawnCmd = F2(
	function (router, _v0) {
		var task = _v0;
		return _Scheduler_spawn(
			A2(
				$elm$core$Task$andThen,
				$elm$core$Platform$sendToApp(router),
				task));
	});
var $elm$core$Task$onEffects = F3(
	function (router, commands, state) {
		return A2(
			$elm$core$Task$map,
			function (_v0) {
				return 0;
			},
			$elm$core$Task$sequence(
				A2(
					$elm$core$List$map,
					$elm$core$Task$spawnCmd(router),
					commands)));
	});
var $elm$core$Task$onSelfMsg = F3(
	function (_v0, _v1, _v2) {
		return $elm$core$Task$succeed(0);
	});
var $elm$core$Task$cmdMap = F2(
	function (tagger, _v0) {
		var task = _v0;
		return A2($elm$core$Task$map, tagger, task);
	});
_Platform_effectManagers['Task'] = _Platform_createManager($elm$core$Task$init, $elm$core$Task$onEffects, $elm$core$Task$onSelfMsg, $elm$core$Task$cmdMap);
var $elm$core$Task$command = _Platform_leaf('Task');
var $elm$core$Task$perform = F2(
	function (toMessage, task) {
		return $elm$core$Task$command(
			A2($elm$core$Task$map, toMessage, task));
	});
var $elm$browser$Browser$document = _Browser_document;
var $author$project$Main$GotMesh = function (a) {
	return {$: 2, a: a};
};
var $author$project$Main$Loading = {$: 0};
var $ianmackenzie$elm_geometry$Geometry$Types$Frame3d = $elm$core$Basics$identity;
var $ianmackenzie$elm_geometry$Geometry$Types$Point3d = $elm$core$Basics$identity;
var $ianmackenzie$elm_geometry$Point3d$origin = {eK: 0, eL: 0, cz: 0};
var $ianmackenzie$elm_geometry$Geometry$Types$Direction3d = $elm$core$Basics$identity;
var $ianmackenzie$elm_geometry$Direction3d$unsafe = function (givenComponents) {
	return givenComponents;
};
var $ianmackenzie$elm_geometry$Direction3d$positiveX = $ianmackenzie$elm_geometry$Direction3d$unsafe(
	{eK: 1, eL: 0, cz: 0});
var $ianmackenzie$elm_geometry$Direction3d$x = $ianmackenzie$elm_geometry$Direction3d$positiveX;
var $ianmackenzie$elm_geometry$Direction3d$positiveY = $ianmackenzie$elm_geometry$Direction3d$unsafe(
	{eK: 0, eL: 1, cz: 0});
var $ianmackenzie$elm_geometry$Direction3d$y = $ianmackenzie$elm_geometry$Direction3d$positiveY;
var $ianmackenzie$elm_geometry$Direction3d$positiveZ = $ianmackenzie$elm_geometry$Direction3d$unsafe(
	{eK: 0, eL: 0, cz: 1});
var $ianmackenzie$elm_geometry$Direction3d$z = $ianmackenzie$elm_geometry$Direction3d$positiveZ;
var $ianmackenzie$elm_geometry$Frame3d$atOrigin = {c1: $ianmackenzie$elm_geometry$Point3d$origin, dr: $ianmackenzie$elm_geometry$Direction3d$x, ds: $ianmackenzie$elm_geometry$Direction3d$y, dt: $ianmackenzie$elm_geometry$Direction3d$z};
var $elm$http$Http$BadBody = function (a) {
	return {$: 4, a: a};
};
var $elm$http$Http$BadStatus = function (a) {
	return {$: 3, a: a};
};
var $elm$http$Http$BadUrl = function (a) {
	return {$: 0, a: a};
};
var $elm$http$Http$NetworkError = {$: 2};
var $elm$http$Http$Timeout = {$: 1};
var $w0rm$elm_obj_file$Obj$Decode$FaceElement = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $w0rm$elm_obj_file$Obj$Decode$LineElement = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $w0rm$elm_obj_file$Obj$Decode$PointsElement = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $w0rm$elm_obj_file$Obj$Decode$Group = F4(
	function (a, b, c, d) {
		return {$: 0, a: a, b: b, c: c, d: d};
	});
var $w0rm$elm_obj_file$Obj$Decode$addNonEmptyGroup = F7(
	function (object_, material_, groups_, faceElements, lineElements, pointsElements, groups) {
		if (faceElements.b) {
			return A2(
				$elm$core$List$cons,
				A4(
					$w0rm$elm_obj_file$Obj$Decode$Group,
					{bz: groups_, bG: material_, bI: object_},
					faceElements,
					lineElements,
					pointsElements),
				groups);
		} else {
			if (lineElements.b) {
				return A2(
					$elm$core$List$cons,
					A4(
						$w0rm$elm_obj_file$Obj$Decode$Group,
						{bz: groups_, bG: material_, bI: object_},
						faceElements,
						lineElements,
						pointsElements),
					groups);
			} else {
				if (pointsElements.b) {
					return A2(
						$elm$core$List$cons,
						A4(
							$w0rm$elm_obj_file$Obj$Decode$Group,
							{bz: groups_, bG: material_, bI: object_},
							faceElements,
							lineElements,
							pointsElements),
						groups);
				} else {
					return groups;
				}
			}
		}
	});
var $elm$core$List$any = F2(
	function (isOkay, list) {
		any:
		while (true) {
			if (!list.b) {
				return false;
			} else {
				var x = list.a;
				var xs = list.b;
				if (isOkay(x)) {
					return true;
				} else {
					var $temp$isOkay = isOkay,
						$temp$list = xs;
					isOkay = $temp$isOkay;
					list = $temp$list;
					continue any;
				}
			}
		}
	});
var $elm$core$List$drop = F2(
	function (n, list) {
		drop:
		while (true) {
			if (n <= 0) {
				return list;
			} else {
				if (!list.b) {
					return list;
				} else {
					var x = list.a;
					var xs = list.b;
					var $temp$n = n - 1,
						$temp$list = xs;
					n = $temp$n;
					list = $temp$list;
					continue drop;
				}
			}
		}
	});
var $w0rm$elm_obj_file$Obj$Decode$formatError = F2(
	function (lineno, error) {
		return $elm$core$Result$Err(
			'Line ' + ($elm$core$String$fromInt(lineno) + (': ' + error)));
	});
var $elm$core$Array$fromListHelp = F3(
	function (list, nodeList, nodeListSize) {
		fromListHelp:
		while (true) {
			var _v0 = A2($elm$core$Elm$JsArray$initializeFromList, $elm$core$Array$branchFactor, list);
			var jsArray = _v0.a;
			var remainingItems = _v0.b;
			if (_Utils_cmp(
				$elm$core$Elm$JsArray$length(jsArray),
				$elm$core$Array$branchFactor) < 0) {
				return A2(
					$elm$core$Array$builderToArray,
					true,
					{D: nodeList, o: nodeListSize, t: jsArray});
			} else {
				var $temp$list = remainingItems,
					$temp$nodeList = A2(
					$elm$core$List$cons,
					$elm$core$Array$Leaf(jsArray),
					nodeList),
					$temp$nodeListSize = nodeListSize + 1;
				list = $temp$list;
				nodeList = $temp$nodeList;
				nodeListSize = $temp$nodeListSize;
				continue fromListHelp;
			}
		}
	});
var $elm$core$Array$fromList = function (list) {
	if (!list.b) {
		return $elm$core$Array$empty;
	} else {
		return A3($elm$core$Array$fromListHelp, list, _List_Nil, 0);
	}
};
var $ianmackenzie$elm_geometry$Point3d$fromMeters = function (givenCoordinates) {
	return givenCoordinates;
};
var $elm$core$Basics$isNaN = _Basics_isNaN;
var $elm$core$Array$length = function (_v0) {
	var len = _v0.a;
	return len;
};
var $elm$core$Basics$negate = function (n) {
	return -n;
};
var $w0rm$elm_obj_file$Obj$Decode$parseIndices = F2(
	function (list, vertices) {
		parseIndices:
		while (true) {
			if (list.b) {
				var first = list.a;
				var more = list.b;
				var _v1 = A2($elm$core$String$split, '/', first);
				if (_v1.b) {
					var pComponent = _v1.a;
					var uvnComponents = _v1.b;
					var _v2 = $elm$core$String$toInt(pComponent);
					if (!_v2.$) {
						var p = _v2.a;
						if (uvnComponents.b) {
							var uvComponent = uvnComponents.a;
							var nComponents = uvnComponents.b;
							var _v4 = $elm$core$String$toInt(uvComponent);
							if (!_v4.$) {
								var uv = _v4.a;
								if (nComponents.b) {
									var nComponent = nComponents.a;
									var _v6 = $elm$core$String$toInt(nComponent);
									if (!_v6.$) {
										var n = _v6.a;
										var $temp$list = more,
											$temp$vertices = A2(
											$elm$core$List$cons,
											{aC: n - 1, _: p - 1, P: uv - 1},
											vertices);
										list = $temp$list;
										vertices = $temp$vertices;
										continue parseIndices;
									} else {
										return _List_Nil;
									}
								} else {
									var $temp$list = more,
										$temp$vertices = A2(
										$elm$core$List$cons,
										{aC: -1, _: p - 1, P: uv - 1},
										vertices);
									list = $temp$list;
									vertices = $temp$vertices;
									continue parseIndices;
								}
							} else {
								if (nComponents.b) {
									var nComponent = nComponents.a;
									var _v8 = $elm$core$String$toInt(nComponent);
									if (!_v8.$) {
										var n = _v8.a;
										var $temp$list = more,
											$temp$vertices = A2(
											$elm$core$List$cons,
											{aC: n - 1, _: p - 1, P: -1},
											vertices);
										list = $temp$list;
										vertices = $temp$vertices;
										continue parseIndices;
									} else {
										return _List_Nil;
									}
								} else {
									var $temp$list = more,
										$temp$vertices = A2(
										$elm$core$List$cons,
										{aC: -1, _: p - 1, P: -1},
										vertices);
									list = $temp$list;
									vertices = $temp$vertices;
									continue parseIndices;
								}
							}
						} else {
							var $temp$list = more,
								$temp$vertices = A2(
								$elm$core$List$cons,
								{aC: -1, _: p - 1, P: -1},
								vertices);
							list = $temp$list;
							vertices = $temp$vertices;
							continue parseIndices;
						}
					} else {
						return _List_Nil;
					}
				} else {
					return _List_Nil;
				}
			} else {
				return vertices;
			}
		}
	});
var $w0rm$elm_obj_file$Obj$Decode$nanXyz = {eK: 0 / 0, eL: 0 / 0, cz: 0 / 0};
var $elm$core$String$toFloat = _String_toFloat;
var $w0rm$elm_obj_file$Obj$Decode$parseNormal = function (list) {
	if ((list.b && list.b.b) && list.b.b.b) {
		var sx = list.a;
		var _v1 = list.b;
		var sy = _v1.a;
		var _v2 = _v1.b;
		var sz = _v2.a;
		var _v3 = $elm$core$String$toFloat(sx);
		if (!_v3.$) {
			var x = _v3.a;
			var _v4 = $elm$core$String$toFloat(sy);
			if (!_v4.$) {
				var y = _v4.a;
				var _v5 = $elm$core$String$toFloat(sz);
				if (!_v5.$) {
					var z = _v5.a;
					return {eK: x, eL: y, cz: z};
				} else {
					return $w0rm$elm_obj_file$Obj$Decode$nanXyz;
				}
			} else {
				return $w0rm$elm_obj_file$Obj$Decode$nanXyz;
			}
		} else {
			return $w0rm$elm_obj_file$Obj$Decode$nanXyz;
		}
	} else {
		return $w0rm$elm_obj_file$Obj$Decode$nanXyz;
	}
};
var $w0rm$elm_obj_file$Obj$Decode$parsePosition = F2(
	function (units, list) {
		if ((list.b && list.b.b) && list.b.b.b) {
			var sx = list.a;
			var _v1 = list.b;
			var sy = _v1.a;
			var _v2 = _v1.b;
			var sz = _v2.a;
			var _v3 = $elm$core$String$toFloat(sx);
			if (!_v3.$) {
				var x = _v3.a;
				var _v4 = $elm$core$String$toFloat(sy);
				if (!_v4.$) {
					var y = _v4.a;
					var _v5 = $elm$core$String$toFloat(sz);
					if (!_v5.$) {
						var z = _v5.a;
						return {
							eK: units(x),
							eL: units(y),
							cz: units(z)
						};
					} else {
						return $w0rm$elm_obj_file$Obj$Decode$nanXyz;
					}
				} else {
					return $w0rm$elm_obj_file$Obj$Decode$nanXyz;
				}
			} else {
				return $w0rm$elm_obj_file$Obj$Decode$nanXyz;
			}
		} else {
			return $w0rm$elm_obj_file$Obj$Decode$nanXyz;
		}
	});
var $w0rm$elm_obj_file$Obj$Decode$nanUv = _Utils_Tuple2(0 / 0, 0 / 0);
var $w0rm$elm_obj_file$Obj$Decode$parseUv = function (list) {
	if (list.b) {
		if (list.b.b) {
			var su = list.a;
			var _v1 = list.b;
			var sv = _v1.a;
			var _v2 = $elm$core$String$toFloat(su);
			if (!_v2.$) {
				var u = _v2.a;
				var _v3 = $elm$core$String$toFloat(sv);
				if (!_v3.$) {
					var v = _v3.a;
					return _Utils_Tuple2(u, v);
				} else {
					return $w0rm$elm_obj_file$Obj$Decode$nanUv;
				}
			} else {
				return $w0rm$elm_obj_file$Obj$Decode$nanUv;
			}
		} else {
			var su = list.a;
			var _v4 = $elm$core$String$toFloat(su);
			if (!_v4.$) {
				var u = _v4.a;
				return _Utils_Tuple2(u, 0);
			} else {
				return $w0rm$elm_obj_file$Obj$Decode$nanUv;
			}
		}
	} else {
		return $w0rm$elm_obj_file$Obj$Decode$nanUv;
	}
};
var $elm$core$Array$repeat = F2(
	function (n, e) {
		return A2(
			$elm$core$Array$initialize,
			n,
			function (_v0) {
				return e;
			});
	});
var $w0rm$elm_obj_file$Obj$Decode$skipCommands = _List_fromArray(
	['s', 'mg', 'mtllib', 'bevel', 'c_interp', 'd_interp', 'lod', 'shadow_obj', 'trace_obj', 'ctech', 'stech', 'cstype', 'deg', 'bmat', 'step', 'curv', 'curv2', 'surf', 'parm', 'trim', 'hole', 'scrv', 'sp', 'end', 'con', 'call', 'scmp', 'csh']);
var $elm$core$String$words = _String_words;
var $w0rm$elm_obj_file$Obj$Decode$decodeHelp = function (units) {
	return function (decode) {
		return function (lines) {
			return function (lineno) {
				return function (positions) {
					return function (normals) {
						return function (uvs) {
							return function (groups) {
								return function (object_) {
									return function (material_) {
										return function (groups_) {
											return function (faceElements) {
												return function (lineElements) {
													return function (pointsElements) {
														decodeHelp:
														while (true) {
															if (lines.b) {
																var line = lines.a;
																var remainingLines = lines.b;
																var words = $elm$core$String$words(line);
																var startsWith = function () {
																	if (words.b) {
																		var firstWord = words.a;
																		return firstWord;
																	} else {
																		return '';
																	}
																}();
																var remainingWords = A2($elm$core$List$drop, 1, words);
																if (startsWith === 'v') {
																	var position = A2($w0rm$elm_obj_file$Obj$Decode$parsePosition, units, remainingWords);
																	var x = position.eK;
																	if ($elm$core$Basics$isNaN(x)) {
																		return A2($w0rm$elm_obj_file$Obj$Decode$formatError, lineno, 'Invalid position format');
																	} else {
																		var $temp$units = units,
																			$temp$decode = decode,
																			$temp$lines = remainingLines,
																			$temp$lineno = lineno + 1,
																			$temp$positions = A2(
																			$elm$core$List$cons,
																			$ianmackenzie$elm_geometry$Point3d$fromMeters(position),
																			positions),
																			$temp$normals = normals,
																			$temp$uvs = uvs,
																			$temp$groups = groups,
																			$temp$object_ = object_,
																			$temp$material_ = material_,
																			$temp$groups_ = groups_,
																			$temp$faceElements = faceElements,
																			$temp$lineElements = lineElements,
																			$temp$pointsElements = pointsElements;
																		units = $temp$units;
																		decode = $temp$decode;
																		lines = $temp$lines;
																		lineno = $temp$lineno;
																		positions = $temp$positions;
																		normals = $temp$normals;
																		uvs = $temp$uvs;
																		groups = $temp$groups;
																		object_ = $temp$object_;
																		material_ = $temp$material_;
																		groups_ = $temp$groups_;
																		faceElements = $temp$faceElements;
																		lineElements = $temp$lineElements;
																		pointsElements = $temp$pointsElements;
																		continue decodeHelp;
																	}
																} else {
																	if (startsWith === 'vt') {
																		var uv = $w0rm$elm_obj_file$Obj$Decode$parseUv(remainingWords);
																		var u = uv.a;
																		if ($elm$core$Basics$isNaN(u)) {
																			return A2($w0rm$elm_obj_file$Obj$Decode$formatError, lineno, 'Invalid texture coordinates format');
																		} else {
																			var $temp$units = units,
																				$temp$decode = decode,
																				$temp$lines = remainingLines,
																				$temp$lineno = lineno + 1,
																				$temp$positions = positions,
																				$temp$normals = normals,
																				$temp$uvs = A2($elm$core$List$cons, uv, uvs),
																				$temp$groups = groups,
																				$temp$object_ = object_,
																				$temp$material_ = material_,
																				$temp$groups_ = groups_,
																				$temp$faceElements = faceElements,
																				$temp$lineElements = lineElements,
																				$temp$pointsElements = pointsElements;
																			units = $temp$units;
																			decode = $temp$decode;
																			lines = $temp$lines;
																			lineno = $temp$lineno;
																			positions = $temp$positions;
																			normals = $temp$normals;
																			uvs = $temp$uvs;
																			groups = $temp$groups;
																			object_ = $temp$object_;
																			material_ = $temp$material_;
																			groups_ = $temp$groups_;
																			faceElements = $temp$faceElements;
																			lineElements = $temp$lineElements;
																			pointsElements = $temp$pointsElements;
																			continue decodeHelp;
																		}
																	} else {
																		if (startsWith === 'vn') {
																			var normal = $w0rm$elm_obj_file$Obj$Decode$parseNormal(remainingWords);
																			var x = normal.eK;
																			if ($elm$core$Basics$isNaN(x)) {
																				return A2($w0rm$elm_obj_file$Obj$Decode$formatError, lineno, 'Invalid normal vector format');
																			} else {
																				var $temp$units = units,
																					$temp$decode = decode,
																					$temp$lines = remainingLines,
																					$temp$lineno = lineno + 1,
																					$temp$positions = positions,
																					$temp$normals = A2(
																					$elm$core$List$cons,
																					$ianmackenzie$elm_geometry$Direction3d$unsafe(normal),
																					normals),
																					$temp$uvs = uvs,
																					$temp$groups = groups,
																					$temp$object_ = object_,
																					$temp$material_ = material_,
																					$temp$groups_ = groups_,
																					$temp$faceElements = faceElements,
																					$temp$lineElements = lineElements,
																					$temp$pointsElements = pointsElements;
																				units = $temp$units;
																				decode = $temp$decode;
																				lines = $temp$lines;
																				lineno = $temp$lineno;
																				positions = $temp$positions;
																				normals = $temp$normals;
																				uvs = $temp$uvs;
																				groups = $temp$groups;
																				object_ = $temp$object_;
																				material_ = $temp$material_;
																				groups_ = $temp$groups_;
																				faceElements = $temp$faceElements;
																				lineElements = $temp$lineElements;
																				pointsElements = $temp$pointsElements;
																				continue decodeHelp;
																			}
																		} else {
																			if (startsWith === 'f') {
																				var _v1 = A2($w0rm$elm_obj_file$Obj$Decode$parseIndices, remainingWords, _List_Nil);
																				if (_v1.b) {
																					if (_v1.b.b && _v1.b.b.b) {
																						var vertices = _v1;
																						var _v2 = vertices.b;
																						var _v3 = _v2.b;
																						var $temp$units = units,
																							$temp$decode = decode,
																							$temp$lines = remainingLines,
																							$temp$lineno = lineno + 1,
																							$temp$positions = positions,
																							$temp$normals = normals,
																							$temp$uvs = uvs,
																							$temp$groups = groups,
																							$temp$object_ = object_,
																							$temp$material_ = material_,
																							$temp$groups_ = groups_,
																							$temp$faceElements = A2(
																							$elm$core$List$cons,
																							A2($w0rm$elm_obj_file$Obj$Decode$FaceElement, lineno, vertices),
																							faceElements),
																							$temp$lineElements = lineElements,
																							$temp$pointsElements = pointsElements;
																						units = $temp$units;
																						decode = $temp$decode;
																						lines = $temp$lines;
																						lineno = $temp$lineno;
																						positions = $temp$positions;
																						normals = $temp$normals;
																						uvs = $temp$uvs;
																						groups = $temp$groups;
																						object_ = $temp$object_;
																						material_ = $temp$material_;
																						groups_ = $temp$groups_;
																						faceElements = $temp$faceElements;
																						lineElements = $temp$lineElements;
																						pointsElements = $temp$pointsElements;
																						continue decodeHelp;
																					} else {
																						return A2($w0rm$elm_obj_file$Obj$Decode$formatError, lineno, 'Face has less than three vertices');
																					}
																				} else {
																					if (!remainingWords.b) {
																						return A2($w0rm$elm_obj_file$Obj$Decode$formatError, lineno, 'Face has less than three vertices');
																					} else {
																						return A2($w0rm$elm_obj_file$Obj$Decode$formatError, lineno, 'Invalid face format');
																					}
																				}
																			} else {
																				if (startsWith === 'l') {
																					var _v5 = A2($w0rm$elm_obj_file$Obj$Decode$parseIndices, remainingWords, _List_Nil);
																					if (_v5.b) {
																						if (_v5.b.b) {
																							var vertices = _v5;
																							var _v6 = vertices.b;
																							var $temp$units = units,
																								$temp$decode = decode,
																								$temp$lines = remainingLines,
																								$temp$lineno = lineno + 1,
																								$temp$positions = positions,
																								$temp$normals = normals,
																								$temp$uvs = uvs,
																								$temp$groups = groups,
																								$temp$object_ = object_,
																								$temp$material_ = material_,
																								$temp$groups_ = groups_,
																								$temp$faceElements = faceElements,
																								$temp$lineElements = A2(
																								$elm$core$List$cons,
																								A2($w0rm$elm_obj_file$Obj$Decode$LineElement, lineno, vertices),
																								lineElements),
																								$temp$pointsElements = pointsElements;
																							units = $temp$units;
																							decode = $temp$decode;
																							lines = $temp$lines;
																							lineno = $temp$lineno;
																							positions = $temp$positions;
																							normals = $temp$normals;
																							uvs = $temp$uvs;
																							groups = $temp$groups;
																							object_ = $temp$object_;
																							material_ = $temp$material_;
																							groups_ = $temp$groups_;
																							faceElements = $temp$faceElements;
																							lineElements = $temp$lineElements;
																							pointsElements = $temp$pointsElements;
																							continue decodeHelp;
																						} else {
																							return A2($w0rm$elm_obj_file$Obj$Decode$formatError, lineno, 'Line has less than two vertices');
																						}
																					} else {
																						if (!remainingWords.b) {
																							return A2($w0rm$elm_obj_file$Obj$Decode$formatError, lineno, 'Line has less than two vertices');
																						} else {
																							return A2($w0rm$elm_obj_file$Obj$Decode$formatError, lineno, 'Invalid line format');
																						}
																					}
																				} else {
																					if (startsWith === 'p') {
																						var _v8 = A2($w0rm$elm_obj_file$Obj$Decode$parseIndices, remainingWords, _List_Nil);
																						if (_v8.b) {
																							var vertices = _v8;
																							var $temp$units = units,
																								$temp$decode = decode,
																								$temp$lines = remainingLines,
																								$temp$lineno = lineno + 1,
																								$temp$positions = positions,
																								$temp$normals = normals,
																								$temp$uvs = uvs,
																								$temp$groups = groups,
																								$temp$object_ = object_,
																								$temp$material_ = material_,
																								$temp$groups_ = groups_,
																								$temp$faceElements = faceElements,
																								$temp$lineElements = lineElements,
																								$temp$pointsElements = A2(
																								$elm$core$List$cons,
																								A2($w0rm$elm_obj_file$Obj$Decode$PointsElement, lineno, vertices),
																								pointsElements);
																							units = $temp$units;
																							decode = $temp$decode;
																							lines = $temp$lines;
																							lineno = $temp$lineno;
																							positions = $temp$positions;
																							normals = $temp$normals;
																							uvs = $temp$uvs;
																							groups = $temp$groups;
																							object_ = $temp$object_;
																							material_ = $temp$material_;
																							groups_ = $temp$groups_;
																							faceElements = $temp$faceElements;
																							lineElements = $temp$lineElements;
																							pointsElements = $temp$pointsElements;
																							continue decodeHelp;
																						} else {
																							if (!remainingWords.b) {
																								return A2($w0rm$elm_obj_file$Obj$Decode$formatError, lineno, 'Points element has no vertices');
																							} else {
																								return A2($w0rm$elm_obj_file$Obj$Decode$formatError, lineno, 'Invalid points format');
																							}
																						}
																					} else {
																						if (startsWith === 'o') {
																							if (remainingWords.b) {
																								var newObject = remainingWords.a;
																								var $temp$units = units,
																									$temp$decode = decode,
																									$temp$lines = remainingLines,
																									$temp$lineno = lineno + 1,
																									$temp$positions = positions,
																									$temp$normals = normals,
																									$temp$uvs = uvs,
																									$temp$groups = A7($w0rm$elm_obj_file$Obj$Decode$addNonEmptyGroup, object_, material_, groups_, faceElements, lineElements, pointsElements, groups),
																									$temp$object_ = $elm$core$Maybe$Just(newObject),
																									$temp$material_ = material_,
																									$temp$groups_ = groups_,
																									$temp$faceElements = _List_Nil,
																									$temp$lineElements = _List_Nil,
																									$temp$pointsElements = _List_Nil;
																								units = $temp$units;
																								decode = $temp$decode;
																								lines = $temp$lines;
																								lineno = $temp$lineno;
																								positions = $temp$positions;
																								normals = $temp$normals;
																								uvs = $temp$uvs;
																								groups = $temp$groups;
																								object_ = $temp$object_;
																								material_ = $temp$material_;
																								groups_ = $temp$groups_;
																								faceElements = $temp$faceElements;
																								lineElements = $temp$lineElements;
																								pointsElements = $temp$pointsElements;
																								continue decodeHelp;
																							} else {
																								return A2($w0rm$elm_obj_file$Obj$Decode$formatError, lineno, 'No object name');
																							}
																						} else {
																							if (startsWith === 'g') {
																								if (!remainingWords.b) {
																									var $temp$units = units,
																										$temp$decode = decode,
																										$temp$lines = remainingLines,
																										$temp$lineno = lineno + 1,
																										$temp$positions = positions,
																										$temp$normals = normals,
																										$temp$uvs = uvs,
																										$temp$groups = A7($w0rm$elm_obj_file$Obj$Decode$addNonEmptyGroup, object_, material_, groups_, faceElements, lineElements, pointsElements, groups),
																										$temp$object_ = object_,
																										$temp$material_ = material_,
																										$temp$groups_ = _List_fromArray(
																										['default']),
																										$temp$faceElements = _List_Nil,
																										$temp$lineElements = _List_Nil,
																										$temp$pointsElements = _List_Nil;
																									units = $temp$units;
																									decode = $temp$decode;
																									lines = $temp$lines;
																									lineno = $temp$lineno;
																									positions = $temp$positions;
																									normals = $temp$normals;
																									uvs = $temp$uvs;
																									groups = $temp$groups;
																									object_ = $temp$object_;
																									material_ = $temp$material_;
																									groups_ = $temp$groups_;
																									faceElements = $temp$faceElements;
																									lineElements = $temp$lineElements;
																									pointsElements = $temp$pointsElements;
																									continue decodeHelp;
																								} else {
																									var newGroups = remainingWords;
																									var $temp$units = units,
																										$temp$decode = decode,
																										$temp$lines = remainingLines,
																										$temp$lineno = lineno + 1,
																										$temp$positions = positions,
																										$temp$normals = normals,
																										$temp$uvs = uvs,
																										$temp$groups = A7($w0rm$elm_obj_file$Obj$Decode$addNonEmptyGroup, object_, material_, groups_, faceElements, lineElements, pointsElements, groups),
																										$temp$object_ = object_,
																										$temp$material_ = material_,
																										$temp$groups_ = newGroups,
																										$temp$faceElements = _List_Nil,
																										$temp$lineElements = _List_Nil,
																										$temp$pointsElements = _List_Nil;
																									units = $temp$units;
																									decode = $temp$decode;
																									lines = $temp$lines;
																									lineno = $temp$lineno;
																									positions = $temp$positions;
																									normals = $temp$normals;
																									uvs = $temp$uvs;
																									groups = $temp$groups;
																									object_ = $temp$object_;
																									material_ = $temp$material_;
																									groups_ = $temp$groups_;
																									faceElements = $temp$faceElements;
																									lineElements = $temp$lineElements;
																									pointsElements = $temp$pointsElements;
																									continue decodeHelp;
																								}
																							} else {
																								if (startsWith === 'usemtl') {
																									if (remainingWords.b) {
																										var newMaterial = remainingWords.a;
																										var $temp$units = units,
																											$temp$decode = decode,
																											$temp$lines = remainingLines,
																											$temp$lineno = lineno + 1,
																											$temp$positions = positions,
																											$temp$normals = normals,
																											$temp$uvs = uvs,
																											$temp$groups = A7($w0rm$elm_obj_file$Obj$Decode$addNonEmptyGroup, object_, material_, groups_, faceElements, lineElements, pointsElements, groups),
																											$temp$object_ = object_,
																											$temp$material_ = $elm$core$Maybe$Just(newMaterial),
																											$temp$groups_ = groups_,
																											$temp$faceElements = _List_Nil,
																											$temp$lineElements = _List_Nil,
																											$temp$pointsElements = _List_Nil;
																										units = $temp$units;
																										decode = $temp$decode;
																										lines = $temp$lines;
																										lineno = $temp$lineno;
																										positions = $temp$positions;
																										normals = $temp$normals;
																										uvs = $temp$uvs;
																										groups = $temp$groups;
																										object_ = $temp$object_;
																										material_ = $temp$material_;
																										groups_ = $temp$groups_;
																										faceElements = $temp$faceElements;
																										lineElements = $temp$lineElements;
																										pointsElements = $temp$pointsElements;
																										continue decodeHelp;
																									} else {
																										return A2($w0rm$elm_obj_file$Obj$Decode$formatError, lineno, 'No material name');
																									}
																								} else {
																									if ((startsWith === '') || ((A2($elm$core$String$left, 1, startsWith) === '#') || A2(
																										$elm$core$List$any,
																										$elm$core$Basics$eq(startsWith),
																										$w0rm$elm_obj_file$Obj$Decode$skipCommands))) {
																										var $temp$units = units,
																											$temp$decode = decode,
																											$temp$lines = remainingLines,
																											$temp$lineno = lineno + 1,
																											$temp$positions = positions,
																											$temp$normals = normals,
																											$temp$uvs = uvs,
																											$temp$groups = groups,
																											$temp$object_ = object_,
																											$temp$material_ = material_,
																											$temp$groups_ = groups_,
																											$temp$faceElements = faceElements,
																											$temp$lineElements = lineElements,
																											$temp$pointsElements = pointsElements;
																										units = $temp$units;
																										decode = $temp$decode;
																										lines = $temp$lines;
																										lineno = $temp$lineno;
																										positions = $temp$positions;
																										normals = $temp$normals;
																										uvs = $temp$uvs;
																										groups = $temp$groups;
																										object_ = $temp$object_;
																										material_ = $temp$material_;
																										groups_ = $temp$groups_;
																										faceElements = $temp$faceElements;
																										lineElements = $temp$lineElements;
																										pointsElements = $temp$pointsElements;
																										continue decodeHelp;
																									} else {
																										return A2(
																											$w0rm$elm_obj_file$Obj$Decode$formatError,
																											lineno,
																											'Invalid OBJ syntax \'' + (($elm$core$String$length(line) > 20) ? (A2($elm$core$String$left, 20, line) + '...\'') : (line + '\'')));
																									}
																								}
																							}
																						}
																					}
																				}
																			}
																		}
																	}
																}
															} else {
																var positions_ = $elm$core$Array$fromList(
																	$elm$core$List$reverse(positions));
																return A3(
																	decode,
																	{
																		R: A2(
																			$elm$core$Array$repeat,
																			$elm$core$Array$length(positions_),
																			_List_Nil),
																		ci: $elm$core$Array$fromList(
																			$elm$core$List$reverse(normals)),
																		af: positions_,
																		cx: $elm$core$Array$fromList(
																			$elm$core$List$reverse(uvs))
																	},
																	_List_Nil,
																	A7($w0rm$elm_obj_file$Obj$Decode$addNonEmptyGroup, object_, material_, groups_, faceElements, lineElements, pointsElements, groups));
															}
														}
													};
												};
											};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var $ianmackenzie$elm_units$Length$inMeters = function (_v0) {
	var numMeters = _v0;
	return numMeters;
};
var $elm$core$String$lines = _String_lines;
var $w0rm$elm_obj_file$Obj$Decode$decodeString = F3(
	function (units, _v0, content) {
		var decode = _v0;
		var unitsFn = function (n) {
			return $ianmackenzie$elm_units$Length$inMeters(
				units(n));
		};
		return $w0rm$elm_obj_file$Obj$Decode$decodeHelp(unitsFn)(decode)(
			$elm$core$String$lines(content))(1)(_List_Nil)(_List_Nil)(_List_Nil)(_List_Nil)($elm$core$Maybe$Nothing)($elm$core$Maybe$Nothing)(
			_List_fromArray(
				['default']))(_List_Nil)(_List_Nil)(_List_Nil);
	});
var $elm$http$Http$BadStatus_ = F2(
	function (a, b) {
		return {$: 3, a: a, b: b};
	});
var $elm$http$Http$BadUrl_ = function (a) {
	return {$: 0, a: a};
};
var $elm$http$Http$GoodStatus_ = F2(
	function (a, b) {
		return {$: 4, a: a, b: b};
	});
var $elm$http$Http$NetworkError_ = {$: 2};
var $elm$http$Http$Receiving = function (a) {
	return {$: 1, a: a};
};
var $elm$http$Http$Sending = function (a) {
	return {$: 0, a: a};
};
var $elm$http$Http$Timeout_ = {$: 1};
var $elm$core$Dict$RBEmpty_elm_builtin = {$: -2};
var $elm$core$Dict$empty = $elm$core$Dict$RBEmpty_elm_builtin;
var $elm$core$Maybe$isJust = function (maybe) {
	if (!maybe.$) {
		return true;
	} else {
		return false;
	}
};
var $elm$core$Platform$sendToSelf = _Platform_sendToSelf;
var $elm$core$Basics$compare = _Utils_compare;
var $elm$core$Dict$get = F2(
	function (targetKey, dict) {
		get:
		while (true) {
			if (dict.$ === -2) {
				return $elm$core$Maybe$Nothing;
			} else {
				var key = dict.b;
				var value = dict.c;
				var left = dict.d;
				var right = dict.e;
				var _v1 = A2($elm$core$Basics$compare, targetKey, key);
				switch (_v1) {
					case 0:
						var $temp$targetKey = targetKey,
							$temp$dict = left;
						targetKey = $temp$targetKey;
						dict = $temp$dict;
						continue get;
					case 1:
						return $elm$core$Maybe$Just(value);
					default:
						var $temp$targetKey = targetKey,
							$temp$dict = right;
						targetKey = $temp$targetKey;
						dict = $temp$dict;
						continue get;
				}
			}
		}
	});
var $elm$core$Dict$Black = 1;
var $elm$core$Dict$RBNode_elm_builtin = F5(
	function (a, b, c, d, e) {
		return {$: -1, a: a, b: b, c: c, d: d, e: e};
	});
var $elm$core$Dict$Red = 0;
var $elm$core$Dict$balance = F5(
	function (color, key, value, left, right) {
		if ((right.$ === -1) && (!right.a)) {
			var _v1 = right.a;
			var rK = right.b;
			var rV = right.c;
			var rLeft = right.d;
			var rRight = right.e;
			if ((left.$ === -1) && (!left.a)) {
				var _v3 = left.a;
				var lK = left.b;
				var lV = left.c;
				var lLeft = left.d;
				var lRight = left.e;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					0,
					key,
					value,
					A5($elm$core$Dict$RBNode_elm_builtin, 1, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 1, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					color,
					rK,
					rV,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, key, value, left, rLeft),
					rRight);
			}
		} else {
			if ((((left.$ === -1) && (!left.a)) && (left.d.$ === -1)) && (!left.d.a)) {
				var _v5 = left.a;
				var lK = left.b;
				var lV = left.c;
				var _v6 = left.d;
				var _v7 = _v6.a;
				var llK = _v6.b;
				var llV = _v6.c;
				var llLeft = _v6.d;
				var llRight = _v6.e;
				var lRight = left.e;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					0,
					lK,
					lV,
					A5($elm$core$Dict$RBNode_elm_builtin, 1, llK, llV, llLeft, llRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 1, key, value, lRight, right));
			} else {
				return A5($elm$core$Dict$RBNode_elm_builtin, color, key, value, left, right);
			}
		}
	});
var $elm$core$Dict$insertHelp = F3(
	function (key, value, dict) {
		if (dict.$ === -2) {
			return A5($elm$core$Dict$RBNode_elm_builtin, 0, key, value, $elm$core$Dict$RBEmpty_elm_builtin, $elm$core$Dict$RBEmpty_elm_builtin);
		} else {
			var nColor = dict.a;
			var nKey = dict.b;
			var nValue = dict.c;
			var nLeft = dict.d;
			var nRight = dict.e;
			var _v1 = A2($elm$core$Basics$compare, key, nKey);
			switch (_v1) {
				case 0:
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						A3($elm$core$Dict$insertHelp, key, value, nLeft),
						nRight);
				case 1:
					return A5($elm$core$Dict$RBNode_elm_builtin, nColor, nKey, value, nLeft, nRight);
				default:
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						nLeft,
						A3($elm$core$Dict$insertHelp, key, value, nRight));
			}
		}
	});
var $elm$core$Dict$insert = F3(
	function (key, value, dict) {
		var _v0 = A3($elm$core$Dict$insertHelp, key, value, dict);
		if ((_v0.$ === -1) && (!_v0.a)) {
			var _v1 = _v0.a;
			var k = _v0.b;
			var v = _v0.c;
			var l = _v0.d;
			var r = _v0.e;
			return A5($elm$core$Dict$RBNode_elm_builtin, 1, k, v, l, r);
		} else {
			var x = _v0;
			return x;
		}
	});
var $elm$core$Dict$getMin = function (dict) {
	getMin:
	while (true) {
		if ((dict.$ === -1) && (dict.d.$ === -1)) {
			var left = dict.d;
			var $temp$dict = left;
			dict = $temp$dict;
			continue getMin;
		} else {
			return dict;
		}
	}
};
var $elm$core$Dict$moveRedLeft = function (dict) {
	if (((dict.$ === -1) && (dict.d.$ === -1)) && (dict.e.$ === -1)) {
		if ((dict.e.d.$ === -1) && (!dict.e.d.a)) {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v1 = dict.d;
			var lClr = _v1.a;
			var lK = _v1.b;
			var lV = _v1.c;
			var lLeft = _v1.d;
			var lRight = _v1.e;
			var _v2 = dict.e;
			var rClr = _v2.a;
			var rK = _v2.b;
			var rV = _v2.c;
			var rLeft = _v2.d;
			var _v3 = rLeft.a;
			var rlK = rLeft.b;
			var rlV = rLeft.c;
			var rlL = rLeft.d;
			var rlR = rLeft.e;
			var rRight = _v2.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				0,
				rlK,
				rlV,
				A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					rlL),
				A5($elm$core$Dict$RBNode_elm_builtin, 1, rK, rV, rlR, rRight));
		} else {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v4 = dict.d;
			var lClr = _v4.a;
			var lK = _v4.b;
			var lV = _v4.c;
			var lLeft = _v4.d;
			var lRight = _v4.e;
			var _v5 = dict.e;
			var rClr = _v5.a;
			var rK = _v5.b;
			var rV = _v5.c;
			var rLeft = _v5.d;
			var rRight = _v5.e;
			if (clr === 1) {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			}
		}
	} else {
		return dict;
	}
};
var $elm$core$Dict$moveRedRight = function (dict) {
	if (((dict.$ === -1) && (dict.d.$ === -1)) && (dict.e.$ === -1)) {
		if ((dict.d.d.$ === -1) && (!dict.d.d.a)) {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v1 = dict.d;
			var lClr = _v1.a;
			var lK = _v1.b;
			var lV = _v1.c;
			var _v2 = _v1.d;
			var _v3 = _v2.a;
			var llK = _v2.b;
			var llV = _v2.c;
			var llLeft = _v2.d;
			var llRight = _v2.e;
			var lRight = _v1.e;
			var _v4 = dict.e;
			var rClr = _v4.a;
			var rK = _v4.b;
			var rV = _v4.c;
			var rLeft = _v4.d;
			var rRight = _v4.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				0,
				lK,
				lV,
				A5($elm$core$Dict$RBNode_elm_builtin, 1, llK, llV, llLeft, llRight),
				A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					lRight,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight)));
		} else {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v5 = dict.d;
			var lClr = _v5.a;
			var lK = _v5.b;
			var lV = _v5.c;
			var lLeft = _v5.d;
			var lRight = _v5.e;
			var _v6 = dict.e;
			var rClr = _v6.a;
			var rK = _v6.b;
			var rV = _v6.c;
			var rLeft = _v6.d;
			var rRight = _v6.e;
			if (clr === 1) {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			}
		}
	} else {
		return dict;
	}
};
var $elm$core$Dict$removeHelpPrepEQGT = F7(
	function (targetKey, dict, color, key, value, left, right) {
		if ((left.$ === -1) && (!left.a)) {
			var _v1 = left.a;
			var lK = left.b;
			var lV = left.c;
			var lLeft = left.d;
			var lRight = left.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				color,
				lK,
				lV,
				lLeft,
				A5($elm$core$Dict$RBNode_elm_builtin, 0, key, value, lRight, right));
		} else {
			_v2$2:
			while (true) {
				if ((right.$ === -1) && (right.a === 1)) {
					if (right.d.$ === -1) {
						if (right.d.a === 1) {
							var _v3 = right.a;
							var _v4 = right.d;
							var _v5 = _v4.a;
							return $elm$core$Dict$moveRedRight(dict);
						} else {
							break _v2$2;
						}
					} else {
						var _v6 = right.a;
						var _v7 = right.d;
						return $elm$core$Dict$moveRedRight(dict);
					}
				} else {
					break _v2$2;
				}
			}
			return dict;
		}
	});
var $elm$core$Dict$removeMin = function (dict) {
	if ((dict.$ === -1) && (dict.d.$ === -1)) {
		var color = dict.a;
		var key = dict.b;
		var value = dict.c;
		var left = dict.d;
		var lColor = left.a;
		var lLeft = left.d;
		var right = dict.e;
		if (lColor === 1) {
			if ((lLeft.$ === -1) && (!lLeft.a)) {
				var _v3 = lLeft.a;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					color,
					key,
					value,
					$elm$core$Dict$removeMin(left),
					right);
			} else {
				var _v4 = $elm$core$Dict$moveRedLeft(dict);
				if (_v4.$ === -1) {
					var nColor = _v4.a;
					var nKey = _v4.b;
					var nValue = _v4.c;
					var nLeft = _v4.d;
					var nRight = _v4.e;
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						$elm$core$Dict$removeMin(nLeft),
						nRight);
				} else {
					return $elm$core$Dict$RBEmpty_elm_builtin;
				}
			}
		} else {
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				color,
				key,
				value,
				$elm$core$Dict$removeMin(left),
				right);
		}
	} else {
		return $elm$core$Dict$RBEmpty_elm_builtin;
	}
};
var $elm$core$Dict$removeHelp = F2(
	function (targetKey, dict) {
		if (dict.$ === -2) {
			return $elm$core$Dict$RBEmpty_elm_builtin;
		} else {
			var color = dict.a;
			var key = dict.b;
			var value = dict.c;
			var left = dict.d;
			var right = dict.e;
			if (_Utils_cmp(targetKey, key) < 0) {
				if ((left.$ === -1) && (left.a === 1)) {
					var _v4 = left.a;
					var lLeft = left.d;
					if ((lLeft.$ === -1) && (!lLeft.a)) {
						var _v6 = lLeft.a;
						return A5(
							$elm$core$Dict$RBNode_elm_builtin,
							color,
							key,
							value,
							A2($elm$core$Dict$removeHelp, targetKey, left),
							right);
					} else {
						var _v7 = $elm$core$Dict$moveRedLeft(dict);
						if (_v7.$ === -1) {
							var nColor = _v7.a;
							var nKey = _v7.b;
							var nValue = _v7.c;
							var nLeft = _v7.d;
							var nRight = _v7.e;
							return A5(
								$elm$core$Dict$balance,
								nColor,
								nKey,
								nValue,
								A2($elm$core$Dict$removeHelp, targetKey, nLeft),
								nRight);
						} else {
							return $elm$core$Dict$RBEmpty_elm_builtin;
						}
					}
				} else {
					return A5(
						$elm$core$Dict$RBNode_elm_builtin,
						color,
						key,
						value,
						A2($elm$core$Dict$removeHelp, targetKey, left),
						right);
				}
			} else {
				return A2(
					$elm$core$Dict$removeHelpEQGT,
					targetKey,
					A7($elm$core$Dict$removeHelpPrepEQGT, targetKey, dict, color, key, value, left, right));
			}
		}
	});
var $elm$core$Dict$removeHelpEQGT = F2(
	function (targetKey, dict) {
		if (dict.$ === -1) {
			var color = dict.a;
			var key = dict.b;
			var value = dict.c;
			var left = dict.d;
			var right = dict.e;
			if (_Utils_eq(targetKey, key)) {
				var _v1 = $elm$core$Dict$getMin(right);
				if (_v1.$ === -1) {
					var minKey = _v1.b;
					var minValue = _v1.c;
					return A5(
						$elm$core$Dict$balance,
						color,
						minKey,
						minValue,
						left,
						$elm$core$Dict$removeMin(right));
				} else {
					return $elm$core$Dict$RBEmpty_elm_builtin;
				}
			} else {
				return A5(
					$elm$core$Dict$balance,
					color,
					key,
					value,
					left,
					A2($elm$core$Dict$removeHelp, targetKey, right));
			}
		} else {
			return $elm$core$Dict$RBEmpty_elm_builtin;
		}
	});
var $elm$core$Dict$remove = F2(
	function (key, dict) {
		var _v0 = A2($elm$core$Dict$removeHelp, key, dict);
		if ((_v0.$ === -1) && (!_v0.a)) {
			var _v1 = _v0.a;
			var k = _v0.b;
			var v = _v0.c;
			var l = _v0.d;
			var r = _v0.e;
			return A5($elm$core$Dict$RBNode_elm_builtin, 1, k, v, l, r);
		} else {
			var x = _v0;
			return x;
		}
	});
var $elm$core$Dict$update = F3(
	function (targetKey, alter, dictionary) {
		var _v0 = alter(
			A2($elm$core$Dict$get, targetKey, dictionary));
		if (!_v0.$) {
			var value = _v0.a;
			return A3($elm$core$Dict$insert, targetKey, value, dictionary);
		} else {
			return A2($elm$core$Dict$remove, targetKey, dictionary);
		}
	});
var $elm$core$Basics$composeR = F3(
	function (f, g, x) {
		return g(
			f(x));
	});
var $elm$http$Http$expectStringResponse = F2(
	function (toMsg, toResult) {
		return A3(
			_Http_expect,
			'',
			$elm$core$Basics$identity,
			A2($elm$core$Basics$composeR, toResult, toMsg));
	});
var $w0rm$elm_obj_file$Obj$Decode$expectObj = F3(
	function (toMsg, units, decoder) {
		return A2(
			$elm$http$Http$expectStringResponse,
			toMsg,
			function (response) {
				switch (response.$) {
					case 0:
						var url = response.a;
						return $elm$core$Result$Err(
							$elm$http$Http$BadUrl(url));
					case 1:
						return $elm$core$Result$Err($elm$http$Http$Timeout);
					case 2:
						return $elm$core$Result$Err($elm$http$Http$NetworkError);
					case 3:
						var metadata = response.a;
						return $elm$core$Result$Err(
							$elm$http$Http$BadStatus(metadata.fF));
					default:
						var body = response.b;
						var _v1 = A3($w0rm$elm_obj_file$Obj$Decode$decodeString, units, decoder, body);
						if (!_v1.$) {
							var value = _v1.a;
							return $elm$core$Result$Ok(value);
						} else {
							var string = _v1.a;
							return $elm$core$Result$Err(
								$elm$http$Http$BadBody(string));
						}
				}
			});
	});
var $w0rm$elm_obj_file$Obj$Decode$Decoder = $elm$core$Basics$identity;
var $elm$core$Bitwise$and = _Bitwise_and;
var $elm$core$Bitwise$shiftRightZfBy = _Bitwise_shiftRightZfBy;
var $elm$core$Array$bitMask = 4294967295 >>> (32 - $elm$core$Array$shiftStep);
var $elm$core$Basics$ge = _Utils_ge;
var $elm$core$Elm$JsArray$unsafeGet = _JsArray_unsafeGet;
var $elm$core$Array$getHelp = F3(
	function (shift, index, tree) {
		getHelp:
		while (true) {
			var pos = $elm$core$Array$bitMask & (index >>> shift);
			var _v0 = A2($elm$core$Elm$JsArray$unsafeGet, pos, tree);
			if (!_v0.$) {
				var subTree = _v0.a;
				var $temp$shift = shift - $elm$core$Array$shiftStep,
					$temp$index = index,
					$temp$tree = subTree;
				shift = $temp$shift;
				index = $temp$index;
				tree = $temp$tree;
				continue getHelp;
			} else {
				var values = _v0.a;
				return A2($elm$core$Elm$JsArray$unsafeGet, $elm$core$Array$bitMask & index, values);
			}
		}
	});
var $elm$core$Bitwise$shiftLeftBy = _Bitwise_shiftLeftBy;
var $elm$core$Array$tailIndex = function (len) {
	return (len >>> 5) << 5;
};
var $elm$core$Array$get = F2(
	function (index, _v0) {
		var len = _v0.a;
		var startShift = _v0.b;
		var tree = _v0.c;
		var tail = _v0.d;
		return ((index < 0) || (_Utils_cmp(index, len) > -1)) ? $elm$core$Maybe$Nothing : ((_Utils_cmp(
			index,
			$elm$core$Array$tailIndex(len)) > -1) ? $elm$core$Maybe$Just(
			A2($elm$core$Elm$JsArray$unsafeGet, $elm$core$Array$bitMask & index, tail)) : $elm$core$Maybe$Just(
			A3($elm$core$Array$getHelp, startShift, index, tree)));
	});
var $w0rm$elm_obj_file$Obj$Decode$groupIndices = F3(
	function (p1, more, result) {
		groupIndices:
		while (true) {
			if (more.b) {
				var p2 = more.a;
				var rest = more.b;
				if (rest.b) {
					var p3 = rest.a;
					var $temp$p1 = p1,
						$temp$more = rest,
						$temp$result = A2(
						$elm$core$List$cons,
						_Utils_Tuple3(p1, p2, p3),
						result);
					p1 = $temp$p1;
					more = $temp$more;
					result = $temp$result;
					continue groupIndices;
				} else {
					return result;
				}
			} else {
				return result;
			}
		}
	});
var $w0rm$elm_obj_file$Obj$Decode$lookup1 = F2(
	function (idx1, list) {
		lookup1:
		while (true) {
			if (list.b && list.b.b) {
				var i1 = list.a;
				var _v1 = list.b;
				var result = _v1.a;
				var rest = _v1.b;
				if (!(idx1 - i1)) {
					return result;
				} else {
					var $temp$idx1 = idx1,
						$temp$list = rest;
					idx1 = $temp$idx1;
					list = $temp$list;
					continue lookup1;
				}
			} else {
				return -1;
			}
		}
	});
var $ianmackenzie$elm_geometry$Direction3d$placeIn = F2(
	function (_v0, _v1) {
		var frame = _v0;
		var d = _v1;
		var _v2 = frame.dt;
		var k = _v2;
		var _v3 = frame.ds;
		var j = _v3;
		var _v4 = frame.dr;
		var i = _v4;
		return {eK: ((i.eK * d.eK) + (j.eK * d.eL)) + (k.eK * d.cz), eL: ((i.eL * d.eK) + (j.eL * d.eL)) + (k.eL * d.cz), cz: ((i.cz * d.eK) + (j.cz * d.eL)) + (k.cz * d.cz)};
	});
var $ianmackenzie$elm_geometry$Point3d$placeIn = F2(
	function (_v0, _v1) {
		var frame = _v0;
		var p = _v1;
		var _v2 = frame.c1;
		var p0 = _v2;
		var _v3 = frame.dt;
		var k = _v3;
		var _v4 = frame.ds;
		var j = _v4;
		var _v5 = frame.dr;
		var i = _v5;
		return {eK: ((p0.eK + (p.eK * i.eK)) + (p.eL * j.eK)) + (p.cz * k.eK), eL: ((p0.eL + (p.eK * i.eL)) + (p.eL * j.eL)) + (p.cz * k.eL), cz: ((p0.cz + (p.eK * i.cz)) + (p.eL * j.cz)) + (p.cz * k.cz)};
	});
var $elm$core$Elm$JsArray$unsafeSet = _JsArray_unsafeSet;
var $elm$core$Array$setHelp = F4(
	function (shift, index, value, tree) {
		var pos = $elm$core$Array$bitMask & (index >>> shift);
		var _v0 = A2($elm$core$Elm$JsArray$unsafeGet, pos, tree);
		if (!_v0.$) {
			var subTree = _v0.a;
			var newSub = A4($elm$core$Array$setHelp, shift - $elm$core$Array$shiftStep, index, value, subTree);
			return A3(
				$elm$core$Elm$JsArray$unsafeSet,
				pos,
				$elm$core$Array$SubTree(newSub),
				tree);
		} else {
			var values = _v0.a;
			var newLeaf = A3($elm$core$Elm$JsArray$unsafeSet, $elm$core$Array$bitMask & index, value, values);
			return A3(
				$elm$core$Elm$JsArray$unsafeSet,
				pos,
				$elm$core$Array$Leaf(newLeaf),
				tree);
		}
	});
var $elm$core$Array$set = F3(
	function (index, value, array) {
		var len = array.a;
		var startShift = array.b;
		var tree = array.c;
		var tail = array.d;
		return ((index < 0) || (_Utils_cmp(index, len) > -1)) ? array : ((_Utils_cmp(
			index,
			$elm$core$Array$tailIndex(len)) > -1) ? A4(
			$elm$core$Array$Array_elm_builtin,
			len,
			startShift,
			tree,
			A3($elm$core$Elm$JsArray$unsafeSet, $elm$core$Array$bitMask & index, value, tail)) : A4(
			$elm$core$Array$Array_elm_builtin,
			len,
			startShift,
			A4($elm$core$Array$setHelp, startShift, index, value, tree),
			tail));
	});
var $ianmackenzie$elm_geometry$Geometry$Types$Vector3d = $elm$core$Basics$identity;
var $ianmackenzie$elm_geometry$Direction3d$toVector = function (_v0) {
	var directionComponents = _v0;
	return directionComponents;
};
var $elm$core$Maybe$withDefault = F2(
	function (_default, maybe) {
		if (!maybe.$) {
			var value = maybe.a;
			return value;
		} else {
			return _default;
		}
	});
var $w0rm$elm_obj_file$Obj$Decode$addFaces = function (vertexData) {
	return function (frame) {
		return function (lineno) {
			return function (elementVertices) {
				return function (elements) {
					return function (maxIndex) {
						return function (indexMap) {
							return function (vertices) {
								return function (indices) {
									return function (faceIndices) {
										addFaces:
										while (true) {
											if (elementVertices.b) {
												var p = elementVertices.a._;
												var n = elementVertices.a.aC;
												var remainingVertices = elementVertices.b;
												if (_Utils_cmp(n, -1) > 0) {
													var lookupArray = A2(
														$elm$core$Maybe$withDefault,
														_List_Nil,
														A2($elm$core$Array$get, p, indexMap));
													var idx = A2($w0rm$elm_obj_file$Obj$Decode$lookup1, n, lookupArray);
													if (_Utils_cmp(idx, -1) > 0) {
														var $temp$vertexData = vertexData,
															$temp$frame = frame,
															$temp$lineno = lineno,
															$temp$elementVertices = remainingVertices,
															$temp$elements = elements,
															$temp$maxIndex = maxIndex,
															$temp$indexMap = indexMap,
															$temp$vertices = vertices,
															$temp$indices = A2($elm$core$List$cons, idx, indices),
															$temp$faceIndices = faceIndices;
														vertexData = $temp$vertexData;
														frame = $temp$frame;
														lineno = $temp$lineno;
														elementVertices = $temp$elementVertices;
														elements = $temp$elements;
														maxIndex = $temp$maxIndex;
														indexMap = $temp$indexMap;
														vertices = $temp$vertices;
														indices = $temp$indices;
														faceIndices = $temp$faceIndices;
														continue addFaces;
													} else {
														var _v1 = A2($elm$core$Array$get, p, vertexData.af);
														if (!_v1.$) {
															var position = _v1.a;
															var _v2 = A2($elm$core$Array$get, n, vertexData.ci);
															if (!_v2.$) {
																var normal = _v2.a;
																var $temp$vertexData = vertexData,
																	$temp$frame = frame,
																	$temp$lineno = lineno,
																	$temp$elementVertices = remainingVertices,
																	$temp$elements = elements,
																	$temp$maxIndex = maxIndex + 1,
																	$temp$indexMap = A3(
																	$elm$core$Array$set,
																	p,
																	A2(
																		$elm$core$List$cons,
																		n,
																		A2($elm$core$List$cons, maxIndex + 1, lookupArray)),
																	indexMap),
																	$temp$vertices = A2(
																	$elm$core$List$cons,
																	{
																		s: $ianmackenzie$elm_geometry$Direction3d$toVector(
																			A2($ianmackenzie$elm_geometry$Direction3d$placeIn, frame, normal)),
																		cn: A2($ianmackenzie$elm_geometry$Point3d$placeIn, frame, position)
																	},
																	vertices),
																	$temp$indices = A2($elm$core$List$cons, maxIndex + 1, indices),
																	$temp$faceIndices = faceIndices;
																vertexData = $temp$vertexData;
																frame = $temp$frame;
																lineno = $temp$lineno;
																elementVertices = $temp$elementVertices;
																elements = $temp$elements;
																maxIndex = $temp$maxIndex;
																indexMap = $temp$indexMap;
																vertices = $temp$vertices;
																indices = $temp$indices;
																faceIndices = $temp$faceIndices;
																continue addFaces;
															} else {
																return A2($w0rm$elm_obj_file$Obj$Decode$formatError, lineno, 'Index out of range');
															}
														} else {
															return A2($w0rm$elm_obj_file$Obj$Decode$formatError, lineno, 'Index out of range');
														}
													}
												} else {
													return A2($w0rm$elm_obj_file$Obj$Decode$formatError, lineno, 'Vertex has no normal vector');
												}
											} else {
												var newFaceIndices = function () {
													if (indices.b) {
														var p1 = indices.a;
														var remainingIndices = indices.b;
														return A3($w0rm$elm_obj_file$Obj$Decode$groupIndices, p1, remainingIndices, faceIndices);
													} else {
														return faceIndices;
													}
												}();
												if (elements.b) {
													var _v4 = elements.a;
													var newLineno = _v4.a;
													var newElementVertices = _v4.b;
													var remainingElements = elements.b;
													var $temp$vertexData = vertexData,
														$temp$frame = frame,
														$temp$lineno = newLineno,
														$temp$elementVertices = newElementVertices,
														$temp$elements = remainingElements,
														$temp$maxIndex = maxIndex,
														$temp$indexMap = indexMap,
														$temp$vertices = vertices,
														$temp$indices = _List_Nil,
														$temp$faceIndices = newFaceIndices;
													vertexData = $temp$vertexData;
													frame = $temp$frame;
													lineno = $temp$lineno;
													elementVertices = $temp$elementVertices;
													elements = $temp$elements;
													maxIndex = $temp$maxIndex;
													indexMap = $temp$indexMap;
													vertices = $temp$vertices;
													indices = $temp$indices;
													faceIndices = $temp$faceIndices;
													continue addFaces;
												} else {
													return $elm$core$Result$Ok(
														_Utils_Tuple2(
															{R: indexMap, aV: maxIndex, at: vertices},
															newFaceIndices));
												}
											}
										}
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var $w0rm$elm_obj_file$Obj$Decode$indexState = function (indexMap) {
	return {R: indexMap, aV: -1, at: _List_Nil};
};
var $ianmackenzie$elm_triangular_mesh$TriangularMesh$TriangularMesh = $elm$core$Basics$identity;
var $elm$core$Basics$composeL = F3(
	function (g, f, x) {
		return g(
			f(x));
	});
var $elm$core$Basics$not = _Basics_not;
var $elm$core$List$all = F2(
	function (isOkay, list) {
		return !A2(
			$elm$core$List$any,
			A2($elm$core$Basics$composeL, $elm$core$Basics$not, isOkay),
			list);
	});
var $elm$core$List$filter = F2(
	function (isGood, list) {
		return A3(
			$elm$core$List$foldr,
			F2(
				function (x, xs) {
					return isGood(x) ? A2($elm$core$List$cons, x, xs) : xs;
				}),
			_List_Nil,
			list);
	});
var $ianmackenzie$elm_triangular_mesh$TriangularMesh$indexed = F2(
	function (vertices_, faceIndices_) {
		var numVertices = $elm$core$Array$length(vertices_);
		var validIndices = function (_v0) {
			var i = _v0.a;
			var j = _v0.b;
			var k = _v0.c;
			return ((i >= 0) && (_Utils_cmp(i, numVertices) < 0)) && (((j >= 0) && (_Utils_cmp(j, numVertices) < 0)) && ((k >= 0) && (_Utils_cmp(k, numVertices) < 0)));
		};
		return A2($elm$core$List$all, validIndices, faceIndices_) ? {I: faceIndices_, at: vertices_} : {
			I: A2($elm$core$List$filter, validIndices, faceIndices_),
			at: vertices_
		};
	});
var $w0rm$elm_obj_file$Obj$Decode$triangularMesh = F5(
	function (add, filters, groups, currentIndexedState, faceIndices) {
		triangularMesh:
		while (true) {
			var maxIndex = currentIndexedState.aV;
			var indexMap = currentIndexedState.R;
			var vertices = currentIndexedState.at;
			if (groups.b) {
				if (groups.a.b.b) {
					var _v1 = groups.a;
					var _v2 = _v1.b;
					var _v3 = _v2.a;
					var lineno = _v3.a;
					var elementVertices = _v3.b;
					var faceElements = _v2.b;
					var remainingElementGroups = groups.b;
					var _v4 = A8(add, lineno, elementVertices, faceElements, maxIndex, indexMap, vertices, _List_Nil, faceIndices);
					if (!_v4.$) {
						var _v5 = _v4.a;
						var newIndexedState = _v5.a;
						var newFaceIndices = _v5.b;
						var $temp$add = add,
							$temp$filters = filters,
							$temp$groups = remainingElementGroups,
							$temp$currentIndexedState = newIndexedState,
							$temp$faceIndices = newFaceIndices;
						add = $temp$add;
						filters = $temp$filters;
						groups = $temp$groups;
						currentIndexedState = $temp$currentIndexedState;
						faceIndices = $temp$faceIndices;
						continue triangularMesh;
					} else {
						var error = _v4.a;
						return $elm$core$Result$Err(error);
					}
				} else {
					var _v6 = groups.a;
					var remainingElementGroups = groups.b;
					var $temp$add = add,
						$temp$filters = filters,
						$temp$groups = remainingElementGroups,
						$temp$currentIndexedState = currentIndexedState,
						$temp$faceIndices = faceIndices;
					add = $temp$add;
					filters = $temp$filters;
					groups = $temp$groups;
					currentIndexedState = $temp$currentIndexedState;
					faceIndices = $temp$faceIndices;
					continue triangularMesh;
				}
			} else {
				if (faceIndices.b) {
					return $elm$core$Result$Ok(
						A2(
							$ianmackenzie$elm_triangular_mesh$TriangularMesh$indexed,
							$elm$core$Array$fromList(
								$elm$core$List$reverse(vertices)),
							faceIndices));
				} else {
					if (filters.b) {
						return $elm$core$Result$Err(
							'No faces found for ' + A2($elm$core$String$join, ', ', filters));
					} else {
						return $elm$core$Result$Err('No faces found');
					}
				}
			}
		}
	});
var $w0rm$elm_obj_file$Obj$Decode$facesIn = function (frame) {
	return F3(
		function (vertexData, filters, groups) {
			return A5(
				$w0rm$elm_obj_file$Obj$Decode$triangularMesh,
				A2($w0rm$elm_obj_file$Obj$Decode$addFaces, vertexData, frame),
				filters,
				groups,
				$w0rm$elm_obj_file$Obj$Decode$indexState(vertexData.R),
				_List_Nil);
		});
};
var $elm$http$Http$emptyBody = _Http_emptyBody;
var $elm$http$Http$Request = function (a) {
	return {$: 1, a: a};
};
var $elm$http$Http$State = F2(
	function (reqs, subs) {
		return {es: reqs, ez: subs};
	});
var $elm$http$Http$init = $elm$core$Task$succeed(
	A2($elm$http$Http$State, $elm$core$Dict$empty, _List_Nil));
var $elm$core$Process$kill = _Scheduler_kill;
var $elm$core$Process$spawn = _Scheduler_spawn;
var $elm$http$Http$updateReqs = F3(
	function (router, cmds, reqs) {
		updateReqs:
		while (true) {
			if (!cmds.b) {
				return $elm$core$Task$succeed(reqs);
			} else {
				var cmd = cmds.a;
				var otherCmds = cmds.b;
				if (!cmd.$) {
					var tracker = cmd.a;
					var _v2 = A2($elm$core$Dict$get, tracker, reqs);
					if (_v2.$ === 1) {
						var $temp$router = router,
							$temp$cmds = otherCmds,
							$temp$reqs = reqs;
						router = $temp$router;
						cmds = $temp$cmds;
						reqs = $temp$reqs;
						continue updateReqs;
					} else {
						var pid = _v2.a;
						return A2(
							$elm$core$Task$andThen,
							function (_v3) {
								return A3(
									$elm$http$Http$updateReqs,
									router,
									otherCmds,
									A2($elm$core$Dict$remove, tracker, reqs));
							},
							$elm$core$Process$kill(pid));
					}
				} else {
					var req = cmd.a;
					return A2(
						$elm$core$Task$andThen,
						function (pid) {
							var _v4 = req.eE;
							if (_v4.$ === 1) {
								return A3($elm$http$Http$updateReqs, router, otherCmds, reqs);
							} else {
								var tracker = _v4.a;
								return A3(
									$elm$http$Http$updateReqs,
									router,
									otherCmds,
									A3($elm$core$Dict$insert, tracker, pid, reqs));
							}
						},
						$elm$core$Process$spawn(
							A3(
								_Http_toTask,
								router,
								$elm$core$Platform$sendToApp(router),
								req)));
				}
			}
		}
	});
var $elm$http$Http$onEffects = F4(
	function (router, cmds, subs, state) {
		return A2(
			$elm$core$Task$andThen,
			function (reqs) {
				return $elm$core$Task$succeed(
					A2($elm$http$Http$State, reqs, subs));
			},
			A3($elm$http$Http$updateReqs, router, cmds, state.es));
	});
var $elm$core$List$maybeCons = F3(
	function (f, mx, xs) {
		var _v0 = f(mx);
		if (!_v0.$) {
			var x = _v0.a;
			return A2($elm$core$List$cons, x, xs);
		} else {
			return xs;
		}
	});
var $elm$core$List$filterMap = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$foldr,
			$elm$core$List$maybeCons(f),
			_List_Nil,
			xs);
	});
var $elm$http$Http$maybeSend = F4(
	function (router, desiredTracker, progress, _v0) {
		var actualTracker = _v0.a;
		var toMsg = _v0.b;
		return _Utils_eq(desiredTracker, actualTracker) ? $elm$core$Maybe$Just(
			A2(
				$elm$core$Platform$sendToApp,
				router,
				toMsg(progress))) : $elm$core$Maybe$Nothing;
	});
var $elm$http$Http$onSelfMsg = F3(
	function (router, _v0, state) {
		var tracker = _v0.a;
		var progress = _v0.b;
		return A2(
			$elm$core$Task$andThen,
			function (_v1) {
				return $elm$core$Task$succeed(state);
			},
			$elm$core$Task$sequence(
				A2(
					$elm$core$List$filterMap,
					A3($elm$http$Http$maybeSend, router, tracker, progress),
					state.ez)));
	});
var $elm$http$Http$Cancel = function (a) {
	return {$: 0, a: a};
};
var $elm$http$Http$cmdMap = F2(
	function (func, cmd) {
		if (!cmd.$) {
			var tracker = cmd.a;
			return $elm$http$Http$Cancel(tracker);
		} else {
			var r = cmd.a;
			return $elm$http$Http$Request(
				{
					eN: r.eN,
					eS: r.eS,
					e5: A2(_Http_mapExpect, func, r.e5),
					dF: r.dF,
					fn: r.fn,
					fK: r.fK,
					eE: r.eE,
					fN: r.fN
				});
		}
	});
var $elm$http$Http$MySub = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $elm$http$Http$subMap = F2(
	function (func, _v0) {
		var tracker = _v0.a;
		var toMsg = _v0.b;
		return A2(
			$elm$http$Http$MySub,
			tracker,
			A2($elm$core$Basics$composeR, toMsg, func));
	});
_Platform_effectManagers['Http'] = _Platform_createManager($elm$http$Http$init, $elm$http$Http$onEffects, $elm$http$Http$onSelfMsg, $elm$http$Http$cmdMap, $elm$http$Http$subMap);
var $elm$http$Http$command = _Platform_leaf('Http');
var $elm$http$Http$subscription = _Platform_leaf('Http');
var $elm$http$Http$request = function (r) {
	return $elm$http$Http$command(
		$elm$http$Http$Request(
			{eN: false, eS: r.eS, e5: r.e5, dF: r.dF, fn: r.fn, fK: r.fK, eE: r.eE, fN: r.fN}));
};
var $elm$http$Http$get = function (r) {
	return $elm$http$Http$request(
		{eS: $elm$http$Http$emptyBody, e5: r.e5, dF: _List_Nil, fn: 'GET', fK: $elm$core$Maybe$Nothing, eE: $elm$core$Maybe$Nothing, fN: r.fN});
};
var $ianmackenzie$elm_units$Quantity$Quantity = $elm$core$Basics$identity;
var $ianmackenzie$elm_units$Length$meters = function (numMeters) {
	return numMeters;
};
var $author$project$Main$init = function (_v0) {
	return _Utils_Tuple2(
		$author$project$Main$Loading,
		$elm$http$Http$get(
			{
				e5: A3(
					$w0rm$elm_obj_file$Obj$Decode$expectObj,
					$author$project$Main$GotMesh,
					$ianmackenzie$elm_units$Length$meters,
					$w0rm$elm_obj_file$Obj$Decode$facesIn($ianmackenzie$elm_geometry$Frame3d$atOrigin)),
				fN: 'assets/hive.obj'
			}));
};
var $author$project$Main$Tick = function (a) {
	return {$: 1, a: a};
};
var $elm$core$Platform$Sub$batch = _Platform_batch;
var $elm$core$Platform$Sub$none = $elm$core$Platform$Sub$batch(_List_Nil);
var $elm$browser$Browser$AnimationManager$Delta = function (a) {
	return {$: 1, a: a};
};
var $elm$browser$Browser$AnimationManager$State = F3(
	function (subs, request, oldTime) {
		return {c0: oldTime, et: request, ez: subs};
	});
var $elm$browser$Browser$AnimationManager$init = $elm$core$Task$succeed(
	A3($elm$browser$Browser$AnimationManager$State, _List_Nil, $elm$core$Maybe$Nothing, 0));
var $elm$browser$Browser$AnimationManager$now = _Browser_now(0);
var $elm$browser$Browser$AnimationManager$rAF = _Browser_rAF(0);
var $elm$browser$Browser$AnimationManager$onEffects = F3(
	function (router, subs, _v0) {
		var request = _v0.et;
		var oldTime = _v0.c0;
		var _v1 = _Utils_Tuple2(request, subs);
		if (_v1.a.$ === 1) {
			if (!_v1.b.b) {
				var _v2 = _v1.a;
				return $elm$browser$Browser$AnimationManager$init;
			} else {
				var _v4 = _v1.a;
				return A2(
					$elm$core$Task$andThen,
					function (pid) {
						return A2(
							$elm$core$Task$andThen,
							function (time) {
								return $elm$core$Task$succeed(
									A3(
										$elm$browser$Browser$AnimationManager$State,
										subs,
										$elm$core$Maybe$Just(pid),
										time));
							},
							$elm$browser$Browser$AnimationManager$now);
					},
					$elm$core$Process$spawn(
						A2(
							$elm$core$Task$andThen,
							$elm$core$Platform$sendToSelf(router),
							$elm$browser$Browser$AnimationManager$rAF)));
			}
		} else {
			if (!_v1.b.b) {
				var pid = _v1.a.a;
				return A2(
					$elm$core$Task$andThen,
					function (_v3) {
						return $elm$browser$Browser$AnimationManager$init;
					},
					$elm$core$Process$kill(pid));
			} else {
				return $elm$core$Task$succeed(
					A3($elm$browser$Browser$AnimationManager$State, subs, request, oldTime));
			}
		}
	});
var $elm$time$Time$Posix = $elm$core$Basics$identity;
var $elm$time$Time$millisToPosix = $elm$core$Basics$identity;
var $elm$browser$Browser$AnimationManager$onSelfMsg = F3(
	function (router, newTime, _v0) {
		var subs = _v0.ez;
		var oldTime = _v0.c0;
		var send = function (sub) {
			if (!sub.$) {
				var tagger = sub.a;
				return A2(
					$elm$core$Platform$sendToApp,
					router,
					tagger(
						$elm$time$Time$millisToPosix(newTime)));
			} else {
				var tagger = sub.a;
				return A2(
					$elm$core$Platform$sendToApp,
					router,
					tagger(newTime - oldTime));
			}
		};
		return A2(
			$elm$core$Task$andThen,
			function (pid) {
				return A2(
					$elm$core$Task$andThen,
					function (_v1) {
						return $elm$core$Task$succeed(
							A3(
								$elm$browser$Browser$AnimationManager$State,
								subs,
								$elm$core$Maybe$Just(pid),
								newTime));
					},
					$elm$core$Task$sequence(
						A2($elm$core$List$map, send, subs)));
			},
			$elm$core$Process$spawn(
				A2(
					$elm$core$Task$andThen,
					$elm$core$Platform$sendToSelf(router),
					$elm$browser$Browser$AnimationManager$rAF)));
	});
var $elm$browser$Browser$AnimationManager$Time = function (a) {
	return {$: 0, a: a};
};
var $elm$browser$Browser$AnimationManager$subMap = F2(
	function (func, sub) {
		if (!sub.$) {
			var tagger = sub.a;
			return $elm$browser$Browser$AnimationManager$Time(
				A2($elm$core$Basics$composeL, func, tagger));
		} else {
			var tagger = sub.a;
			return $elm$browser$Browser$AnimationManager$Delta(
				A2($elm$core$Basics$composeL, func, tagger));
		}
	});
_Platform_effectManagers['Browser.AnimationManager'] = _Platform_createManager($elm$browser$Browser$AnimationManager$init, $elm$browser$Browser$AnimationManager$onEffects, $elm$browser$Browser$AnimationManager$onSelfMsg, 0, $elm$browser$Browser$AnimationManager$subMap);
var $elm$browser$Browser$AnimationManager$subscription = _Platform_leaf('Browser.AnimationManager');
var $elm$browser$Browser$AnimationManager$onAnimationFrameDelta = function (tagger) {
	return $elm$browser$Browser$AnimationManager$subscription(
		$elm$browser$Browser$AnimationManager$Delta(tagger));
};
var $elm$browser$Browser$Events$onAnimationFrameDelta = $elm$browser$Browser$AnimationManager$onAnimationFrameDelta;
var $author$project$Main$subscriptions = function (model) {
	switch (model.$) {
		case 0:
			return $elm$core$Platform$Sub$none;
		case 2:
			return $elm$core$Platform$Sub$none;
		default:
			return $elm$browser$Browser$Events$onAnimationFrameDelta($author$project$Main$Tick);
	}
};
var $author$project$Main$FailedToLoad = function (a) {
	return {$: 2, a: a};
};
var $author$project$Main$Loaded = function (a) {
	return {$: 1, a: a};
};
var $author$project$Main$errorToString = function (err) {
	switch (err.$) {
		case 0:
			var url = err.a;
			return 'BadUrl: ' + url;
		case 1:
			return 'Timeout';
		case 2:
			return 'NetworkError';
		case 3:
			var status = err.a;
			return 'BadStatus: ' + $elm$core$String$fromInt(status);
		default:
			var body = err.a;
			return 'BadBody: ' + body;
	}
};
var $ianmackenzie$elm_3d_scene$Scene3d$Types$EmptyMesh = {$: 0};
var $ianmackenzie$elm_3d_scene$Scene3d$Types$KeepBackFaces = 0;
var $ianmackenzie$elm_3d_scene$Scene3d$Types$MeshWithNormals = F4(
	function (a, b, c, d) {
		return {$: 4, a: a, b: b, c: c, d: d};
	});
var $elm_explorations$linear_algebra$Math$Vector3$fromRecord = _MJS_v3fromRecord;
var $ianmackenzie$elm_geometry$Point3d$unwrap = function (_v0) {
	var pointCoordinates = _v0;
	return pointCoordinates;
};
var $ianmackenzie$elm_geometry_linear_algebra_interop$Geometry$Interop$LinearAlgebra$Point3d$toVec3 = function (point) {
	return $elm_explorations$linear_algebra$Math$Vector3$fromRecord(
		$ianmackenzie$elm_geometry$Point3d$unwrap(point));
};
var $ianmackenzie$elm_geometry$Vector3d$unwrap = function (_v0) {
	var givenComponents = _v0;
	return givenComponents;
};
var $ianmackenzie$elm_geometry_linear_algebra_interop$Geometry$Interop$LinearAlgebra$Vector3d$toVec3 = function (vector) {
	return $elm_explorations$linear_algebra$Math$Vector3$fromRecord(
		$ianmackenzie$elm_geometry$Vector3d$unwrap(vector));
};
var $ianmackenzie$elm_3d_scene$Scene3d$Mesh$collectSmooth = F2(
	function (_v0, accumulated) {
		var position = _v0.cn;
		var normal = _v0.s;
		return A2(
			$elm$core$List$cons,
			{
				s: $ianmackenzie$elm_geometry_linear_algebra_interop$Geometry$Interop$LinearAlgebra$Vector3d$toVec3(normal),
				cn: $ianmackenzie$elm_geometry_linear_algebra_interop$Geometry$Interop$LinearAlgebra$Point3d$toVec3(position)
			},
			accumulated);
	});
var $ianmackenzie$elm_triangular_mesh$TriangularMesh$faceIndices = function (_v0) {
	var mesh = _v0;
	return mesh.I;
};
var $elm_explorations$webgl$WebGL$MeshIndexed3 = F3(
	function (a, b, c) {
		return {$: 3, a: a, b: b, c: c};
	});
var $elm_explorations$webgl$WebGL$indexedTriangles = $elm_explorations$webgl$WebGL$MeshIndexed3(
	{dA: 1, dJ: 3, ef: 4});
var $elm_explorations$linear_algebra$Math$Vector3$getX = _MJS_v3getX;
var $elm_explorations$linear_algebra$Math$Vector3$getY = _MJS_v3getY;
var $elm_explorations$linear_algebra$Math$Vector3$getZ = _MJS_v3getZ;
var $ianmackenzie$elm_geometry$Geometry$Types$BoundingBox3d = $elm$core$Basics$identity;
var $ianmackenzie$elm_units$Quantity$lessThanOrEqualTo = F2(
	function (_v0, _v1) {
		var y = _v0;
		var x = _v1;
		return _Utils_cmp(x, y) < 1;
	});
var $ianmackenzie$elm_units$Quantity$max = F2(
	function (_v0, _v1) {
		var x = _v0;
		var y = _v1;
		return A2($elm$core$Basics$max, x, y);
	});
var $elm$core$Basics$min = F2(
	function (x, y) {
		return (_Utils_cmp(x, y) < 0) ? x : y;
	});
var $ianmackenzie$elm_units$Quantity$min = F2(
	function (_v0, _v1) {
		var x = _v0;
		var y = _v1;
		return A2($elm$core$Basics$min, x, y);
	});
var $ianmackenzie$elm_geometry$BoundingBox3d$fromExtrema = function (given) {
	return (A2($ianmackenzie$elm_units$Quantity$lessThanOrEqualTo, given.d8, given.eb) && (A2($ianmackenzie$elm_units$Quantity$lessThanOrEqualTo, given.d9, given.ec) && A2($ianmackenzie$elm_units$Quantity$lessThanOrEqualTo, given.ea, given.ed))) ? given : {
		d8: A2($ianmackenzie$elm_units$Quantity$max, given.eb, given.d8),
		d9: A2($ianmackenzie$elm_units$Quantity$max, given.ec, given.d9),
		ea: A2($ianmackenzie$elm_units$Quantity$max, given.ed, given.ea),
		eb: A2($ianmackenzie$elm_units$Quantity$min, given.eb, given.d8),
		ec: A2($ianmackenzie$elm_units$Quantity$min, given.ec, given.d9),
		ed: A2($ianmackenzie$elm_units$Quantity$min, given.ed, given.ea)
	};
};
var $ianmackenzie$elm_3d_scene$Scene3d$Mesh$vertexBoundsHelp = F7(
	function (minX, maxX, minY, maxY, minZ, maxZ, remaining) {
		vertexBoundsHelp:
		while (true) {
			if (remaining.b) {
				var next = remaining.a;
				var rest = remaining.b;
				var z = $elm_explorations$linear_algebra$Math$Vector3$getZ(next.cn);
				var y = $elm_explorations$linear_algebra$Math$Vector3$getY(next.cn);
				var x = $elm_explorations$linear_algebra$Math$Vector3$getX(next.cn);
				var $temp$minX = A2($elm$core$Basics$min, minX, x),
					$temp$maxX = A2($elm$core$Basics$max, maxX, x),
					$temp$minY = A2($elm$core$Basics$min, minY, y),
					$temp$maxY = A2($elm$core$Basics$max, maxY, y),
					$temp$minZ = A2($elm$core$Basics$min, minZ, z),
					$temp$maxZ = A2($elm$core$Basics$max, maxZ, z),
					$temp$remaining = rest;
				minX = $temp$minX;
				maxX = $temp$maxX;
				minY = $temp$minY;
				maxY = $temp$maxY;
				minZ = $temp$minZ;
				maxZ = $temp$maxZ;
				remaining = $temp$remaining;
				continue vertexBoundsHelp;
			} else {
				return $ianmackenzie$elm_geometry$BoundingBox3d$fromExtrema(
					{d8: maxX, d9: maxY, ea: maxZ, eb: minX, ec: minY, ed: minZ});
			}
		}
	});
var $ianmackenzie$elm_3d_scene$Scene3d$Mesh$vertexBounds = F2(
	function (first, rest) {
		var z = $elm_explorations$linear_algebra$Math$Vector3$getZ(first.cn);
		var y = $elm_explorations$linear_algebra$Math$Vector3$getY(first.cn);
		var x = $elm_explorations$linear_algebra$Math$Vector3$getX(first.cn);
		return A7($ianmackenzie$elm_3d_scene$Scene3d$Mesh$vertexBoundsHelp, x, x, y, y, z, z, rest);
	});
var $ianmackenzie$elm_triangular_mesh$TriangularMesh$vertices = function (_v0) {
	var mesh = _v0;
	return mesh.at;
};
var $ianmackenzie$elm_3d_scene$Scene3d$Mesh$indexedFaces = function (givenMesh) {
	var collectedVertices = A3(
		$elm$core$Array$foldr,
		$ianmackenzie$elm_3d_scene$Scene3d$Mesh$collectSmooth,
		_List_Nil,
		$ianmackenzie$elm_triangular_mesh$TriangularMesh$vertices(givenMesh));
	if (!collectedVertices.b) {
		return $ianmackenzie$elm_3d_scene$Scene3d$Types$EmptyMesh;
	} else {
		var first = collectedVertices.a;
		var rest = collectedVertices.b;
		var webGLMesh = A2(
			$elm_explorations$webgl$WebGL$indexedTriangles,
			collectedVertices,
			$ianmackenzie$elm_triangular_mesh$TriangularMesh$faceIndices(givenMesh));
		var bounds = A2($ianmackenzie$elm_3d_scene$Scene3d$Mesh$vertexBounds, first, rest);
		return A4($ianmackenzie$elm_3d_scene$Scene3d$Types$MeshWithNormals, bounds, givenMesh, webGLMesh, 0);
	}
};
var $author$project$Main$Hive = 0;
var $author$project$Main$HiveG = F2(
	function (a, b) {
		return {$: 2, a: a, b: b};
	});
var $avh4$elm_color$Color$RgbaSpace = F4(
	function (a, b, c, d) {
		return {$: 0, a: a, b: b, c: c, d: d};
	});
var $avh4$elm_color$Color$brown = A4($avh4$elm_color$Color$RgbaSpace, 193 / 255, 125 / 255, 17 / 255, 1.0);
var $author$project$Ecs$Internal$Config = $elm$core$Basics$identity;
var $author$project$Ecs$Internal$Entity = $elm$core$Basics$identity;
var $author$project$Ecs$Entity$create = F2(
	function (config, world) {
		var _v0 = config.fb(world);
		var _v1 = _v0;
		var nextId = _v1.a;
		var availableIds = _v1.b;
		if (!availableIds.b) {
			return _Utils_Tuple2(
				_Utils_Tuple2(nextId, 0),
				A2(
					config.fA,
					_Utils_Tuple2(nextId + 1, availableIds),
					world));
		} else {
			var _v3 = availableIds.a;
			var id = _v3.a;
			var version = _v3.b;
			var remainingIds = availableIds.b;
			return _Utils_Tuple2(
				_Utils_Tuple2(id, version + 1),
				A2(
					config.fA,
					_Utils_Tuple2(nextId, remainingIds),
					world));
		}
	});
var $author$project$Main$BeeAI = 0;
var $author$project$Main$BeeG = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $author$project$Main$aiSpec = {
	fb: function ($) {
		return $.au;
	},
	fA: F2(
		function (comp, world) {
			return _Utils_update(
				world,
				{au: comp});
		})
};
var $author$project$Main$animatedPositionSpec = {
	fb: function ($) {
		return $.av;
	},
	fA: F2(
		function (comp, world) {
			return _Utils_update(
				world,
				{av: comp});
		})
};
var $ianmackenzie$elm_geometry$Geometry$Types$Sphere3d = $elm$core$Basics$identity;
var $elm$core$Basics$abs = function (n) {
	return (n < 0) ? (-n) : n;
};
var $ianmackenzie$elm_units$Quantity$abs = function (_v0) {
	var value = _v0;
	return $elm$core$Basics$abs(value);
};
var $ianmackenzie$elm_geometry$Sphere3d$withRadius = F2(
	function (givenRadius, givenCenterPoint) {
		return {
			eV: givenCenterPoint,
			cq: $ianmackenzie$elm_units$Quantity$abs(givenRadius)
		};
	});
var $ianmackenzie$elm_geometry$Sphere3d$atPoint = F2(
	function (givenCenterPoint, givenRadius) {
		return A2($ianmackenzie$elm_geometry$Sphere3d$withRadius, givenRadius, givenCenterPoint);
	});
var $author$project$Main$ecsConfigSpec = {
	fb: function ($) {
		return $.b2;
	},
	fA: F2(
		function (config, world) {
			return _Utils_update(
				world,
				{b2: config});
		})
};
var $author$project$Main$graphicsSpec = {
	fb: function ($) {
		return $.aT;
	},
	fA: F2(
		function (comp, world) {
			return _Utils_update(
				world,
				{aT: comp});
		})
};
var $ianmackenzie$elm_geometry$Point3d$meters = F3(
	function (x, y, z) {
		return {eK: x, eL: y, cz: z};
	});
var $author$project$Main$pollenSpec = {
	fb: function ($) {
		return $.p;
	},
	fA: F2(
		function (comp, world) {
			return _Utils_update(
				world,
				{p: comp});
		})
};
var $author$project$Main$positionSpec = {
	fb: function ($) {
		return $.aa;
	},
	fA: F2(
		function (comp, world) {
			return _Utils_update(
				world,
				{aa: comp});
		})
};
var $elm$core$Tuple$second = function (_v0) {
	var y = _v0.b;
	return y;
};
var $author$project$Ecs$Internal$Component = $elm$core$Basics$identity;
var $author$project$Ecs$Component$set = F3(
	function (_v0, value, _v1) {
		var id = _v0;
		var components = _v1;
		return A3($elm$core$Dict$insert, id, value, components);
	});
var $author$project$Ecs$Entity$with = F2(
	function (_v0, _v1) {
		var spec = _v0.a;
		var component = _v0.b;
		var id = _v1.a;
		var world = _v1.b;
		var updatedComponents = A3(
			$author$project$Ecs$Component$set,
			id,
			component,
			spec.fb(world));
		var updatedWorld = A2(spec.fA, updatedComponents, world);
		return _Utils_Tuple2(id, updatedWorld);
	});
var $avh4$elm_color$Color$yellow = A4($avh4$elm_color$Color$RgbaSpace, 237 / 255, 212 / 255, 0 / 255, 1.0);
var $author$project$Main$createBee = F2(
	function (startPos, world) {
		return A2(
			$author$project$Ecs$Entity$with,
			_Utils_Tuple2(
				$author$project$Main$graphicsSpec,
				A2(
					$author$project$Main$BeeG,
					$avh4$elm_color$Color$yellow,
					A2(
						$ianmackenzie$elm_geometry$Sphere3d$atPoint,
						A3($ianmackenzie$elm_geometry$Point3d$meters, 0, 0, 1),
						$ianmackenzie$elm_units$Length$meters(0.25)))),
			A2(
				$author$project$Ecs$Entity$with,
				_Utils_Tuple2($author$project$Main$pollenSpec, 0),
				A2(
					$author$project$Ecs$Entity$with,
					_Utils_Tuple2($author$project$Main$aiSpec, 0),
					A2(
						$author$project$Ecs$Entity$with,
						_Utils_Tuple2(
							$author$project$Main$animatedPositionSpec,
							_Utils_Tuple2(
								startPos,
								_Utils_Tuple2(0, 0))),
						A2(
							$author$project$Ecs$Entity$with,
							_Utils_Tuple2($author$project$Main$positionSpec, startPos),
							A2($author$project$Ecs$Entity$create, $author$project$Main$ecsConfigSpec, world)))))).b;
	});
var $elm$core$Basics$pi = _Basics_pi;
var $ianmackenzie$elm_units$Angle$radians = function (numRadians) {
	return numRadians;
};
var $ianmackenzie$elm_units$Angle$degrees = function (numDegrees) {
	return $ianmackenzie$elm_units$Angle$radians($elm$core$Basics$pi * (numDegrees / 180));
};
var $Voronchuk$hexagons$Hexagons$Hex$FloatCubeHex = function (a) {
	return {$: 0, a: a};
};
var $Voronchuk$hexagons$Hexagons$Hex$IntCubeHex = function (a) {
	return {$: 1, a: a};
};
var $Voronchuk$hexagons$Hexagons$Hex$add = F2(
	function (a, b) {
		switch (a.$) {
			case 2:
				var _v1 = a.a;
				var a1 = _v1.a;
				var a2 = _v1.b;
				switch (b.$) {
					case 2:
						var _v3 = b.a;
						var b1 = _v3.a;
						var b2 = _v3.b;
						return $Voronchuk$hexagons$Hexagons$Hex$IntCubeHex(
							_Utils_Tuple3(a1 + b1, a2 + b2, ((-a1) - a2) + ((-b1) - b2)));
					case 1:
						var _v4 = b.a;
						var b1 = _v4.a;
						var b2 = _v4.b;
						var b3 = _v4.c;
						return $Voronchuk$hexagons$Hexagons$Hex$IntCubeHex(
							_Utils_Tuple3(a1 + b1, a2 + b2, ((-a1) - a2) + b3));
					default:
						var _v5 = b.a;
						var b1 = _v5.a;
						var b2 = _v5.b;
						var b3 = _v5.c;
						var a2_ = a2;
						var a1_ = a1;
						var a3_ = (-a1_) - a2_;
						return $Voronchuk$hexagons$Hexagons$Hex$FloatCubeHex(
							_Utils_Tuple3(a1_ + b1, a2_ + b2, a3_ + b3));
				}
			case 1:
				var _v6 = a.a;
				var a1 = _v6.a;
				var a2 = _v6.b;
				var a3 = _v6.c;
				switch (b.$) {
					case 2:
						var _v8 = b.a;
						var b1 = _v8.a;
						var b2 = _v8.b;
						return $Voronchuk$hexagons$Hexagons$Hex$IntCubeHex(
							_Utils_Tuple3(a1 + b1, a2 + b2, a3 + ((-b1) - b2)));
					case 1:
						var _v9 = b.a;
						var b1 = _v9.a;
						var b2 = _v9.b;
						var b3 = _v9.c;
						return $Voronchuk$hexagons$Hexagons$Hex$IntCubeHex(
							_Utils_Tuple3(a1 + b1, a2 + b2, a3 + b3));
					default:
						var _v10 = b.a;
						var b1 = _v10.a;
						var b2 = _v10.b;
						var b3 = _v10.c;
						var a3_ = a3;
						var a2_ = a2;
						var a1_ = a1;
						return $Voronchuk$hexagons$Hexagons$Hex$FloatCubeHex(
							_Utils_Tuple3(a1_ + b1, a2_ + b2, a3_ + b3));
				}
			default:
				var _v11 = a.a;
				var a1 = _v11.a;
				var a2 = _v11.b;
				var a3 = _v11.c;
				switch (b.$) {
					case 2:
						var _v13 = b.a;
						var b1 = _v13.a;
						var b2 = _v13.b;
						var b2_ = b2;
						var b1_ = b1;
						var b3_ = (-b1_) - b2_;
						return $Voronchuk$hexagons$Hexagons$Hex$FloatCubeHex(
							_Utils_Tuple3(a1 + b1_, a2 + b2_, a3 + b3_));
					case 1:
						var _v14 = b.a;
						var b1 = _v14.a;
						var b2 = _v14.b;
						var b3 = _v14.c;
						var b3_ = b3;
						var b2_ = b2;
						var b1_ = b1;
						return $Voronchuk$hexagons$Hexagons$Hex$FloatCubeHex(
							_Utils_Tuple3(a1 + b1_, a2 + b2_, a3 + b3_));
					default:
						var _v15 = b.a;
						var b1 = _v15.a;
						var b2 = _v15.b;
						var b3 = _v15.c;
						return $Voronchuk$hexagons$Hexagons$Hex$FloatCubeHex(
							_Utils_Tuple3(a1 + b1, a2 + b2, a3 + b3));
				}
		}
	});
var $elm$core$List$append = F2(
	function (xs, ys) {
		if (!ys.b) {
			return xs;
		} else {
			return A3($elm$core$List$foldr, $elm$core$List$cons, ys, xs);
		}
	});
var $elm$core$List$concat = function (lists) {
	return A3($elm$core$List$foldr, $elm$core$List$append, _List_Nil, lists);
};
var $Voronchuk$hexagons$Hexagons$Hex$intFactory = function (_v0) {
	var q_ = _v0.a;
	var r_ = _v0.b;
	return $Voronchuk$hexagons$Hexagons$Hex$IntCubeHex(
		_Utils_Tuple3(q_, r_, (-q_) - r_));
};
var $Voronchuk$hexagons$Hexagons$Hex$intQ = function (a) {
	switch (a.$) {
		case 2:
			var _v1 = a.a;
			var a1 = _v1.a;
			var a2 = _v1.b;
			return a1;
		case 1:
			var _v2 = a.a;
			var a1 = _v2.a;
			var a2 = _v2.b;
			var a3 = _v2.c;
			return a1;
		default:
			var _v3 = a.a;
			var a1 = _v3.a;
			var a2 = _v3.b;
			var a3 = _v3.c;
			return $elm$core$Basics$floor(a1);
	}
};
var $Voronchuk$hexagons$Hexagons$Hex$intR = function (a) {
	switch (a.$) {
		case 2:
			var _v1 = a.a;
			var a1 = _v1.a;
			var a2 = _v1.b;
			return a2;
		case 1:
			var _v2 = a.a;
			var a1 = _v2.a;
			var a2 = _v2.b;
			var a3 = _v2.c;
			return a2;
		default:
			var _v3 = a.a;
			var a1 = _v3.a;
			var a2 = _v3.b;
			var a3 = _v3.c;
			return $elm$core$Basics$floor(a2);
	}
};
var $Voronchuk$hexagons$Hexagons$Layout$drawCircle = F2(
	function (hex, radius) {
		var r = $Voronchuk$hexagons$Hexagons$Hex$intR(hex);
		var q = $Voronchuk$hexagons$Hexagons$Hex$intQ(hex);
		var calcHex = F2(
			function (q2, r2) {
				return A2(
					$Voronchuk$hexagons$Hexagons$Hex$add,
					hex,
					$Voronchuk$hexagons$Hexagons$Hex$intFactory(
						_Utils_Tuple2(q2, r2)));
			});
		var calcRow = function (q2) {
			var r1 = A2($elm$core$Basics$min, radius, (-q2) + radius);
			var q1 = A2($elm$core$Basics$max, -radius, (-q2) - radius);
			return A2(
				$elm$core$List$map,
				calcHex(q2),
				A2($elm$core$List$range, q1, r1));
		};
		return $elm$core$List$concat(
			A2(
				$elm$core$List$map,
				calcRow,
				A2($elm$core$List$range, -radius, radius)));
	});
var $author$project$Ecs$Component$empty = $elm$core$Dict$empty;
var $ianmackenzie$elm_geometry$Geometry$Types$Block3d = $elm$core$Basics$identity;
var $ianmackenzie$elm_units$Quantity$greaterThanOrEqualTo = F2(
	function (_v0, _v1) {
		var y = _v0;
		var x = _v1;
		return _Utils_cmp(x, y) > -1;
	});
var $ianmackenzie$elm_units$Quantity$midpoint = F2(
	function (_v0, _v1) {
		var x = _v0;
		var y = _v1;
		return x + (0.5 * (y - x));
	});
var $ianmackenzie$elm_units$Quantity$minus = F2(
	function (_v0, _v1) {
		var y = _v0;
		var x = _v1;
		return x - y;
	});
var $ianmackenzie$elm_geometry$Direction3d$negativeX = $ianmackenzie$elm_geometry$Direction3d$unsafe(
	{eK: -1, eL: 0, cz: 0});
var $ianmackenzie$elm_geometry$Direction3d$negativeY = $ianmackenzie$elm_geometry$Direction3d$unsafe(
	{eK: 0, eL: -1, cz: 0});
var $ianmackenzie$elm_geometry$Direction3d$negativeZ = $ianmackenzie$elm_geometry$Direction3d$unsafe(
	{eK: 0, eL: 0, cz: -1});
var $ianmackenzie$elm_geometry$Frame3d$unsafe = function (properties) {
	return properties;
};
var $ianmackenzie$elm_geometry$Point3d$xyz = F3(
	function (_v0, _v1, _v2) {
		var x = _v0;
		var y = _v1;
		var z = _v2;
		return {eK: x, eL: y, cz: z};
	});
var $ianmackenzie$elm_geometry$Block3d$axisAligned = F6(
	function (x1, y1, z1, x2, y2, z2) {
		var computedZDirection = A2($ianmackenzie$elm_units$Quantity$greaterThanOrEqualTo, z1, z2) ? $ianmackenzie$elm_geometry$Direction3d$positiveZ : $ianmackenzie$elm_geometry$Direction3d$negativeZ;
		var computedYDirection = A2($ianmackenzie$elm_units$Quantity$greaterThanOrEqualTo, y1, y2) ? $ianmackenzie$elm_geometry$Direction3d$positiveY : $ianmackenzie$elm_geometry$Direction3d$negativeY;
		var computedXDirection = A2($ianmackenzie$elm_units$Quantity$greaterThanOrEqualTo, x1, x2) ? $ianmackenzie$elm_geometry$Direction3d$positiveX : $ianmackenzie$elm_geometry$Direction3d$negativeX;
		var computedDimensions = _Utils_Tuple3(
			$ianmackenzie$elm_units$Quantity$abs(
				A2($ianmackenzie$elm_units$Quantity$minus, x1, x2)),
			$ianmackenzie$elm_units$Quantity$abs(
				A2($ianmackenzie$elm_units$Quantity$minus, y1, y2)),
			$ianmackenzie$elm_units$Quantity$abs(
				A2($ianmackenzie$elm_units$Quantity$minus, z1, z2)));
		var computedCenterPoint = A3(
			$ianmackenzie$elm_geometry$Point3d$xyz,
			A2($ianmackenzie$elm_units$Quantity$midpoint, x1, x2),
			A2($ianmackenzie$elm_units$Quantity$midpoint, y1, y2),
			A2($ianmackenzie$elm_units$Quantity$midpoint, z1, z2));
		var computedAxes = $ianmackenzie$elm_geometry$Frame3d$unsafe(
			{c1: computedCenterPoint, dr: computedXDirection, ds: computedYDirection, dt: computedZDirection});
		return {eQ: computedAxes, e_: computedDimensions};
	});
var $ianmackenzie$elm_geometry$Point3d$xCoordinate = function (_v0) {
	var p = _v0;
	return p.eK;
};
var $ianmackenzie$elm_geometry$Point3d$yCoordinate = function (_v0) {
	var p = _v0;
	return p.eL;
};
var $ianmackenzie$elm_geometry$Point3d$zCoordinate = function (_v0) {
	var p = _v0;
	return p.cz;
};
var $ianmackenzie$elm_geometry$Block3d$from = F2(
	function (p1, p2) {
		return A6(
			$ianmackenzie$elm_geometry$Block3d$axisAligned,
			$ianmackenzie$elm_geometry$Point3d$xCoordinate(p1),
			$ianmackenzie$elm_geometry$Point3d$yCoordinate(p1),
			$ianmackenzie$elm_geometry$Point3d$zCoordinate(p1),
			$ianmackenzie$elm_geometry$Point3d$xCoordinate(p2),
			$ianmackenzie$elm_geometry$Point3d$yCoordinate(p2),
			$ianmackenzie$elm_geometry$Point3d$zCoordinate(p2));
	});
var $elm$core$Dict$fromList = function (assocs) {
	return A3(
		$elm$core$List$foldl,
		F2(
			function (_v0, dict) {
				var key = _v0.a;
				var value = _v0.b;
				return A3($elm$core$Dict$insert, key, value, dict);
			}),
		$elm$core$Dict$empty,
		assocs);
};
var $Voronchuk$hexagons$Hexagons$Hex$intS = function (a) {
	switch (a.$) {
		case 2:
			var _v1 = a.a;
			var a1 = _v1.a;
			var a2 = _v1.b;
			return (-a1) - a2;
		case 1:
			var _v2 = a.a;
			var a1 = _v2.a;
			var a2 = _v2.b;
			var a3 = _v2.c;
			return a3;
		default:
			var _v3 = a.a;
			var a1 = _v3.a;
			var a2 = _v3.b;
			var a3 = _v3.c;
			return $elm$core$Basics$floor(a3);
	}
};
var $elm$core$Basics$round = _Basics_round;
var $Voronchuk$hexagons$Hexagons$Hex$toIntHex = function (hex) {
	switch (hex.$) {
		case 2:
			var _v1 = hex.a;
			var q1 = _v1.a;
			var r1 = _v1.b;
			return $Voronchuk$hexagons$Hexagons$Hex$IntCubeHex(
				_Utils_Tuple3(q1, r1, (-q1) - r1));
		case 1:
			var _v2 = hex.a;
			var q_ = _v2.a;
			var r_ = _v2.b;
			var s_ = _v2.c;
			return hex;
		default:
			var _v3 = hex.a;
			var q_ = _v3.a;
			var r_ = _v3.b;
			var s_ = _v3.c;
			var s1 = $elm$core$Basics$round(s_);
			var s_diff = $elm$core$Basics$abs(s1 - s_);
			var r1 = $elm$core$Basics$round(r_);
			var r_diff = $elm$core$Basics$abs(r1 - r_);
			var q1 = $elm$core$Basics$round(q_);
			var q_diff = $elm$core$Basics$abs(q1 - q_);
			return ((_Utils_cmp(q_diff, r_diff) > 0) && (_Utils_cmp(q_diff, r_diff) > 0)) ? $Voronchuk$hexagons$Hexagons$Hex$IntCubeHex(
				_Utils_Tuple3((-r1) - s1, r1, s1)) : ((_Utils_cmp(r_diff, s_diff) > 0) ? $Voronchuk$hexagons$Hexagons$Hex$IntCubeHex(
				_Utils_Tuple3(q1, (-q1) - s1, s1)) : $Voronchuk$hexagons$Hexagons$Hex$IntCubeHex(
				_Utils_Tuple3(q1, r1, (-q1) - r1)));
	}
};
var $Voronchuk$hexagons$Hexagons$Map$hashHex = function (hex) {
	var hex_ = $Voronchuk$hexagons$Hexagons$Hex$toIntHex(hex);
	var q = $Voronchuk$hexagons$Hexagons$Hex$intQ(hex_);
	var r = $Voronchuk$hexagons$Hexagons$Hex$intR(hex_);
	var s = $Voronchuk$hexagons$Hexagons$Hex$intS(hex_);
	return _Utils_Tuple3(q, r, s);
};
var $author$project$Main$hexOrigin = $Voronchuk$hexagons$Hexagons$Hex$IntCubeHex(
	_Utils_Tuple3(0, 0, 0));
var $author$project$Main$hiveSpec = {
	fb: function ($) {
		return $.bC;
	},
	fA: F2(
		function (comp, world) {
			return _Utils_update(
				world,
				{bC: comp});
		})
};
var $author$project$Ecs$Config$init = _Utils_Tuple2(0, _List_Nil);
var $elm$random$Random$Seed = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $elm$random$Random$next = function (_v0) {
	var state0 = _v0.a;
	var incr = _v0.b;
	return A2($elm$random$Random$Seed, ((state0 * 1664525) + incr) >>> 0, incr);
};
var $elm$random$Random$initialSeed = function (x) {
	var _v0 = $elm$random$Random$next(
		A2($elm$random$Random$Seed, 0, 1013904223));
	var state1 = _v0.a;
	var incr = _v0.b;
	var state2 = (state1 + x) >>> 0;
	return $elm$random$Random$next(
		A2($elm$random$Random$Seed, state2, incr));
};
var $ianmackenzie$elm_geometry$Frame3d$copy = function (_v0) {
	var properties = _v0;
	return properties;
};
var $ianmackenzie$elm_geometry$Block3d$axes = function (_v0) {
	var block = _v0;
	return $ianmackenzie$elm_geometry$Frame3d$copy(block.eQ);
};
var $ianmackenzie$elm_geometry$Block3d$dimensions = function (_v0) {
	var block = _v0;
	return block.e_;
};
var $ianmackenzie$elm_geometry$Frame3d$originPoint = function (_v0) {
	var properties = _v0;
	return properties.c1;
};
var $elm$core$Basics$cos = _Basics_cos;
var $elm$core$Basics$sin = _Basics_sin;
var $ianmackenzie$elm_geometry$Direction3d$rotateAround = F3(
	function (_v0, _v1, _v2) {
		var axis = _v0;
		var angle = _v1;
		var d = _v2;
		var halfAngle = 0.5 * angle;
		var qw = $elm$core$Basics$cos(halfAngle);
		var sinHalfAngle = $elm$core$Basics$sin(halfAngle);
		var _v3 = axis.e$;
		var a = _v3;
		var qx = a.eK * sinHalfAngle;
		var qwx = qw * qx;
		var qxx = qx * qx;
		var qy = a.eL * sinHalfAngle;
		var qwy = qw * qy;
		var qxy = qx * qy;
		var qyy = qy * qy;
		var a22 = 1 - (2 * (qxx + qyy));
		var qz = a.cz * sinHalfAngle;
		var qwz = qw * qz;
		var a01 = 2 * (qxy - qwz);
		var a10 = 2 * (qxy + qwz);
		var qxz = qx * qz;
		var a02 = 2 * (qxz + qwy);
		var a20 = 2 * (qxz - qwy);
		var qyz = qy * qz;
		var a12 = 2 * (qyz - qwx);
		var a21 = 2 * (qyz + qwx);
		var qzz = qz * qz;
		var a00 = 1 - (2 * (qyy + qzz));
		var a11 = 1 - (2 * (qxx + qzz));
		return {eK: ((a00 * d.eK) + (a01 * d.eL)) + (a02 * d.cz), eL: ((a10 * d.eK) + (a11 * d.eL)) + (a12 * d.cz), cz: ((a20 * d.eK) + (a21 * d.eL)) + (a22 * d.cz)};
	});
var $ianmackenzie$elm_geometry$Point3d$rotateAround = F3(
	function (_v0, _v1, _v2) {
		var axis = _v0;
		var angle = _v1;
		var p = _v2;
		var halfAngle = 0.5 * angle;
		var qw = $elm$core$Basics$cos(halfAngle);
		var sinHalfAngle = $elm$core$Basics$sin(halfAngle);
		var _v3 = axis.c1;
		var p0 = _v3;
		var deltaX = p.eK - p0.eK;
		var deltaY = p.eL - p0.eL;
		var deltaZ = p.cz - p0.cz;
		var _v4 = axis.e$;
		var d = _v4;
		var qx = d.eK * sinHalfAngle;
		var wx = qw * qx;
		var xx = qx * qx;
		var qy = d.eL * sinHalfAngle;
		var wy = qw * qy;
		var xy = qx * qy;
		var yy = qy * qy;
		var a22 = 1 - (2 * (xx + yy));
		var qz = d.cz * sinHalfAngle;
		var wz = qw * qz;
		var a01 = 2 * (xy - wz);
		var a10 = 2 * (xy + wz);
		var xz = qx * qz;
		var a02 = 2 * (xz + wy);
		var a20 = 2 * (xz - wy);
		var yz = qy * qz;
		var a12 = 2 * (yz - wx);
		var a21 = 2 * (yz + wx);
		var zz = qz * qz;
		var a00 = 1 - (2 * (yy + zz));
		var a11 = 1 - (2 * (xx + zz));
		return {eK: ((p0.eK + (a00 * deltaX)) + (a01 * deltaY)) + (a02 * deltaZ), eL: ((p0.eL + (a10 * deltaX)) + (a11 * deltaY)) + (a12 * deltaZ), cz: ((p0.cz + (a20 * deltaX)) + (a21 * deltaY)) + (a22 * deltaZ)};
	});
var $ianmackenzie$elm_geometry$Frame3d$xDirection = function (_v0) {
	var properties = _v0;
	return properties.dr;
};
var $ianmackenzie$elm_geometry$Frame3d$yDirection = function (_v0) {
	var properties = _v0;
	return properties.ds;
};
var $ianmackenzie$elm_geometry$Frame3d$zDirection = function (_v0) {
	var properties = _v0;
	return properties.dt;
};
var $ianmackenzie$elm_geometry$Frame3d$rotateAround = F3(
	function (axis, angle, frame) {
		return $ianmackenzie$elm_geometry$Frame3d$unsafe(
			{
				c1: A3(
					$ianmackenzie$elm_geometry$Point3d$rotateAround,
					axis,
					angle,
					$ianmackenzie$elm_geometry$Frame3d$originPoint(frame)),
				dr: A3(
					$ianmackenzie$elm_geometry$Direction3d$rotateAround,
					axis,
					angle,
					$ianmackenzie$elm_geometry$Frame3d$xDirection(frame)),
				ds: A3(
					$ianmackenzie$elm_geometry$Direction3d$rotateAround,
					axis,
					angle,
					$ianmackenzie$elm_geometry$Frame3d$yDirection(frame)),
				dt: A3(
					$ianmackenzie$elm_geometry$Direction3d$rotateAround,
					axis,
					angle,
					$ianmackenzie$elm_geometry$Frame3d$zDirection(frame))
			});
	});
var $ianmackenzie$elm_geometry$Block3d$rotateAround = F3(
	function (axis, angle, block) {
		return {
			eQ: A3(
				$ianmackenzie$elm_geometry$Frame3d$rotateAround,
				axis,
				angle,
				$ianmackenzie$elm_geometry$Block3d$axes(block)),
			e_: $ianmackenzie$elm_geometry$Block3d$dimensions(block)
		};
	});
var $ianmackenzie$elm_geometry$Geometry$Types$Axis3d = $elm$core$Basics$identity;
var $ianmackenzie$elm_geometry$Axis3d$through = F2(
	function (givenPoint, givenDirection) {
		return {e$: givenDirection, c1: givenPoint};
	});
var $ianmackenzie$elm_geometry$Axis3d$z = A2($ianmackenzie$elm_geometry$Axis3d$through, $ianmackenzie$elm_geometry$Point3d$origin, $ianmackenzie$elm_geometry$Direction3d$z);
var $author$project$Main$initWorld = function (hiveMesh) {
	var baseWorld = A2(
		$author$project$Main$createBee,
		$author$project$Main$hexOrigin,
		A2(
			$author$project$Main$createBee,
			$author$project$Main$hexOrigin,
			{
				au: $author$project$Ecs$Component$empty,
				av: $author$project$Ecs$Component$empty,
				bZ: $elm$core$Dict$fromList(
					A2(
						$elm$core$List$map,
						function (hex) {
							return _Utils_Tuple2(
								$Voronchuk$hexagons$Hexagons$Map$hashHex(hex),
								hex);
						},
						A2(
							$elm$core$List$cons,
							$author$project$Main$hexOrigin,
							_Utils_ap(
								A2($Voronchuk$hexagons$Hexagons$Layout$drawCircle, $author$project$Main$hexOrigin, 1),
								_Utils_ap(
									A2($Voronchuk$hexagons$Hexagons$Layout$drawCircle, $author$project$Main$hexOrigin, 2),
									A2($Voronchuk$hexagons$Hexagons$Layout$drawCircle, $author$project$Main$hexOrigin, 3)))))),
				b2: $author$project$Ecs$Config$init,
				a8: $author$project$Ecs$Component$empty,
				ac: $author$project$Ecs$Component$empty,
				aT: $author$project$Ecs$Component$empty,
				bB: $elm$core$Maybe$Nothing,
				bC: $author$project$Ecs$Component$empty,
				cK: hiveMesh,
				p: $author$project$Ecs$Component$empty,
				aa: $author$project$Ecs$Component$empty,
				aZ: $elm$random$Random$initialSeed(0),
				cv: 0
			}));
	var _v0 = A2(
		$author$project$Ecs$Entity$with,
		_Utils_Tuple2(
			$author$project$Main$graphicsSpec,
			A2(
				$author$project$Main$HiveG,
				$avh4$elm_color$Color$brown,
				A3(
					$ianmackenzie$elm_geometry$Block3d$rotateAround,
					$ianmackenzie$elm_geometry$Axis3d$z,
					$ianmackenzie$elm_units$Angle$degrees(45),
					A2(
						$ianmackenzie$elm_geometry$Block3d$from,
						A3($ianmackenzie$elm_geometry$Point3d$meters, 0.5, 0.5, 1.5),
						A3($ianmackenzie$elm_geometry$Point3d$meters, -0.5, -0.5, 0))))),
		A2(
			$author$project$Ecs$Entity$with,
			_Utils_Tuple2($author$project$Main$pollenSpec, 0),
			A2(
				$author$project$Ecs$Entity$with,
				_Utils_Tuple2($author$project$Main$hiveSpec, 0),
				A2(
					$author$project$Ecs$Entity$with,
					_Utils_Tuple2($author$project$Main$positionSpec, $author$project$Main$hexOrigin),
					A2($author$project$Ecs$Entity$create, $author$project$Main$ecsConfigSpec, baseWorld)))));
	var hive = _v0.a;
	var worldWithHive = _v0.b;
	return _Utils_update(
		worldWithHive,
		{
			bB: $elm$core$Maybe$Just(hive)
		});
};
var $ianmackenzie$elm_3d_scene$Scene3d$Types$Constant = function (a) {
	return {$: 0, a: a};
};
var $ianmackenzie$elm_3d_scene$Scene3d$Types$LambertianMaterial = F3(
	function (a, b, c) {
		return {$: 2, a: a, b: b, c: c};
	});
var $ianmackenzie$elm_3d_scene$Scene3d$Types$UseMeshUvs = 0;
var $ianmackenzie$elm_3d_scene$Scene3d$Types$VerticalNormal = 0;
var $ianmackenzie$elm_3d_scene$Scene3d$Types$LinearRgb = $elm$core$Basics$identity;
var $elm$core$Basics$clamp = F3(
	function (low, high, number) {
		return (_Utils_cmp(number, low) < 0) ? low : ((_Utils_cmp(number, high) > 0) ? high : number);
	});
var $elm$core$Basics$pow = _Basics_pow;
var $ianmackenzie$elm_3d_scene$Scene3d$ColorConversions$inverseGamma = function (u) {
	return A3(
		$elm$core$Basics$clamp,
		0,
		1,
		(u <= 0.04045) ? (u / 12.92) : A2($elm$core$Basics$pow, (u + 0.055) / 1.055, 2.4));
};
var $avh4$elm_color$Color$toRgba = function (_v0) {
	var r = _v0.a;
	var g = _v0.b;
	var b = _v0.c;
	var a = _v0.d;
	return {a1: a, cE: b, cJ: g, dd: r};
};
var $elm_explorations$linear_algebra$Math$Vector3$vec3 = _MJS_v3;
var $ianmackenzie$elm_3d_scene$Scene3d$ColorConversions$colorToLinearRgb = function (color) {
	var _v0 = $avh4$elm_color$Color$toRgba(color);
	var red = _v0.dd;
	var green = _v0.cJ;
	var blue = _v0.cE;
	return A3(
		$elm_explorations$linear_algebra$Math$Vector3$vec3,
		$ianmackenzie$elm_3d_scene$Scene3d$ColorConversions$inverseGamma(red),
		$ianmackenzie$elm_3d_scene$Scene3d$ColorConversions$inverseGamma(green),
		$ianmackenzie$elm_3d_scene$Scene3d$ColorConversions$inverseGamma(blue));
};
var $ianmackenzie$elm_3d_scene$Scene3d$Material$matte = function (materialColor) {
	return A3(
		$ianmackenzie$elm_3d_scene$Scene3d$Types$LambertianMaterial,
		0,
		$ianmackenzie$elm_3d_scene$Scene3d$Types$Constant(
			$ianmackenzie$elm_3d_scene$Scene3d$ColorConversions$colorToLinearRgb(materialColor)),
		$ianmackenzie$elm_3d_scene$Scene3d$Types$Constant(0));
};
var $ianmackenzie$elm_3d_scene$Scene3d$Types$Entity = $elm$core$Basics$identity;
var $ianmackenzie$elm_3d_scene$Scene3d$Types$Group = function (a) {
	return {$: 4, a: a};
};
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$collectNodes = F2(
	function (drawables, accumulated) {
		collectNodes:
		while (true) {
			if (!drawables.b) {
				return accumulated;
			} else {
				var node = drawables.a;
				var rest = drawables.b;
				var $temp$drawables = rest,
					$temp$accumulated = A2($elm$core$List$cons, node, accumulated);
				drawables = $temp$drawables;
				accumulated = $temp$accumulated;
				continue collectNodes;
			}
		}
	});
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$group = function (drawables) {
	return $ianmackenzie$elm_3d_scene$Scene3d$Types$Group(
		A2($ianmackenzie$elm_3d_scene$Scene3d$Entity$collectNodes, drawables, _List_Nil));
};
var $ianmackenzie$elm_3d_scene$Scene3d$group = function (entities) {
	return $ianmackenzie$elm_3d_scene$Scene3d$Entity$group(entities);
};
var $ianmackenzie$elm_3d_scene$Scene3d$Types$MeshNode = F2(
	function (a, b) {
		return {$: 1, a: a, b: b};
	});
var $ianmackenzie$elm_3d_scene$Scene3d$UnoptimizedShaders$colorTextureFragment = {
	src: '\n        precision mediump float;\n        \n        uniform mediump sampler2D colorTexture;\n        \n        varying mediump vec2 interpolatedUv;\n        \n        void main () {\n            gl_FragColor = texture2D(colorTexture, interpolatedUv);\n        }\n    ',
	attributes: {},
	uniforms: {colorTexture: 'b1'}
};
var $elm_explorations$webgl$WebGL$Internal$enableOption = F2(
	function (ctx, option) {
		switch (option.$) {
			case 0:
				return A2(_WebGL_enableAlpha, ctx, option);
			case 1:
				return A2(_WebGL_enableDepth, ctx, option);
			case 2:
				return A2(_WebGL_enableStencil, ctx, option);
			case 3:
				return A2(_WebGL_enableAntialias, ctx, option);
			case 4:
				return A2(_WebGL_enableClearColor, ctx, option);
			default:
				return A2(_WebGL_enablePreserveDrawingBuffer, ctx, option);
		}
	});
var $elm_explorations$webgl$WebGL$Internal$enableSetting = F2(
	function (cache, setting) {
		switch (setting.$) {
			case 0:
				return A2(_WebGL_enableBlend, cache, setting);
			case 1:
				return A2(_WebGL_enableDepthTest, cache, setting);
			case 2:
				return A2(_WebGL_enableStencilTest, cache, setting);
			case 3:
				return A2(_WebGL_enableScissor, cache, setting);
			case 4:
				return A2(_WebGL_enableColorMask, cache, setting);
			case 5:
				return A2(_WebGL_enableCullFace, cache, setting);
			case 6:
				return A2(_WebGL_enablePolygonOffset, cache, setting);
			case 7:
				return A2(_WebGL_enableSampleCoverage, cache, setting);
			default:
				return _WebGL_enableSampleAlphaToCoverage(cache);
		}
	});
var $elm_explorations$webgl$WebGL$entityWith = _WebGL_entity;
var $elm_explorations$webgl$WebGL$Settings$FaceMode = $elm$core$Basics$identity;
var $elm_explorations$webgl$WebGL$Settings$back = 1029;
var $elm_explorations$webgl$WebGL$Internal$CullFace = function (a) {
	return {$: 5, a: a};
};
var $elm_explorations$webgl$WebGL$Settings$cullFace = function (_v0) {
	var faceMode = _v0;
	return $elm_explorations$webgl$WebGL$Internal$CullFace(faceMode);
};
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$cullBackFaceSetting = $elm_explorations$webgl$WebGL$Settings$cullFace($elm_explorations$webgl$WebGL$Settings$back);
var $elm_explorations$webgl$WebGL$Settings$front = 1028;
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$cullFrontFaceSetting = $elm_explorations$webgl$WebGL$Settings$cullFace($elm_explorations$webgl$WebGL$Settings$front);
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$meshSettings = F3(
	function (isRightHanded, backFaceSetting, settings) {
		if (backFaceSetting === 1) {
			return isRightHanded ? A2($elm$core$List$cons, $ianmackenzie$elm_3d_scene$Scene3d$Entity$cullBackFaceSetting, settings) : A2($elm$core$List$cons, $ianmackenzie$elm_3d_scene$Scene3d$Entity$cullFrontFaceSetting, settings);
		} else {
			return settings;
		}
	});
var $ianmackenzie$elm_3d_scene$Scene3d$UnoptimizedShaders$unlitVertex = {
	src: '\n        precision highp float;\n        \n        attribute highp vec3 position;\n        attribute mediump vec2 uv;\n        \n        uniform highp vec4 modelScale;\n        uniform highp mat4 modelMatrix;\n        uniform highp mat4 viewMatrix;\n        uniform highp mat4 projectionMatrix;\n        uniform highp mat4 sceneProperties;\n        \n        varying mediump vec2 interpolatedUv;\n        \n        vec4 getWorldPosition(vec3 modelPosition, vec4 modelScale, mat4 modelMatrix) {\n            vec4 scaledPosition = vec4(modelScale.xyz * modelPosition, 1.0);\n            return modelMatrix * scaledPosition;\n        }\n        \n        void main() {\n            vec4 worldPosition = getWorldPosition(position, modelScale, modelMatrix);\n            gl_Position = projectionMatrix * (viewMatrix * worldPosition);\n            interpolatedUv = uv;\n        }\n    ',
	attributes: {position: 'cn', uv: 'P'},
	uniforms: {modelMatrix: 'd', modelScale: 'e', projectionMatrix: 'f', sceneProperties: 'g', viewMatrix: 'h'}
};
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$colorTextureMesh = F4(
	function (data, bounds, webGLMesh, backFaceSetting) {
		return A2(
			$ianmackenzie$elm_3d_scene$Scene3d$Types$MeshNode,
			bounds,
			F8(
				function (sceneProperties, modelScale, modelMatrix, isRightHanded, viewMatrix, projectionMatrix, lights, settings) {
					return A5(
						$elm_explorations$webgl$WebGL$entityWith,
						A3($ianmackenzie$elm_3d_scene$Scene3d$Entity$meshSettings, isRightHanded, backFaceSetting, settings),
						$ianmackenzie$elm_3d_scene$Scene3d$UnoptimizedShaders$unlitVertex,
						$ianmackenzie$elm_3d_scene$Scene3d$UnoptimizedShaders$colorTextureFragment,
						webGLMesh,
						{b1: data, d: modelMatrix, e: modelScale, f: projectionMatrix, g: sceneProperties, h: viewMatrix});
				}));
	});
var $ianmackenzie$elm_3d_scene$Scene3d$UnoptimizedShaders$constantFragment = {
	src: '\n        precision lowp float;\n        \n        uniform lowp vec3 constantColor;\n        \n        void main () {\n            gl_FragColor = vec4(constantColor, 1.0);\n        }\n    ',
	attributes: {},
	uniforms: {constantColor: 'aN'}
};
var $ianmackenzie$elm_3d_scene$Scene3d$UnoptimizedShaders$plainVertex = {
	src: '\n        precision highp float;\n        \n        attribute highp vec3 position;\n        \n        uniform highp vec4 modelScale;\n        uniform highp mat4 modelMatrix;\n        uniform highp mat4 viewMatrix;\n        uniform highp mat4 projectionMatrix;\n        uniform highp mat4 sceneProperties;\n        \n        vec4 getWorldPosition(vec3 modelPosition, vec4 modelScale, mat4 modelMatrix) {\n            vec4 scaledPosition = vec4(modelScale.xyz * modelPosition, 1.0);\n            return modelMatrix * scaledPosition;\n        }\n        \n        void main () {\n            vec4 worldPosition = getWorldPosition(position, modelScale, modelMatrix);\n            gl_Position = projectionMatrix * (viewMatrix * worldPosition);\n        }\n    ',
	attributes: {position: 'cn'},
	uniforms: {modelMatrix: 'd', modelScale: 'e', projectionMatrix: 'f', sceneProperties: 'g', viewMatrix: 'h'}
};
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$constantMesh = F4(
	function (color, bounds, webGLMesh, backFaceSetting) {
		return A2(
			$ianmackenzie$elm_3d_scene$Scene3d$Types$MeshNode,
			bounds,
			F8(
				function (sceneProperties, modelScale, modelMatrix, isRightHanded, viewMatrix, projectionMatrix, lights, settings) {
					return A5(
						$elm_explorations$webgl$WebGL$entityWith,
						A3($ianmackenzie$elm_3d_scene$Scene3d$Entity$meshSettings, isRightHanded, backFaceSetting, settings),
						$ianmackenzie$elm_3d_scene$Scene3d$UnoptimizedShaders$plainVertex,
						$ianmackenzie$elm_3d_scene$Scene3d$UnoptimizedShaders$constantFragment,
						webGLMesh,
						{aN: color, d: modelMatrix, e: modelScale, f: projectionMatrix, g: sceneProperties, h: viewMatrix});
				}));
	});
var $ianmackenzie$elm_3d_scene$Scene3d$Types$PointNode = F2(
	function (a, b) {
		return {$: 3, a: a, b: b};
	});
var $ianmackenzie$elm_3d_scene$Scene3d$UnoptimizedShaders$constantPointFragment = {
	src: '\n        precision lowp float;\n        \n        uniform lowp vec3 constantColor;\n        uniform lowp float pointRadius;\n        uniform highp mat4 sceneProperties;\n        \n        float pointAlpha(float pointRadius, vec2 pointCoord) {\n            float pointSize = 2.0 * pointRadius;\n            float x = (pointSize + 2.0) * (pointCoord.s - 0.5);\n            float y = (pointSize + 2.0) * (pointCoord.t - 0.5);\n            float r = sqrt(x * x + y * y);\n            float innerRadius = pointRadius;\n            float outerRadius = pointRadius + 1.0;\n            if (r > outerRadius) {\n                return 0.0;\n            } else if (r > innerRadius) {\n                return outerRadius - r;\n            } else {\n                return 1.0;\n            }\n        }\n        \n        void main () {\n            float supersampling = sceneProperties[3][0];\n            float alpha = pointAlpha(pointRadius * supersampling, gl_PointCoord);\n            gl_FragColor = vec4(constantColor, alpha);\n        }\n    ',
	attributes: {},
	uniforms: {constantColor: 'aN', pointRadius: 'cm', sceneProperties: 'g'}
};
var $ianmackenzie$elm_3d_scene$Scene3d$UnoptimizedShaders$pointVertex = {
	src: '\n        precision highp float;\n        \n        attribute highp vec3 position;\n        \n        uniform highp vec4 modelScale;\n        uniform highp mat4 modelMatrix;\n        uniform lowp float pointRadius;\n        uniform highp mat4 viewMatrix;\n        uniform highp mat4 projectionMatrix;\n        uniform highp mat4 sceneProperties;\n        \n        vec4 getWorldPosition(vec3 modelPosition, vec4 modelScale, mat4 modelMatrix) {\n            vec4 scaledPosition = vec4(modelScale.xyz * modelPosition, 1.0);\n            return modelMatrix * scaledPosition;\n        }\n        \n        void main () {\n            vec4 worldPosition = getWorldPosition(position, modelScale, modelMatrix);\n            gl_Position = projectionMatrix * (viewMatrix * worldPosition);\n            float supersampling = sceneProperties[3][0];\n            gl_PointSize = 2.0 * pointRadius * supersampling + 2.0;\n        }\n    ',
	attributes: {position: 'cn'},
	uniforms: {modelMatrix: 'd', modelScale: 'e', pointRadius: 'cm', projectionMatrix: 'f', sceneProperties: 'g', viewMatrix: 'h'}
};
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$constantPointMesh = F4(
	function (color, radius, bounds, webGLMesh) {
		return A2(
			$ianmackenzie$elm_3d_scene$Scene3d$Types$PointNode,
			bounds,
			F8(
				function (sceneProperties, modelScale, modelMatrix, isRightHanded, viewMatrix, projectionMatrix, lights, settings) {
					return A5(
						$elm_explorations$webgl$WebGL$entityWith,
						settings,
						$ianmackenzie$elm_3d_scene$Scene3d$UnoptimizedShaders$pointVertex,
						$ianmackenzie$elm_3d_scene$Scene3d$UnoptimizedShaders$constantPointFragment,
						webGLMesh,
						{aN: color, d: modelMatrix, e: modelScale, cm: radius, f: projectionMatrix, g: sceneProperties, h: viewMatrix});
				}));
	});
var $ianmackenzie$elm_3d_scene$Scene3d$UnoptimizedShaders$emissiveFragment = {
	src: '\n        precision mediump float;\n        \n        uniform mediump vec3 emissiveColor;\n        uniform highp mat4 sceneProperties;\n        \n        float gammaCorrect(float u) {\n            if (u <= 0.0031308) {\n                return 12.92 * u;\n            } else {\n                return 1.055 * pow(u, 1.0 / 2.4) - 0.055;\n            }\n        }\n        \n        vec3 gammaCorrectedColor(vec3 color) {\n            float red = gammaCorrect(color.r);\n            float green = gammaCorrect(color.g);\n            float blue = gammaCorrect(color.b);\n            return vec3(red, green, blue);\n        }\n        \n        vec3 reinhardLuminanceToneMap(vec3 color) {\n            float luminance = 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;\n            float scale = 1.0 / (1.0 + luminance);\n            return gammaCorrectedColor(color * scale);\n        }\n        \n        vec3 reinhardPerChannelToneMap(vec3 color) {\n            return gammaCorrectedColor(color / (color + 1.0));\n        }\n        \n        float extendedReinhardToneMap(float x, float xMax) {\n            return x * (1.0 + (x / (xMax * xMax))) / (1.0 + x);\n        }\n        \n        vec3 extendedReinhardLuminanceToneMap(vec3 color, float overexposureLimit) {\n            float luminance = 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;\n            float scaledLuminance = extendedReinhardToneMap(luminance, overexposureLimit);\n            float scale = scaledLuminance / luminance;\n            return gammaCorrectedColor(color * scale);\n        }\n        \n        vec3 extendedReinhardPerChannelToneMap(vec3 color, float overexposureLimit) {\n            float red = extendedReinhardToneMap(color.r, overexposureLimit);\n            float green = extendedReinhardToneMap(color.g, overexposureLimit);\n            float blue = extendedReinhardToneMap(color.b, overexposureLimit);\n            return gammaCorrectedColor(vec3(red, green, blue));\n        }\n        \n        vec3 hableFilmicHelper(vec3 color) {\n            float a = 0.15;\n            float b = 0.5;\n            float c = 0.1;\n            float d = 0.2;\n            float e = 0.02;\n            float f = 0.3;\n            return (color * (a * color + c * b) + d * e) / (color * (a * color + b) + d * f) - e / f;\n        }\n        \n        vec3 hableFilmicToneMap(vec3 color) {\n            float exposureBias = 2.0;\n            vec3 unscaled = hableFilmicHelper(exposureBias * color);\n            vec3 scale = 1.0 / hableFilmicHelper(vec3(11.2));\n            return gammaCorrectedColor(scale * unscaled);\n        }\n        \n        vec3 toneMap(vec3 color, float toneMapType, float toneMapParam) {\n            if (toneMapType == 0.0) {\n                return gammaCorrectedColor(color);\n            } else if (toneMapType == 1.0) {\n                return reinhardLuminanceToneMap(color);\n            } else if (toneMapType == 2.0) {\n                return reinhardPerChannelToneMap(color);\n            } else if (toneMapType == 3.0) {\n                return extendedReinhardLuminanceToneMap(color, toneMapParam);\n            } else if (toneMapType == 4.0) {\n                return extendedReinhardPerChannelToneMap(color, toneMapParam);\n            } else if (toneMapType == 5.0) {\n                return hableFilmicToneMap(color);\n            } else {\n                return vec3(0.0, 0.0, 0.0);\n            }\n        }\n        \n        vec4 toSrgb(vec3 linearColor, mat4 sceneProperties) {\n            vec3 referenceWhite = sceneProperties[2].rgb;\n            float unitR = linearColor.r / referenceWhite.r;\n            float unitG = linearColor.g / referenceWhite.g;\n            float unitB = linearColor.b / referenceWhite.b;\n            float toneMapType = sceneProperties[3][2];\n            float toneMapParam = sceneProperties[3][3];\n            vec3 toneMapped = toneMap(vec3(unitR, unitG, unitB), toneMapType, toneMapParam);\n            return vec4(toneMapped, 1.0);\n        }\n        \n        void main () {\n            gl_FragColor = toSrgb(emissiveColor, sceneProperties);\n        }\n    ',
	attributes: {},
	uniforms: {emissiveColor: 'a5', sceneProperties: 'g'}
};
var $ianmackenzie$elm_units$Luminance$inNits = function (_v0) {
	var numNits = _v0;
	return numNits;
};
var $elm_explorations$linear_algebra$Math$Vector3$scale = _MJS_v3scale;
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$emissiveMesh = F5(
	function (color, backlight, bounds, webGLMesh, backFaceSetting) {
		return A2(
			$ianmackenzie$elm_3d_scene$Scene3d$Types$MeshNode,
			bounds,
			F8(
				function (sceneProperties, modelScale, modelMatrix, isRightHanded, viewMatrix, projectionMatrix, lights, settings) {
					return A5(
						$elm_explorations$webgl$WebGL$entityWith,
						A3($ianmackenzie$elm_3d_scene$Scene3d$Entity$meshSettings, isRightHanded, backFaceSetting, settings),
						$ianmackenzie$elm_3d_scene$Scene3d$UnoptimizedShaders$plainVertex,
						$ianmackenzie$elm_3d_scene$Scene3d$UnoptimizedShaders$emissiveFragment,
						webGLMesh,
						{
							a5: A2(
								$elm_explorations$linear_algebra$Math$Vector3$scale,
								$ianmackenzie$elm_units$Luminance$inNits(backlight),
								color),
							d: modelMatrix,
							e: modelScale,
							f: projectionMatrix,
							g: sceneProperties,
							h: viewMatrix
						});
				}));
	});
var $ianmackenzie$elm_3d_scene$Scene3d$UnoptimizedShaders$emissivePointFragment = {
	src: '\n        precision mediump float;\n        \n        uniform mediump vec3 emissiveColor;\n        uniform lowp float pointRadius;\n        uniform highp mat4 sceneProperties;\n        \n        float gammaCorrect(float u) {\n            if (u <= 0.0031308) {\n                return 12.92 * u;\n            } else {\n                return 1.055 * pow(u, 1.0 / 2.4) - 0.055;\n            }\n        }\n        \n        vec3 gammaCorrectedColor(vec3 color) {\n            float red = gammaCorrect(color.r);\n            float green = gammaCorrect(color.g);\n            float blue = gammaCorrect(color.b);\n            return vec3(red, green, blue);\n        }\n        \n        vec3 reinhardLuminanceToneMap(vec3 color) {\n            float luminance = 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;\n            float scale = 1.0 / (1.0 + luminance);\n            return gammaCorrectedColor(color * scale);\n        }\n        \n        vec3 reinhardPerChannelToneMap(vec3 color) {\n            return gammaCorrectedColor(color / (color + 1.0));\n        }\n        \n        float extendedReinhardToneMap(float x, float xMax) {\n            return x * (1.0 + (x / (xMax * xMax))) / (1.0 + x);\n        }\n        \n        vec3 extendedReinhardLuminanceToneMap(vec3 color, float overexposureLimit) {\n            float luminance = 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;\n            float scaledLuminance = extendedReinhardToneMap(luminance, overexposureLimit);\n            float scale = scaledLuminance / luminance;\n            return gammaCorrectedColor(color * scale);\n        }\n        \n        vec3 extendedReinhardPerChannelToneMap(vec3 color, float overexposureLimit) {\n            float red = extendedReinhardToneMap(color.r, overexposureLimit);\n            float green = extendedReinhardToneMap(color.g, overexposureLimit);\n            float blue = extendedReinhardToneMap(color.b, overexposureLimit);\n            return gammaCorrectedColor(vec3(red, green, blue));\n        }\n        \n        vec3 hableFilmicHelper(vec3 color) {\n            float a = 0.15;\n            float b = 0.5;\n            float c = 0.1;\n            float d = 0.2;\n            float e = 0.02;\n            float f = 0.3;\n            return (color * (a * color + c * b) + d * e) / (color * (a * color + b) + d * f) - e / f;\n        }\n        \n        vec3 hableFilmicToneMap(vec3 color) {\n            float exposureBias = 2.0;\n            vec3 unscaled = hableFilmicHelper(exposureBias * color);\n            vec3 scale = 1.0 / hableFilmicHelper(vec3(11.2));\n            return gammaCorrectedColor(scale * unscaled);\n        }\n        \n        vec3 toneMap(vec3 color, float toneMapType, float toneMapParam) {\n            if (toneMapType == 0.0) {\n                return gammaCorrectedColor(color);\n            } else if (toneMapType == 1.0) {\n                return reinhardLuminanceToneMap(color);\n            } else if (toneMapType == 2.0) {\n                return reinhardPerChannelToneMap(color);\n            } else if (toneMapType == 3.0) {\n                return extendedReinhardLuminanceToneMap(color, toneMapParam);\n            } else if (toneMapType == 4.0) {\n                return extendedReinhardPerChannelToneMap(color, toneMapParam);\n            } else if (toneMapType == 5.0) {\n                return hableFilmicToneMap(color);\n            } else {\n                return vec3(0.0, 0.0, 0.0);\n            }\n        }\n        \n        vec4 toSrgb(vec3 linearColor, mat4 sceneProperties) {\n            vec3 referenceWhite = sceneProperties[2].rgb;\n            float unitR = linearColor.r / referenceWhite.r;\n            float unitG = linearColor.g / referenceWhite.g;\n            float unitB = linearColor.b / referenceWhite.b;\n            float toneMapType = sceneProperties[3][2];\n            float toneMapParam = sceneProperties[3][3];\n            vec3 toneMapped = toneMap(vec3(unitR, unitG, unitB), toneMapType, toneMapParam);\n            return vec4(toneMapped, 1.0);\n        }\n        \n        float pointAlpha(float pointRadius, vec2 pointCoord) {\n            float pointSize = 2.0 * pointRadius;\n            float x = (pointSize + 2.0) * (pointCoord.s - 0.5);\n            float y = (pointSize + 2.0) * (pointCoord.t - 0.5);\n            float r = sqrt(x * x + y * y);\n            float innerRadius = pointRadius;\n            float outerRadius = pointRadius + 1.0;\n            if (r > outerRadius) {\n                return 0.0;\n            } else if (r > innerRadius) {\n                return outerRadius - r;\n            } else {\n                return 1.0;\n            }\n        }\n        \n        void main () {\n            vec4 color = toSrgb(emissiveColor, sceneProperties);\n            float supersampling = sceneProperties[3][0];\n            float alpha = pointAlpha(pointRadius * supersampling, gl_PointCoord);\n            gl_FragColor = vec4(color.rgb, alpha);\n        }\n    ',
	attributes: {},
	uniforms: {emissiveColor: 'a5', pointRadius: 'cm', sceneProperties: 'g'}
};
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$emissivePointMesh = F5(
	function (color, backlight, radius, bounds, webGLMesh) {
		return A2(
			$ianmackenzie$elm_3d_scene$Scene3d$Types$PointNode,
			bounds,
			F8(
				function (sceneProperties, modelScale, modelMatrix, isRightHanded, viewMatrix, projectionMatrix, lights, settings) {
					return A5(
						$elm_explorations$webgl$WebGL$entityWith,
						settings,
						$ianmackenzie$elm_3d_scene$Scene3d$UnoptimizedShaders$pointVertex,
						$ianmackenzie$elm_3d_scene$Scene3d$UnoptimizedShaders$emissivePointFragment,
						webGLMesh,
						{
							a5: A2(
								$elm_explorations$linear_algebra$Math$Vector3$scale,
								$ianmackenzie$elm_units$Luminance$inNits(backlight),
								color),
							d: modelMatrix,
							e: modelScale,
							cm: radius,
							f: projectionMatrix,
							g: sceneProperties,
							h: viewMatrix
						});
				}));
	});
var $ianmackenzie$elm_3d_scene$Scene3d$Types$EmptyNode = {$: 0};
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty = $ianmackenzie$elm_3d_scene$Scene3d$Types$EmptyNode;
var $ianmackenzie$elm_3d_scene$Scene3d$UnoptimizedShaders$lambertianFragment = {
	src: '\n        precision highp float;\n        \n        uniform highp mat4 sceneProperties;\n        uniform highp mat4 lights12;\n        uniform highp mat4 lights34;\n        uniform highp mat4 lights56;\n        uniform highp mat4 lights78;\n        uniform lowp vec4 enabledLights;\n        uniform lowp vec3 materialColor;\n        uniform highp mat4 viewMatrix;\n        \n        varying highp vec3 interpolatedPosition;\n        varying highp vec3 interpolatedNormal;\n        \n        const lowp float kPerspectiveProjection = 0.0;\n        const lowp float kOrthographicProjection = 1.0;\n        const lowp float kDirectionalLight = 1.0;\n        const lowp float kPointLight = 2.0;\n        const highp float kPi = 3.14159265359;\n        const lowp float kDisabledLight = 0.0;\n        const lowp float kSoftLighting = 3.0;\n        \n        float getNormalSign() {\n            return 2.0 * float(gl_FrontFacing) - 1.0;\n        }\n        \n        vec3 getDirectionToCamera(vec3 surfacePosition, mat4 sceneProperties) {\n            float projectionType = sceneProperties[1].w;\n            if (projectionType == kPerspectiveProjection) {\n                vec3 cameraPoint = sceneProperties[1].xyz;\n                return normalize(cameraPoint - surfacePosition);\n            } else if (projectionType == kOrthographicProjection) {\n                return sceneProperties[1].xyz;\n            } else {\n                return vec3(0.0, 0.0, 0.0);\n            }\n        }\n        \n        void getDirectionToLightAndNormalIlluminance(\n            vec4 xyz_type,\n            vec4 rgb_parameter,\n            vec3 surfacePosition,\n            out vec3 directionToLight,\n            out vec3 normalIlluminance\n        ) {\n            float lightType = xyz_type.w;\n            if (lightType == kDirectionalLight) {\n                directionToLight = xyz_type.xyz;\n                normalIlluminance = rgb_parameter.rgb;\n            } else if (lightType == kPointLight) {\n                vec3 lightPosition = xyz_type.xyz;\n                vec3 displacement = lightPosition - surfacePosition;\n                float distance = length(displacement);\n                directionToLight = displacement / distance;\n                normalIlluminance = rgb_parameter.rgb / (4.0 * kPi * distance * distance);\n            }\n        }\n        \n        float positiveDotProduct(vec3 v1, vec3 v2) {\n            return clamp(dot(v1, v2), 0.0, 1.0);\n        }\n        \n        vec3 softLightingLuminance(\n            vec3 aboveLuminance,\n            vec3 belowLuminance,\n            vec3 localUpDirection,\n            vec3 localLightDirection\n        ) {\n            float sinElevation = dot(localLightDirection, localUpDirection);\n            float t = (sinElevation + 1.0) / 2.0;\n            return aboveLuminance * t + belowLuminance * (1.0 - t);\n        }\n        \n        vec3 lambertianLight(\n            vec3 surfacePosition,\n            vec3 surfaceNormal,\n            vec3 materialColor,\n            vec4 xyz_type,\n            vec4 rgb_parameter\n        ) {\n            float lightType = xyz_type.w;\n            if (lightType == kDisabledLight) {\n                return vec3(0.0, 0.0, 0.0);\n            } else if (lightType == kSoftLighting) {\n                vec3 upDirection = xyz_type.xyz;\n                vec3 aboveLuminance = rgb_parameter.rgb;\n                vec3 belowLuminance = rgb_parameter.a * aboveLuminance;\n                vec3 luminance = softLightingLuminance(aboveLuminance, belowLuminance, upDirection, surfaceNormal);\n                return luminance * materialColor;\n            }\n        \n            vec3 directionToLight = vec3(0.0, 0.0, 0.0);\n            vec3 normalIlluminance = vec3(0.0, 0.0, 0.0);\n            getDirectionToLightAndNormalIlluminance(\n                xyz_type,\n                rgb_parameter,\n                surfacePosition,\n                directionToLight,\n                normalIlluminance\n            );\n        \n            float dotNL = positiveDotProduct(directionToLight, surfaceNormal);\n            return (normalIlluminance * dotNL) * (materialColor / kPi);\n        }\n        \n        vec3 lambertianLighting(\n            vec3 surfacePosition,\n            vec3 surfaceNormal,\n            vec3 materialColor,\n            mat4 lights12,\n            mat4 lights34,\n            mat4 lights56,\n            mat4 lights78,\n            vec4 enabledLights\n        ) {\n            vec3 litColor1 = enabledLights[0] == 1.0 ? lambertianLight(surfacePosition, surfaceNormal, materialColor, lights12[0], lights12[1]) : vec3(0.0, 0.0, 0.0);\n            vec3 litColor2 = enabledLights[1] == 1.0 ? lambertianLight(surfacePosition, surfaceNormal, materialColor, lights12[2], lights12[3]) : vec3(0.0, 0.0, 0.0);\n            vec3 litColor3 = enabledLights[2] == 1.0 ? lambertianLight(surfacePosition, surfaceNormal, materialColor, lights34[0], lights34[1]) : vec3(0.0, 0.0, 0.0);\n            vec3 litColor4 = enabledLights[3] == 1.0 ? lambertianLight(surfacePosition, surfaceNormal, materialColor, lights34[2], lights34[3]) : vec3(0.0, 0.0, 0.0);\n            vec3 litColor5 = lambertianLight(surfacePosition, surfaceNormal, materialColor, lights56[0], lights56[1]);\n            vec3 litColor6 = lambertianLight(surfacePosition, surfaceNormal, materialColor, lights56[2], lights56[3]);\n            vec3 litColor7 = lambertianLight(surfacePosition, surfaceNormal, materialColor, lights78[0], lights78[1]);\n            vec3 litColor8 = lambertianLight(surfacePosition, surfaceNormal, materialColor, lights78[2], lights78[3]);\n            return litColor1 + litColor2 + litColor3 + litColor4 + litColor5 + litColor6 + litColor7 + litColor8;\n        }\n        \n        float gammaCorrect(float u) {\n            if (u <= 0.0031308) {\n                return 12.92 * u;\n            } else {\n                return 1.055 * pow(u, 1.0 / 2.4) - 0.055;\n            }\n        }\n        \n        vec3 gammaCorrectedColor(vec3 color) {\n            float red = gammaCorrect(color.r);\n            float green = gammaCorrect(color.g);\n            float blue = gammaCorrect(color.b);\n            return vec3(red, green, blue);\n        }\n        \n        vec3 reinhardLuminanceToneMap(vec3 color) {\n            float luminance = 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;\n            float scale = 1.0 / (1.0 + luminance);\n            return gammaCorrectedColor(color * scale);\n        }\n        \n        vec3 reinhardPerChannelToneMap(vec3 color) {\n            return gammaCorrectedColor(color / (color + 1.0));\n        }\n        \n        float extendedReinhardToneMap(float x, float xMax) {\n            return x * (1.0 + (x / (xMax * xMax))) / (1.0 + x);\n        }\n        \n        vec3 extendedReinhardLuminanceToneMap(vec3 color, float overexposureLimit) {\n            float luminance = 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;\n            float scaledLuminance = extendedReinhardToneMap(luminance, overexposureLimit);\n            float scale = scaledLuminance / luminance;\n            return gammaCorrectedColor(color * scale);\n        }\n        \n        vec3 extendedReinhardPerChannelToneMap(vec3 color, float overexposureLimit) {\n            float red = extendedReinhardToneMap(color.r, overexposureLimit);\n            float green = extendedReinhardToneMap(color.g, overexposureLimit);\n            float blue = extendedReinhardToneMap(color.b, overexposureLimit);\n            return gammaCorrectedColor(vec3(red, green, blue));\n        }\n        \n        vec3 hableFilmicHelper(vec3 color) {\n            float a = 0.15;\n            float b = 0.5;\n            float c = 0.1;\n            float d = 0.2;\n            float e = 0.02;\n            float f = 0.3;\n            return (color * (a * color + c * b) + d * e) / (color * (a * color + b) + d * f) - e / f;\n        }\n        \n        vec3 hableFilmicToneMap(vec3 color) {\n            float exposureBias = 2.0;\n            vec3 unscaled = hableFilmicHelper(exposureBias * color);\n            vec3 scale = 1.0 / hableFilmicHelper(vec3(11.2));\n            return gammaCorrectedColor(scale * unscaled);\n        }\n        \n        vec3 toneMap(vec3 color, float toneMapType, float toneMapParam) {\n            if (toneMapType == 0.0) {\n                return gammaCorrectedColor(color);\n            } else if (toneMapType == 1.0) {\n                return reinhardLuminanceToneMap(color);\n            } else if (toneMapType == 2.0) {\n                return reinhardPerChannelToneMap(color);\n            } else if (toneMapType == 3.0) {\n                return extendedReinhardLuminanceToneMap(color, toneMapParam);\n            } else if (toneMapType == 4.0) {\n                return extendedReinhardPerChannelToneMap(color, toneMapParam);\n            } else if (toneMapType == 5.0) {\n                return hableFilmicToneMap(color);\n            } else {\n                return vec3(0.0, 0.0, 0.0);\n            }\n        }\n        \n        vec4 toSrgb(vec3 linearColor, mat4 sceneProperties) {\n            vec3 referenceWhite = sceneProperties[2].rgb;\n            float unitR = linearColor.r / referenceWhite.r;\n            float unitG = linearColor.g / referenceWhite.g;\n            float unitB = linearColor.b / referenceWhite.b;\n            float toneMapType = sceneProperties[3][2];\n            float toneMapParam = sceneProperties[3][3];\n            vec3 toneMapped = toneMap(vec3(unitR, unitG, unitB), toneMapType, toneMapParam);\n            return vec4(toneMapped, 1.0);\n        }\n        \n        void main() {\n            vec3 normalDirection = normalize(interpolatedNormal) * getNormalSign();\n            vec3 directionToCamera = getDirectionToCamera(interpolatedPosition, sceneProperties);\n        \n            vec3 linearColor = lambertianLighting(\n                interpolatedPosition,\n                normalDirection,\n                materialColor,\n                lights12,\n                lights34,\n                lights56,\n                lights78,\n                enabledLights\n            );\n        \n            gl_FragColor = toSrgb(linearColor, sceneProperties);\n        }\n    ',
	attributes: {},
	uniforms: {enabledLights: 'W', lights12: 'bE', lights34: 'cc', lights56: 'cd', lights78: 'ce', materialColor: 'cV', sceneProperties: 'g', viewMatrix: 'h'}
};
var $ianmackenzie$elm_3d_scene$Scene3d$UnoptimizedShaders$uniformVertex = {
	src: '\n        precision highp float;\n        \n        attribute highp vec3 position;\n        attribute highp vec3 normal;\n        \n        uniform highp vec4 modelScale;\n        uniform highp mat4 modelMatrix;\n        uniform highp mat4 viewMatrix;\n        uniform highp mat4 projectionMatrix;\n        uniform highp mat4 sceneProperties;\n        \n        varying highp vec3 interpolatedPosition;\n        varying highp vec3 interpolatedNormal;\n        \n        vec4 getWorldPosition(vec3 modelPosition, vec4 modelScale, mat4 modelMatrix) {\n            vec4 scaledPosition = vec4(modelScale.xyz * modelPosition, 1.0);\n            return modelMatrix * scaledPosition;\n        }\n        \n        vec3 safeNormalize(vec3 vector) {\n            if (vector == vec3(0.0, 0.0, 0.0)) {\n                return vector;\n            } else {\n                return normalize(vector);\n            }\n        }\n        \n        vec3 getWorldNormal(vec3 modelNormal, vec4 modelScale, mat4 modelMatrix) {\n            vec3 normalScale = vec3(modelScale.w / modelScale.x, modelScale.w / modelScale.y, modelScale.w / modelScale.z);\n            return (modelMatrix * vec4(safeNormalize(normalScale * modelNormal), 0.0)).xyz;\n        }\n        \n        void main () {\n            vec4 worldPosition = getWorldPosition(position, modelScale, modelMatrix);\n            gl_Position = projectionMatrix * (viewMatrix * worldPosition);\n            interpolatedPosition = worldPosition.xyz;\n            interpolatedNormal = getWorldNormal(normal, modelScale, modelMatrix);\n        }\n    ',
	attributes: {normal: 's', position: 'cn'},
	uniforms: {modelMatrix: 'd', modelScale: 'e', projectionMatrix: 'f', sceneProperties: 'g', viewMatrix: 'h'}
};
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$lambertianMesh = F4(
	function (color, bounds, webGLMesh, backFaceSetting) {
		return A2(
			$ianmackenzie$elm_3d_scene$Scene3d$Types$MeshNode,
			bounds,
			F8(
				function (sceneProperties, modelScale, modelMatrix, isRightHanded, viewMatrix, projectionMatrix, _v0, settings) {
					var lights = _v0.a;
					var enabledLights = _v0.b;
					return A5(
						$elm_explorations$webgl$WebGL$entityWith,
						A3($ianmackenzie$elm_3d_scene$Scene3d$Entity$meshSettings, isRightHanded, backFaceSetting, settings),
						$ianmackenzie$elm_3d_scene$Scene3d$UnoptimizedShaders$uniformVertex,
						$ianmackenzie$elm_3d_scene$Scene3d$UnoptimizedShaders$lambertianFragment,
						webGLMesh,
						{W: enabledLights, bE: lights.bE, cc: lights.cc, cd: lights.cd, ce: lights.ce, cV: color, d: modelMatrix, e: modelScale, f: projectionMatrix, g: sceneProperties, h: viewMatrix});
				}));
	});
var $ianmackenzie$elm_3d_scene$Scene3d$UnoptimizedShaders$lambertianTextureFragment = {
	src: '\n        precision highp float;\n        \n        uniform highp mat4 sceneProperties;\n        uniform highp mat4 lights12;\n        uniform highp mat4 lights34;\n        uniform highp mat4 lights56;\n        uniform highp mat4 lights78;\n        uniform lowp vec4 enabledLights;\n        uniform mediump sampler2D materialColorTexture;\n        uniform mediump sampler2D normalMapTexture;\n        uniform lowp float useNormalMap;\n        uniform highp mat4 viewMatrix;\n        \n        varying highp vec3 interpolatedPosition;\n        varying highp vec3 interpolatedNormal;\n        varying mediump vec2 interpolatedUv;\n        varying highp vec3 interpolatedTangent;\n        \n        const lowp float kPerspectiveProjection = 0.0;\n        const lowp float kOrthographicProjection = 1.0;\n        const lowp float kDirectionalLight = 1.0;\n        const lowp float kPointLight = 2.0;\n        const highp float kPi = 3.14159265359;\n        const lowp float kDisabledLight = 0.0;\n        const lowp float kSoftLighting = 3.0;\n        \n        vec3 getLocalNormal(sampler2D normalMap, float useNormalMap, vec2 uv) {\n            vec3 rgb = useNormalMap * texture2D(normalMap, uv).rgb + (1.0 - useNormalMap) * vec3(0.5, 0.5, 1.0);\n            float x = 2.0 * (rgb.r - 0.5);\n            float y = 2.0 * (rgb.g - 0.5);\n            float z = 2.0 * (rgb.b - 0.5);\n            return normalize(vec3(-x, -y, z));\n        }\n        \n        float getNormalSign() {\n            return 2.0 * float(gl_FrontFacing) - 1.0;\n        }\n        \n        vec3 getMappedNormal(vec3 normal, vec3 tangent, float normalSign, vec3 localNormal) {\n            vec3 bitangent = cross(normal, tangent) * normalSign;\n            return normalize(localNormal.x * tangent + localNormal.y * bitangent + localNormal.z * normal);\n        }\n        \n        vec3 getDirectionToCamera(vec3 surfacePosition, mat4 sceneProperties) {\n            float projectionType = sceneProperties[1].w;\n            if (projectionType == kPerspectiveProjection) {\n                vec3 cameraPoint = sceneProperties[1].xyz;\n                return normalize(cameraPoint - surfacePosition);\n            } else if (projectionType == kOrthographicProjection) {\n                return sceneProperties[1].xyz;\n            } else {\n                return vec3(0.0, 0.0, 0.0);\n            }\n        }\n        \n        void getDirectionToLightAndNormalIlluminance(\n            vec4 xyz_type,\n            vec4 rgb_parameter,\n            vec3 surfacePosition,\n            out vec3 directionToLight,\n            out vec3 normalIlluminance\n        ) {\n            float lightType = xyz_type.w;\n            if (lightType == kDirectionalLight) {\n                directionToLight = xyz_type.xyz;\n                normalIlluminance = rgb_parameter.rgb;\n            } else if (lightType == kPointLight) {\n                vec3 lightPosition = xyz_type.xyz;\n                vec3 displacement = lightPosition - surfacePosition;\n                float distance = length(displacement);\n                directionToLight = displacement / distance;\n                normalIlluminance = rgb_parameter.rgb / (4.0 * kPi * distance * distance);\n            }\n        }\n        \n        float positiveDotProduct(vec3 v1, vec3 v2) {\n            return clamp(dot(v1, v2), 0.0, 1.0);\n        }\n        \n        vec3 softLightingLuminance(\n            vec3 aboveLuminance,\n            vec3 belowLuminance,\n            vec3 localUpDirection,\n            vec3 localLightDirection\n        ) {\n            float sinElevation = dot(localLightDirection, localUpDirection);\n            float t = (sinElevation + 1.0) / 2.0;\n            return aboveLuminance * t + belowLuminance * (1.0 - t);\n        }\n        \n        vec3 lambertianLight(\n            vec3 surfacePosition,\n            vec3 surfaceNormal,\n            vec3 materialColor,\n            vec4 xyz_type,\n            vec4 rgb_parameter\n        ) {\n            float lightType = xyz_type.w;\n            if (lightType == kDisabledLight) {\n                return vec3(0.0, 0.0, 0.0);\n            } else if (lightType == kSoftLighting) {\n                vec3 upDirection = xyz_type.xyz;\n                vec3 aboveLuminance = rgb_parameter.rgb;\n                vec3 belowLuminance = rgb_parameter.a * aboveLuminance;\n                vec3 luminance = softLightingLuminance(aboveLuminance, belowLuminance, upDirection, surfaceNormal);\n                return luminance * materialColor;\n            }\n        \n            vec3 directionToLight = vec3(0.0, 0.0, 0.0);\n            vec3 normalIlluminance = vec3(0.0, 0.0, 0.0);\n            getDirectionToLightAndNormalIlluminance(\n                xyz_type,\n                rgb_parameter,\n                surfacePosition,\n                directionToLight,\n                normalIlluminance\n            );\n        \n            float dotNL = positiveDotProduct(directionToLight, surfaceNormal);\n            return (normalIlluminance * dotNL) * (materialColor / kPi);\n        }\n        \n        vec3 lambertianLighting(\n            vec3 surfacePosition,\n            vec3 surfaceNormal,\n            vec3 materialColor,\n            mat4 lights12,\n            mat4 lights34,\n            mat4 lights56,\n            mat4 lights78,\n            vec4 enabledLights\n        ) {\n            vec3 litColor1 = enabledLights[0] == 1.0 ? lambertianLight(surfacePosition, surfaceNormal, materialColor, lights12[0], lights12[1]) : vec3(0.0, 0.0, 0.0);\n            vec3 litColor2 = enabledLights[1] == 1.0 ? lambertianLight(surfacePosition, surfaceNormal, materialColor, lights12[2], lights12[3]) : vec3(0.0, 0.0, 0.0);\n            vec3 litColor3 = enabledLights[2] == 1.0 ? lambertianLight(surfacePosition, surfaceNormal, materialColor, lights34[0], lights34[1]) : vec3(0.0, 0.0, 0.0);\n            vec3 litColor4 = enabledLights[3] == 1.0 ? lambertianLight(surfacePosition, surfaceNormal, materialColor, lights34[2], lights34[3]) : vec3(0.0, 0.0, 0.0);\n            vec3 litColor5 = lambertianLight(surfacePosition, surfaceNormal, materialColor, lights56[0], lights56[1]);\n            vec3 litColor6 = lambertianLight(surfacePosition, surfaceNormal, materialColor, lights56[2], lights56[3]);\n            vec3 litColor7 = lambertianLight(surfacePosition, surfaceNormal, materialColor, lights78[0], lights78[1]);\n            vec3 litColor8 = lambertianLight(surfacePosition, surfaceNormal, materialColor, lights78[2], lights78[3]);\n            return litColor1 + litColor2 + litColor3 + litColor4 + litColor5 + litColor6 + litColor7 + litColor8;\n        }\n        \n        float inverseGamma(float u) {\n            if (u <= 0.04045) {\n                return clamp(u / 12.92, 0.0, 1.0);\n            } else {\n                return clamp(pow((u + 0.055) / 1.055, 2.4), 0.0, 1.0);\n            }\n        }\n        \n        vec3 fromSrgb(vec3 srgbColor) {\n            return vec3(\n                inverseGamma(srgbColor.r),\n                inverseGamma(srgbColor.g),\n                inverseGamma(srgbColor.b)\n            );\n        }\n        \n        float gammaCorrect(float u) {\n            if (u <= 0.0031308) {\n                return 12.92 * u;\n            } else {\n                return 1.055 * pow(u, 1.0 / 2.4) - 0.055;\n            }\n        }\n        \n        vec3 gammaCorrectedColor(vec3 color) {\n            float red = gammaCorrect(color.r);\n            float green = gammaCorrect(color.g);\n            float blue = gammaCorrect(color.b);\n            return vec3(red, green, blue);\n        }\n        \n        vec3 reinhardLuminanceToneMap(vec3 color) {\n            float luminance = 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;\n            float scale = 1.0 / (1.0 + luminance);\n            return gammaCorrectedColor(color * scale);\n        }\n        \n        vec3 reinhardPerChannelToneMap(vec3 color) {\n            return gammaCorrectedColor(color / (color + 1.0));\n        }\n        \n        float extendedReinhardToneMap(float x, float xMax) {\n            return x * (1.0 + (x / (xMax * xMax))) / (1.0 + x);\n        }\n        \n        vec3 extendedReinhardLuminanceToneMap(vec3 color, float overexposureLimit) {\n            float luminance = 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;\n            float scaledLuminance = extendedReinhardToneMap(luminance, overexposureLimit);\n            float scale = scaledLuminance / luminance;\n            return gammaCorrectedColor(color * scale);\n        }\n        \n        vec3 extendedReinhardPerChannelToneMap(vec3 color, float overexposureLimit) {\n            float red = extendedReinhardToneMap(color.r, overexposureLimit);\n            float green = extendedReinhardToneMap(color.g, overexposureLimit);\n            float blue = extendedReinhardToneMap(color.b, overexposureLimit);\n            return gammaCorrectedColor(vec3(red, green, blue));\n        }\n        \n        vec3 hableFilmicHelper(vec3 color) {\n            float a = 0.15;\n            float b = 0.5;\n            float c = 0.1;\n            float d = 0.2;\n            float e = 0.02;\n            float f = 0.3;\n            return (color * (a * color + c * b) + d * e) / (color * (a * color + b) + d * f) - e / f;\n        }\n        \n        vec3 hableFilmicToneMap(vec3 color) {\n            float exposureBias = 2.0;\n            vec3 unscaled = hableFilmicHelper(exposureBias * color);\n            vec3 scale = 1.0 / hableFilmicHelper(vec3(11.2));\n            return gammaCorrectedColor(scale * unscaled);\n        }\n        \n        vec3 toneMap(vec3 color, float toneMapType, float toneMapParam) {\n            if (toneMapType == 0.0) {\n                return gammaCorrectedColor(color);\n            } else if (toneMapType == 1.0) {\n                return reinhardLuminanceToneMap(color);\n            } else if (toneMapType == 2.0) {\n                return reinhardPerChannelToneMap(color);\n            } else if (toneMapType == 3.0) {\n                return extendedReinhardLuminanceToneMap(color, toneMapParam);\n            } else if (toneMapType == 4.0) {\n                return extendedReinhardPerChannelToneMap(color, toneMapParam);\n            } else if (toneMapType == 5.0) {\n                return hableFilmicToneMap(color);\n            } else {\n                return vec3(0.0, 0.0, 0.0);\n            }\n        }\n        \n        vec4 toSrgb(vec3 linearColor, mat4 sceneProperties) {\n            vec3 referenceWhite = sceneProperties[2].rgb;\n            float unitR = linearColor.r / referenceWhite.r;\n            float unitG = linearColor.g / referenceWhite.g;\n            float unitB = linearColor.b / referenceWhite.b;\n            float toneMapType = sceneProperties[3][2];\n            float toneMapParam = sceneProperties[3][3];\n            vec3 toneMapped = toneMap(vec3(unitR, unitG, unitB), toneMapType, toneMapParam);\n            return vec4(toneMapped, 1.0);\n        }\n        \n        void main() {\n            vec3 localNormal = getLocalNormal(normalMapTexture, useNormalMap, interpolatedUv);\n            float normalSign = getNormalSign();\n            vec3 originalNormal = normalize(interpolatedNormal) * normalSign;\n            vec3 normalDirection = getMappedNormal(originalNormal, interpolatedTangent, normalSign, localNormal);\n            vec3 directionToCamera = getDirectionToCamera(interpolatedPosition, sceneProperties);\n            vec3 materialColor = fromSrgb(texture2D(materialColorTexture, interpolatedUv).rgb);\n        \n            vec3 linearColor = lambertianLighting(\n                interpolatedPosition,\n                normalDirection,\n                materialColor,\n                lights12,\n                lights34,\n                lights56,\n                lights78,\n                enabledLights\n            );\n        \n            gl_FragColor = toSrgb(linearColor, sceneProperties);\n        }\n    ',
	attributes: {},
	uniforms: {enabledLights: 'W', lights12: 'bE', lights34: 'cc', lights56: 'cd', lights78: 'ce', materialColorTexture: 'cW', normalMapTexture: 'bd', sceneProperties: 'g', useNormalMap: 'bi', viewMatrix: 'h'}
};
var $ianmackenzie$elm_3d_scene$Scene3d$UnoptimizedShaders$normalMappedVertex = {
	src: '\n        precision highp float;\n        \n        attribute highp vec3 position;\n        attribute highp vec3 normal;\n        attribute mediump vec2 uv;\n        attribute highp vec3 tangent;\n        \n        uniform highp vec4 modelScale;\n        uniform highp mat4 modelMatrix;\n        uniform highp mat4 viewMatrix;\n        uniform highp mat4 projectionMatrix;\n        uniform highp mat4 sceneProperties;\n        \n        varying highp vec3 interpolatedPosition;\n        varying highp vec3 interpolatedNormal;\n        varying mediump vec2 interpolatedUv;\n        varying highp vec3 interpolatedTangent;\n        \n        vec4 getWorldPosition(vec3 modelPosition, vec4 modelScale, mat4 modelMatrix) {\n            vec4 scaledPosition = vec4(modelScale.xyz * modelPosition, 1.0);\n            return modelMatrix * scaledPosition;\n        }\n        \n        vec3 safeNormalize(vec3 vector) {\n            if (vector == vec3(0.0, 0.0, 0.0)) {\n                return vector;\n            } else {\n                return normalize(vector);\n            }\n        }\n        \n        vec3 getWorldNormal(vec3 modelNormal, vec4 modelScale, mat4 modelMatrix) {\n            vec3 normalScale = vec3(modelScale.w / modelScale.x, modelScale.w / modelScale.y, modelScale.w / modelScale.z);\n            return (modelMatrix * vec4(safeNormalize(normalScale * modelNormal), 0.0)).xyz;\n        }\n        \n        vec3 getWorldTangent(vec3 modelTangent, vec4 modelScale, mat4 modelMatrix) {\n            return (modelMatrix * vec4(safeNormalize(modelScale.xyz * modelTangent), 0.0)).xyz;\n        }\n        \n        void main () {\n            vec4 worldPosition = getWorldPosition(position, modelScale, modelMatrix);\n            gl_Position = projectionMatrix * (viewMatrix * worldPosition);\n            interpolatedPosition = worldPosition.xyz;\n            interpolatedNormal = getWorldNormal(normal, modelScale, modelMatrix);\n            interpolatedUv = uv;\n            interpolatedTangent = getWorldTangent(tangent, modelScale, modelMatrix);\n        }\n    ',
	attributes: {normal: 's', position: 'cn', tangent: 'eC', uv: 'P'},
	uniforms: {modelMatrix: 'd', modelScale: 'e', projectionMatrix: 'f', sceneProperties: 'g', viewMatrix: 'h'}
};
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$normalMappedLambertianMesh = F6(
	function (materialColorData, normalMapData, useNormalMap, bounds, webGLMesh, backFaceSetting) {
		return A2(
			$ianmackenzie$elm_3d_scene$Scene3d$Types$MeshNode,
			bounds,
			F8(
				function (sceneProperties, modelScale, modelMatrix, isRightHanded, viewMatrix, projectionMatrix, _v0, settings) {
					var lights = _v0.a;
					var enabledLights = _v0.b;
					return A5(
						$elm_explorations$webgl$WebGL$entityWith,
						A3($ianmackenzie$elm_3d_scene$Scene3d$Entity$meshSettings, isRightHanded, backFaceSetting, settings),
						$ianmackenzie$elm_3d_scene$Scene3d$UnoptimizedShaders$normalMappedVertex,
						$ianmackenzie$elm_3d_scene$Scene3d$UnoptimizedShaders$lambertianTextureFragment,
						webGLMesh,
						{W: enabledLights, bE: lights.bE, cc: lights.cc, cd: lights.cd, ce: lights.ce, cW: materialColorData, d: modelMatrix, e: modelScale, bd: normalMapData, f: projectionMatrix, g: sceneProperties, bi: useNormalMap, h: viewMatrix});
				}));
	});
var $ianmackenzie$elm_3d_scene$Scene3d$UnoptimizedShaders$physicalTexturesFragment = {
	src: '\n        precision highp float;\n        \n        uniform highp mat4 sceneProperties;\n        uniform highp mat4 viewMatrix;\n        uniform highp mat4 lights12;\n        uniform highp mat4 lights34;\n        uniform highp mat4 lights56;\n        uniform highp mat4 lights78;\n        uniform lowp vec4 enabledLights;\n        uniform mediump sampler2D baseColorTexture;\n        uniform lowp vec4 constantBaseColor;\n        uniform mediump sampler2D roughnessTexture;\n        uniform lowp vec2 constantRoughness;\n        uniform mediump sampler2D metallicTexture;\n        uniform lowp vec2 constantMetallic;\n        uniform mediump sampler2D normalMapTexture;\n        uniform lowp float useNormalMap;\n        \n        varying highp vec3 interpolatedPosition;\n        varying highp vec3 interpolatedNormal;\n        varying mediump vec2 interpolatedUv;\n        varying highp vec3 interpolatedTangent;\n        \n        const lowp float kPerspectiveProjection = 0.0;\n        const lowp float kOrthographicProjection = 1.0;\n        const lowp float kDirectionalLight = 1.0;\n        const lowp float kPointLight = 2.0;\n        const highp float kPi = 3.14159265359;\n        const mediump float kMediumpFloatMax = 65504.0;\n        const lowp float kDisabledLight = 0.0;\n        const lowp float kSoftLighting = 3.0;\n        \n        float getFloatValue(sampler2D texture, vec2 uv, vec2 constantValue) {\n            if (constantValue.y == 1.0) {\n                return constantValue.x;\n            } else {\n                vec4 textureColor = texture2D(texture, uv);\n                return dot(textureColor, vec4(0.2126, 0.7152, 0.0722, 0.0));\n            }\n        }\n        \n        vec3 getLocalNormal(sampler2D normalMap, float useNormalMap, vec2 uv) {\n            vec3 rgb = useNormalMap * texture2D(normalMap, uv).rgb + (1.0 - useNormalMap) * vec3(0.5, 0.5, 1.0);\n            float x = 2.0 * (rgb.r - 0.5);\n            float y = 2.0 * (rgb.g - 0.5);\n            float z = 2.0 * (rgb.b - 0.5);\n            return normalize(vec3(-x, -y, z));\n        }\n        \n        float getNormalSign() {\n            return 2.0 * float(gl_FrontFacing) - 1.0;\n        }\n        \n        vec3 getMappedNormal(vec3 normal, vec3 tangent, float normalSign, vec3 localNormal) {\n            vec3 bitangent = cross(normal, tangent) * normalSign;\n            return normalize(localNormal.x * tangent + localNormal.y * bitangent + localNormal.z * normal);\n        }\n        \n        vec3 getDirectionToCamera(vec3 surfacePosition, mat4 sceneProperties) {\n            float projectionType = sceneProperties[1].w;\n            if (projectionType == kPerspectiveProjection) {\n                vec3 cameraPoint = sceneProperties[1].xyz;\n                return normalize(cameraPoint - surfacePosition);\n            } else if (projectionType == kOrthographicProjection) {\n                return sceneProperties[1].xyz;\n            } else {\n                return vec3(0.0, 0.0, 0.0);\n            }\n        }\n        \n        void getDirectionToLightAndNormalIlluminance(\n            vec4 xyz_type,\n            vec4 rgb_parameter,\n            vec3 surfacePosition,\n            out vec3 directionToLight,\n            out vec3 normalIlluminance\n        ) {\n            float lightType = xyz_type.w;\n            if (lightType == kDirectionalLight) {\n                directionToLight = xyz_type.xyz;\n                normalIlluminance = rgb_parameter.rgb;\n            } else if (lightType == kPointLight) {\n                vec3 lightPosition = xyz_type.xyz;\n                vec3 displacement = lightPosition - surfacePosition;\n                float distance = length(displacement);\n                directionToLight = displacement / distance;\n                normalIlluminance = rgb_parameter.rgb / (4.0 * kPi * distance * distance);\n            }\n        }\n        \n        float positiveDotProduct(vec3 v1, vec3 v2) {\n            return clamp(dot(v1, v2), 0.0, 1.0);\n        }\n        \n        // Adapted from https://google.github.io/filament/Filament.md.html#materialsystem/specularbrdf/normaldistributionfunction(speculard)\n        float specularD(float alpha, float dotNH, vec3 normalDirection, vec3 halfDirection) {\n            vec3 crossNH = cross(normalDirection, halfDirection);\n            float a = dotNH * alpha;\n            float k = alpha / (dot(crossNH, crossNH) + a * a);\n            float d = k * k * (1.0 / kPi);\n            return min(d, kMediumpFloatMax);\n        }\n        \n        float safeQuotient(float numerator, float denominator) {\n            if (denominator == 0.0) {\n                return 0.0;\n            } else {\n                return numerator / denominator;\n            }\n        }\n        \n        float g1(float dotNV, float alphaSquared) {\n            return safeQuotient(2.0 * dotNV, dotNV + sqrt(alphaSquared + (1.0 - alphaSquared) * dotNV * dotNV));\n        }\n        \n        float specularG(float dotNL, float dotNV, float alphaSquared) {\n            return g1(dotNV, alphaSquared) * g1(dotNL, alphaSquared);\n        }\n        \n        vec3 fresnelColor(vec3 specularBaseColor, float dotVH) {\n            vec3 one = vec3(1.0, 1.0, 1.0);\n            float scale = exp2((-5.55473 * dotVH - 6.98316) * dotVH);\n            return specularBaseColor + (one - specularBaseColor) * scale;\n        }\n        \n        vec3 brdf(vec3 normalDirection, vec3 directionToCamera, vec3 directionToLight, float alpha, float dotNV, float dotNL, vec3 specularBaseColor, vec3 normalIlluminance) {\n            vec3 halfDirection = normalize(directionToCamera + directionToLight);\n            float dotVH = positiveDotProduct(directionToCamera, halfDirection);\n            float dotNH = positiveDotProduct(normalDirection, halfDirection);\n            float dotNHSquared = dotNH * dotNH;\n        \n            float d = specularD(alpha, dotNH, normalDirection, halfDirection);\n            float g = specularG(dotNL, dotNV, alpha * alpha);\n            vec3 f = fresnelColor(specularBaseColor, dotVH);\n            return safeQuotient(d * g, 4.0 * dotNL * dotNV) * f;\n        }\n        \n        vec3 sampleFacetNormal(vec3 vH, vec3 vT1, vec3 vT2, float s, float alpha) {\n            float t2 = (1.0 - s);\n            vec3 vNh = t2 * vT2 + sqrt(max(0.0, 1.0 - t2 * t2)) * vH;\n            return normalize(vec3(alpha * vNh.x, alpha * vNh.y, max(0.0, vNh.z)));\n        }\n        \n        vec3 softLightingLuminance(\n            vec3 aboveLuminance,\n            vec3 belowLuminance,\n            vec3 localUpDirection,\n            vec3 localLightDirection\n        ) {\n            float sinElevation = dot(localLightDirection, localUpDirection);\n            float t = (sinElevation + 1.0) / 2.0;\n            return aboveLuminance * t + belowLuminance * (1.0 - t);\n        }\n        \n        vec3 softLightingSpecularSample(\n            vec3 aboveLuminance,\n            vec3 belowLuminance,\n            vec3 localUpDirection,\n            vec3 localViewDirection,\n            vec3 localLightDirection,\n            vec3 localHalfDirection,\n            float alphaSquared,\n            vec3 specularBaseColor\n        ) {\n            vec3 luminance = softLightingLuminance(aboveLuminance, belowLuminance, localUpDirection, localLightDirection);\n            float dotVH = positiveDotProduct(localViewDirection, localHalfDirection);\n            float dotNL = localLightDirection.z;\n            return luminance * (fresnelColor(specularBaseColor, dotVH) * g1(dotNL, alphaSquared));\n        }\n        \n        vec3 softLighting(\n            vec3 normalDirection,\n            vec3 diffuseBaseColor,\n            vec3 specularBaseColor,\n            float alpha,\n            vec3 directionToCamera,\n            vec3 viewY,\n            vec4 xyz_type,\n            vec4 rgb_parameter\n        ) {\n            float alphaSquared = alpha * alpha;\n            vec3 upDirection = xyz_type.xyz;\n            vec3 luminanceAbove = rgb_parameter.rgb;\n            vec3 luminanceBelow = rgb_parameter.a * luminanceAbove;\n            vec3 crossProduct = cross(normalDirection, directionToCamera);\n            float crossMagnitude = length(crossProduct);\n            vec3 xDirection = vec3(0.0, 0.0, 0.0);\n            vec3 yDirection = vec3(0.0, 0.0, 0.0);\n            if (crossMagnitude > 1.0e-6) {\n                yDirection = (1.0 / crossMagnitude) * crossProduct;\n                xDirection = cross(yDirection, normalDirection);\n            } else {\n                vec3 viewY = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);\n                xDirection = normalize(cross(viewY, normalDirection));\n                yDirection = cross(normalDirection, xDirection);\n            }\n            float localViewX = dot(directionToCamera, xDirection);\n            float localViewZ = dot(directionToCamera, normalDirection);\n            vec3 localViewDirection = vec3(localViewX, 0, localViewZ);\n            float localUpX = dot(upDirection, xDirection);\n            float localUpY = dot(upDirection, yDirection);\n            float localUpZ = dot(upDirection, normalDirection);\n            vec3 localUpDirection = vec3(localUpX, localUpY, localUpZ);\n        \n            vec3 vH = normalize(vec3(alpha * localViewX, 0.0, localViewZ));\n            vec3 vT1 = vec3(0.0, 1.0, 0.0);\n            vec3 vT2 = cross(vH, vT1);\n            float s = 0.5 * (1.0 + vH.z);\n            \n            vec3 localHalfDirection = sampleFacetNormal(vH, vT1, vT2, s, alpha);\n            vec3 localLightDirection = vec3(0.0, 0.0, 0.0);\n            \n            localLightDirection = -reflect(localViewDirection, localHalfDirection);\n            vec3 specular = softLightingSpecularSample(luminanceAbove, luminanceBelow, localUpDirection, localViewDirection, localLightDirection, localHalfDirection, alphaSquared, specularBaseColor);\n            \n            localLightDirection = vec3(0.000000, 0.000000, 1.000000);\n            vec3 diffuse = softLightingLuminance(luminanceAbove, luminanceBelow, localUpDirection, localLightDirection) * localLightDirection.z;\n            \n            return specular + diffuse * diffuseBaseColor;\n        }\n        \n        vec3 physicalLight(\n            vec4 xyz_type,\n            vec4 rgb_parameter,\n            vec3 surfacePosition,\n            vec3 normalDirection,\n            vec3 directionToCamera,\n            vec3 viewY,\n            float dotNV,\n            vec3 diffuseBaseColor,\n            vec3 specularBaseColor,\n            float alpha\n        ) {\n            float lightType = xyz_type.w;\n            if (lightType == kDisabledLight) {\n                return vec3(0.0, 0.0, 0.0);\n            } else if (lightType == kSoftLighting) {\n                return softLighting(normalDirection, diffuseBaseColor, specularBaseColor, alpha, directionToCamera, viewY, xyz_type, rgb_parameter);\n            }\n        \n            vec3 directionToLight = vec3(0.0, 0.0, 0.0);\n            vec3 normalIlluminance = vec3(0.0, 0.0, 0.0);\n            getDirectionToLightAndNormalIlluminance(xyz_type, rgb_parameter, surfacePosition, directionToLight, normalIlluminance);\n        \n            float dotNL = positiveDotProduct(normalDirection, directionToLight);\n            vec3 specularColor = brdf(normalDirection, directionToCamera, directionToLight, alpha, dotNV, dotNL, specularBaseColor, normalIlluminance);\n            return (normalIlluminance * dotNL) * ((diffuseBaseColor / kPi) + specularColor);\n        }\n        \n        vec3 physicalLighting(\n            vec3 surfacePosition,\n            vec3 surfaceNormal,\n            vec3 baseColor,\n            vec3 directionToCamera,\n            mat4 viewMatrix,\n            float roughness,\n            float metallic,\n            mat4 lights12,\n            mat4 lights34,\n            mat4 lights56,\n            mat4 lights78,\n            vec4 enabledLights\n        ) {\n            float dotNV = positiveDotProduct(surfaceNormal, directionToCamera);\n            float alpha = roughness * roughness;\n            float nonmetallic = 1.0 - metallic;\n            vec3 diffuseBaseColor = nonmetallic * 0.96 * baseColor;\n            vec3 specularBaseColor = nonmetallic * 0.04 * vec3(1.0, 1.0, 1.0) + metallic * baseColor;\n            vec3 viewY = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);\n        \n            vec3 litColor1 = enabledLights[0] == 1.0 ? physicalLight(lights12[0], lights12[1], surfacePosition, surfaceNormal, directionToCamera, viewY, dotNV, diffuseBaseColor, specularBaseColor, alpha) : vec3(0.0, 0.0, 0.0);\n            vec3 litColor2 = enabledLights[1] == 1.0 ? physicalLight(lights12[2], lights12[3], surfacePosition, surfaceNormal, directionToCamera, viewY, dotNV, diffuseBaseColor, specularBaseColor, alpha) : vec3(0.0, 0.0, 0.0);\n            vec3 litColor3 = enabledLights[2] == 1.0 ? physicalLight(lights34[0], lights34[1], surfacePosition, surfaceNormal, directionToCamera, viewY, dotNV, diffuseBaseColor, specularBaseColor, alpha) : vec3(0.0, 0.0, 0.0);\n            vec3 litColor4 = enabledLights[3] == 1.0 ? physicalLight(lights34[2], lights34[3], surfacePosition, surfaceNormal, directionToCamera, viewY, dotNV, diffuseBaseColor, specularBaseColor, alpha) : vec3(0.0, 0.0, 0.0);\n            vec3 litColor5 = physicalLight(lights56[0], lights56[1], surfacePosition, surfaceNormal, directionToCamera, viewY, dotNV, diffuseBaseColor, specularBaseColor, alpha);\n            vec3 litColor6 = physicalLight(lights56[2], lights56[3], surfacePosition, surfaceNormal, directionToCamera, viewY, dotNV, diffuseBaseColor, specularBaseColor, alpha);\n            vec3 litColor7 = physicalLight(lights78[0], lights78[1], surfacePosition, surfaceNormal, directionToCamera, viewY, dotNV, diffuseBaseColor, specularBaseColor, alpha);\n            vec3 litColor8 = physicalLight(lights78[2], lights78[3], surfacePosition, surfaceNormal, directionToCamera, viewY, dotNV, diffuseBaseColor, specularBaseColor, alpha);\n            return litColor1 + litColor2 + litColor3 + litColor4 + litColor5 + litColor6 + litColor7 + litColor8;\n        }\n        \n        float inverseGamma(float u) {\n            if (u <= 0.04045) {\n                return clamp(u / 12.92, 0.0, 1.0);\n            } else {\n                return clamp(pow((u + 0.055) / 1.055, 2.4), 0.0, 1.0);\n            }\n        }\n        \n        vec3 fromSrgb(vec3 srgbColor) {\n            return vec3(\n                inverseGamma(srgbColor.r),\n                inverseGamma(srgbColor.g),\n                inverseGamma(srgbColor.b)\n            );\n        }\n        \n        float gammaCorrect(float u) {\n            if (u <= 0.0031308) {\n                return 12.92 * u;\n            } else {\n                return 1.055 * pow(u, 1.0 / 2.4) - 0.055;\n            }\n        }\n        \n        vec3 gammaCorrectedColor(vec3 color) {\n            float red = gammaCorrect(color.r);\n            float green = gammaCorrect(color.g);\n            float blue = gammaCorrect(color.b);\n            return vec3(red, green, blue);\n        }\n        \n        vec3 reinhardLuminanceToneMap(vec3 color) {\n            float luminance = 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;\n            float scale = 1.0 / (1.0 + luminance);\n            return gammaCorrectedColor(color * scale);\n        }\n        \n        vec3 reinhardPerChannelToneMap(vec3 color) {\n            return gammaCorrectedColor(color / (color + 1.0));\n        }\n        \n        float extendedReinhardToneMap(float x, float xMax) {\n            return x * (1.0 + (x / (xMax * xMax))) / (1.0 + x);\n        }\n        \n        vec3 extendedReinhardLuminanceToneMap(vec3 color, float overexposureLimit) {\n            float luminance = 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;\n            float scaledLuminance = extendedReinhardToneMap(luminance, overexposureLimit);\n            float scale = scaledLuminance / luminance;\n            return gammaCorrectedColor(color * scale);\n        }\n        \n        vec3 extendedReinhardPerChannelToneMap(vec3 color, float overexposureLimit) {\n            float red = extendedReinhardToneMap(color.r, overexposureLimit);\n            float green = extendedReinhardToneMap(color.g, overexposureLimit);\n            float blue = extendedReinhardToneMap(color.b, overexposureLimit);\n            return gammaCorrectedColor(vec3(red, green, blue));\n        }\n        \n        vec3 hableFilmicHelper(vec3 color) {\n            float a = 0.15;\n            float b = 0.5;\n            float c = 0.1;\n            float d = 0.2;\n            float e = 0.02;\n            float f = 0.3;\n            return (color * (a * color + c * b) + d * e) / (color * (a * color + b) + d * f) - e / f;\n        }\n        \n        vec3 hableFilmicToneMap(vec3 color) {\n            float exposureBias = 2.0;\n            vec3 unscaled = hableFilmicHelper(exposureBias * color);\n            vec3 scale = 1.0 / hableFilmicHelper(vec3(11.2));\n            return gammaCorrectedColor(scale * unscaled);\n        }\n        \n        vec3 toneMap(vec3 color, float toneMapType, float toneMapParam) {\n            if (toneMapType == 0.0) {\n                return gammaCorrectedColor(color);\n            } else if (toneMapType == 1.0) {\n                return reinhardLuminanceToneMap(color);\n            } else if (toneMapType == 2.0) {\n                return reinhardPerChannelToneMap(color);\n            } else if (toneMapType == 3.0) {\n                return extendedReinhardLuminanceToneMap(color, toneMapParam);\n            } else if (toneMapType == 4.0) {\n                return extendedReinhardPerChannelToneMap(color, toneMapParam);\n            } else if (toneMapType == 5.0) {\n                return hableFilmicToneMap(color);\n            } else {\n                return vec3(0.0, 0.0, 0.0);\n            }\n        }\n        \n        vec4 toSrgb(vec3 linearColor, mat4 sceneProperties) {\n            vec3 referenceWhite = sceneProperties[2].rgb;\n            float unitR = linearColor.r / referenceWhite.r;\n            float unitG = linearColor.g / referenceWhite.g;\n            float unitB = linearColor.b / referenceWhite.b;\n            float toneMapType = sceneProperties[3][2];\n            float toneMapParam = sceneProperties[3][3];\n            vec3 toneMapped = toneMap(vec3(unitR, unitG, unitB), toneMapType, toneMapParam);\n            return vec4(toneMapped, 1.0);\n        }\n        \n        void main() {\n            vec3 baseColor = fromSrgb(texture2D(baseColorTexture, interpolatedUv).rgb) * (1.0 - constantBaseColor.w) + constantBaseColor.rgb * constantBaseColor.w;\n            float roughness = getFloatValue(roughnessTexture, interpolatedUv, constantRoughness);\n            float metallic = getFloatValue(metallicTexture, interpolatedUv, constantMetallic);\n        \n            vec3 localNormal = getLocalNormal(normalMapTexture, useNormalMap, interpolatedUv);\n            float normalSign = getNormalSign();\n            vec3 originalNormal = normalize(interpolatedNormal) * normalSign;\n            vec3 normalDirection = getMappedNormal(originalNormal, interpolatedTangent, normalSign, localNormal);\n            vec3 directionToCamera = getDirectionToCamera(interpolatedPosition, sceneProperties);\n        \n            vec3 linearColor = physicalLighting(\n                interpolatedPosition,\n                normalDirection,\n                baseColor,\n                directionToCamera,\n                viewMatrix,\n                roughness,\n                metallic,\n                lights12,\n                lights34,\n                lights56,\n                lights78,\n                enabledLights\n            );\n        \n            gl_FragColor = toSrgb(linearColor, sceneProperties);\n        }\n    ',
	attributes: {},
	uniforms: {baseColorTexture: 'cD', constantBaseColor: 'cF', constantMetallic: 'cG', constantRoughness: 'cH', enabledLights: 'W', lights12: 'bE', lights34: 'cc', lights56: 'cd', lights78: 'ce', metallicTexture: 'cZ', normalMapTexture: 'bd', roughnessTexture: 'di', sceneProperties: 'g', useNormalMap: 'bi', viewMatrix: 'h'}
};
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$normalMappedPhysicalMesh = function (baseColorData) {
	return function (constantBaseColor) {
		return function (roughnessData) {
			return function (constantRoughness) {
				return function (metallicData) {
					return function (constantMetallic) {
						return function (normalMapData) {
							return function (useNormalMap) {
								return function (bounds) {
									return function (webGLMesh) {
										return function (backFaceSetting) {
											return A2(
												$ianmackenzie$elm_3d_scene$Scene3d$Types$MeshNode,
												bounds,
												F8(
													function (sceneProperties, modelScale, modelMatrix, isRightHanded, viewMatrix, projectionMatrix, _v0, settings) {
														var lights = _v0.a;
														var enabledLights = _v0.b;
														return A5(
															$elm_explorations$webgl$WebGL$entityWith,
															A3($ianmackenzie$elm_3d_scene$Scene3d$Entity$meshSettings, isRightHanded, backFaceSetting, settings),
															$ianmackenzie$elm_3d_scene$Scene3d$UnoptimizedShaders$normalMappedVertex,
															$ianmackenzie$elm_3d_scene$Scene3d$UnoptimizedShaders$physicalTexturesFragment,
															webGLMesh,
															{cD: baseColorData, cF: constantBaseColor, cG: constantMetallic, cH: constantRoughness, W: enabledLights, bE: lights.bE, cc: lights.cc, cd: lights.cd, ce: lights.ce, cZ: metallicData, d: modelMatrix, e: modelScale, bd: normalMapData, f: projectionMatrix, di: roughnessData, g: sceneProperties, bi: useNormalMap, h: viewMatrix});
													}));
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var $ianmackenzie$elm_3d_scene$Scene3d$UnoptimizedShaders$physicalFragment = {
	src: '\n        precision highp float;\n        \n        uniform highp mat4 sceneProperties;\n        uniform highp mat4 viewMatrix;\n        uniform highp mat4 lights12;\n        uniform highp mat4 lights34;\n        uniform highp mat4 lights56;\n        uniform highp mat4 lights78;\n        uniform lowp vec4 enabledLights;\n        uniform lowp vec3 baseColor;\n        uniform lowp float roughness;\n        uniform lowp float metallic;\n        \n        varying highp vec3 interpolatedPosition;\n        varying highp vec3 interpolatedNormal;\n        \n        const lowp float kPerspectiveProjection = 0.0;\n        const lowp float kOrthographicProjection = 1.0;\n        const lowp float kDirectionalLight = 1.0;\n        const lowp float kPointLight = 2.0;\n        const highp float kPi = 3.14159265359;\n        const mediump float kMediumpFloatMax = 65504.0;\n        const lowp float kDisabledLight = 0.0;\n        const lowp float kSoftLighting = 3.0;\n        \n        float getNormalSign() {\n            return 2.0 * float(gl_FrontFacing) - 1.0;\n        }\n        \n        vec3 getDirectionToCamera(vec3 surfacePosition, mat4 sceneProperties) {\n            float projectionType = sceneProperties[1].w;\n            if (projectionType == kPerspectiveProjection) {\n                vec3 cameraPoint = sceneProperties[1].xyz;\n                return normalize(cameraPoint - surfacePosition);\n            } else if (projectionType == kOrthographicProjection) {\n                return sceneProperties[1].xyz;\n            } else {\n                return vec3(0.0, 0.0, 0.0);\n            }\n        }\n        \n        void getDirectionToLightAndNormalIlluminance(\n            vec4 xyz_type,\n            vec4 rgb_parameter,\n            vec3 surfacePosition,\n            out vec3 directionToLight,\n            out vec3 normalIlluminance\n        ) {\n            float lightType = xyz_type.w;\n            if (lightType == kDirectionalLight) {\n                directionToLight = xyz_type.xyz;\n                normalIlluminance = rgb_parameter.rgb;\n            } else if (lightType == kPointLight) {\n                vec3 lightPosition = xyz_type.xyz;\n                vec3 displacement = lightPosition - surfacePosition;\n                float distance = length(displacement);\n                directionToLight = displacement / distance;\n                normalIlluminance = rgb_parameter.rgb / (4.0 * kPi * distance * distance);\n            }\n        }\n        \n        float positiveDotProduct(vec3 v1, vec3 v2) {\n            return clamp(dot(v1, v2), 0.0, 1.0);\n        }\n        \n        // Adapted from https://google.github.io/filament/Filament.md.html#materialsystem/specularbrdf/normaldistributionfunction(speculard)\n        float specularD(float alpha, float dotNH, vec3 normalDirection, vec3 halfDirection) {\n            vec3 crossNH = cross(normalDirection, halfDirection);\n            float a = dotNH * alpha;\n            float k = alpha / (dot(crossNH, crossNH) + a * a);\n            float d = k * k * (1.0 / kPi);\n            return min(d, kMediumpFloatMax);\n        }\n        \n        float safeQuotient(float numerator, float denominator) {\n            if (denominator == 0.0) {\n                return 0.0;\n            } else {\n                return numerator / denominator;\n            }\n        }\n        \n        float g1(float dotNV, float alphaSquared) {\n            return safeQuotient(2.0 * dotNV, dotNV + sqrt(alphaSquared + (1.0 - alphaSquared) * dotNV * dotNV));\n        }\n        \n        float specularG(float dotNL, float dotNV, float alphaSquared) {\n            return g1(dotNV, alphaSquared) * g1(dotNL, alphaSquared);\n        }\n        \n        vec3 fresnelColor(vec3 specularBaseColor, float dotVH) {\n            vec3 one = vec3(1.0, 1.0, 1.0);\n            float scale = exp2((-5.55473 * dotVH - 6.98316) * dotVH);\n            return specularBaseColor + (one - specularBaseColor) * scale;\n        }\n        \n        vec3 brdf(vec3 normalDirection, vec3 directionToCamera, vec3 directionToLight, float alpha, float dotNV, float dotNL, vec3 specularBaseColor, vec3 normalIlluminance) {\n            vec3 halfDirection = normalize(directionToCamera + directionToLight);\n            float dotVH = positiveDotProduct(directionToCamera, halfDirection);\n            float dotNH = positiveDotProduct(normalDirection, halfDirection);\n            float dotNHSquared = dotNH * dotNH;\n        \n            float d = specularD(alpha, dotNH, normalDirection, halfDirection);\n            float g = specularG(dotNL, dotNV, alpha * alpha);\n            vec3 f = fresnelColor(specularBaseColor, dotVH);\n            return safeQuotient(d * g, 4.0 * dotNL * dotNV) * f;\n        }\n        \n        vec3 sampleFacetNormal(vec3 vH, vec3 vT1, vec3 vT2, float s, float alpha) {\n            float t2 = (1.0 - s);\n            vec3 vNh = t2 * vT2 + sqrt(max(0.0, 1.0 - t2 * t2)) * vH;\n            return normalize(vec3(alpha * vNh.x, alpha * vNh.y, max(0.0, vNh.z)));\n        }\n        \n        vec3 softLightingLuminance(\n            vec3 aboveLuminance,\n            vec3 belowLuminance,\n            vec3 localUpDirection,\n            vec3 localLightDirection\n        ) {\n            float sinElevation = dot(localLightDirection, localUpDirection);\n            float t = (sinElevation + 1.0) / 2.0;\n            return aboveLuminance * t + belowLuminance * (1.0 - t);\n        }\n        \n        vec3 softLightingSpecularSample(\n            vec3 aboveLuminance,\n            vec3 belowLuminance,\n            vec3 localUpDirection,\n            vec3 localViewDirection,\n            vec3 localLightDirection,\n            vec3 localHalfDirection,\n            float alphaSquared,\n            vec3 specularBaseColor\n        ) {\n            vec3 luminance = softLightingLuminance(aboveLuminance, belowLuminance, localUpDirection, localLightDirection);\n            float dotVH = positiveDotProduct(localViewDirection, localHalfDirection);\n            float dotNL = localLightDirection.z;\n            return luminance * (fresnelColor(specularBaseColor, dotVH) * g1(dotNL, alphaSquared));\n        }\n        \n        vec3 softLighting(\n            vec3 normalDirection,\n            vec3 diffuseBaseColor,\n            vec3 specularBaseColor,\n            float alpha,\n            vec3 directionToCamera,\n            vec3 viewY,\n            vec4 xyz_type,\n            vec4 rgb_parameter\n        ) {\n            float alphaSquared = alpha * alpha;\n            vec3 upDirection = xyz_type.xyz;\n            vec3 luminanceAbove = rgb_parameter.rgb;\n            vec3 luminanceBelow = rgb_parameter.a * luminanceAbove;\n            vec3 crossProduct = cross(normalDirection, directionToCamera);\n            float crossMagnitude = length(crossProduct);\n            vec3 xDirection = vec3(0.0, 0.0, 0.0);\n            vec3 yDirection = vec3(0.0, 0.0, 0.0);\n            if (crossMagnitude > 1.0e-6) {\n                yDirection = (1.0 / crossMagnitude) * crossProduct;\n                xDirection = cross(yDirection, normalDirection);\n            } else {\n                vec3 viewY = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);\n                xDirection = normalize(cross(viewY, normalDirection));\n                yDirection = cross(normalDirection, xDirection);\n            }\n            float localViewX = dot(directionToCamera, xDirection);\n            float localViewZ = dot(directionToCamera, normalDirection);\n            vec3 localViewDirection = vec3(localViewX, 0, localViewZ);\n            float localUpX = dot(upDirection, xDirection);\n            float localUpY = dot(upDirection, yDirection);\n            float localUpZ = dot(upDirection, normalDirection);\n            vec3 localUpDirection = vec3(localUpX, localUpY, localUpZ);\n        \n            vec3 vH = normalize(vec3(alpha * localViewX, 0.0, localViewZ));\n            vec3 vT1 = vec3(0.0, 1.0, 0.0);\n            vec3 vT2 = cross(vH, vT1);\n            float s = 0.5 * (1.0 + vH.z);\n            \n            vec3 localHalfDirection = sampleFacetNormal(vH, vT1, vT2, s, alpha);\n            vec3 localLightDirection = vec3(0.0, 0.0, 0.0);\n            \n            localLightDirection = -reflect(localViewDirection, localHalfDirection);\n            vec3 specular = softLightingSpecularSample(luminanceAbove, luminanceBelow, localUpDirection, localViewDirection, localLightDirection, localHalfDirection, alphaSquared, specularBaseColor);\n            \n            localLightDirection = vec3(0.000000, 0.000000, 1.000000);\n            vec3 diffuse = softLightingLuminance(luminanceAbove, luminanceBelow, localUpDirection, localLightDirection) * localLightDirection.z;\n            \n            return specular + diffuse * diffuseBaseColor;\n        }\n        \n        vec3 physicalLight(\n            vec4 xyz_type,\n            vec4 rgb_parameter,\n            vec3 surfacePosition,\n            vec3 normalDirection,\n            vec3 directionToCamera,\n            vec3 viewY,\n            float dotNV,\n            vec3 diffuseBaseColor,\n            vec3 specularBaseColor,\n            float alpha\n        ) {\n            float lightType = xyz_type.w;\n            if (lightType == kDisabledLight) {\n                return vec3(0.0, 0.0, 0.0);\n            } else if (lightType == kSoftLighting) {\n                return softLighting(normalDirection, diffuseBaseColor, specularBaseColor, alpha, directionToCamera, viewY, xyz_type, rgb_parameter);\n            }\n        \n            vec3 directionToLight = vec3(0.0, 0.0, 0.0);\n            vec3 normalIlluminance = vec3(0.0, 0.0, 0.0);\n            getDirectionToLightAndNormalIlluminance(xyz_type, rgb_parameter, surfacePosition, directionToLight, normalIlluminance);\n        \n            float dotNL = positiveDotProduct(normalDirection, directionToLight);\n            vec3 specularColor = brdf(normalDirection, directionToCamera, directionToLight, alpha, dotNV, dotNL, specularBaseColor, normalIlluminance);\n            return (normalIlluminance * dotNL) * ((diffuseBaseColor / kPi) + specularColor);\n        }\n        \n        vec3 physicalLighting(\n            vec3 surfacePosition,\n            vec3 surfaceNormal,\n            vec3 baseColor,\n            vec3 directionToCamera,\n            mat4 viewMatrix,\n            float roughness,\n            float metallic,\n            mat4 lights12,\n            mat4 lights34,\n            mat4 lights56,\n            mat4 lights78,\n            vec4 enabledLights\n        ) {\n            float dotNV = positiveDotProduct(surfaceNormal, directionToCamera);\n            float alpha = roughness * roughness;\n            float nonmetallic = 1.0 - metallic;\n            vec3 diffuseBaseColor = nonmetallic * 0.96 * baseColor;\n            vec3 specularBaseColor = nonmetallic * 0.04 * vec3(1.0, 1.0, 1.0) + metallic * baseColor;\n            vec3 viewY = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);\n        \n            vec3 litColor1 = enabledLights[0] == 1.0 ? physicalLight(lights12[0], lights12[1], surfacePosition, surfaceNormal, directionToCamera, viewY, dotNV, diffuseBaseColor, specularBaseColor, alpha) : vec3(0.0, 0.0, 0.0);\n            vec3 litColor2 = enabledLights[1] == 1.0 ? physicalLight(lights12[2], lights12[3], surfacePosition, surfaceNormal, directionToCamera, viewY, dotNV, diffuseBaseColor, specularBaseColor, alpha) : vec3(0.0, 0.0, 0.0);\n            vec3 litColor3 = enabledLights[2] == 1.0 ? physicalLight(lights34[0], lights34[1], surfacePosition, surfaceNormal, directionToCamera, viewY, dotNV, diffuseBaseColor, specularBaseColor, alpha) : vec3(0.0, 0.0, 0.0);\n            vec3 litColor4 = enabledLights[3] == 1.0 ? physicalLight(lights34[2], lights34[3], surfacePosition, surfaceNormal, directionToCamera, viewY, dotNV, diffuseBaseColor, specularBaseColor, alpha) : vec3(0.0, 0.0, 0.0);\n            vec3 litColor5 = physicalLight(lights56[0], lights56[1], surfacePosition, surfaceNormal, directionToCamera, viewY, dotNV, diffuseBaseColor, specularBaseColor, alpha);\n            vec3 litColor6 = physicalLight(lights56[2], lights56[3], surfacePosition, surfaceNormal, directionToCamera, viewY, dotNV, diffuseBaseColor, specularBaseColor, alpha);\n            vec3 litColor7 = physicalLight(lights78[0], lights78[1], surfacePosition, surfaceNormal, directionToCamera, viewY, dotNV, diffuseBaseColor, specularBaseColor, alpha);\n            vec3 litColor8 = physicalLight(lights78[2], lights78[3], surfacePosition, surfaceNormal, directionToCamera, viewY, dotNV, diffuseBaseColor, specularBaseColor, alpha);\n            return litColor1 + litColor2 + litColor3 + litColor4 + litColor5 + litColor6 + litColor7 + litColor8;\n        }\n        \n        float gammaCorrect(float u) {\n            if (u <= 0.0031308) {\n                return 12.92 * u;\n            } else {\n                return 1.055 * pow(u, 1.0 / 2.4) - 0.055;\n            }\n        }\n        \n        vec3 gammaCorrectedColor(vec3 color) {\n            float red = gammaCorrect(color.r);\n            float green = gammaCorrect(color.g);\n            float blue = gammaCorrect(color.b);\n            return vec3(red, green, blue);\n        }\n        \n        vec3 reinhardLuminanceToneMap(vec3 color) {\n            float luminance = 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;\n            float scale = 1.0 / (1.0 + luminance);\n            return gammaCorrectedColor(color * scale);\n        }\n        \n        vec3 reinhardPerChannelToneMap(vec3 color) {\n            return gammaCorrectedColor(color / (color + 1.0));\n        }\n        \n        float extendedReinhardToneMap(float x, float xMax) {\n            return x * (1.0 + (x / (xMax * xMax))) / (1.0 + x);\n        }\n        \n        vec3 extendedReinhardLuminanceToneMap(vec3 color, float overexposureLimit) {\n            float luminance = 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;\n            float scaledLuminance = extendedReinhardToneMap(luminance, overexposureLimit);\n            float scale = scaledLuminance / luminance;\n            return gammaCorrectedColor(color * scale);\n        }\n        \n        vec3 extendedReinhardPerChannelToneMap(vec3 color, float overexposureLimit) {\n            float red = extendedReinhardToneMap(color.r, overexposureLimit);\n            float green = extendedReinhardToneMap(color.g, overexposureLimit);\n            float blue = extendedReinhardToneMap(color.b, overexposureLimit);\n            return gammaCorrectedColor(vec3(red, green, blue));\n        }\n        \n        vec3 hableFilmicHelper(vec3 color) {\n            float a = 0.15;\n            float b = 0.5;\n            float c = 0.1;\n            float d = 0.2;\n            float e = 0.02;\n            float f = 0.3;\n            return (color * (a * color + c * b) + d * e) / (color * (a * color + b) + d * f) - e / f;\n        }\n        \n        vec3 hableFilmicToneMap(vec3 color) {\n            float exposureBias = 2.0;\n            vec3 unscaled = hableFilmicHelper(exposureBias * color);\n            vec3 scale = 1.0 / hableFilmicHelper(vec3(11.2));\n            return gammaCorrectedColor(scale * unscaled);\n        }\n        \n        vec3 toneMap(vec3 color, float toneMapType, float toneMapParam) {\n            if (toneMapType == 0.0) {\n                return gammaCorrectedColor(color);\n            } else if (toneMapType == 1.0) {\n                return reinhardLuminanceToneMap(color);\n            } else if (toneMapType == 2.0) {\n                return reinhardPerChannelToneMap(color);\n            } else if (toneMapType == 3.0) {\n                return extendedReinhardLuminanceToneMap(color, toneMapParam);\n            } else if (toneMapType == 4.0) {\n                return extendedReinhardPerChannelToneMap(color, toneMapParam);\n            } else if (toneMapType == 5.0) {\n                return hableFilmicToneMap(color);\n            } else {\n                return vec3(0.0, 0.0, 0.0);\n            }\n        }\n        \n        vec4 toSrgb(vec3 linearColor, mat4 sceneProperties) {\n            vec3 referenceWhite = sceneProperties[2].rgb;\n            float unitR = linearColor.r / referenceWhite.r;\n            float unitG = linearColor.g / referenceWhite.g;\n            float unitB = linearColor.b / referenceWhite.b;\n            float toneMapType = sceneProperties[3][2];\n            float toneMapParam = sceneProperties[3][3];\n            vec3 toneMapped = toneMap(vec3(unitR, unitG, unitB), toneMapType, toneMapParam);\n            return vec4(toneMapped, 1.0);\n        }\n        \n        void main() {\n            vec3 normalDirection = normalize(interpolatedNormal) * getNormalSign();\n            vec3 directionToCamera = getDirectionToCamera(interpolatedPosition, sceneProperties);\n        \n            vec3 linearColor = physicalLighting(\n                interpolatedPosition,\n                normalDirection,\n                baseColor,\n                directionToCamera,\n                viewMatrix,\n                roughness,\n                metallic,\n                lights12,\n                lights34,\n                lights56,\n                lights78,\n                enabledLights\n            );\n        \n            gl_FragColor = toSrgb(linearColor, sceneProperties);\n        }\n    ',
	attributes: {},
	uniforms: {baseColor: 'cC', enabledLights: 'W', lights12: 'bE', lights34: 'cc', lights56: 'cd', lights78: 'ce', metallic: 'cY', roughness: 'dh', sceneProperties: 'g', viewMatrix: 'h'}
};
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$physicalMesh = F6(
	function (color, roughness, metallic, bounds, webGLMesh, backFaceSetting) {
		return A2(
			$ianmackenzie$elm_3d_scene$Scene3d$Types$MeshNode,
			bounds,
			F8(
				function (sceneProperties, modelScale, modelMatrix, isRightHanded, viewMatrix, projectionMatrix, _v0, settings) {
					var lights = _v0.a;
					var enabledLights = _v0.b;
					return A5(
						$elm_explorations$webgl$WebGL$entityWith,
						A3($ianmackenzie$elm_3d_scene$Scene3d$Entity$meshSettings, isRightHanded, backFaceSetting, settings),
						$ianmackenzie$elm_3d_scene$Scene3d$UnoptimizedShaders$uniformVertex,
						$ianmackenzie$elm_3d_scene$Scene3d$UnoptimizedShaders$physicalFragment,
						webGLMesh,
						{cC: color, W: enabledLights, bE: lights.bE, cc: lights.cc, cd: lights.cd, ce: lights.ce, cY: metallic, d: modelMatrix, e: modelScale, f: projectionMatrix, dh: roughness, g: sceneProperties, h: viewMatrix});
				}));
	});
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$ConstantLambertianMaterial = function (a) {
	return {$: 0, a: a};
};
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$TexturedLambertianMaterial = F2(
	function (a, b) {
		return {$: 1, a: a, b: b};
	});
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$normalMapTuple = F2(
	function (fallbackData, channel) {
		if (!channel.$) {
			var _v1 = channel.a;
			return _Utils_Tuple2(fallbackData, 0.0);
		} else {
			var data = channel.a.H;
			return _Utils_Tuple2(data, 1.0);
		}
	});
var $elm_explorations$linear_algebra$Math$Vector4$vec4 = _MJS_v4;
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$enabledVec3 = function (vector) {
	return A4(
		$elm_explorations$linear_algebra$Math$Vector4$vec4,
		$elm_explorations$linear_algebra$Math$Vector3$getX(vector),
		$elm_explorations$linear_algebra$Math$Vector3$getY(vector),
		$elm_explorations$linear_algebra$Math$Vector3$getZ(vector),
		1);
};
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$zeroVec4 = A4($elm_explorations$linear_algebra$Math$Vector4$vec4, 0, 0, 0, 0);
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$vec3Tuple = F2(
	function (fallbackData, texture) {
		if (!texture.$) {
			var baseColor = texture.a;
			return _Utils_Tuple2(
				fallbackData,
				$ianmackenzie$elm_3d_scene$Scene3d$Entity$enabledVec3(baseColor));
		} else {
			var data = texture.a.H;
			return _Utils_Tuple2(data, $ianmackenzie$elm_3d_scene$Scene3d$Entity$zeroVec4);
		}
	});
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$resolveLambertian = F2(
	function (materialColorTexture, normalMapTexture) {
		var _v0 = _Utils_Tuple2(materialColorTexture, normalMapTexture);
		if (!_v0.a.$) {
			if (!_v0.b.$) {
				var materialColor = _v0.a.a;
				var _v1 = _v0.b.a;
				return $ianmackenzie$elm_3d_scene$Scene3d$Entity$ConstantLambertianMaterial(materialColor);
			} else {
				var data = _v0.b.a.H;
				return A2(
					$ianmackenzie$elm_3d_scene$Scene3d$Entity$TexturedLambertianMaterial,
					A2($ianmackenzie$elm_3d_scene$Scene3d$Entity$vec3Tuple, data, materialColorTexture),
					A2($ianmackenzie$elm_3d_scene$Scene3d$Entity$normalMapTuple, data, normalMapTexture));
			}
		} else {
			var data = _v0.a.a.H;
			return A2(
				$ianmackenzie$elm_3d_scene$Scene3d$Entity$TexturedLambertianMaterial,
				_Utils_Tuple2(data, $ianmackenzie$elm_3d_scene$Scene3d$Entity$zeroVec4),
				A2($ianmackenzie$elm_3d_scene$Scene3d$Entity$normalMapTuple, data, normalMapTexture));
		}
	});
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$ConstantPbrMaterial = F3(
	function (a, b, c) {
		return {$: 0, a: a, b: b, c: c};
	});
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$TexturedPbrMaterial = F4(
	function (a, b, c, d) {
		return {$: 1, a: a, b: b, c: c, d: d};
	});
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$Tuple4 = F4(
	function (a, b, c, d) {
		return {$: 0, a: a, b: b, c: c, d: d};
	});
var $elm_explorations$linear_algebra$Math$Vector2$vec2 = _MJS_v2;
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$enabledFloat = function (value) {
	return A2($elm_explorations$linear_algebra$Math$Vector2$vec2, value, 1);
};
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$zeroVec2 = A2($elm_explorations$linear_algebra$Math$Vector2$vec2, 0, 0);
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$floatTuple = F2(
	function (fallbackData, texture) {
		if (!texture.$) {
			var value = texture.a;
			return _Utils_Tuple2(
				fallbackData,
				$ianmackenzie$elm_3d_scene$Scene3d$Entity$enabledFloat(value));
		} else {
			var data = texture.a.H;
			return _Utils_Tuple2(data, $ianmackenzie$elm_3d_scene$Scene3d$Entity$zeroVec2);
		}
	});
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$resolvePbr = F4(
	function (baseColorTexture, roughnessTexture, metallicTexture, normalMapTexture) {
		var _v0 = A4($ianmackenzie$elm_3d_scene$Scene3d$Entity$Tuple4, baseColorTexture, roughnessTexture, metallicTexture, normalMapTexture);
		if (!_v0.a.$) {
			if (!_v0.b.$) {
				if (!_v0.c.$) {
					if (!_v0.d.$) {
						var baseColor = _v0.a.a;
						var roughness = _v0.b.a;
						var metallic = _v0.c.a;
						var _v1 = _v0.d.a;
						return A3($ianmackenzie$elm_3d_scene$Scene3d$Entity$ConstantPbrMaterial, baseColor, roughness, metallic);
					} else {
						var data = _v0.d.a.H;
						return A4(
							$ianmackenzie$elm_3d_scene$Scene3d$Entity$TexturedPbrMaterial,
							A2($ianmackenzie$elm_3d_scene$Scene3d$Entity$vec3Tuple, data, baseColorTexture),
							A2($ianmackenzie$elm_3d_scene$Scene3d$Entity$floatTuple, data, roughnessTexture),
							A2($ianmackenzie$elm_3d_scene$Scene3d$Entity$floatTuple, data, metallicTexture),
							_Utils_Tuple2(data, 1.0));
					}
				} else {
					var data = _v0.c.a.H;
					return A4(
						$ianmackenzie$elm_3d_scene$Scene3d$Entity$TexturedPbrMaterial,
						A2($ianmackenzie$elm_3d_scene$Scene3d$Entity$vec3Tuple, data, baseColorTexture),
						A2($ianmackenzie$elm_3d_scene$Scene3d$Entity$floatTuple, data, roughnessTexture),
						_Utils_Tuple2(data, $ianmackenzie$elm_3d_scene$Scene3d$Entity$zeroVec2),
						A2($ianmackenzie$elm_3d_scene$Scene3d$Entity$normalMapTuple, data, normalMapTexture));
				}
			} else {
				var data = _v0.b.a.H;
				return A4(
					$ianmackenzie$elm_3d_scene$Scene3d$Entity$TexturedPbrMaterial,
					A2($ianmackenzie$elm_3d_scene$Scene3d$Entity$vec3Tuple, data, baseColorTexture),
					_Utils_Tuple2(data, $ianmackenzie$elm_3d_scene$Scene3d$Entity$zeroVec2),
					A2($ianmackenzie$elm_3d_scene$Scene3d$Entity$floatTuple, data, metallicTexture),
					A2($ianmackenzie$elm_3d_scene$Scene3d$Entity$normalMapTuple, data, normalMapTexture));
			}
		} else {
			var data = _v0.a.a.H;
			return A4(
				$ianmackenzie$elm_3d_scene$Scene3d$Entity$TexturedPbrMaterial,
				_Utils_Tuple2(data, $ianmackenzie$elm_3d_scene$Scene3d$Entity$zeroVec4),
				A2($ianmackenzie$elm_3d_scene$Scene3d$Entity$floatTuple, data, roughnessTexture),
				A2($ianmackenzie$elm_3d_scene$Scene3d$Entity$floatTuple, data, metallicTexture),
				A2($ianmackenzie$elm_3d_scene$Scene3d$Entity$normalMapTuple, data, normalMapTexture));
		}
	});
var $ianmackenzie$elm_3d_scene$Scene3d$UnoptimizedShaders$emissiveTextureFragment = {
	src: '\n        precision mediump float;\n        \n        uniform mediump sampler2D colorTexture;\n        uniform mediump float backlight;\n        uniform highp mat4 sceneProperties;\n        \n        varying mediump vec2 interpolatedUv;\n        \n        float inverseGamma(float u) {\n            if (u <= 0.04045) {\n                return clamp(u / 12.92, 0.0, 1.0);\n            } else {\n                return clamp(pow((u + 0.055) / 1.055, 2.4), 0.0, 1.0);\n            }\n        }\n        \n        vec3 fromSrgb(vec3 srgbColor) {\n            return vec3(\n                inverseGamma(srgbColor.r),\n                inverseGamma(srgbColor.g),\n                inverseGamma(srgbColor.b)\n            );\n        }\n        \n        float gammaCorrect(float u) {\n            if (u <= 0.0031308) {\n                return 12.92 * u;\n            } else {\n                return 1.055 * pow(u, 1.0 / 2.4) - 0.055;\n            }\n        }\n        \n        vec3 gammaCorrectedColor(vec3 color) {\n            float red = gammaCorrect(color.r);\n            float green = gammaCorrect(color.g);\n            float blue = gammaCorrect(color.b);\n            return vec3(red, green, blue);\n        }\n        \n        vec3 reinhardLuminanceToneMap(vec3 color) {\n            float luminance = 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;\n            float scale = 1.0 / (1.0 + luminance);\n            return gammaCorrectedColor(color * scale);\n        }\n        \n        vec3 reinhardPerChannelToneMap(vec3 color) {\n            return gammaCorrectedColor(color / (color + 1.0));\n        }\n        \n        float extendedReinhardToneMap(float x, float xMax) {\n            return x * (1.0 + (x / (xMax * xMax))) / (1.0 + x);\n        }\n        \n        vec3 extendedReinhardLuminanceToneMap(vec3 color, float overexposureLimit) {\n            float luminance = 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;\n            float scaledLuminance = extendedReinhardToneMap(luminance, overexposureLimit);\n            float scale = scaledLuminance / luminance;\n            return gammaCorrectedColor(color * scale);\n        }\n        \n        vec3 extendedReinhardPerChannelToneMap(vec3 color, float overexposureLimit) {\n            float red = extendedReinhardToneMap(color.r, overexposureLimit);\n            float green = extendedReinhardToneMap(color.g, overexposureLimit);\n            float blue = extendedReinhardToneMap(color.b, overexposureLimit);\n            return gammaCorrectedColor(vec3(red, green, blue));\n        }\n        \n        vec3 hableFilmicHelper(vec3 color) {\n            float a = 0.15;\n            float b = 0.5;\n            float c = 0.1;\n            float d = 0.2;\n            float e = 0.02;\n            float f = 0.3;\n            return (color * (a * color + c * b) + d * e) / (color * (a * color + b) + d * f) - e / f;\n        }\n        \n        vec3 hableFilmicToneMap(vec3 color) {\n            float exposureBias = 2.0;\n            vec3 unscaled = hableFilmicHelper(exposureBias * color);\n            vec3 scale = 1.0 / hableFilmicHelper(vec3(11.2));\n            return gammaCorrectedColor(scale * unscaled);\n        }\n        \n        vec3 toneMap(vec3 color, float toneMapType, float toneMapParam) {\n            if (toneMapType == 0.0) {\n                return gammaCorrectedColor(color);\n            } else if (toneMapType == 1.0) {\n                return reinhardLuminanceToneMap(color);\n            } else if (toneMapType == 2.0) {\n                return reinhardPerChannelToneMap(color);\n            } else if (toneMapType == 3.0) {\n                return extendedReinhardLuminanceToneMap(color, toneMapParam);\n            } else if (toneMapType == 4.0) {\n                return extendedReinhardPerChannelToneMap(color, toneMapParam);\n            } else if (toneMapType == 5.0) {\n                return hableFilmicToneMap(color);\n            } else {\n                return vec3(0.0, 0.0, 0.0);\n            }\n        }\n        \n        vec4 toSrgb(vec3 linearColor, mat4 sceneProperties) {\n            vec3 referenceWhite = sceneProperties[2].rgb;\n            float unitR = linearColor.r / referenceWhite.r;\n            float unitG = linearColor.g / referenceWhite.g;\n            float unitB = linearColor.b / referenceWhite.b;\n            float toneMapType = sceneProperties[3][2];\n            float toneMapParam = sceneProperties[3][3];\n            vec3 toneMapped = toneMap(vec3(unitR, unitG, unitB), toneMapType, toneMapParam);\n            return vec4(toneMapped, 1.0);\n        }\n        \n        void main () {\n            vec3 emissiveColor = fromSrgb(texture2D(colorTexture, interpolatedUv).rgb) * backlight;\n            gl_FragColor = toSrgb(emissiveColor, sceneProperties);\n        }\n    ',
	attributes: {},
	uniforms: {backlight: 'cA', colorTexture: 'b1', sceneProperties: 'g'}
};
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$texturedEmissiveMesh = F5(
	function (colorData, backlight, bounds, webGLMesh, backFaceSetting) {
		return A2(
			$ianmackenzie$elm_3d_scene$Scene3d$Types$MeshNode,
			bounds,
			F8(
				function (sceneProperties, modelScale, modelMatrix, isRightHanded, viewMatrix, projectionMatrix, lights, settings) {
					return A5(
						$elm_explorations$webgl$WebGL$entityWith,
						A3($ianmackenzie$elm_3d_scene$Scene3d$Entity$meshSettings, isRightHanded, backFaceSetting, settings),
						$ianmackenzie$elm_3d_scene$Scene3d$UnoptimizedShaders$unlitVertex,
						$ianmackenzie$elm_3d_scene$Scene3d$UnoptimizedShaders$emissiveTextureFragment,
						webGLMesh,
						{
							cA: $ianmackenzie$elm_units$Luminance$inNits(backlight),
							b1: colorData,
							d: modelMatrix,
							e: modelScale,
							f: projectionMatrix,
							g: sceneProperties,
							h: viewMatrix
						});
				}));
	});
var $ianmackenzie$elm_3d_scene$Scene3d$UnoptimizedShaders$texturedVertex = {
	src: '\n        precision highp float;\n        \n        attribute highp vec3 position;\n        attribute highp vec3 normal;\n        attribute mediump vec2 uv;\n        \n        uniform highp vec4 modelScale;\n        uniform highp mat4 modelMatrix;\n        uniform highp mat4 viewMatrix;\n        uniform highp mat4 projectionMatrix;\n        uniform highp mat4 sceneProperties;\n        \n        varying highp vec3 interpolatedPosition;\n        varying highp vec3 interpolatedNormal;\n        varying mediump vec2 interpolatedUv;\n        varying highp vec3 interpolatedTangent;\n        \n        vec4 getWorldPosition(vec3 modelPosition, vec4 modelScale, mat4 modelMatrix) {\n            vec4 scaledPosition = vec4(modelScale.xyz * modelPosition, 1.0);\n            return modelMatrix * scaledPosition;\n        }\n        \n        vec3 safeNormalize(vec3 vector) {\n            if (vector == vec3(0.0, 0.0, 0.0)) {\n                return vector;\n            } else {\n                return normalize(vector);\n            }\n        }\n        \n        vec3 getWorldNormal(vec3 modelNormal, vec4 modelScale, mat4 modelMatrix) {\n            vec3 normalScale = vec3(modelScale.w / modelScale.x, modelScale.w / modelScale.y, modelScale.w / modelScale.z);\n            return (modelMatrix * vec4(safeNormalize(normalScale * modelNormal), 0.0)).xyz;\n        }\n        \n        void main () {\n            vec4 worldPosition = getWorldPosition(position, modelScale, modelMatrix);\n            gl_Position = projectionMatrix * (viewMatrix * worldPosition);\n            interpolatedPosition = worldPosition.xyz;\n            interpolatedNormal = getWorldNormal(normal, modelScale, modelMatrix);\n            interpolatedUv = uv;\n            interpolatedTangent = vec3(0.0, 0.0, 0.0);\n        }\n    ',
	attributes: {normal: 's', position: 'cn', uv: 'P'},
	uniforms: {modelMatrix: 'd', modelScale: 'e', projectionMatrix: 'f', sceneProperties: 'g', viewMatrix: 'h'}
};
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$texturedLambertianMesh = F4(
	function (materialColorData, bounds, webGLMesh, backFaceSetting) {
		return A2(
			$ianmackenzie$elm_3d_scene$Scene3d$Types$MeshNode,
			bounds,
			F8(
				function (sceneProperties, modelScale, modelMatrix, isRightHanded, viewMatrix, projectionMatrix, _v0, settings) {
					var lights = _v0.a;
					var enabledLights = _v0.b;
					return A5(
						$elm_explorations$webgl$WebGL$entityWith,
						A3($ianmackenzie$elm_3d_scene$Scene3d$Entity$meshSettings, isRightHanded, backFaceSetting, settings),
						$ianmackenzie$elm_3d_scene$Scene3d$UnoptimizedShaders$texturedVertex,
						$ianmackenzie$elm_3d_scene$Scene3d$UnoptimizedShaders$lambertianTextureFragment,
						webGLMesh,
						{W: enabledLights, bE: lights.bE, cc: lights.cc, cd: lights.cd, ce: lights.ce, cW: materialColorData, d: modelMatrix, e: modelScale, bd: materialColorData, f: projectionMatrix, g: sceneProperties, bi: 0.0, h: viewMatrix});
				}));
	});
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$texturedPhysicalMesh = F9(
	function (baseColorData, constantBaseColor, roughnessData, constantRoughness, metallicData, constantMetallic, bounds, webGLMesh, backFaceSetting) {
		return A2(
			$ianmackenzie$elm_3d_scene$Scene3d$Types$MeshNode,
			bounds,
			F8(
				function (sceneProperties, modelScale, modelMatrix, isRightHanded, viewMatrix, projectionMatrix, _v0, settings) {
					var lights = _v0.a;
					var enabledLights = _v0.b;
					return A5(
						$elm_explorations$webgl$WebGL$entityWith,
						A3($ianmackenzie$elm_3d_scene$Scene3d$Entity$meshSettings, isRightHanded, backFaceSetting, settings),
						$ianmackenzie$elm_3d_scene$Scene3d$UnoptimizedShaders$texturedVertex,
						$ianmackenzie$elm_3d_scene$Scene3d$UnoptimizedShaders$physicalTexturesFragment,
						webGLMesh,
						{cD: baseColorData, cF: constantBaseColor, cG: constantMetallic, cH: constantRoughness, W: enabledLights, bE: lights.bE, cc: lights.cc, cd: lights.cd, ce: lights.ce, cZ: metallicData, d: modelMatrix, e: modelScale, bd: baseColorData, f: projectionMatrix, di: roughnessData, g: sceneProperties, bi: 0.0, h: viewMatrix});
				}));
	});
var $ianmackenzie$elm_units$Quantity$interpolateFrom = F3(
	function (_v0, _v1, parameter) {
		var start = _v0;
		var end = _v1;
		return (parameter <= 0.5) ? (start + (parameter * (end - start))) : (end + ((1 - parameter) * (start - end)));
	});
var $ianmackenzie$elm_geometry$BoundingBox3d$midX = function (_v0) {
	var boundingBox = _v0;
	return A3($ianmackenzie$elm_units$Quantity$interpolateFrom, boundingBox.eb, boundingBox.d8, 0.5);
};
var $ianmackenzie$elm_geometry$BoundingBox3d$midY = function (_v0) {
	var boundingBox = _v0;
	return A3($ianmackenzie$elm_units$Quantity$interpolateFrom, boundingBox.ec, boundingBox.d9, 0.5);
};
var $ianmackenzie$elm_geometry$BoundingBox3d$midZ = function (_v0) {
	var boundingBox = _v0;
	return A3($ianmackenzie$elm_units$Quantity$interpolateFrom, boundingBox.ed, boundingBox.ea, 0.5);
};
var $ianmackenzie$elm_geometry$BoundingBox3d$centerPoint = function (boundingBox) {
	return A3(
		$ianmackenzie$elm_geometry$Point3d$xyz,
		$ianmackenzie$elm_geometry$BoundingBox3d$midX(boundingBox),
		$ianmackenzie$elm_geometry$BoundingBox3d$midY(boundingBox),
		$ianmackenzie$elm_geometry$BoundingBox3d$midZ(boundingBox));
};
var $ianmackenzie$elm_geometry$BoundingBox3d$maxX = function (_v0) {
	var boundingBox = _v0;
	return boundingBox.d8;
};
var $ianmackenzie$elm_geometry$BoundingBox3d$maxY = function (_v0) {
	var boundingBox = _v0;
	return boundingBox.d9;
};
var $ianmackenzie$elm_geometry$BoundingBox3d$maxZ = function (_v0) {
	var boundingBox = _v0;
	return boundingBox.ea;
};
var $ianmackenzie$elm_geometry$BoundingBox3d$minX = function (_v0) {
	var boundingBox = _v0;
	return boundingBox.eb;
};
var $ianmackenzie$elm_geometry$BoundingBox3d$minY = function (_v0) {
	var boundingBox = _v0;
	return boundingBox.ec;
};
var $ianmackenzie$elm_geometry$BoundingBox3d$minZ = function (_v0) {
	var boundingBox = _v0;
	return boundingBox.ed;
};
var $ianmackenzie$elm_geometry$BoundingBox3d$dimensions = function (boundingBox) {
	return _Utils_Tuple3(
		A2(
			$ianmackenzie$elm_units$Quantity$minus,
			$ianmackenzie$elm_geometry$BoundingBox3d$minX(boundingBox),
			$ianmackenzie$elm_geometry$BoundingBox3d$maxX(boundingBox)),
		A2(
			$ianmackenzie$elm_units$Quantity$minus,
			$ianmackenzie$elm_geometry$BoundingBox3d$minY(boundingBox),
			$ianmackenzie$elm_geometry$BoundingBox3d$maxY(boundingBox)),
		A2(
			$ianmackenzie$elm_units$Quantity$minus,
			$ianmackenzie$elm_geometry$BoundingBox3d$minZ(boundingBox),
			$ianmackenzie$elm_geometry$BoundingBox3d$maxZ(boundingBox)));
};
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$toBounds = function (boundingBox) {
	var _v0 = $ianmackenzie$elm_geometry$BoundingBox3d$dimensions(boundingBox);
	var xDimension = _v0.a;
	var yDimension = _v0.b;
	var zDimension = _v0.c;
	return {
		eV: $ianmackenzie$elm_geometry$Point3d$unwrap(
			$ianmackenzie$elm_geometry$BoundingBox3d$centerPoint(boundingBox)),
		fc: xDimension / 2,
		fd: yDimension / 2,
		fe: zDimension / 2
	};
};
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$mesh = F2(
	function (givenMaterial, givenMesh) {
		switch (givenMaterial.$) {
			case 0:
				if (!givenMaterial.b.$) {
					var color = givenMaterial.b.a;
					switch (givenMesh.$) {
						case 0:
							return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
						case 1:
							var boundingBox = givenMesh.a;
							var webGLMesh = givenMesh.c;
							var backFaceSetting = givenMesh.d;
							return A4(
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$constantMesh,
								color,
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$toBounds(boundingBox),
								webGLMesh,
								backFaceSetting);
						case 2:
							var boundingBox = givenMesh.a;
							var webGLMesh = givenMesh.c;
							var backFaceSetting = givenMesh.d;
							return A4(
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$constantMesh,
								color,
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$toBounds(boundingBox),
								webGLMesh,
								backFaceSetting);
						case 3:
							var boundingBox = givenMesh.a;
							var webGLMesh = givenMesh.c;
							var backFaceSetting = givenMesh.d;
							return A4(
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$constantMesh,
								color,
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$toBounds(boundingBox),
								webGLMesh,
								backFaceSetting);
						case 4:
							var boundingBox = givenMesh.a;
							var webGLMesh = givenMesh.c;
							var backFaceSetting = givenMesh.d;
							return A4(
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$constantMesh,
								color,
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$toBounds(boundingBox),
								webGLMesh,
								backFaceSetting);
						case 5:
							var boundingBox = givenMesh.a;
							var webGLMesh = givenMesh.c;
							var backFaceSetting = givenMesh.d;
							return A4(
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$constantMesh,
								color,
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$toBounds(boundingBox),
								webGLMesh,
								backFaceSetting);
						case 6:
							var boundingBox = givenMesh.a;
							var webGLMesh = givenMesh.c;
							var backFaceSetting = givenMesh.d;
							return A4(
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$constantMesh,
								color,
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$toBounds(boundingBox),
								webGLMesh,
								backFaceSetting);
						case 7:
							var boundingBox = givenMesh.a;
							var webGLMesh = givenMesh.c;
							var backFaceSetting = givenMesh.d;
							return A4(
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$constantMesh,
								color,
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$toBounds(boundingBox),
								webGLMesh,
								backFaceSetting);
						case 8:
							var boundingBox = givenMesh.a;
							var webGLMesh = givenMesh.c;
							return A4(
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$constantMesh,
								color,
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$toBounds(boundingBox),
								webGLMesh,
								0);
						case 9:
							var boundingBox = givenMesh.a;
							var webGLMesh = givenMesh.c;
							return A4(
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$constantMesh,
								color,
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$toBounds(boundingBox),
								webGLMesh,
								0);
						default:
							var boundingBox = givenMesh.a;
							var radius = givenMesh.b;
							var webGLMesh = givenMesh.d;
							return A4(
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$constantPointMesh,
								color,
								radius,
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$toBounds(boundingBox),
								webGLMesh);
					}
				} else {
					var _v2 = givenMaterial.a;
					var data = givenMaterial.b.a.H;
					switch (givenMesh.$) {
						case 0:
							return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
						case 1:
							return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
						case 2:
							return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
						case 3:
							return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
						case 4:
							return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
						case 5:
							var boundingBox = givenMesh.a;
							var webGLMesh = givenMesh.c;
							var backFaceSetting = givenMesh.d;
							return A4(
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$colorTextureMesh,
								data,
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$toBounds(boundingBox),
								webGLMesh,
								backFaceSetting);
						case 6:
							var boundingBox = givenMesh.a;
							var webGLMesh = givenMesh.c;
							var backFaceSetting = givenMesh.d;
							return A4(
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$colorTextureMesh,
								data,
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$toBounds(boundingBox),
								webGLMesh,
								backFaceSetting);
						case 7:
							var boundingBox = givenMesh.a;
							var webGLMesh = givenMesh.c;
							var backFaceSetting = givenMesh.d;
							return A4(
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$colorTextureMesh,
								data,
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$toBounds(boundingBox),
								webGLMesh,
								backFaceSetting);
						case 8:
							return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
						case 9:
							return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
						default:
							return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
					}
				}
			case 1:
				if (!givenMaterial.b.$) {
					var emissiveColor = givenMaterial.b.a;
					var backlight = givenMaterial.c;
					switch (givenMesh.$) {
						case 0:
							return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
						case 1:
							var boundingBox = givenMesh.a;
							var webGLMesh = givenMesh.c;
							var backFaceSetting = givenMesh.d;
							return A5(
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$emissiveMesh,
								emissiveColor,
								backlight,
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$toBounds(boundingBox),
								webGLMesh,
								backFaceSetting);
						case 2:
							var boundingBox = givenMesh.a;
							var webGLMesh = givenMesh.c;
							var backFaceSetting = givenMesh.d;
							return A5(
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$emissiveMesh,
								emissiveColor,
								backlight,
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$toBounds(boundingBox),
								webGLMesh,
								backFaceSetting);
						case 3:
							var boundingBox = givenMesh.a;
							var webGLMesh = givenMesh.c;
							var backFaceSetting = givenMesh.d;
							return A5(
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$emissiveMesh,
								emissiveColor,
								backlight,
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$toBounds(boundingBox),
								webGLMesh,
								backFaceSetting);
						case 4:
							var boundingBox = givenMesh.a;
							var webGLMesh = givenMesh.c;
							var backFaceSetting = givenMesh.d;
							return A5(
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$emissiveMesh,
								emissiveColor,
								backlight,
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$toBounds(boundingBox),
								webGLMesh,
								backFaceSetting);
						case 5:
							var boundingBox = givenMesh.a;
							var webGLMesh = givenMesh.c;
							var backFaceSetting = givenMesh.d;
							return A5(
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$emissiveMesh,
								emissiveColor,
								backlight,
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$toBounds(boundingBox),
								webGLMesh,
								backFaceSetting);
						case 6:
							var boundingBox = givenMesh.a;
							var webGLMesh = givenMesh.c;
							var backFaceSetting = givenMesh.d;
							return A5(
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$emissiveMesh,
								emissiveColor,
								backlight,
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$toBounds(boundingBox),
								webGLMesh,
								backFaceSetting);
						case 7:
							var boundingBox = givenMesh.a;
							var webGLMesh = givenMesh.c;
							var backFaceSetting = givenMesh.d;
							return A5(
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$emissiveMesh,
								emissiveColor,
								backlight,
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$toBounds(boundingBox),
								webGLMesh,
								backFaceSetting);
						case 8:
							var boundingBox = givenMesh.a;
							var webGLMesh = givenMesh.c;
							return A5(
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$emissiveMesh,
								emissiveColor,
								backlight,
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$toBounds(boundingBox),
								webGLMesh,
								0);
						case 9:
							var boundingBox = givenMesh.a;
							var webGLMesh = givenMesh.c;
							return A5(
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$emissiveMesh,
								emissiveColor,
								backlight,
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$toBounds(boundingBox),
								webGLMesh,
								0);
						default:
							var boundingBox = givenMesh.a;
							var radius = givenMesh.b;
							var webGLMesh = givenMesh.d;
							return A5(
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$emissivePointMesh,
								emissiveColor,
								backlight,
								radius,
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$toBounds(boundingBox),
								webGLMesh);
					}
				} else {
					var _v5 = givenMaterial.a;
					var data = givenMaterial.b.a.H;
					var backlight = givenMaterial.c;
					switch (givenMesh.$) {
						case 0:
							return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
						case 1:
							return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
						case 2:
							return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
						case 3:
							return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
						case 4:
							return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
						case 5:
							var boundingBox = givenMesh.a;
							var webGLMesh = givenMesh.c;
							var backFaceSetting = givenMesh.d;
							return A5(
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$texturedEmissiveMesh,
								data,
								backlight,
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$toBounds(boundingBox),
								webGLMesh,
								backFaceSetting);
						case 6:
							var boundingBox = givenMesh.a;
							var webGLMesh = givenMesh.c;
							var backFaceSetting = givenMesh.d;
							return A5(
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$texturedEmissiveMesh,
								data,
								backlight,
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$toBounds(boundingBox),
								webGLMesh,
								backFaceSetting);
						case 7:
							var boundingBox = givenMesh.a;
							var webGLMesh = givenMesh.c;
							var backFaceSetting = givenMesh.d;
							return A5(
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$texturedEmissiveMesh,
								data,
								backlight,
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$toBounds(boundingBox),
								webGLMesh,
								backFaceSetting);
						case 8:
							return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
						case 9:
							return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
						default:
							return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
					}
				}
			case 2:
				var _v7 = givenMaterial.a;
				var materialColorTexture = givenMaterial.b;
				var normalMapTexture = givenMaterial.c;
				var _v8 = A2($ianmackenzie$elm_3d_scene$Scene3d$Entity$resolveLambertian, materialColorTexture, normalMapTexture);
				if (!_v8.$) {
					var materialColor = _v8.a;
					switch (givenMesh.$) {
						case 0:
							return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
						case 1:
							return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
						case 2:
							var boundingBox = givenMesh.a;
							var webGLMesh = givenMesh.c;
							var cullBackFaces = givenMesh.d;
							return A4(
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$lambertianMesh,
								materialColor,
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$toBounds(boundingBox),
								webGLMesh,
								cullBackFaces);
						case 3:
							return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
						case 4:
							var boundingBox = givenMesh.a;
							var webGLMesh = givenMesh.c;
							var cullBackFaces = givenMesh.d;
							return A4(
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$lambertianMesh,
								materialColor,
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$toBounds(boundingBox),
								webGLMesh,
								cullBackFaces);
						case 5:
							return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
						case 6:
							var boundingBox = givenMesh.a;
							var webGLMesh = givenMesh.c;
							var cullBackFaces = givenMesh.d;
							return A4(
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$lambertianMesh,
								materialColor,
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$toBounds(boundingBox),
								webGLMesh,
								cullBackFaces);
						case 7:
							var boundingBox = givenMesh.a;
							var webGLMesh = givenMesh.c;
							var cullBackFaces = givenMesh.d;
							return A4(
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$lambertianMesh,
								materialColor,
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$toBounds(boundingBox),
								webGLMesh,
								cullBackFaces);
						case 8:
							return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
						case 9:
							return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
						default:
							return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
					}
				} else {
					var _v10 = _v8.a;
					var materialColorData = _v10.a;
					var constantMaterialColor = _v10.b;
					var _v11 = _v8.b;
					var normalMapData = _v11.a;
					var useNormalMap = _v11.b;
					switch (givenMesh.$) {
						case 0:
							return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
						case 1:
							return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
						case 2:
							return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
						case 3:
							return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
						case 4:
							return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
						case 5:
							return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
						case 6:
							var boundingBox = givenMesh.a;
							var webGLMesh = givenMesh.c;
							var cullBackFaces = givenMesh.d;
							return A4(
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$texturedLambertianMesh,
								materialColorData,
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$toBounds(boundingBox),
								webGLMesh,
								cullBackFaces);
						case 7:
							var boundingBox = givenMesh.a;
							var webGLMesh = givenMesh.c;
							var cullBackFaces = givenMesh.d;
							return A6(
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$normalMappedLambertianMesh,
								materialColorData,
								normalMapData,
								useNormalMap,
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$toBounds(boundingBox),
								webGLMesh,
								cullBackFaces);
						case 8:
							return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
						case 9:
							return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
						default:
							return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
					}
				}
			default:
				var _v13 = givenMaterial.a;
				var baseColorTexture = givenMaterial.b;
				var roughnessTexture = givenMaterial.c;
				var metallicTexture = givenMaterial.d;
				var normalMapTexture = givenMaterial.e;
				var _v14 = A4($ianmackenzie$elm_3d_scene$Scene3d$Entity$resolvePbr, baseColorTexture, roughnessTexture, metallicTexture, normalMapTexture);
				if (!_v14.$) {
					var baseColor = _v14.a;
					var roughness = _v14.b;
					var metallic = _v14.c;
					switch (givenMesh.$) {
						case 0:
							return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
						case 1:
							return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
						case 2:
							var boundingBox = givenMesh.a;
							var webGLMesh = givenMesh.c;
							var backFaceSetting = givenMesh.d;
							return A6(
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$physicalMesh,
								baseColor,
								roughness,
								metallic,
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$toBounds(boundingBox),
								webGLMesh,
								backFaceSetting);
						case 3:
							return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
						case 4:
							var boundingBox = givenMesh.a;
							var webGLMesh = givenMesh.c;
							var backFaceSetting = givenMesh.d;
							return A6(
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$physicalMesh,
								baseColor,
								roughness,
								metallic,
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$toBounds(boundingBox),
								webGLMesh,
								backFaceSetting);
						case 5:
							return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
						case 6:
							var boundingBox = givenMesh.a;
							var webGLMesh = givenMesh.c;
							var backFaceSetting = givenMesh.d;
							return A6(
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$physicalMesh,
								baseColor,
								roughness,
								metallic,
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$toBounds(boundingBox),
								webGLMesh,
								backFaceSetting);
						case 7:
							var boundingBox = givenMesh.a;
							var webGLMesh = givenMesh.c;
							var backFaceSetting = givenMesh.d;
							return A6(
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$physicalMesh,
								baseColor,
								roughness,
								metallic,
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$toBounds(boundingBox),
								webGLMesh,
								backFaceSetting);
						case 8:
							return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
						case 9:
							return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
						default:
							return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
					}
				} else {
					var _v16 = _v14.a;
					var baseColorData = _v16.a;
					var constantBaseColor = _v16.b;
					var _v17 = _v14.b;
					var roughnessData = _v17.a;
					var constantRoughness = _v17.b;
					var _v18 = _v14.c;
					var metallicData = _v18.a;
					var constantMetallic = _v18.b;
					var _v19 = _v14.d;
					var normalMapData = _v19.a;
					var useNormalMap = _v19.b;
					switch (givenMesh.$) {
						case 0:
							return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
						case 1:
							return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
						case 2:
							return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
						case 3:
							return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
						case 4:
							return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
						case 5:
							return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
						case 6:
							var boundingBox = givenMesh.a;
							var webGLMesh = givenMesh.c;
							var backFaceSetting = givenMesh.d;
							return A9(
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$texturedPhysicalMesh,
								baseColorData,
								constantBaseColor,
								roughnessData,
								constantRoughness,
								metallicData,
								constantMetallic,
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$toBounds(boundingBox),
								webGLMesh,
								backFaceSetting);
						case 7:
							var boundingBox = givenMesh.a;
							var webGLMesh = givenMesh.c;
							var backFaceSetting = givenMesh.d;
							return $ianmackenzie$elm_3d_scene$Scene3d$Entity$normalMappedPhysicalMesh(baseColorData)(constantBaseColor)(roughnessData)(constantRoughness)(metallicData)(constantMetallic)(normalMapData)(useNormalMap)(
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$toBounds(boundingBox))(webGLMesh)(backFaceSetting);
						case 8:
							return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
						case 9:
							return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
						default:
							return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
					}
				}
		}
	});
var $ianmackenzie$elm_3d_scene$Scene3d$Types$ShadowNode = function (a) {
	return {$: 2, a: a};
};
var $ianmackenzie$elm_3d_scene$Scene3d$UnoptimizedShaders$shadowFragment = {
	src: '\n        precision lowp float;\n        \n        void main () {\n            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n        }\n    ',
	attributes: {},
	uniforms: {}
};
var $elm_explorations$webgl$WebGL$Settings$StencilTest$Test = $elm$core$Basics$identity;
var $elm_explorations$webgl$WebGL$Settings$StencilTest$always = 519;
var $elm_explorations$webgl$WebGL$Settings$StencilTest$Operation = $elm$core$Basics$identity;
var $elm_explorations$webgl$WebGL$Settings$StencilTest$decrement = 7683;
var $elm_explorations$webgl$WebGL$Settings$StencilTest$increment = 7682;
var $elm_explorations$webgl$WebGL$Settings$StencilTest$keep = 7680;
var $elm_explorations$webgl$WebGL$Internal$StencilTest = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return function (k) {
											return {$: 2, a: a, b: b, c: c, d: d, e: e, f: f, g: g, h: h, i: i, j: j, k: k};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var $elm_explorations$webgl$WebGL$Settings$StencilTest$testSeparate = F3(
	function (_v0, options1, options2) {
		var ref = _v0.de;
		var mask = _v0.cU;
		var writeMask = _v0.dq;
		var expandTest = F2(
			function (_v2, fn) {
				var expandedTest = _v2;
				return fn(expandedTest);
			});
		var expandOp = F2(
			function (_v1, fn) {
				var op = _v1;
				return fn(op);
			});
		var expand = function (options) {
			return A2(
				$elm$core$Basics$composeR,
				expandTest(options.bO),
				A2(
					$elm$core$Basics$composeR,
					expandOp(options.bv),
					A2(
						$elm$core$Basics$composeR,
						expandOp(options.bW),
						expandOp(options.bX))));
		};
		return A2(
			expand,
			options2,
			A2(
				expand,
				options1,
				A3($elm_explorations$webgl$WebGL$Internal$StencilTest, ref, mask, writeMask)));
	});
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$leftHandedStencilTest = A3(
	$elm_explorations$webgl$WebGL$Settings$StencilTest$testSeparate,
	{cU: 0, de: 0, dq: 15},
	{bv: $elm_explorations$webgl$WebGL$Settings$StencilTest$keep, bO: $elm_explorations$webgl$WebGL$Settings$StencilTest$always, bW: $elm_explorations$webgl$WebGL$Settings$StencilTest$keep, bX: $elm_explorations$webgl$WebGL$Settings$StencilTest$decrement},
	{bv: $elm_explorations$webgl$WebGL$Settings$StencilTest$keep, bO: $elm_explorations$webgl$WebGL$Settings$StencilTest$always, bW: $elm_explorations$webgl$WebGL$Settings$StencilTest$keep, bX: $elm_explorations$webgl$WebGL$Settings$StencilTest$increment});
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$rightHandedStencilTest = A3(
	$elm_explorations$webgl$WebGL$Settings$StencilTest$testSeparate,
	{cU: 0, de: 0, dq: 15},
	{bv: $elm_explorations$webgl$WebGL$Settings$StencilTest$keep, bO: $elm_explorations$webgl$WebGL$Settings$StencilTest$always, bW: $elm_explorations$webgl$WebGL$Settings$StencilTest$keep, bX: $elm_explorations$webgl$WebGL$Settings$StencilTest$increment},
	{bv: $elm_explorations$webgl$WebGL$Settings$StencilTest$keep, bO: $elm_explorations$webgl$WebGL$Settings$StencilTest$always, bW: $elm_explorations$webgl$WebGL$Settings$StencilTest$keep, bX: $elm_explorations$webgl$WebGL$Settings$StencilTest$decrement});
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$shadowSettings = F2(
	function (isRightHanded, settings) {
		return isRightHanded ? A2($elm$core$List$cons, $ianmackenzie$elm_3d_scene$Scene3d$Entity$rightHandedStencilTest, settings) : A2($elm$core$List$cons, $ianmackenzie$elm_3d_scene$Scene3d$Entity$leftHandedStencilTest, settings);
	});
var $ianmackenzie$elm_3d_scene$Scene3d$UnoptimizedShaders$shadowVertex = {
	src: '\n        precision highp float;\n        \n        attribute highp vec3 position;\n        attribute highp vec3 normal;\n        \n        uniform highp vec4 modelScale;\n        uniform highp mat4 modelMatrix;\n        uniform highp mat4 viewMatrix;\n        uniform highp mat4 projectionMatrix;\n        uniform highp mat4 sceneProperties;\n        uniform highp mat4 shadowLight;\n        \n        const lowp float kDirectionalLight = 1.0;\n        const lowp float kPointLight = 2.0;\n        \n        vec4 getWorldPosition(vec3 modelPosition, vec4 modelScale, mat4 modelMatrix) {\n            vec4 scaledPosition = vec4(modelScale.xyz * modelPosition, 1.0);\n            return modelMatrix * scaledPosition;\n        }\n        \n        vec3 safeNormalize(vec3 vector) {\n            if (vector == vec3(0.0, 0.0, 0.0)) {\n                return vector;\n            } else {\n                return normalize(vector);\n            }\n        }\n        \n        vec3 getWorldNormal(vec3 modelNormal, vec4 modelScale, mat4 modelMatrix) {\n            vec3 normalScale = vec3(modelScale.w / modelScale.x, modelScale.w / modelScale.y, modelScale.w / modelScale.z);\n            return (modelMatrix * vec4(safeNormalize(normalScale * modelNormal), 0.0)).xyz;\n        }\n        \n        vec3 getDirectionToLight(vec3 surfacePosition, vec4 xyz_type, vec4 rgb_parameter) {\n            float lightType = xyz_type.w;\n            if (lightType == kDirectionalLight) {\n                return xyz_type.xyz;\n            } else if (lightType == kPointLight) {\n                vec3 lightPosition = xyz_type.xyz;\n                return normalize(lightPosition - surfacePosition);\n            } else {\n                return vec3(0.0, 0.0, 0.0);\n            }\n        }\n        \n        vec4 shadowVertexPosition(vec3 position, vec3 normal, mat4 shadowLight, vec4 modelScale, mat4 modelMatrix, mat4 viewMatrix, mat4 projectionMatrix, mat4 sceneProperties) {\n            vec4 worldPosition = getWorldPosition(position, modelScale, modelMatrix);\n            vec3 worldNormal = getWorldNormal(normal, vec4(modelScale.xyz, 1.0), modelMatrix);\n            vec4 xyz_type = shadowLight[0];\n            vec4 rgb_parameter = shadowLight[1];\n            vec3 directionToLight = getDirectionToLight(worldPosition.xyz, xyz_type, rgb_parameter);\n            vec3 offset = vec3(0.0, 0.0, 0.0);\n            float sceneDiameter = sceneProperties[3][1];\n            if (dot(directionToLight, worldNormal) <= 0.0) {\n                offset = -sceneDiameter * directionToLight;\n            } else {\n                offset = -0.001 * sceneDiameter * directionToLight;\n            }\n            vec4 offsetPosition = worldPosition + vec4(offset, 0.0);\n            return projectionMatrix * (viewMatrix * offsetPosition);\n        }\n        \n        void main () {\n            gl_Position = shadowVertexPosition(\n                position,\n                normal,\n                shadowLight,\n                modelScale,\n                modelMatrix,\n                viewMatrix,\n                projectionMatrix,\n                sceneProperties\n            );\n        }\n    ',
	attributes: {normal: 's', position: 'cn'},
	uniforms: {modelMatrix: 'd', modelScale: 'e', projectionMatrix: 'f', sceneProperties: 'g', shadowLight: 'ct', viewMatrix: 'h'}
};
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$shadowDrawFunction = function (givenShadow) {
	if (!givenShadow.$) {
		return $elm$core$Maybe$Nothing;
	} else {
		var webGLMesh = givenShadow.c;
		return $elm$core$Maybe$Just(
			F8(
				function (sceneProperties, modelScale, modelMatrix, isRightHanded, viewMatrix, projectionMatrix, shadowLight, settings) {
					return A5(
						$elm_explorations$webgl$WebGL$entityWith,
						A2($ianmackenzie$elm_3d_scene$Scene3d$Entity$shadowSettings, isRightHanded, settings),
						$ianmackenzie$elm_3d_scene$Scene3d$UnoptimizedShaders$shadowVertex,
						$ianmackenzie$elm_3d_scene$Scene3d$UnoptimizedShaders$shadowFragment,
						webGLMesh,
						{d: modelMatrix, e: modelScale, f: projectionMatrix, g: sceneProperties, ct: shadowLight, h: viewMatrix});
				}));
	}
};
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$shadow = function (givenShadow) {
	var _v0 = $ianmackenzie$elm_3d_scene$Scene3d$Entity$shadowDrawFunction(givenShadow);
	if (!_v0.$) {
		var drawFunction = _v0.a;
		return $ianmackenzie$elm_3d_scene$Scene3d$Types$ShadowNode(drawFunction);
	} else {
		return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
	}
};
var $ianmackenzie$elm_3d_scene$Scene3d$meshWithShadow = F3(
	function (givenMaterial, givenMesh, givenShadow) {
		return $ianmackenzie$elm_3d_scene$Scene3d$group(
			_List_fromArray(
				[
					A2($ianmackenzie$elm_3d_scene$Scene3d$Entity$mesh, givenMaterial, givenMesh),
					$ianmackenzie$elm_3d_scene$Scene3d$Entity$shadow(givenShadow)
				]));
	});
var $elm$core$Platform$Cmd$batch = _Platform_batch;
var $elm$core$Platform$Cmd$none = $elm$core$Platform$Cmd$batch(_List_Nil);
var $Voronchuk$hexagons$Hexagons$Layout$precision = F2(
	function (division, number) {
		var k = A2($elm$core$Basics$pow, 10, division);
		return A2($elm$core$Basics$composeL, $elm$core$Basics$toFloat, $elm$core$Basics$round)(number * k) / k;
	});
var $Voronchuk$hexagons$Hexagons$Hex$q = function (a) {
	switch (a.$) {
		case 2:
			var _v1 = a.a;
			var a1 = _v1.a;
			var a2 = _v1.b;
			return a1;
		case 1:
			var _v2 = a.a;
			var a1 = _v2.a;
			var a2 = _v2.b;
			var a3 = _v2.c;
			return a1;
		default:
			var _v3 = a.a;
			var a1 = _v3.a;
			var a2 = _v3.b;
			var a3 = _v3.c;
			return a1;
	}
};
var $Voronchuk$hexagons$Hexagons$Hex$r = function (a) {
	switch (a.$) {
		case 2:
			var _v1 = a.a;
			var a1 = _v1.a;
			var a2 = _v1.b;
			return a2;
		case 1:
			var _v2 = a.a;
			var a1 = _v2.a;
			var a2 = _v2.b;
			var a3 = _v2.c;
			return a2;
		default:
			var _v3 = a.a;
			var a1 = _v3.a;
			var a2 = _v3.b;
			var a3 = _v3.c;
			return a2;
	}
};
var $Voronchuk$hexagons$Hexagons$Layout$hexToPoint = F2(
	function (layout, hex) {
		var r = $Voronchuk$hexagons$Hexagons$Hex$r(hex);
		var q = $Voronchuk$hexagons$Hexagons$Hex$q(hex);
		var _v0 = layout.fw;
		var xo = _v0.a;
		var yo = _v0.b;
		var _v1 = layout.fD;
		var xl = _v1.a;
		var yl = _v1.b;
		var _v2 = layout.fv.b5;
		var f0 = _v2.aO;
		var f1 = _v2.aP;
		var f2 = _v2.aQ;
		var f3 = _v2.aR;
		var x = A2($Voronchuk$hexagons$Hexagons$Layout$precision, 2, (((f0 * q) + (f1 * r)) * xl) + xo);
		var y = A2($Voronchuk$hexagons$Hexagons$Layout$precision, 2, (((f2 * q) + (f3 * r)) * yl) + yo);
		return _Utils_Tuple2(x, y);
	});
var $elm$core$Basics$sqrt = _Basics_sqrt;
var $Voronchuk$hexagons$Hexagons$Layout$orientationLayoutPointy = {
	b5: {
		aO: $elm$core$Basics$sqrt(3.0),
		aP: $elm$core$Basics$sqrt(3.0) / 2.0,
		aQ: 0.0,
		aR: 3.0 / 2.0
	},
	b9: {
		aO: $elm$core$Basics$sqrt(3.0) / 3.0,
		aP: (-1.0) / 3.0,
		aQ: 0.0,
		aR: 2.0 / 3.0
	},
	cu: 0.5
};
var $author$project$Main$gameHexToPoint = $Voronchuk$hexagons$Hexagons$Layout$hexToPoint(
	{
		fv: $Voronchuk$hexagons$Hexagons$Layout$orientationLayoutPointy,
		fw: _Utils_Tuple2(0, 0),
		fD: _Utils_Tuple2(1, 1)
	});
var $ianmackenzie$elm_float_extra$Float$Extra$interpolateFrom = F3(
	function (start, end, parameter) {
		return (parameter <= 0.5) ? (start + (parameter * (end - start))) : (end + ((1 - parameter) * (start - end)));
	});
var $author$project$Ecs$System$applyIf = F3(
	function (bool, f, world) {
		return bool ? f(world) : world;
	});
var $author$project$Ecs$Component$get = F2(
	function (_v0, _v1) {
		var id = _v0;
		var component = _v1;
		return A2($elm$core$Dict$get, id, component);
	});
var $elm$core$Dict$foldl = F3(
	function (func, acc, dict) {
		foldl:
		while (true) {
			if (dict.$ === -2) {
				return acc;
			} else {
				var key = dict.b;
				var value = dict.c;
				var left = dict.d;
				var right = dict.e;
				var $temp$func = func,
					$temp$acc = A3(
					func,
					key,
					value,
					A3($elm$core$Dict$foldl, func, acc, left)),
					$temp$dict = right;
				func = $temp$func;
				acc = $temp$acc;
				dict = $temp$dict;
				continue foldl;
			}
		}
	});
var $author$project$Ecs$System$indexedFoldl = F3(
	function (f, _v0, acc_) {
		var comp = _v0;
		return A3(
			$elm$core$Dict$foldl,
			F3(
				function (id, a, thisAcc) {
					return A3(f, id, a, thisAcc);
				}),
			acc_,
			comp);
	});
var $elm$core$Maybe$map = F2(
	function (f, maybe) {
		if (!maybe.$) {
			var value = maybe.a;
			return $elm$core$Maybe$Just(
				f(value));
		} else {
			return $elm$core$Maybe$Nothing;
		}
	});
var $elm$core$Basics$neq = _Utils_notEqual;
var $author$project$Ecs$System$map2 = F4(
	function (f, spec1, spec2, world) {
		var set2 = F3(
			function (_v3, b, acc) {
				var i = _v3;
				var _v2 = acc.c;
				var comp = _v2;
				return _Utils_update(
					acc,
					{
						c: A3($elm$core$Dict$insert, i, b, comp)
					});
			});
		var set1 = F3(
			function (_v1, a, acc) {
				var i = _v1;
				var _v0 = acc.b;
				var comp = _v0;
				return _Utils_update(
					acc,
					{
						b: A3($elm$core$Dict$insert, i, a, comp)
					});
			});
		var combined = {
			b: spec1.fb(world),
			c: spec2.fb(world)
		};
		var result = A3(
			$author$project$Ecs$System$indexedFoldl,
			F3(
				function (n, a, acc) {
					return A2(
						$elm$core$Maybe$withDefault,
						acc,
						A2(
							$elm$core$Maybe$map,
							function (b) {
								return A3(
									f,
									_Utils_Tuple2(
										a,
										set1(n)),
									_Utils_Tuple2(
										b,
										set2(n)),
									acc);
							},
							A2($author$project$Ecs$Component$get, n, acc.c)));
				}),
			combined.b,
			combined);
		return A3(
			$author$project$Ecs$System$applyIf,
			!_Utils_eq(result.c, combined.c),
			spec2.fA(result.c),
			A3(
				$author$project$Ecs$System$applyIf,
				!_Utils_eq(result.b, combined.b),
				spec1.fA(result.b),
				world));
	});
var $author$project$Main$runAnimation = function (t) {
	return A3(
		$author$project$Ecs$System$map2,
		F2(
			function (_v0, _v1) {
				var currentPos = _v0.a;
				var setPos = _v0.b;
				var _v2 = _v1.a;
				var nextPos = _v2.a;
				var setAnimatedPosition = _v1.b;
				var _v3 = $author$project$Main$gameHexToPoint(nextPos);
				var x = _v3.a;
				var y = _v3.b;
				var _v4 = $author$project$Main$gameHexToPoint(currentPos);
				var px = _v4.a;
				var py = _v4.b;
				return (t >= 1) ? setPos(nextPos) : setAnimatedPosition(
					_Utils_Tuple2(
						nextPos,
						_Utils_Tuple2(
							A3($ianmackenzie$elm_float_extra$Float$Extra$interpolateFrom, px, x, t),
							A3($ianmackenzie$elm_float_extra$Float$Extra$interpolateFrom, py, y, t))));
			}),
		$author$project$Main$positionSpec,
		$author$project$Main$animatedPositionSpec);
};
var $elm$random$Random$Generator = $elm$core$Basics$identity;
var $elm$random$Random$constant = function (value) {
	return function (seed) {
		return _Utils_Tuple2(value, seed);
	};
};
var $elm$core$List$head = function (list) {
	if (list.b) {
		var x = list.a;
		var xs = list.b;
		return $elm$core$Maybe$Just(x);
	} else {
		return $elm$core$Maybe$Nothing;
	}
};
var $elm_community$random_extra$Random$List$get = F2(
	function (index, list) {
		return $elm$core$List$head(
			A2($elm$core$List$drop, index, list));
	});
var $elm$core$Bitwise$xor = _Bitwise_xor;
var $elm$random$Random$peel = function (_v0) {
	var state = _v0.a;
	var word = (state ^ (state >>> ((state >>> 28) + 4))) * 277803737;
	return ((word >>> 22) ^ word) >>> 0;
};
var $elm$random$Random$int = F2(
	function (a, b) {
		return function (seed0) {
			var _v0 = (_Utils_cmp(a, b) < 0) ? _Utils_Tuple2(a, b) : _Utils_Tuple2(b, a);
			var lo = _v0.a;
			var hi = _v0.b;
			var range = (hi - lo) + 1;
			if (!((range - 1) & range)) {
				return _Utils_Tuple2(
					(((range - 1) & $elm$random$Random$peel(seed0)) >>> 0) + lo,
					$elm$random$Random$next(seed0));
			} else {
				var threshhold = (((-range) >>> 0) % range) >>> 0;
				var accountForBias = function (seed) {
					accountForBias:
					while (true) {
						var x = $elm$random$Random$peel(seed);
						var seedN = $elm$random$Random$next(seed);
						if (_Utils_cmp(x, threshhold) < 0) {
							var $temp$seed = seedN;
							seed = $temp$seed;
							continue accountForBias;
						} else {
							return _Utils_Tuple2((x % range) + lo, seedN);
						}
					}
				};
				return accountForBias(seed0);
			}
		};
	});
var $elm$core$List$isEmpty = function (xs) {
	if (!xs.b) {
		return true;
	} else {
		return false;
	}
};
var $elm$random$Random$map = F2(
	function (func, _v0) {
		var genA = _v0;
		return function (seed0) {
			var _v1 = genA(seed0);
			var a = _v1.a;
			var seed1 = _v1.b;
			return _Utils_Tuple2(
				func(a),
				seed1);
		};
	});
var $elm$core$List$takeReverse = F3(
	function (n, list, kept) {
		takeReverse:
		while (true) {
			if (n <= 0) {
				return kept;
			} else {
				if (!list.b) {
					return kept;
				} else {
					var x = list.a;
					var xs = list.b;
					var $temp$n = n - 1,
						$temp$list = xs,
						$temp$kept = A2($elm$core$List$cons, x, kept);
					n = $temp$n;
					list = $temp$list;
					kept = $temp$kept;
					continue takeReverse;
				}
			}
		}
	});
var $elm$core$List$takeTailRec = F2(
	function (n, list) {
		return $elm$core$List$reverse(
			A3($elm$core$List$takeReverse, n, list, _List_Nil));
	});
var $elm$core$List$takeFast = F3(
	function (ctr, n, list) {
		if (n <= 0) {
			return _List_Nil;
		} else {
			var _v0 = _Utils_Tuple2(n, list);
			_v0$1:
			while (true) {
				_v0$5:
				while (true) {
					if (!_v0.b.b) {
						return list;
					} else {
						if (_v0.b.b.b) {
							switch (_v0.a) {
								case 1:
									break _v0$1;
								case 2:
									var _v2 = _v0.b;
									var x = _v2.a;
									var _v3 = _v2.b;
									var y = _v3.a;
									return _List_fromArray(
										[x, y]);
								case 3:
									if (_v0.b.b.b.b) {
										var _v4 = _v0.b;
										var x = _v4.a;
										var _v5 = _v4.b;
										var y = _v5.a;
										var _v6 = _v5.b;
										var z = _v6.a;
										return _List_fromArray(
											[x, y, z]);
									} else {
										break _v0$5;
									}
								default:
									if (_v0.b.b.b.b && _v0.b.b.b.b.b) {
										var _v7 = _v0.b;
										var x = _v7.a;
										var _v8 = _v7.b;
										var y = _v8.a;
										var _v9 = _v8.b;
										var z = _v9.a;
										var _v10 = _v9.b;
										var w = _v10.a;
										var tl = _v10.b;
										return (ctr > 1000) ? A2(
											$elm$core$List$cons,
											x,
											A2(
												$elm$core$List$cons,
												y,
												A2(
													$elm$core$List$cons,
													z,
													A2(
														$elm$core$List$cons,
														w,
														A2($elm$core$List$takeTailRec, n - 4, tl))))) : A2(
											$elm$core$List$cons,
											x,
											A2(
												$elm$core$List$cons,
												y,
												A2(
													$elm$core$List$cons,
													z,
													A2(
														$elm$core$List$cons,
														w,
														A3($elm$core$List$takeFast, ctr + 1, n - 4, tl)))));
									} else {
										break _v0$5;
									}
							}
						} else {
							if (_v0.a === 1) {
								break _v0$1;
							} else {
								break _v0$5;
							}
						}
					}
				}
				return list;
			}
			var _v1 = _v0.b;
			var x = _v1.a;
			return _List_fromArray(
				[x]);
		}
	});
var $elm$core$List$take = F2(
	function (n, list) {
		return A3($elm$core$List$takeFast, 0, n, list);
	});
var $elm_community$random_extra$Random$List$choose = function (list) {
	if ($elm$core$List$isEmpty(list)) {
		return $elm$random$Random$constant(
			_Utils_Tuple2($elm$core$Maybe$Nothing, list));
	} else {
		var lastIndex = $elm$core$List$length(list) - 1;
		var gen = A2($elm$random$Random$int, 0, lastIndex);
		var front = function (i) {
			return A2($elm$core$List$take, i, list);
		};
		var back = function (i) {
			return A2($elm$core$List$drop, i + 1, list);
		};
		return A2(
			$elm$random$Random$map,
			function (index) {
				return _Utils_Tuple2(
					A2($elm_community$random_extra$Random$List$get, index, list),
					A2(
						$elm$core$List$append,
						front(index),
						back(index)));
			},
			gen);
	}
};
var $elm$core$Maybe$map2 = F3(
	function (func, ma, mb) {
		if (ma.$ === 1) {
			return $elm$core$Maybe$Nothing;
		} else {
			var a = ma.a;
			if (mb.$ === 1) {
				return $elm$core$Maybe$Nothing;
			} else {
				var b = mb.a;
				return $elm$core$Maybe$Just(
					A2(func, a, b));
			}
		}
	});
var $author$project$Ecs$System$foldl3 = F5(
	function (f, comp1, comp2, comp3, acc_) {
		return A3(
			$author$project$Ecs$System$indexedFoldl,
			F3(
				function (n, a, acc) {
					return A2(
						$elm$core$Maybe$withDefault,
						acc,
						A3(
							$elm$core$Maybe$map2,
							F2(
								function (b, c) {
									return A4(f, a, b, c, acc);
								}),
							A2($author$project$Ecs$Component$get, n, comp2),
							A2($author$project$Ecs$Component$get, n, comp3)));
				}),
			comp1,
			acc_);
	});
var $author$project$Ecs$System$indexedFoldl2 = F4(
	function (f, comp1, comp2, acc_) {
		return A3(
			$author$project$Ecs$System$indexedFoldl,
			F3(
				function (entity, a, acc) {
					return A2(
						$elm$core$Maybe$withDefault,
						acc,
						A2(
							$elm$core$Maybe$map,
							function (b) {
								return A4(f, entity, a, b, acc);
							},
							A2($author$project$Ecs$Component$get, entity, comp2)));
				}),
			comp1,
			acc_);
	});
var $elm$random$Random$step = F2(
	function (_v0, seed) {
		var generator = _v0;
		return generator(seed);
	});
var $author$project$Main$assignGoal = function (world) {
	var needGoals = A4(
		$author$project$Ecs$System$indexedFoldl2,
		F4(
			function (entity, _v6, ai, result) {
				var _v7 = A2($author$project$Ecs$Component$get, entity, world.ac);
				if (_v7.$ === 1) {
					return A2(
						$elm$core$List$cons,
						_Utils_Tuple2(entity, ai),
						result);
				} else {
					return result;
				}
			}),
		world.aa,
		world.au,
		_List_Nil);
	return A3(
		$elm$core$List$foldl,
		F2(
			function (_v0, w) {
				var entity = _v0.a;
				var ai = _v0.b;
				var _v2 = A2($author$project$Ecs$Component$get, entity, w.p);
				if (_v2.$ === 1) {
					return w;
				} else {
					var pollen = _v2.a;
					if (pollen >= 100) {
						return _Utils_update(
							w,
							{
								ac: A3($author$project$Ecs$Component$set, entity, $author$project$Main$hexOrigin, w.ac)
							});
					} else {
						var flowersWithPollen = A5(
							$author$project$Ecs$System$foldl3,
							F4(
								function (position, _v5, pollenCount, result) {
									return (pollenCount > 0) ? A2($elm$core$List$cons, position, result) : result;
								}),
							w.aa,
							w.a8,
							w.p,
							_List_Nil);
						var _v3 = A2(
							$elm$random$Random$step,
							A2(
								$elm$random$Random$map,
								$elm$core$Tuple$first,
								$elm_community$random_extra$Random$List$choose(flowersWithPollen)),
							w.aZ);
						var goal = _v3.a;
						var nextSeed = _v3.b;
						return _Utils_update(
							w,
							{
								ac: function () {
									if (goal.$ === 1) {
										return w.ac;
									} else {
										var g = goal.a;
										return A3($author$project$Ecs$Component$set, entity, g, w.ac);
									}
								}(),
								aZ: nextSeed
							});
					}
				}
			}),
		world,
		needGoals);
};
var $author$project$Ecs$System$indexedFoldl3 = F5(
	function (f, comp1, comp2, comp3, acc_) {
		return A3(
			$author$project$Ecs$System$indexedFoldl,
			F3(
				function (n, a, acc) {
					return A2(
						$elm$core$Maybe$withDefault,
						acc,
						A3(
							$elm$core$Maybe$map2,
							F2(
								function (b, c) {
									return A5(f, n, a, b, c, acc);
								}),
							A2($author$project$Ecs$Component$get, n, comp2),
							A2($author$project$Ecs$Component$get, n, comp3)));
				}),
			comp1,
			acc_);
	});
var $author$project$Ecs$Entity$delete = F2(
	function (config, _v0) {
		var id = _v0.a;
		var world = _v0.b;
		return _Utils_Tuple2(
			id,
			A2(
				config.fA,
				function () {
					var _v1 = config.fb(world);
					var _v2 = _v1;
					var nextId = _v2.a;
					var availableIds = _v2.b;
					return _Utils_Tuple2(
						nextId,
						A2($elm$core$List$cons, id, availableIds));
				}(),
				world));
	});
var $author$project$Main$flowerSpec = {
	fb: function ($) {
		return $.a8;
	},
	fA: F2(
		function (comp, world) {
			return _Utils_update(
				world,
				{a8: comp});
		})
};
var $author$project$Ecs$Entity$remove = F2(
	function (spec, _v0) {
		var id = _v0.a;
		var world = _v0.b;
		return _Utils_Tuple2(
			id,
			A2(
				spec.fA,
				function () {
					var _v1 = spec.fb(world);
					var comp = _v1;
					return A2($elm$core$Dict$remove, id, comp);
				}(),
				world));
	});
var $author$project$Main$removeFlower = F2(
	function (entity, world) {
		return A2(
			$author$project$Ecs$Entity$delete,
			$author$project$Main$ecsConfigSpec,
			A2(
				$author$project$Ecs$Entity$remove,
				$author$project$Main$graphicsSpec,
				A2(
					$author$project$Ecs$Entity$remove,
					$author$project$Main$flowerSpec,
					A2(
						$author$project$Ecs$Entity$remove,
						$author$project$Main$pollenSpec,
						A2(
							$author$project$Ecs$Entity$remove,
							$author$project$Main$positionSpec,
							_Utils_Tuple2(entity, world)))))).b;
	});
var $author$project$Ecs$Internal$update = F3(
	function (_v0, f, entities) {
		var id = _v0;
		var _v1 = A2($elm$core$Dict$get, id, entities);
		if (_v1.$ === 1) {
			return entities;
		} else {
			var data = _v1.a;
			return A3(
				$elm$core$Dict$insert,
				id,
				f(data),
				entities);
		}
	});
var $author$project$Ecs$Component$update = F3(
	function (entity, f, _v0) {
		var comp = _v0;
		return A3($author$project$Ecs$Internal$update, entity, f, comp);
	});
var $author$project$Main$collectPollen = function (world) {
	return A5(
		$author$project$Ecs$System$indexedFoldl3,
		F5(
			function (entity, ai, position, _v0, w) {
				var maybeFlower = A5(
					$author$project$Ecs$System$indexedFoldl3,
					F5(
						function (flower, flowerPos, flowerPollen, _v4, result) {
							return (_Utils_eq(position, flowerPos) && (flowerPollen > 0)) ? $elm$core$Maybe$Just(
								_Utils_Tuple2(flower, flowerPollen)) : result;
						}),
					w.aa,
					w.p,
					w.a8,
					$elm$core$Maybe$Nothing);
				if (!maybeFlower.$) {
					var _v3 = maybeFlower.a;
					var flower = _v3.a;
					var flowerPollen = _v3.b;
					return A2(
						$author$project$Main$removeFlower,
						flower,
						_Utils_update(
							w,
							{
								p: A3(
									$author$project$Ecs$Component$update,
									entity,
									function (p) {
										return p + flowerPollen;
									},
									w.p)
							}));
				} else {
					return w;
				}
			}),
		world.au,
		world.aa,
		world.p,
		world);
};
var $author$project$Main$givePollen = function (world) {
	return A5(
		$author$project$Ecs$System$indexedFoldl3,
		F5(
			function (entity, ai, position, _v0, w) {
				if (_Utils_eq(position, $author$project$Main$hexOrigin)) {
					var _v2 = w.bB;
					if (_v2.$ === 1) {
						return w;
					} else {
						var hive = _v2.a;
						var _v3 = A2($author$project$Ecs$Component$get, entity, w.p);
						if (_v3.$ === 1) {
							return w;
						} else {
							var pol = _v3.a;
							return _Utils_update(
								w,
								{
									p: A3(
										$author$project$Ecs$Component$update,
										hive,
										function (p) {
											return p + pol;
										},
										A3($author$project$Ecs$Component$set, entity, 0, w.p))
								});
						}
					}
				} else {
					return w;
				}
			}),
		world.au,
		world.aa,
		world.p,
		world);
};
var $elm$core$List$sortBy = _List_sortBy;
var $krisajenkins$elm_astar$AStar$Generalised$cheapestOpen = F2(
	function (costFn, model) {
		return A2(
			$elm$core$Maybe$map,
			$elm$core$Tuple$first,
			$elm$core$List$head(
				A2(
					$elm$core$List$sortBy,
					$elm$core$Tuple$second,
					A2(
						$elm$core$List$filterMap,
						function (position) {
							var _v0 = A2($elm$core$Dict$get, position, model.a3);
							if (_v0.$ === 1) {
								return $elm$core$Maybe$Nothing;
							} else {
								var cost = _v0.a;
								return $elm$core$Maybe$Just(
									_Utils_Tuple2(
										position,
										cost + costFn(position)));
							}
						},
						$elm$core$Set$toList(model.aW)))));
	});
var $elm$core$Set$Set_elm_builtin = $elm$core$Basics$identity;
var $elm$core$Dict$diff = F2(
	function (t1, t2) {
		return A3(
			$elm$core$Dict$foldl,
			F3(
				function (k, v, t) {
					return A2($elm$core$Dict$remove, k, t);
				}),
			t1,
			t2);
	});
var $elm$core$Set$diff = F2(
	function (_v0, _v1) {
		var dict1 = _v0;
		var dict2 = _v1;
		return A2($elm$core$Dict$diff, dict1, dict2);
	});
var $elm$core$Set$foldl = F3(
	function (func, initialState, _v0) {
		var dict = _v0;
		return A3(
			$elm$core$Dict$foldl,
			F3(
				function (key, _v1, state) {
					return A2(func, key, state);
				}),
			initialState,
			dict);
	});
var $elm$core$Set$insert = F2(
	function (key, _v0) {
		var dict = _v0;
		return A3($elm$core$Dict$insert, key, 0, dict);
	});
var $elm$core$Elm$JsArray$push = _JsArray_push;
var $elm$core$Elm$JsArray$singleton = _JsArray_singleton;
var $elm$core$Array$insertTailInTree = F4(
	function (shift, index, tail, tree) {
		var pos = $elm$core$Array$bitMask & (index >>> shift);
		if (_Utils_cmp(
			pos,
			$elm$core$Elm$JsArray$length(tree)) > -1) {
			if (shift === 5) {
				return A2(
					$elm$core$Elm$JsArray$push,
					$elm$core$Array$Leaf(tail),
					tree);
			} else {
				var newSub = $elm$core$Array$SubTree(
					A4($elm$core$Array$insertTailInTree, shift - $elm$core$Array$shiftStep, index, tail, $elm$core$Elm$JsArray$empty));
				return A2($elm$core$Elm$JsArray$push, newSub, tree);
			}
		} else {
			var value = A2($elm$core$Elm$JsArray$unsafeGet, pos, tree);
			if (!value.$) {
				var subTree = value.a;
				var newSub = $elm$core$Array$SubTree(
					A4($elm$core$Array$insertTailInTree, shift - $elm$core$Array$shiftStep, index, tail, subTree));
				return A3($elm$core$Elm$JsArray$unsafeSet, pos, newSub, tree);
			} else {
				var newSub = $elm$core$Array$SubTree(
					A4(
						$elm$core$Array$insertTailInTree,
						shift - $elm$core$Array$shiftStep,
						index,
						tail,
						$elm$core$Elm$JsArray$singleton(value)));
				return A3($elm$core$Elm$JsArray$unsafeSet, pos, newSub, tree);
			}
		}
	});
var $elm$core$Array$unsafeReplaceTail = F2(
	function (newTail, _v0) {
		var len = _v0.a;
		var startShift = _v0.b;
		var tree = _v0.c;
		var tail = _v0.d;
		var originalTailLen = $elm$core$Elm$JsArray$length(tail);
		var newTailLen = $elm$core$Elm$JsArray$length(newTail);
		var newArrayLen = len + (newTailLen - originalTailLen);
		if (_Utils_eq(newTailLen, $elm$core$Array$branchFactor)) {
			var overflow = _Utils_cmp(newArrayLen >>> $elm$core$Array$shiftStep, 1 << startShift) > 0;
			if (overflow) {
				var newShift = startShift + $elm$core$Array$shiftStep;
				var newTree = A4(
					$elm$core$Array$insertTailInTree,
					newShift,
					len,
					newTail,
					$elm$core$Elm$JsArray$singleton(
						$elm$core$Array$SubTree(tree)));
				return A4($elm$core$Array$Array_elm_builtin, newArrayLen, newShift, newTree, $elm$core$Elm$JsArray$empty);
			} else {
				return A4(
					$elm$core$Array$Array_elm_builtin,
					newArrayLen,
					startShift,
					A4($elm$core$Array$insertTailInTree, startShift, len, newTail, tree),
					$elm$core$Elm$JsArray$empty);
			}
		} else {
			return A4($elm$core$Array$Array_elm_builtin, newArrayLen, startShift, tree, newTail);
		}
	});
var $elm$core$Array$push = F2(
	function (a, array) {
		var tail = array.d;
		return A2(
			$elm$core$Array$unsafeReplaceTail,
			A2($elm$core$Elm$JsArray$push, a, tail),
			array);
	});
var $krisajenkins$elm_astar$AStar$Generalised$reconstructPath = F2(
	function (cameFrom, goal) {
		var _v0 = A2($elm$core$Dict$get, goal, cameFrom);
		if (_v0.$ === 1) {
			return $elm$core$Array$empty;
		} else {
			var next = _v0.a;
			return A2(
				$elm$core$Array$push,
				goal,
				A2($krisajenkins$elm_astar$AStar$Generalised$reconstructPath, cameFrom, next));
		}
	});
var $elm$core$Set$remove = F2(
	function (key, _v0) {
		var dict = _v0;
		return A2($elm$core$Dict$remove, key, dict);
	});
var $elm$core$Dict$union = F2(
	function (t1, t2) {
		return A3($elm$core$Dict$foldl, $elm$core$Dict$insert, t2, t1);
	});
var $elm$core$Set$union = F2(
	function (_v0, _v1) {
		var dict1 = _v0;
		var dict2 = _v1;
		return A2($elm$core$Dict$union, dict1, dict2);
	});
var $krisajenkins$elm_astar$AStar$Generalised$updateCost = F3(
	function (current, neighbour, model) {
		var newCameFrom = A3($elm$core$Dict$insert, neighbour, current, model.bn);
		var distanceTo = $elm$core$Array$length(
			A2($krisajenkins$elm_astar$AStar$Generalised$reconstructPath, newCameFrom, neighbour));
		var newCosts = A3($elm$core$Dict$insert, neighbour, distanceTo, model.a3);
		var newModel = _Utils_update(
			model,
			{bn: newCameFrom, a3: newCosts});
		var _v0 = A2($elm$core$Dict$get, neighbour, model.a3);
		if (_v0.$ === 1) {
			return newModel;
		} else {
			var previousDistance = _v0.a;
			return (_Utils_cmp(distanceTo, previousDistance) < 0) ? newModel : model;
		}
	});
var $krisajenkins$elm_astar$AStar$Generalised$astar = F4(
	function (costFn, moveFn, goal, model) {
		astar:
		while (true) {
			var _v0 = A2(
				$krisajenkins$elm_astar$AStar$Generalised$cheapestOpen,
				costFn(goal),
				model);
			if (_v0.$ === 1) {
				return $elm$core$Maybe$Nothing;
			} else {
				var current = _v0.a;
				if (_Utils_eq(current, goal)) {
					return $elm$core$Maybe$Just(
						A2($krisajenkins$elm_astar$AStar$Generalised$reconstructPath, model.bn, goal));
				} else {
					var neighbours = moveFn(current);
					var modelPopped = _Utils_update(
						model,
						{
							bt: A2($elm$core$Set$insert, current, model.bt),
							aW: A2($elm$core$Set$remove, current, model.aW)
						});
					var newNeighbours = A2($elm$core$Set$diff, neighbours, modelPopped.bt);
					var modelWithNeighbours = _Utils_update(
						modelPopped,
						{
							aW: A2($elm$core$Set$union, modelPopped.aW, newNeighbours)
						});
					var modelWithCosts = A3(
						$elm$core$Set$foldl,
						$krisajenkins$elm_astar$AStar$Generalised$updateCost(current),
						modelWithNeighbours,
						newNeighbours);
					var $temp$costFn = costFn,
						$temp$moveFn = moveFn,
						$temp$goal = goal,
						$temp$model = modelWithCosts;
					costFn = $temp$costFn;
					moveFn = $temp$moveFn;
					goal = $temp$goal;
					model = $temp$model;
					continue astar;
				}
			}
		}
	});
var $elm$core$Set$empty = $elm$core$Dict$empty;
var $elm$core$Dict$singleton = F2(
	function (key, value) {
		return A5($elm$core$Dict$RBNode_elm_builtin, 1, key, value, $elm$core$Dict$RBEmpty_elm_builtin, $elm$core$Dict$RBEmpty_elm_builtin);
	});
var $elm$core$Set$singleton = function (key) {
	return A2($elm$core$Dict$singleton, key, 0);
};
var $krisajenkins$elm_astar$AStar$Generalised$initialModel = function (start) {
	return {
		bn: $elm$core$Dict$empty,
		a3: A2($elm$core$Dict$singleton, start, 0),
		bt: $elm$core$Set$empty,
		aW: $elm$core$Set$singleton(start)
	};
};
var $krisajenkins$elm_astar$AStar$Generalised$findPath = F4(
	function (costFn, moveFn, start, end) {
		return A2(
			$elm$core$Maybe$map,
			$elm$core$Array$toList,
			A4(
				$krisajenkins$elm_astar$AStar$Generalised$astar,
				costFn,
				moveFn,
				end,
				$krisajenkins$elm_astar$AStar$Generalised$initialModel(start)));
	});
var $Voronchuk$hexagons$Hexagons$Hex$s = function (a) {
	switch (a.$) {
		case 2:
			var _v1 = a.a;
			var a1 = _v1.a;
			var a2 = _v1.b;
			return (-a1) - a2;
		case 1:
			var _v2 = a.a;
			var a1 = _v2.a;
			var a2 = _v2.b;
			var a3 = _v2.c;
			return a3;
		default:
			var _v3 = a.a;
			var a1 = _v3.a;
			var a2 = _v3.b;
			var a3 = _v3.c;
			return a3;
	}
};
var $Voronchuk$hexagons$Hexagons$Hex$length = function (a) {
	var a3 = A3($elm$core$Basics$composeL, $elm$core$Basics$abs, $Voronchuk$hexagons$Hexagons$Hex$s, a);
	var a2 = A3($elm$core$Basics$composeL, $elm$core$Basics$abs, $Voronchuk$hexagons$Hexagons$Hex$r, a);
	var a1 = A3($elm$core$Basics$composeL, $elm$core$Basics$abs, $Voronchuk$hexagons$Hexagons$Hex$q, a);
	return $elm$core$Basics$floor(((a1 + a2) + a3) / 2);
};
var $Voronchuk$hexagons$Hexagons$Hex$sub = F2(
	function (a, b) {
		switch (a.$) {
			case 2:
				var _v1 = a.a;
				var a1 = _v1.a;
				var a2 = _v1.b;
				switch (b.$) {
					case 2:
						var _v3 = b.a;
						var b1 = _v3.a;
						var b2 = _v3.b;
						return $Voronchuk$hexagons$Hexagons$Hex$IntCubeHex(
							_Utils_Tuple3(a1 - b1, a2 - b2, ((-a1) - a2) - ((-b1) - b2)));
					case 1:
						var _v4 = b.a;
						var b1 = _v4.a;
						var b2 = _v4.b;
						var b3 = _v4.c;
						return $Voronchuk$hexagons$Hexagons$Hex$IntCubeHex(
							_Utils_Tuple3(a1 - b1, a2 - b2, ((-a1) - a2) - b3));
					default:
						var _v5 = b.a;
						var b1 = _v5.a;
						var b2 = _v5.b;
						var b3 = _v5.c;
						var a2_ = a2;
						var a1_ = a1;
						var a3_ = (-a1_) - a2_;
						return $Voronchuk$hexagons$Hexagons$Hex$FloatCubeHex(
							_Utils_Tuple3(a1_ - b1, a2_ - b2, a3_ - b3));
				}
			case 1:
				var _v6 = a.a;
				var a1 = _v6.a;
				var a2 = _v6.b;
				var a3 = _v6.c;
				switch (b.$) {
					case 2:
						var _v8 = b.a;
						var b1 = _v8.a;
						var b2 = _v8.b;
						return $Voronchuk$hexagons$Hexagons$Hex$IntCubeHex(
							_Utils_Tuple3(a1 - b1, a2 - b2, a3 - ((-b1) - b2)));
					case 1:
						var _v9 = b.a;
						var b1 = _v9.a;
						var b2 = _v9.b;
						var b3 = _v9.c;
						return $Voronchuk$hexagons$Hexagons$Hex$IntCubeHex(
							_Utils_Tuple3(a1 - b1, a2 - b2, a3 - b3));
					default:
						var _v10 = b.a;
						var b1 = _v10.a;
						var b2 = _v10.b;
						var b3 = _v10.c;
						var a3_ = a3;
						var a2_ = a2;
						var a1_ = a1;
						return $Voronchuk$hexagons$Hexagons$Hex$FloatCubeHex(
							_Utils_Tuple3(a1_ - b1, a2_ - b2, a3_ - b3));
				}
			default:
				var _v11 = a.a;
				var a1 = _v11.a;
				var a2 = _v11.b;
				var a3 = _v11.c;
				switch (b.$) {
					case 2:
						var _v13 = b.a;
						var b1 = _v13.a;
						var b2 = _v13.b;
						var b2_ = b2;
						var b1_ = b1;
						var b3_ = (-b1_) - b2_;
						return $Voronchuk$hexagons$Hexagons$Hex$FloatCubeHex(
							_Utils_Tuple3(a1 - b1_, a2 - b2_, a3 - b3_));
					case 1:
						var _v14 = b.a;
						var b1 = _v14.a;
						var b2 = _v14.b;
						var b3 = _v14.c;
						var b3_ = b3;
						var b2_ = b2;
						var b1_ = b1;
						return $Voronchuk$hexagons$Hexagons$Hex$FloatCubeHex(
							_Utils_Tuple3(a1 - b1_, a2 - b2_, a3 - b3_));
					default:
						var _v15 = b.a;
						var b1 = _v15.a;
						var b2 = _v15.b;
						var b3 = _v15.c;
						return $Voronchuk$hexagons$Hexagons$Hex$FloatCubeHex(
							_Utils_Tuple3(a1 - b1, a2 - b2, a3 - b3));
				}
		}
	});
var $Voronchuk$hexagons$Hexagons$Hex$distance = F2(
	function (a, b) {
		return $Voronchuk$hexagons$Hexagons$Hex$length(
			A2($Voronchuk$hexagons$Hexagons$Hex$sub, a, b));
	});
var $author$project$Main$hexCost = F2(
	function (from, to) {
		var toHex = $Voronchuk$hexagons$Hexagons$Hex$IntCubeHex(to);
		var fromHex = $Voronchuk$hexagons$Hexagons$Hex$IntCubeHex(from);
		return A2($Voronchuk$hexagons$Hexagons$Hex$distance, fromHex, toHex);
	});
var $Voronchuk$hexagons$Hexagons$Hex$E = 1;
var $Voronchuk$hexagons$Hexagons$Hex$NE = 0;
var $Voronchuk$hexagons$Hexagons$Hex$NW = 5;
var $Voronchuk$hexagons$Hexagons$Hex$SE = 2;
var $Voronchuk$hexagons$Hexagons$Hex$SW = 3;
var $Voronchuk$hexagons$Hexagons$Hex$W = 4;
var $elm$core$Set$fromList = function (list) {
	return A3($elm$core$List$foldl, $elm$core$Set$insert, $elm$core$Set$empty, list);
};
var $Voronchuk$hexagons$Hexagons$Hex$direction = function (dir) {
	switch (dir) {
		case 0:
			return $Voronchuk$hexagons$Hexagons$Hex$IntCubeHex(
				_Utils_Tuple3(1, 0, -1));
		case 1:
			return $Voronchuk$hexagons$Hexagons$Hex$IntCubeHex(
				_Utils_Tuple3(1, -1, 0));
		case 2:
			return $Voronchuk$hexagons$Hexagons$Hex$IntCubeHex(
				_Utils_Tuple3(0, -1, 1));
		case 3:
			return $Voronchuk$hexagons$Hexagons$Hex$IntCubeHex(
				_Utils_Tuple3(-1, 0, 1));
		case 4:
			return $Voronchuk$hexagons$Hexagons$Hex$IntCubeHex(
				_Utils_Tuple3(-1, 1, 0));
		default:
			return $Voronchuk$hexagons$Hexagons$Hex$IntCubeHex(
				_Utils_Tuple3(0, 1, -1));
	}
};
var $Voronchuk$hexagons$Hexagons$Hex$neighbor = F2(
	function (hex, dir) {
		return A2(
			$Voronchuk$hexagons$Hexagons$Hex$add,
			hex,
			$Voronchuk$hexagons$Hexagons$Hex$direction(dir));
	});
var $author$project$Main$hexNeighbors = F2(
	function (board, hash) {
		var hex = $Voronchuk$hexagons$Hexagons$Hex$IntCubeHex(hash);
		return $elm$core$Set$fromList(
			A2(
				$elm$core$List$filterMap,
				function (dir) {
					var neighbor = $Voronchuk$hexagons$Hexagons$Map$hashHex(
						A2($Voronchuk$hexagons$Hexagons$Hex$neighbor, hex, dir));
					var _v0 = A2($elm$core$Dict$get, neighbor, board);
					if (_v0.$ === 1) {
						return $elm$core$Maybe$Nothing;
					} else {
						return $elm$core$Maybe$Just(neighbor);
					}
				},
				_List_fromArray(
					[0, 1, 2, 3, 4, 5])));
	});
var $author$project$Ecs$Component$remove = F2(
	function (_v0, _v1) {
		var id = _v0;
		var components = _v1;
		return A2($elm$core$Dict$remove, id, components);
	});
var $author$project$Main$navigate = function (world) {
	return A5(
		$author$project$Ecs$System$indexedFoldl3,
		F5(
			function (entity, _v0, currentPos, goal, w) {
				var nextPos = _v0.a;
				var animatedPos = _v0.b;
				if (_Utils_eq(currentPos, goal)) {
					return _Utils_update(
						w,
						{
							ac: A2($author$project$Ecs$Component$remove, entity, w.ac)
						});
				} else {
					var path = A4(
						$krisajenkins$elm_astar$AStar$Generalised$findPath,
						$author$project$Main$hexCost,
						$author$project$Main$hexNeighbors(w.bZ),
						$Voronchuk$hexagons$Hexagons$Map$hashHex(currentPos),
						$Voronchuk$hexagons$Hexagons$Map$hashHex(goal));
					if ((!path.$) && path.a.b) {
						var _v2 = path.a;
						var next = _v2.a;
						var nextPosition = $Voronchuk$hexagons$Hexagons$Hex$IntCubeHex(next);
						return _Utils_update(
							w,
							{
								av: A3(
									$author$project$Ecs$Component$set,
									entity,
									_Utils_Tuple2(nextPosition, animatedPos),
									w.av)
							});
					} else {
						return w;
					}
				}
			}),
		world.av,
		world.aa,
		world.ac,
		world);
};
var $author$project$Main$spawnBees = function (world) {
	var _v0 = world.bB;
	if (_v0.$ === 1) {
		return world;
	} else {
		var hive = _v0.a;
		var _v1 = A2($author$project$Ecs$Component$get, hive, world.p);
		if (_v1.$ === 1) {
			return world;
		} else {
			var pollenCount = _v1.a;
			return (pollenCount >= 1000) ? A2(
				$author$project$Main$createBee,
				$author$project$Main$hexOrigin,
				_Utils_update(
					world,
					{
						p: A3(
							$author$project$Ecs$Component$update,
							hive,
							function (p) {
								return p - 1000;
							},
							world.p)
					})) : world;
		}
	}
};
var $author$project$Main$Flower = 0;
var $author$project$Main$FlowerG = F2(
	function (a, b) {
		return {$: 1, a: a, b: b};
	});
var $ianmackenzie$elm_geometry$Geometry$Types$Cylinder3d = $elm$core$Basics$identity;
var $ianmackenzie$elm_geometry$Cylinder3d$centeredOn = F3(
	function (givenCenterPoint, givenDirection, _arguments) {
		return {
			n: A2($ianmackenzie$elm_geometry$Axis3d$through, givenCenterPoint, givenDirection),
			dM: $ianmackenzie$elm_units$Quantity$abs(_arguments.dM),
			cq: $ianmackenzie$elm_units$Quantity$abs(_arguments.cq)
		};
	});
var $ianmackenzie$elm_geometry$Vector3d$meters = F3(
	function (x, y, z) {
		return {eK: x, eL: y, cz: z};
	});
var $ianmackenzie$elm_geometry$Axis3d$rotateAround = F2(
	function (otherAxis, angle) {
		var rotatePoint = A2($ianmackenzie$elm_geometry$Point3d$rotateAround, otherAxis, angle);
		var rotateDirection = A2($ianmackenzie$elm_geometry$Direction3d$rotateAround, otherAxis, angle);
		return function (_v0) {
			var axis = _v0;
			return A2(
				$ianmackenzie$elm_geometry$Axis3d$through,
				rotatePoint(axis.c1),
				rotateDirection(axis.e$));
		};
	});
var $ianmackenzie$elm_geometry$Cylinder3d$rotateAround = F3(
	function (givenAxis, givenAngle, _v0) {
		var cylinder = _v0;
		return {
			n: A3($ianmackenzie$elm_geometry$Axis3d$rotateAround, givenAxis, givenAngle, cylinder.n),
			dM: cylinder.dM,
			cq: cylinder.cq
		};
	});
var $ianmackenzie$elm_geometry$Point3d$translateBy = F2(
	function (_v0, _v1) {
		var v = _v0;
		var p = _v1;
		return {eK: p.eK + v.eK, eL: p.eL + v.eL, cz: p.cz + v.cz};
	});
var $ianmackenzie$elm_geometry$Axis3d$translateBy = F2(
	function (vector, _v0) {
		var axis = _v0;
		return A2(
			$ianmackenzie$elm_geometry$Axis3d$through,
			A2($ianmackenzie$elm_geometry$Point3d$translateBy, vector, axis.c1),
			axis.e$);
	});
var $ianmackenzie$elm_geometry$Cylinder3d$translateBy = F2(
	function (displacement, _v0) {
		var cylinder = _v0;
		return {
			n: A2($ianmackenzie$elm_geometry$Axis3d$translateBy, displacement, cylinder.n),
			dM: cylinder.dM,
			cq: cylinder.cq
		};
	});
var $ianmackenzie$elm_geometry$Axis3d$x = A2($ianmackenzie$elm_geometry$Axis3d$through, $ianmackenzie$elm_geometry$Point3d$origin, $ianmackenzie$elm_geometry$Direction3d$x);
var $author$project$Main$createFlower = F4(
	function (startPos, color, offsets, world) {
		return A2(
			$author$project$Ecs$Entity$with,
			_Utils_Tuple2(
				$author$project$Main$graphicsSpec,
				A2(
					$author$project$Main$FlowerG,
					color,
					A3(
						$ianmackenzie$elm_geometry$Cylinder3d$rotateAround,
						$ianmackenzie$elm_geometry$Axis3d$x,
						$ianmackenzie$elm_units$Angle$degrees(offsets.dv),
						A2(
							$ianmackenzie$elm_geometry$Cylinder3d$translateBy,
							A3($ianmackenzie$elm_geometry$Vector3d$meters, offsets.eK, offsets.eL, 0),
							A3(
								$ianmackenzie$elm_geometry$Cylinder3d$centeredOn,
								A3($ianmackenzie$elm_geometry$Point3d$meters, 0, 0, 0.5),
								$ianmackenzie$elm_geometry$Direction3d$positiveZ,
								{
									dM: $ianmackenzie$elm_units$Length$meters(0.1),
									cq: $ianmackenzie$elm_units$Length$meters(offsets.cq)
								}))))),
			A2(
				$author$project$Ecs$Entity$with,
				_Utils_Tuple2($author$project$Main$flowerSpec, 0),
				A2(
					$author$project$Ecs$Entity$with,
					_Utils_Tuple2($author$project$Main$pollenSpec, 10),
					A2(
						$author$project$Ecs$Entity$with,
						_Utils_Tuple2($author$project$Main$positionSpec, startPos),
						A2($author$project$Ecs$Entity$create, $author$project$Main$ecsConfigSpec, world))))).b;
	});
var $elm$random$Random$float = F2(
	function (a, b) {
		return function (seed0) {
			var seed1 = $elm$random$Random$next(seed0);
			var range = $elm$core$Basics$abs(b - a);
			var n1 = $elm$random$Random$peel(seed1);
			var n0 = $elm$random$Random$peel(seed0);
			var lo = (134217727 & n1) * 1.0;
			var hi = (67108863 & n0) * 1.0;
			var val = ((hi * 134217728.0) + lo) / 9007199254740992.0;
			var scaled = (val * range) + a;
			return _Utils_Tuple2(
				scaled,
				$elm$random$Random$next(seed1));
		};
	});
var $author$project$Ecs$System$foldl2 = F4(
	function (f, comp1, comp2, acc_) {
		return A3(
			$author$project$Ecs$System$indexedFoldl,
			F3(
				function (entity, a, acc) {
					return A2(
						$elm$core$Maybe$withDefault,
						acc,
						A2(
							$elm$core$Maybe$map,
							function (b) {
								return A3(f, a, b, acc);
							},
							A2($author$project$Ecs$Component$get, entity, comp2)));
				}),
			comp1,
			acc_);
	});
var $avh4$elm_color$Color$hsla = F4(
	function (hue, sat, light, alpha) {
		var _v0 = _Utils_Tuple3(hue, sat, light);
		var h = _v0.a;
		var s = _v0.b;
		var l = _v0.c;
		var m2 = (l <= 0.5) ? (l * (s + 1)) : ((l + s) - (l * s));
		var m1 = (l * 2) - m2;
		var hueToRgb = function (h__) {
			var h_ = (h__ < 0) ? (h__ + 1) : ((h__ > 1) ? (h__ - 1) : h__);
			return ((h_ * 6) < 1) ? (m1 + (((m2 - m1) * h_) * 6)) : (((h_ * 2) < 1) ? m2 : (((h_ * 3) < 2) ? (m1 + (((m2 - m1) * ((2 / 3) - h_)) * 6)) : m1));
		};
		var b = hueToRgb(h - (1 / 3));
		var g = hueToRgb(h);
		var r = hueToRgb(h + (1 / 3));
		return A4($avh4$elm_color$Color$RgbaSpace, r, g, b, alpha);
	});
var $avh4$elm_color$Color$hsl = F3(
	function (h, s, l) {
		return A4($avh4$elm_color$Color$hsla, h, s, l, 1.0);
	});
var $elm$random$Random$map3 = F4(
	function (func, _v0, _v1, _v2) {
		var genA = _v0;
		var genB = _v1;
		var genC = _v2;
		return function (seed0) {
			var _v3 = genA(seed0);
			var a = _v3.a;
			var seed1 = _v3.b;
			var _v4 = genB(seed1);
			var b = _v4.a;
			var seed2 = _v4.b;
			var _v5 = genC(seed2);
			var c = _v5.a;
			var seed3 = _v5.b;
			return _Utils_Tuple2(
				A3(func, a, b, c),
				seed3);
		};
	});
var $elm$random$Random$map4 = F5(
	function (func, _v0, _v1, _v2, _v3) {
		var genA = _v0;
		var genB = _v1;
		var genC = _v2;
		var genD = _v3;
		return function (seed0) {
			var _v4 = genA(seed0);
			var a = _v4.a;
			var seed1 = _v4.b;
			var _v5 = genB(seed1);
			var b = _v5.a;
			var seed2 = _v5.b;
			var _v6 = genC(seed2);
			var c = _v6.a;
			var seed3 = _v6.b;
			var _v7 = genD(seed3);
			var d = _v7.a;
			var seed4 = _v7.b;
			return _Utils_Tuple2(
				A4(func, a, b, c, d),
				seed4);
		};
	});
var $elm$core$Dict$values = function (dict) {
	return A3(
		$elm$core$Dict$foldr,
		F3(
			function (key, value, valueList) {
				return A2($elm$core$List$cons, value, valueList);
			}),
		_List_Nil,
		dict);
};
var $author$project$Main$spawnFlower = function (world) {
	var flowerCount = A4(
		$author$project$Ecs$System$foldl2,
		F3(
			function (_v3, graphics, total) {
				if (graphics.$ === 1) {
					return total + 1;
				} else {
					return total;
				}
			}),
		world.aa,
		world.aT,
		0);
	if (flowerCount > 10) {
		return world;
	} else {
		var _v0 = A2(
			$elm$random$Random$step,
			A4(
				$elm$random$Random$map3,
				F3(
					function (p, c, o) {
						return _Utils_Tuple3(p, c, o);
					}),
				A2(
					$elm$random$Random$map,
					$elm$core$Tuple$first,
					$elm_community$random_extra$Random$List$choose(
						$elm$core$Dict$values(
							A2(
								$elm$core$Dict$remove,
								_Utils_Tuple3(0, 0, 0),
								world.bZ)))),
				A2(
					$elm$random$Random$map,
					function (h) {
						var hue = h + 0.0392156863;
						return A3(
							$avh4$elm_color$Color$hsl,
							(hue > 1) ? (hue - 1) : hue,
							1,
							0.5);
					},
					A2($elm$random$Random$float, 0, 0.74)),
				A5(
					$elm$random$Random$map4,
					F4(
						function (x, y, angle, radius) {
							return {dv: angle, cq: radius, eK: x, eL: y};
						}),
					A2($elm$random$Random$float, -0.35, 0.35),
					A2($elm$random$Random$float, -0.35, 0.35),
					A2($elm$random$Random$float, -5, 5),
					A2($elm$random$Random$float, 0.25, 0.4))),
			world.aZ);
		var _v1 = _v0.a;
		var pos = _v1.a;
		var color = _v1.b;
		var offsets = _v1.c;
		var seed = _v0.b;
		if (!pos.$) {
			var position = pos.a;
			return A4(
				$author$project$Main$createFlower,
				position,
				color,
				offsets,
				_Utils_update(
					world,
					{aZ: seed}));
		} else {
			return _Utils_update(
				world,
				{aZ: seed});
		}
	}
};
var $author$project$Main$runTicks = F2(
	function (ticksToRun, world) {
		runTicks:
		while (true) {
			if (ticksToRun < 1) {
				return world;
			} else {
				var $temp$ticksToRun = ticksToRun - 1,
					$temp$world = $author$project$Main$givePollen(
					$author$project$Main$spawnBees(
						$author$project$Main$collectPollen(
							$author$project$Main$assignGoal(
								$author$project$Main$navigate(
									$author$project$Main$spawnFlower(world))))));
				ticksToRun = $temp$ticksToRun;
				world = $temp$world;
				continue runTicks;
			}
		}
	});
var $ianmackenzie$elm_3d_scene$Scene3d$Types$EmptyShadow = {$: 0};
var $ianmackenzie$elm_3d_scene$Scene3d$Types$Shadow = F3(
	function (a, b, c) {
		return {$: 1, a: a, b: b, c: c};
	});
var $ianmackenzie$elm_geometry$Vector3d$cross = F2(
	function (_v0, _v1) {
		var v2 = _v0;
		var v1 = _v1;
		return {eK: (v1.eL * v2.cz) - (v1.cz * v2.eL), eL: (v1.cz * v2.eK) - (v1.eK * v2.cz), cz: (v1.eK * v2.eL) - (v1.eL * v2.eK)};
	});
var $ianmackenzie$elm_geometry$Vector3d$from = F2(
	function (_v0, _v1) {
		var p1 = _v0;
		var p2 = _v1;
		return {eK: p2.eK - p1.eK, eL: p2.eL - p1.eL, cz: p2.cz - p1.cz};
	});
var $ianmackenzie$elm_units$Quantity$float = function (value) {
	return value;
};
var $ianmackenzie$elm_geometry$Vector3d$zero = {eK: 0, eL: 0, cz: 0};
var $ianmackenzie$elm_geometry$Vector3d$scaleTo = F2(
	function (_v0, _v1) {
		var q = _v0;
		var v = _v1;
		var largestComponent = A2(
			$elm$core$Basics$max,
			$elm$core$Basics$abs(v.eK),
			A2(
				$elm$core$Basics$max,
				$elm$core$Basics$abs(v.eL),
				$elm$core$Basics$abs(v.cz)));
		if (!largestComponent) {
			return $ianmackenzie$elm_geometry$Vector3d$zero;
		} else {
			var scaledZ = v.cz / largestComponent;
			var scaledY = v.eL / largestComponent;
			var scaledX = v.eK / largestComponent;
			var scaledLength = $elm$core$Basics$sqrt(((scaledX * scaledX) + (scaledY * scaledY)) + (scaledZ * scaledZ));
			return {eK: (q * scaledX) / scaledLength, eL: (q * scaledY) / scaledLength, cz: (q * scaledZ) / scaledLength};
		}
	});
var $ianmackenzie$elm_geometry$Vector3d$normalize = $ianmackenzie$elm_geometry$Vector3d$scaleTo(
	$ianmackenzie$elm_units$Quantity$float(1));
var $ianmackenzie$elm_3d_scene$Scene3d$Mesh$triangleNormal = F3(
	function (p1, p2, p3) {
		var v2 = A2($ianmackenzie$elm_geometry$Vector3d$from, p2, p3);
		var v1 = A2($ianmackenzie$elm_geometry$Vector3d$from, p1, p2);
		return $ianmackenzie$elm_geometry$Vector3d$normalize(
			A2($ianmackenzie$elm_geometry$Vector3d$cross, v2, v1));
	});
var $ianmackenzie$elm_3d_scene$Scene3d$Mesh$collectShadowVertices = F3(
	function (getPosition, _v0, accumulated) {
		var mv1 = _v0.a;
		var mv2 = _v0.b;
		var mv3 = _v0.c;
		var p3 = getPosition(mv3);
		var p2 = getPosition(mv2);
		var p1 = getPosition(mv1);
		var faceNormal = $ianmackenzie$elm_geometry_linear_algebra_interop$Geometry$Interop$LinearAlgebra$Vector3d$toVec3(
			A3($ianmackenzie$elm_3d_scene$Scene3d$Mesh$triangleNormal, p1, p2, p3));
		var sv1 = {
			s: faceNormal,
			cn: $ianmackenzie$elm_geometry_linear_algebra_interop$Geometry$Interop$LinearAlgebra$Point3d$toVec3(p1)
		};
		var sv2 = {
			s: faceNormal,
			cn: $ianmackenzie$elm_geometry_linear_algebra_interop$Geometry$Interop$LinearAlgebra$Point3d$toVec3(p2)
		};
		var sv3 = {
			s: faceNormal,
			cn: $ianmackenzie$elm_geometry_linear_algebra_interop$Geometry$Interop$LinearAlgebra$Point3d$toVec3(p3)
		};
		return A2(
			$elm$core$List$cons,
			sv1,
			A2(
				$elm$core$List$cons,
				sv2,
				A2($elm$core$List$cons, sv3, accumulated)));
	});
var $elm$core$Maybe$map3 = F4(
	function (func, ma, mb, mc) {
		if (ma.$ === 1) {
			return $elm$core$Maybe$Nothing;
		} else {
			var a = ma.a;
			if (mb.$ === 1) {
				return $elm$core$Maybe$Nothing;
			} else {
				var b = mb.a;
				if (mc.$ === 1) {
					return $elm$core$Maybe$Nothing;
				} else {
					var c = mc.a;
					return $elm$core$Maybe$Just(
						A3(func, a, b, c));
				}
			}
		}
	});
var $ianmackenzie$elm_triangular_mesh$TriangularMesh$vertex = F2(
	function (index, mesh) {
		return A2(
			$elm$core$Array$get,
			index,
			$ianmackenzie$elm_triangular_mesh$TriangularMesh$vertices(mesh));
	});
var $ianmackenzie$elm_triangular_mesh$TriangularMesh$faceVertices = function (mesh) {
	var toFace = function (_v0) {
		var i = _v0.a;
		var j = _v0.b;
		var k = _v0.c;
		return A4(
			$elm$core$Maybe$map3,
			F3(
				function (firstVertex, secondVertex, thirdVertex) {
					return _Utils_Tuple3(firstVertex, secondVertex, thirdVertex);
				}),
			A2($ianmackenzie$elm_triangular_mesh$TriangularMesh$vertex, i, mesh),
			A2($ianmackenzie$elm_triangular_mesh$TriangularMesh$vertex, j, mesh),
			A2($ianmackenzie$elm_triangular_mesh$TriangularMesh$vertex, k, mesh));
	};
	return A2(
		$elm$core$List$filterMap,
		toFace,
		$ianmackenzie$elm_triangular_mesh$TriangularMesh$faceIndices(mesh));
};
var $ianmackenzie$elm_geometry$Point3d$toMeters = function (_v0) {
	var pointCoordinates = _v0;
	return pointCoordinates;
};
var $ianmackenzie$elm_3d_scene$Scene3d$Mesh$edgeKey = F2(
	function (firstPoint, secondPoint) {
		var p2 = $ianmackenzie$elm_geometry$Point3d$toMeters(secondPoint);
		var p1 = $ianmackenzie$elm_geometry$Point3d$toMeters(firstPoint);
		return _Utils_Tuple2(
			_Utils_Tuple3(p1.eK, p1.eL, p1.cz),
			_Utils_Tuple3(p2.eK, p2.eL, p2.cz));
	});
var $ianmackenzie$elm_3d_scene$Scene3d$Mesh$zeroVec3 = A3($elm_explorations$linear_algebra$Math$Vector3$vec3, 0, 0, 0);
var $ianmackenzie$elm_3d_scene$Scene3d$Mesh$joinEdge = F6(
	function (p1, p2, start, end, neighborDict, _v0) {
		var shadowFaceIndices = _v0.a;
		var extraShadowVertices = _v0.b;
		var nextShadowVertexIndex = _v0.c;
		var _v1 = A2(
			$elm$core$Dict$get,
			A2($ianmackenzie$elm_3d_scene$Scene3d$Mesh$edgeKey, p1, p2),
			neighborDict);
		if (!_v1.$) {
			var opposite = _v1.a;
			return _Utils_Tuple3(
				A2(
					$elm$core$List$cons,
					_Utils_Tuple3(start, opposite, end),
					shadowFaceIndices),
				extraShadowVertices,
				nextShadowVertexIndex);
		} else {
			var v2 = {
				s: $ianmackenzie$elm_3d_scene$Scene3d$Mesh$zeroVec3,
				cn: $ianmackenzie$elm_geometry_linear_algebra_interop$Geometry$Interop$LinearAlgebra$Point3d$toVec3(p2)
			};
			var v1 = {
				s: $ianmackenzie$elm_3d_scene$Scene3d$Mesh$zeroVec3,
				cn: $ianmackenzie$elm_geometry_linear_algebra_interop$Geometry$Interop$LinearAlgebra$Point3d$toVec3(p1)
			};
			var b = nextShadowVertexIndex + 1;
			var a = nextShadowVertexIndex;
			return _Utils_Tuple3(
				A2(
					$elm$core$List$cons,
					_Utils_Tuple3(start, a, b),
					A2(
						$elm$core$List$cons,
						_Utils_Tuple3(start, b, end),
						shadowFaceIndices)),
				A2(
					$elm$core$List$cons,
					v2,
					A2($elm$core$List$cons, v1, extraShadowVertices)),
				nextShadowVertexIndex + 2);
		}
	});
var $ianmackenzie$elm_3d_scene$Scene3d$Mesh$joinEdges = F5(
	function (getPosition, neighborDict, meshFaceVertices, nextShadowVertexIndex, state) {
		joinEdges:
		while (true) {
			if (meshFaceVertices.b) {
				var _v1 = meshFaceVertices.a;
				var mv1 = _v1.a;
				var mv2 = _v1.b;
				var mv3 = _v1.c;
				var remainingMeshFaceVertices = meshFaceVertices.b;
				var p3 = getPosition(mv3);
				var p2 = getPosition(mv2);
				var p1 = getPosition(mv1);
				var c = nextShadowVertexIndex + 2;
				var b = nextShadowVertexIndex + 1;
				var a = nextShadowVertexIndex;
				var $temp$getPosition = getPosition,
					$temp$neighborDict = neighborDict,
					$temp$meshFaceVertices = remainingMeshFaceVertices,
					$temp$nextShadowVertexIndex = nextShadowVertexIndex + 3,
					$temp$state = A6(
					$ianmackenzie$elm_3d_scene$Scene3d$Mesh$joinEdge,
					p3,
					p1,
					c,
					a,
					neighborDict,
					A6(
						$ianmackenzie$elm_3d_scene$Scene3d$Mesh$joinEdge,
						p2,
						p3,
						b,
						c,
						neighborDict,
						A6($ianmackenzie$elm_3d_scene$Scene3d$Mesh$joinEdge, p1, p2, a, b, neighborDict, state)));
				getPosition = $temp$getPosition;
				neighborDict = $temp$neighborDict;
				meshFaceVertices = $temp$meshFaceVertices;
				nextShadowVertexIndex = $temp$nextShadowVertexIndex;
				state = $temp$state;
				continue joinEdges;
			} else {
				var _v2 = state;
				var shadowFaceIndices = _v2.a;
				var extraShadowVertices = _v2.b;
				return _Utils_Tuple2(
					shadowFaceIndices,
					$elm$core$List$reverse(extraShadowVertices));
			}
		}
	});
var $ianmackenzie$elm_3d_scene$Scene3d$Mesh$visitFaces = F5(
	function (getPosition, meshFaceVertices, nextShadowVertexIndex, shadowFaceIndices, neighborDict) {
		visitFaces:
		while (true) {
			if (meshFaceVertices.b) {
				var _v1 = meshFaceVertices.a;
				var mv1 = _v1.a;
				var mv2 = _v1.b;
				var mv3 = _v1.c;
				var remainingMeshFaceVertices = meshFaceVertices.b;
				var p3 = getPosition(mv3);
				var p2 = getPosition(mv2);
				var p1 = getPosition(mv1);
				var c = nextShadowVertexIndex + 2;
				var b = nextShadowVertexIndex + 1;
				var a = nextShadowVertexIndex;
				var updatedNeighborDict = A3(
					$elm$core$Dict$insert,
					A2($ianmackenzie$elm_3d_scene$Scene3d$Mesh$edgeKey, p1, p3),
					c,
					A3(
						$elm$core$Dict$insert,
						A2($ianmackenzie$elm_3d_scene$Scene3d$Mesh$edgeKey, p3, p2),
						b,
						A3(
							$elm$core$Dict$insert,
							A2($ianmackenzie$elm_3d_scene$Scene3d$Mesh$edgeKey, p2, p1),
							a,
							neighborDict)));
				var updatedShadowFaceIndices = A2(
					$elm$core$List$cons,
					_Utils_Tuple3(a, b, c),
					shadowFaceIndices);
				var $temp$getPosition = getPosition,
					$temp$meshFaceVertices = remainingMeshFaceVertices,
					$temp$nextShadowVertexIndex = nextShadowVertexIndex + 3,
					$temp$shadowFaceIndices = updatedShadowFaceIndices,
					$temp$neighborDict = updatedNeighborDict;
				getPosition = $temp$getPosition;
				meshFaceVertices = $temp$meshFaceVertices;
				nextShadowVertexIndex = $temp$nextShadowVertexIndex;
				shadowFaceIndices = $temp$shadowFaceIndices;
				neighborDict = $temp$neighborDict;
				continue visitFaces;
			} else {
				return _Utils_Tuple3(shadowFaceIndices, neighborDict, nextShadowVertexIndex);
			}
		}
	});
var $ianmackenzie$elm_3d_scene$Scene3d$Mesh$shadowImpl = F3(
	function (meshBounds, getPosition, triangularMesh) {
		var meshFaceVertices = $ianmackenzie$elm_triangular_mesh$TriangularMesh$faceVertices(triangularMesh);
		var initialShadowVertices = A3(
			$elm$core$List$foldr,
			$ianmackenzie$elm_3d_scene$Scene3d$Mesh$collectShadowVertices(getPosition),
			_List_Nil,
			meshFaceVertices);
		var _v0 = A5($ianmackenzie$elm_3d_scene$Scene3d$Mesh$visitFaces, getPosition, meshFaceVertices, 0, _List_Nil, $elm$core$Dict$empty);
		var initialShadowFaceIndices = _v0.a;
		var neighborDict = _v0.b;
		var nextShadowVertexIndex = _v0.c;
		var _v1 = A5(
			$ianmackenzie$elm_3d_scene$Scene3d$Mesh$joinEdges,
			getPosition,
			neighborDict,
			meshFaceVertices,
			0,
			_Utils_Tuple3(initialShadowFaceIndices, _List_Nil, nextShadowVertexIndex));
		var allShadowFaceIndices = _v1.a;
		var extraShadowVertices = _v1.b;
		var allShadowVertices = $elm$core$List$isEmpty(extraShadowVertices) ? initialShadowVertices : _Utils_ap(initialShadowVertices, extraShadowVertices);
		return A3(
			$ianmackenzie$elm_3d_scene$Scene3d$Types$Shadow,
			meshBounds,
			A2(
				$ianmackenzie$elm_triangular_mesh$TriangularMesh$indexed,
				$elm$core$Array$fromList(allShadowVertices),
				allShadowFaceIndices),
			A2($elm_explorations$webgl$WebGL$indexedTriangles, allShadowVertices, allShadowFaceIndices));
	});
var $ianmackenzie$elm_triangular_mesh$TriangularMesh$triangles = function (faceVertices_) {
	return {
		I: A2(
			$elm$core$List$map,
			function (i) {
				return _Utils_Tuple3(3 * i, (3 * i) + 1, (3 * i) + 2);
			},
			A2(
				$elm$core$List$range,
				0,
				$elm$core$List$length(faceVertices_) - 1)),
		at: $elm$core$Array$fromList(
			$elm$core$List$concat(
				A2(
					$elm$core$List$map,
					function (_v0) {
						var v1 = _v0.a;
						var v2 = _v0.b;
						var v3 = _v0.c;
						return _List_fromArray(
							[v1, v2, v3]);
					},
					faceVertices_)))
	};
};
var $ianmackenzie$elm_geometry$Triangle3d$vertices = function (_v0) {
	var triangleVertices = _v0;
	return triangleVertices;
};
var $ianmackenzie$elm_3d_scene$Scene3d$Mesh$shadow = function (mesh) {
	switch (mesh.$) {
		case 0:
			return $ianmackenzie$elm_3d_scene$Scene3d$Types$EmptyShadow;
		case 1:
			var boundingBox = mesh.a;
			var meshTriangles = mesh.b;
			var vertexTriples = A2($elm$core$List$map, $ianmackenzie$elm_geometry$Triangle3d$vertices, meshTriangles);
			return A3(
				$ianmackenzie$elm_3d_scene$Scene3d$Mesh$shadowImpl,
				boundingBox,
				$elm$core$Basics$identity,
				$ianmackenzie$elm_triangular_mesh$TriangularMesh$triangles(vertexTriples));
		case 2:
			var boundingBox = mesh.a;
			var meshTriangles = mesh.b;
			var vertexTriples = A2($elm$core$List$map, $ianmackenzie$elm_geometry$Triangle3d$vertices, meshTriangles);
			return A3(
				$ianmackenzie$elm_3d_scene$Scene3d$Mesh$shadowImpl,
				boundingBox,
				$elm$core$Basics$identity,
				$ianmackenzie$elm_triangular_mesh$TriangularMesh$triangles(vertexTriples));
		case 3:
			var boundingBox = mesh.a;
			var triangularMesh = mesh.b;
			return A3($ianmackenzie$elm_3d_scene$Scene3d$Mesh$shadowImpl, boundingBox, $elm$core$Basics$identity, triangularMesh);
		case 4:
			var boundingBox = mesh.a;
			var triangularMesh = mesh.b;
			return A3(
				$ianmackenzie$elm_3d_scene$Scene3d$Mesh$shadowImpl,
				boundingBox,
				function ($) {
					return $.cn;
				},
				triangularMesh);
		case 5:
			var boundingBox = mesh.a;
			var triangularMesh = mesh.b;
			return A3(
				$ianmackenzie$elm_3d_scene$Scene3d$Mesh$shadowImpl,
				boundingBox,
				function ($) {
					return $.cn;
				},
				triangularMesh);
		case 6:
			var boundingBox = mesh.a;
			var triangularMesh = mesh.b;
			return A3(
				$ianmackenzie$elm_3d_scene$Scene3d$Mesh$shadowImpl,
				boundingBox,
				function ($) {
					return $.cn;
				},
				triangularMesh);
		case 7:
			var boundingBox = mesh.a;
			var triangularMesh = mesh.b;
			return A3(
				$ianmackenzie$elm_3d_scene$Scene3d$Mesh$shadowImpl,
				boundingBox,
				function ($) {
					return $.cn;
				},
				triangularMesh);
		case 8:
			return $ianmackenzie$elm_3d_scene$Scene3d$Types$EmptyShadow;
		case 9:
			return $ianmackenzie$elm_3d_scene$Scene3d$Types$EmptyShadow;
		default:
			return $ianmackenzie$elm_3d_scene$Scene3d$Types$EmptyShadow;
	}
};
var $author$project$Main$tickTime = 1000;
var $author$project$Main$update = F2(
	function (msg, model) {
		var _v0 = _Utils_Tuple2(msg, model);
		_v0$3:
		while (true) {
			switch (_v0.a.$) {
				case 2:
					if (_v0.a.a.$ === 1) {
						if (!_v0.b.$) {
							var err = _v0.a.a.a;
							var _v1 = _v0.b;
							return _Utils_Tuple2(
								$author$project$Main$FailedToLoad(
									$author$project$Main$errorToString(err)),
								$elm$core$Platform$Cmd$none);
						} else {
							break _v0$3;
						}
					} else {
						if (!_v0.b.$) {
							var mesh = _v0.a.a.a;
							var _v2 = _v0.b;
							var hiveMeshUniform = $ianmackenzie$elm_3d_scene$Scene3d$Mesh$indexedFaces(mesh);
							var hiveMesh = A3(
								$ianmackenzie$elm_3d_scene$Scene3d$meshWithShadow,
								$ianmackenzie$elm_3d_scene$Scene3d$Material$matte($avh4$elm_color$Color$yellow),
								hiveMeshUniform,
								$ianmackenzie$elm_3d_scene$Scene3d$Mesh$shadow(hiveMeshUniform));
							return _Utils_Tuple2(
								$author$project$Main$Loaded(
									$author$project$Main$initWorld(hiveMesh)),
								$elm$core$Platform$Cmd$none);
						} else {
							break _v0$3;
						}
					}
				case 1:
					if (_v0.b.$ === 1) {
						var deltaMs = _v0.a.a;
						var world = _v0.b.a;
						var totalTime = world.cv + deltaMs;
						var ticksToRun = $elm$core$Basics$floor(totalTime / $author$project$Main$tickTime);
						var remainingTime = totalTime - (ticksToRun * $author$project$Main$tickTime);
						var interpolateDist = A2($elm$core$Basics$min, 1, totalTime / $author$project$Main$tickTime);
						return _Utils_Tuple2(
							$author$project$Main$Loaded(
								A2(
									$author$project$Main$runTicks,
									ticksToRun,
									A2(
										$author$project$Main$runAnimation,
										interpolateDist,
										_Utils_update(
											world,
											{cv: remainingTime})))),
							$elm$core$Platform$Cmd$none);
					} else {
						break _v0$3;
					}
				default:
					break _v0$3;
			}
		}
		return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
	});
var $elm$virtual_dom$VirtualDom$text = _VirtualDom_text;
var $elm$html$Html$text = $elm$virtual_dom$VirtualDom$text;
var $ianmackenzie$elm_3d_scene$Scene3d$BackgroundColor = $elm$core$Basics$identity;
var $ianmackenzie$elm_3d_scene$Scene3d$backgroundColor = function (color) {
	return color;
};
var $avh4$elm_color$Color$black = A4($avh4$elm_color$Color$RgbaSpace, 0 / 255, 0 / 255, 0 / 255, 1.0);
var $ianmackenzie$elm_geometry$Cylinder3d$axis = function (_v0) {
	var cylinder = _v0;
	return cylinder.n;
};
var $ianmackenzie$elm_units$Angle$cos = function (_v0) {
	var angle = _v0;
	return $elm$core$Basics$cos(angle);
};
var $ianmackenzie$elm_3d_scene$Scene3d$Types$CullBackFaces = 1;
var $ianmackenzie$elm_3d_scene$Scene3d$Types$Facets = F4(
	function (a, b, c, d) {
		return {$: 2, a: a, b: b, c: c, d: d};
	});
var $ianmackenzie$elm_3d_scene$Scene3d$Types$Indexed = F4(
	function (a, b, c, d) {
		return {$: 3, a: a, b: b, c: c, d: d};
	});
var $ianmackenzie$elm_3d_scene$Scene3d$Types$MeshWithNormalsAndUvs = F4(
	function (a, b, c, d) {
		return {$: 6, a: a, b: b, c: c, d: d};
	});
var $ianmackenzie$elm_3d_scene$Scene3d$Types$MeshWithTangents = F4(
	function (a, b, c, d) {
		return {$: 7, a: a, b: b, c: c, d: d};
	});
var $ianmackenzie$elm_3d_scene$Scene3d$Types$MeshWithUvs = F4(
	function (a, b, c, d) {
		return {$: 5, a: a, b: b, c: c, d: d};
	});
var $ianmackenzie$elm_3d_scene$Scene3d$Types$Triangles = F4(
	function (a, b, c, d) {
		return {$: 1, a: a, b: b, c: c, d: d};
	});
var $ianmackenzie$elm_3d_scene$Scene3d$Mesh$cullBackFaces = function (mesh) {
	switch (mesh.$) {
		case 0:
			return mesh;
		case 1:
			var boundingBox = mesh.a;
			var meshTriangles = mesh.b;
			var webGLMesh = mesh.c;
			return A4($ianmackenzie$elm_3d_scene$Scene3d$Types$Triangles, boundingBox, meshTriangles, webGLMesh, 1);
		case 2:
			var boundingBox = mesh.a;
			var meshTriangles = mesh.b;
			var webGLMesh = mesh.c;
			return A4($ianmackenzie$elm_3d_scene$Scene3d$Types$Facets, boundingBox, meshTriangles, webGLMesh, 1);
		case 3:
			var boundingBox = mesh.a;
			var triangularMesh = mesh.b;
			var webGLMesh = mesh.c;
			return A4($ianmackenzie$elm_3d_scene$Scene3d$Types$Indexed, boundingBox, triangularMesh, webGLMesh, 1);
		case 4:
			var boundingBox = mesh.a;
			var triangularMesh = mesh.b;
			var webGLMesh = mesh.c;
			return A4($ianmackenzie$elm_3d_scene$Scene3d$Types$MeshWithNormals, boundingBox, triangularMesh, webGLMesh, 1);
		case 5:
			var boundingBox = mesh.a;
			var triangularMesh = mesh.b;
			var webGLMesh = mesh.c;
			return A4($ianmackenzie$elm_3d_scene$Scene3d$Types$MeshWithUvs, boundingBox, triangularMesh, webGLMesh, 1);
		case 6:
			var boundingBox = mesh.a;
			var triangularMesh = mesh.b;
			var webGLMesh = mesh.c;
			return A4($ianmackenzie$elm_3d_scene$Scene3d$Types$MeshWithNormalsAndUvs, boundingBox, triangularMesh, webGLMesh, 1);
		case 7:
			var boundingBox = mesh.a;
			var triangularMesh = mesh.b;
			var webGLMesh = mesh.c;
			return A4($ianmackenzie$elm_3d_scene$Scene3d$Types$MeshWithTangents, boundingBox, triangularMesh, webGLMesh, 1);
		case 8:
			return mesh;
		case 9:
			return mesh;
		default:
			return mesh;
	}
};
var $ianmackenzie$elm_units$Quantity$divideBy = F2(
	function (divisor, _v0) {
		var value = _v0;
		return value / divisor;
	});
var $ianmackenzie$elm_geometry$Geometry$Types$Direction2d = $elm$core$Basics$identity;
var $ianmackenzie$elm_geometry$Direction2d$fromAngle = function (_v0) {
	var angle = _v0;
	return {
		eK: $elm$core$Basics$cos(angle),
		eL: $elm$core$Basics$sin(angle)
	};
};
var $elm$core$Basics$modBy = _Basics_modBy;
var $ianmackenzie$elm_units$Quantity$multiplyBy = F2(
	function (scale, _v0) {
		var value = _v0;
		return scale * value;
	});
var $ianmackenzie$elm_geometry$Direction3d$on = F2(
	function (_v0, _v1) {
		var sketchPlane = _v0;
		var d = _v1;
		var _v2 = sketchPlane.ds;
		var j = _v2;
		var _v3 = sketchPlane.dr;
		var i = _v3;
		return {eK: (d.eK * i.eK) + (d.eL * j.eK), eL: (d.eK * i.eL) + (d.eL * j.eL), cz: (d.eK * i.cz) + (d.eL * j.cz)};
	});
var $ianmackenzie$elm_units$Angle$sin = function (_v0) {
	var angle = _v0;
	return $elm$core$Basics$sin(angle);
};
var $ianmackenzie$elm_units$Angle$turns = function (numTurns) {
	return $ianmackenzie$elm_units$Angle$radians((2 * $elm$core$Basics$pi) * numTurns);
};
var $ianmackenzie$elm_geometry$Geometry$Types$SketchPlane3d = $elm$core$Basics$identity;
var $ianmackenzie$elm_geometry$SketchPlane3d$unsafe = $elm$core$Basics$identity;
var $ianmackenzie$elm_geometry$SketchPlane3d$xy = $ianmackenzie$elm_geometry$SketchPlane3d$unsafe(
	{c1: $ianmackenzie$elm_geometry$Point3d$origin, dr: $ianmackenzie$elm_geometry$Direction3d$x, ds: $ianmackenzie$elm_geometry$Direction3d$y});
var $ianmackenzie$elm_units$Quantity$zero = 0;
var $ianmackenzie$elm_3d_scene$Scene3d$Primitives$cylinder = function () {
	var subdivisions = 72;
	var wedgeAngle = A2(
		$ianmackenzie$elm_units$Quantity$divideBy,
		subdivisions,
		$ianmackenzie$elm_units$Angle$turns(1));
	var radius = $ianmackenzie$elm_units$Length$meters(1);
	var positiveZVector = $ianmackenzie$elm_geometry$Direction3d$toVector($ianmackenzie$elm_geometry$Direction3d$positiveZ);
	var negativeZVector = $ianmackenzie$elm_geometry$Direction3d$toVector($ianmackenzie$elm_geometry$Direction3d$negativeZ);
	var height = $ianmackenzie$elm_units$Length$meters(1);
	var topZ = A2($ianmackenzie$elm_units$Quantity$multiplyBy, 0.5, height);
	var topCenter = A3($ianmackenzie$elm_geometry$Point3d$xyz, $ianmackenzie$elm_units$Quantity$zero, $ianmackenzie$elm_units$Quantity$zero, topZ);
	var bottomZ = A2($ianmackenzie$elm_units$Quantity$multiplyBy, -0.5, height);
	var bottomCenter = A3($ianmackenzie$elm_geometry$Point3d$xyz, $ianmackenzie$elm_units$Quantity$zero, $ianmackenzie$elm_units$Quantity$zero, bottomZ);
	var wedge = function (startIndex) {
		var startAngle = A2($ianmackenzie$elm_units$Quantity$multiplyBy, startIndex, wedgeAngle);
		var startNormal = $ianmackenzie$elm_geometry$Direction3d$toVector(
			A2(
				$ianmackenzie$elm_geometry$Direction3d$on,
				$ianmackenzie$elm_geometry$SketchPlane3d$xy,
				$ianmackenzie$elm_geometry$Direction2d$fromAngle(startAngle)));
		var startX = A2(
			$ianmackenzie$elm_units$Quantity$multiplyBy,
			$ianmackenzie$elm_units$Angle$cos(startAngle),
			radius);
		var startY = A2(
			$ianmackenzie$elm_units$Quantity$multiplyBy,
			$ianmackenzie$elm_units$Angle$sin(startAngle),
			radius);
		var p2 = A3($ianmackenzie$elm_geometry$Point3d$xyz, startX, startY, topZ);
		var p0 = A3($ianmackenzie$elm_geometry$Point3d$xyz, startX, startY, bottomZ);
		var endIndex = A2($elm$core$Basics$modBy, subdivisions, startIndex + 1);
		var endAngle = A2($ianmackenzie$elm_units$Quantity$multiplyBy, endIndex, wedgeAngle);
		var endNormal = $ianmackenzie$elm_geometry$Direction3d$toVector(
			A2(
				$ianmackenzie$elm_geometry$Direction3d$on,
				$ianmackenzie$elm_geometry$SketchPlane3d$xy,
				$ianmackenzie$elm_geometry$Direction2d$fromAngle(endAngle)));
		var endX = A2(
			$ianmackenzie$elm_units$Quantity$multiplyBy,
			$ianmackenzie$elm_units$Angle$cos(endAngle),
			radius);
		var endY = A2(
			$ianmackenzie$elm_units$Quantity$multiplyBy,
			$ianmackenzie$elm_units$Angle$sin(endAngle),
			radius);
		var p1 = A3($ianmackenzie$elm_geometry$Point3d$xyz, endX, endY, bottomZ);
		var p3 = A3($ianmackenzie$elm_geometry$Point3d$xyz, endX, endY, topZ);
		return _List_fromArray(
			[
				_Utils_Tuple3(
				{s: negativeZVector, cn: bottomCenter},
				{s: negativeZVector, cn: p1},
				{s: negativeZVector, cn: p0}),
				_Utils_Tuple3(
				{s: startNormal, cn: p0},
				{s: endNormal, cn: p1},
				{s: endNormal, cn: p3}),
				_Utils_Tuple3(
				{s: startNormal, cn: p0},
				{s: endNormal, cn: p3},
				{s: startNormal, cn: p2}),
				_Utils_Tuple3(
				{s: positiveZVector, cn: topCenter},
				{s: positiveZVector, cn: p2},
				{s: positiveZVector, cn: p3})
			]);
	};
	var wedges = A2(
		$elm$core$List$map,
		wedge,
		A2($elm$core$List$range, 0, subdivisions - 1));
	var triangularMesh = $ianmackenzie$elm_triangular_mesh$TriangularMesh$triangles(
		$elm$core$List$concat(wedges));
	return $ianmackenzie$elm_3d_scene$Scene3d$Mesh$cullBackFaces(
		$ianmackenzie$elm_3d_scene$Scene3d$Mesh$indexedFaces(triangularMesh));
}();
var $ianmackenzie$elm_3d_scene$Scene3d$Primitives$cylinderShadow = $ianmackenzie$elm_3d_scene$Scene3d$Mesh$shadow($ianmackenzie$elm_3d_scene$Scene3d$Primitives$cylinder);
var $ianmackenzie$elm_geometry$Axis3d$direction = function (_v0) {
	var axis = _v0;
	return axis.e$;
};
var $ianmackenzie$elm_geometry$Axis3d$originPoint = function (_v0) {
	var axis = _v0;
	return axis.c1;
};
var $ianmackenzie$elm_geometry$Direction3d$perpendicularTo = function (_v0) {
	var d = _v0;
	var absZ = $elm$core$Basics$abs(d.cz);
	var absY = $elm$core$Basics$abs(d.eL);
	var absX = $elm$core$Basics$abs(d.eK);
	if (_Utils_cmp(absX, absY) < 1) {
		if (_Utils_cmp(absX, absZ) < 1) {
			var scale = $elm$core$Basics$sqrt((d.cz * d.cz) + (d.eL * d.eL));
			return {eK: 0, eL: (-d.cz) / scale, cz: d.eL / scale};
		} else {
			var scale = $elm$core$Basics$sqrt((d.eL * d.eL) + (d.eK * d.eK));
			return {eK: (-d.eL) / scale, eL: d.eK / scale, cz: 0};
		}
	} else {
		if (_Utils_cmp(absY, absZ) < 1) {
			var scale = $elm$core$Basics$sqrt((d.cz * d.cz) + (d.eK * d.eK));
			return {eK: d.cz / scale, eL: 0, cz: (-d.eK) / scale};
		} else {
			var scale = $elm$core$Basics$sqrt((d.eK * d.eK) + (d.eL * d.eL));
			return {eK: (-d.eL) / scale, eL: d.eK / scale, cz: 0};
		}
	}
};
var $ianmackenzie$elm_geometry$Direction3d$perpendicularBasis = function (direction) {
	var xDirection = $ianmackenzie$elm_geometry$Direction3d$perpendicularTo(direction);
	var _v0 = xDirection;
	var dX = _v0;
	var _v1 = direction;
	var d = _v1;
	var yDirection = {eK: (d.eL * dX.cz) - (d.cz * dX.eL), eL: (d.cz * dX.eK) - (d.eK * dX.cz), cz: (d.eK * dX.eL) - (d.eL * dX.eK)};
	return _Utils_Tuple2(xDirection, yDirection);
};
var $ianmackenzie$elm_geometry$Frame3d$fromZAxis = function (givenZAxis) {
	var givenZDirection = $ianmackenzie$elm_geometry$Axis3d$direction(givenZAxis);
	var _v0 = $ianmackenzie$elm_geometry$Direction3d$perpendicularBasis(givenZDirection);
	var computedXDirection = _v0.a;
	var computedYDirection = _v0.b;
	return $ianmackenzie$elm_geometry$Frame3d$unsafe(
		{
			c1: $ianmackenzie$elm_geometry$Axis3d$originPoint(givenZAxis),
			dr: computedXDirection,
			ds: computedYDirection,
			dt: givenZDirection
		});
};
var $ianmackenzie$elm_geometry$Cylinder3d$length = function (_v0) {
	var cylinder = _v0;
	return cylinder.dM;
};
var $ianmackenzie$elm_geometry$Direction3d$xComponent = function (_v0) {
	var d = _v0;
	return d.eK;
};
var $ianmackenzie$elm_geometry$Direction3d$yComponent = function (_v0) {
	var d = _v0;
	return d.eL;
};
var $ianmackenzie$elm_geometry$Direction3d$zComponent = function (_v0) {
	var d = _v0;
	return d.cz;
};
var $ianmackenzie$elm_geometry$Frame3d$isRightHanded = function (_v0) {
	var frame = _v0;
	var i = $ianmackenzie$elm_geometry$Direction3d$zComponent(frame.dt);
	var h = $ianmackenzie$elm_geometry$Direction3d$yComponent(frame.dt);
	var g = $ianmackenzie$elm_geometry$Direction3d$xComponent(frame.dt);
	var f = $ianmackenzie$elm_geometry$Direction3d$zComponent(frame.ds);
	var e = $ianmackenzie$elm_geometry$Direction3d$yComponent(frame.ds);
	var d = $ianmackenzie$elm_geometry$Direction3d$xComponent(frame.ds);
	var c = $ianmackenzie$elm_geometry$Direction3d$zComponent(frame.dr);
	var b = $ianmackenzie$elm_geometry$Direction3d$yComponent(frame.dr);
	var a = $ianmackenzie$elm_geometry$Direction3d$xComponent(frame.dr);
	return (((((((a * e) * i) + ((b * f) * g)) + ((c * d) * h)) - ((c * e) * g)) - ((b * d) * i)) - ((a * f) * h)) > 0;
};
var $ianmackenzie$elm_geometry$Direction3d$unwrap = function (_v0) {
	var coordinates = _v0;
	return coordinates;
};
var $ianmackenzie$elm_3d_scene$Scene3d$Transformation$placeIn = function (frame) {
	var p0 = $ianmackenzie$elm_geometry$Point3d$unwrap(
		$ianmackenzie$elm_geometry$Frame3d$originPoint(frame));
	var k = $ianmackenzie$elm_geometry$Direction3d$unwrap(
		$ianmackenzie$elm_geometry$Frame3d$zDirection(frame));
	var j = $ianmackenzie$elm_geometry$Direction3d$unwrap(
		$ianmackenzie$elm_geometry$Frame3d$yDirection(frame));
	var i = $ianmackenzie$elm_geometry$Direction3d$unwrap(
		$ianmackenzie$elm_geometry$Frame3d$xDirection(frame));
	return {
		dK: $ianmackenzie$elm_geometry$Frame3d$isRightHanded(frame),
		u: i.eK,
		v: i.eL,
		w: i.cz,
		x: j.eK,
		y: j.eL,
		z: j.cz,
		A: k.eK,
		B: k.eL,
		C: k.cz,
		L: p0.eK,
		M: p0.eL,
		N: p0.cz,
		cs: 1
	};
};
var $ianmackenzie$elm_3d_scene$Scene3d$Types$Transformed = F2(
	function (a, b) {
		return {$: 5, a: a, b: b};
	});
var $ianmackenzie$elm_3d_scene$Scene3d$Transformation$compose = F2(
	function (t1, t2) {
		return {
			dK: _Utils_eq(t1.dK, t2.dK),
			u: ((t1.u * t2.u) + (t1.v * t2.x)) + (t1.w * t2.A),
			v: ((t1.u * t2.v) + (t1.v * t2.y)) + (t1.w * t2.B),
			w: ((t1.u * t2.w) + (t1.v * t2.z)) + (t1.w * t2.C),
			x: ((t1.x * t2.u) + (t1.y * t2.x)) + (t1.z * t2.A),
			y: ((t1.x * t2.v) + (t1.y * t2.y)) + (t1.z * t2.B),
			z: ((t1.x * t2.w) + (t1.y * t2.z)) + (t1.z * t2.C),
			A: ((t1.A * t2.u) + (t1.B * t2.x)) + (t1.C * t2.A),
			B: ((t1.A * t2.v) + (t1.B * t2.y)) + (t1.C * t2.B),
			C: ((t1.A * t2.w) + (t1.B * t2.z)) + (t1.C * t2.C),
			L: t2.L + ((((t1.L * t2.u) + (t1.M * t2.x)) + (t1.N * t2.A)) * t2.cs),
			M: t2.M + ((((t1.L * t2.v) + (t1.M * t2.y)) + (t1.N * t2.B)) * t2.cs),
			N: t2.N + ((((t1.L * t2.w) + (t1.M * t2.z)) + (t1.N * t2.C)) * t2.cs),
			cs: t1.cs * t2.cs
		};
	});
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$transformBy = F2(
	function (transformation, _v0) {
		var node = _v0;
		switch (node.$) {
			case 0:
				return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
			case 5:
				var existingTransformation = node.a;
				var underlyingNode = node.b;
				var compositeTransformation = A2($ianmackenzie$elm_3d_scene$Scene3d$Transformation$compose, existingTransformation, transformation);
				return A2($ianmackenzie$elm_3d_scene$Scene3d$Types$Transformed, compositeTransformation, underlyingNode);
			case 1:
				return A2($ianmackenzie$elm_3d_scene$Scene3d$Types$Transformed, transformation, node);
			case 3:
				return A2($ianmackenzie$elm_3d_scene$Scene3d$Types$Transformed, transformation, node);
			case 2:
				return A2($ianmackenzie$elm_3d_scene$Scene3d$Types$Transformed, transformation, node);
			default:
				return A2($ianmackenzie$elm_3d_scene$Scene3d$Types$Transformed, transformation, node);
		}
	});
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$placeIn = F2(
	function (frame, givenDrawable) {
		return A2(
			$ianmackenzie$elm_3d_scene$Scene3d$Entity$transformBy,
			$ianmackenzie$elm_3d_scene$Scene3d$Transformation$placeIn(frame),
			givenDrawable);
	});
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$preScaleBounds = F2(
	function (_v0, bounds) {
		var scaleX = _v0.a;
		var scaleY = _v0.b;
		var scaleZ = _v0.c;
		var originalCenterPoint = bounds.eV;
		return {
			eV: {eK: scaleX * originalCenterPoint.eK, eL: scaleY * originalCenterPoint.eL, cz: scaleZ * originalCenterPoint.cz},
			fc: scaleX * bounds.fc,
			fd: scaleY * bounds.fd,
			fe: scaleZ * bounds.fe
		};
	});
var $elm_explorations$linear_algebra$Math$Vector4$fromRecord = _MJS_v4fromRecord;
var $elm_explorations$linear_algebra$Math$Vector4$toRecord = _MJS_v4toRecord;
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$preScaleDrawFunction = function (_v0) {
	return function (originalDrawFunction) {
		return function (sceneProperties) {
			return function (modelScale) {
				return function (modelMatrix) {
					return function (isRightHanded) {
						return function (viewMatrix) {
							return function (projectionMatrix) {
								return function (lights) {
									return function (settings) {
										var scaleX = _v0.a;
										var scaleY = _v0.b;
										var scaleZ = _v0.c;
										var _v1 = $elm_explorations$linear_algebra$Math$Vector4$toRecord(modelScale);
										var x = _v1.eK;
										var y = _v1.eL;
										var z = _v1.cz;
										var w = _v1.eI;
										var updatedModelScale = $elm_explorations$linear_algebra$Math$Vector4$fromRecord(
											{eI: w, eK: x * scaleX, eL: y * scaleY, cz: z * scaleZ});
										return A8(originalDrawFunction, sceneProperties, updatedModelScale, modelMatrix, isRightHanded, viewMatrix, projectionMatrix, lights, settings);
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$preScaleNode = F2(
	function (scalingFactors, node) {
		switch (node.$) {
			case 0:
				return $ianmackenzie$elm_3d_scene$Scene3d$Types$EmptyNode;
			case 5:
				var transformation = node.a;
				var underlyingNode = node.b;
				return A2(
					$ianmackenzie$elm_3d_scene$Scene3d$Types$Transformed,
					transformation,
					A2($ianmackenzie$elm_3d_scene$Scene3d$Entity$preScaleNode, scalingFactors, underlyingNode));
			case 1:
				var bounds = node.a;
				var drawFunction = node.b;
				return A2(
					$ianmackenzie$elm_3d_scene$Scene3d$Types$MeshNode,
					A2($ianmackenzie$elm_3d_scene$Scene3d$Entity$preScaleBounds, scalingFactors, bounds),
					A2($ianmackenzie$elm_3d_scene$Scene3d$Entity$preScaleDrawFunction, scalingFactors, drawFunction));
			case 3:
				return node;
			case 2:
				var drawFunction = node.a;
				return $ianmackenzie$elm_3d_scene$Scene3d$Types$ShadowNode(
					A2($ianmackenzie$elm_3d_scene$Scene3d$Entity$preScaleDrawFunction, scalingFactors, drawFunction));
			default:
				var childNodes = node.a;
				return $ianmackenzie$elm_3d_scene$Scene3d$Types$Group(
					A2(
						$elm$core$List$map,
						$ianmackenzie$elm_3d_scene$Scene3d$Entity$preScaleNode(scalingFactors),
						childNodes));
		}
	});
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$preScale = F2(
	function (scalingFactors, _v0) {
		var node = _v0;
		return A2($ianmackenzie$elm_3d_scene$Scene3d$Entity$preScaleNode, scalingFactors, node);
	});
var $ianmackenzie$elm_geometry$Cylinder3d$radius = function (_v0) {
	var cylinder = _v0;
	return cylinder.cq;
};
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$cylinder = F4(
	function (renderObject, renderShadow, givenMaterial, givenCylinder) {
		var centerFrame = $ianmackenzie$elm_geometry$Frame3d$fromZAxis(
			$ianmackenzie$elm_geometry$Cylinder3d$axis(givenCylinder));
		var baseEntity = A2($ianmackenzie$elm_3d_scene$Scene3d$Entity$mesh, givenMaterial, $ianmackenzie$elm_3d_scene$Scene3d$Primitives$cylinder);
		var untransformedEntity = function () {
			var _v2 = _Utils_Tuple2(renderObject, renderShadow);
			if (_v2.a) {
				if (_v2.b) {
					return $ianmackenzie$elm_3d_scene$Scene3d$Entity$group(
						_List_fromArray(
							[
								baseEntity,
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$shadow($ianmackenzie$elm_3d_scene$Scene3d$Primitives$cylinderShadow)
							]));
				} else {
					return baseEntity;
				}
			} else {
				if (_v2.b) {
					return $ianmackenzie$elm_3d_scene$Scene3d$Entity$shadow($ianmackenzie$elm_3d_scene$Scene3d$Primitives$cylinderShadow);
				} else {
					return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
				}
			}
		}();
		var _v0 = $ianmackenzie$elm_geometry$Cylinder3d$radius(givenCylinder);
		var radius = _v0;
		var _v1 = $ianmackenzie$elm_geometry$Cylinder3d$length(givenCylinder);
		var length = _v1;
		return A2(
			$ianmackenzie$elm_3d_scene$Scene3d$Entity$placeIn,
			centerFrame,
			A2(
				$ianmackenzie$elm_3d_scene$Scene3d$Entity$preScale,
				_Utils_Tuple3(radius, radius, length),
				untransformedEntity));
	});
var $ianmackenzie$elm_3d_scene$Scene3d$cylinderWithShadow = F2(
	function (givenMaterial, givenCylinder) {
		return A4($ianmackenzie$elm_3d_scene$Scene3d$Entity$cylinder, true, true, givenMaterial, givenCylinder);
	});
var $elm$html$Html$div = _VirtualDom_node('div');
var $avh4$elm_color$Color$green = A4($avh4$elm_color$Color$RgbaSpace, 115 / 255, 210 / 255, 22 / 255, 1.0);
var $ianmackenzie$elm_units$Pixels$int = function (numPixels) {
	return numPixels;
};
var $ianmackenzie$elm_3d_camera$Camera3d$Types$Viewpoint3d = $elm$core$Basics$identity;
var $ianmackenzie$elm_geometry$Vector3d$direction = function (_v0) {
	var v = _v0;
	var largestComponent = A2(
		$elm$core$Basics$max,
		$elm$core$Basics$abs(v.eK),
		A2(
			$elm$core$Basics$max,
			$elm$core$Basics$abs(v.eL),
			$elm$core$Basics$abs(v.cz)));
	if (!largestComponent) {
		return $elm$core$Maybe$Nothing;
	} else {
		var scaledZ = v.cz / largestComponent;
		var scaledY = v.eL / largestComponent;
		var scaledX = v.eK / largestComponent;
		var scaledLength = $elm$core$Basics$sqrt(((scaledX * scaledX) + (scaledY * scaledY)) + (scaledZ * scaledZ));
		return $elm$core$Maybe$Just(
			{eK: scaledX / scaledLength, eL: scaledY / scaledLength, cz: scaledZ / scaledLength});
	}
};
var $elm$core$Maybe$andThen = F2(
	function (callback, maybeValue) {
		if (!maybeValue.$) {
			var value = maybeValue.a;
			return callback(value);
		} else {
			return $elm$core$Maybe$Nothing;
		}
	});
var $ianmackenzie$elm_geometry$Vector3d$dot = F2(
	function (_v0, _v1) {
		var v2 = _v0;
		var v1 = _v1;
		return ((v1.eK * v2.eK) + (v1.eL * v2.eL)) + (v1.cz * v2.cz);
	});
var $ianmackenzie$elm_units$Quantity$greaterThan = F2(
	function (_v0, _v1) {
		var y = _v0;
		var x = _v1;
		return _Utils_cmp(x, y) > 0;
	});
var $ianmackenzie$elm_units$Quantity$lessThan = F2(
	function (_v0, _v1) {
		var y = _v0;
		var x = _v1;
		return _Utils_cmp(x, y) < 0;
	});
var $ianmackenzie$elm_geometry$Vector3d$minus = F2(
	function (_v0, _v1) {
		var v2 = _v0;
		var v1 = _v1;
		return {eK: v1.eK - v2.eK, eL: v1.eL - v2.eL, cz: v1.cz - v2.cz};
	});
var $ianmackenzie$elm_geometry$Vector3d$projectionIn = F2(
	function (_v0, _v1) {
		var d = _v0;
		var v = _v1;
		var projectedLength = ((v.eK * d.eK) + (v.eL * d.eL)) + (v.cz * d.cz);
		return {eK: d.eK * projectedLength, eL: d.eL * projectedLength, cz: d.cz * projectedLength};
	});
var $ianmackenzie$elm_geometry$Vector3d$reverse = function (_v0) {
	var v = _v0;
	return {eK: -v.eK, eL: -v.eL, cz: -v.cz};
};
var $ianmackenzie$elm_geometry$Direction3d$orthonormalize = F3(
	function (xVector, xyVector, xyzVector) {
		return A2(
			$elm$core$Maybe$andThen,
			function (xDirection) {
				var yVector = A2(
					$ianmackenzie$elm_geometry$Vector3d$minus,
					A2($ianmackenzie$elm_geometry$Vector3d$projectionIn, xDirection, xyVector),
					xyVector);
				return A2(
					$elm$core$Maybe$andThen,
					function (yDirection) {
						var rightHandedZVector = A2($ianmackenzie$elm_geometry$Vector3d$cross, xyVector, xVector);
						var tripleProduct = A2($ianmackenzie$elm_geometry$Vector3d$dot, xyzVector, rightHandedZVector);
						var zVector = A2($ianmackenzie$elm_units$Quantity$greaterThan, $ianmackenzie$elm_units$Quantity$zero, tripleProduct) ? rightHandedZVector : (A2($ianmackenzie$elm_units$Quantity$lessThan, $ianmackenzie$elm_units$Quantity$zero, tripleProduct) ? $ianmackenzie$elm_geometry$Vector3d$reverse(rightHandedZVector) : $ianmackenzie$elm_geometry$Vector3d$zero);
						return A2(
							$elm$core$Maybe$map,
							function (zDirection) {
								return _Utils_Tuple3(xDirection, yDirection, zDirection);
							},
							$ianmackenzie$elm_geometry$Vector3d$direction(zVector));
					},
					$ianmackenzie$elm_geometry$Vector3d$direction(yVector));
			},
			$ianmackenzie$elm_geometry$Vector3d$direction(xVector));
	});
var $ianmackenzie$elm_geometry$Frame3d$withZDirection = F2(
	function (givenZDirection, givenOrigin) {
		var _v0 = $ianmackenzie$elm_geometry$Direction3d$perpendicularBasis(givenZDirection);
		var computedXDirection = _v0.a;
		var computedYDirection = _v0.b;
		return $ianmackenzie$elm_geometry$Frame3d$unsafe(
			{c1: givenOrigin, dr: computedXDirection, ds: computedYDirection, dt: givenZDirection});
	});
var $ianmackenzie$elm_3d_camera$Viewpoint3d$lookAt = function (_arguments) {
	var zVector = A2($ianmackenzie$elm_geometry$Vector3d$from, _arguments.fa, _arguments.e7);
	var yVector = $ianmackenzie$elm_geometry$Direction3d$toVector(_arguments.eG);
	var xVector = A2($ianmackenzie$elm_geometry$Vector3d$cross, zVector, yVector);
	var _v0 = A3($ianmackenzie$elm_geometry$Direction3d$orthonormalize, zVector, yVector, xVector);
	if (!_v0.$) {
		var _v1 = _v0.a;
		var normalizedZDirection = _v1.a;
		var normalizedYDirection = _v1.b;
		var normalizedXDirection = _v1.c;
		return $ianmackenzie$elm_geometry$Frame3d$unsafe(
			{c1: _arguments.e7, dr: normalizedXDirection, ds: normalizedYDirection, dt: normalizedZDirection});
	} else {
		var _v2 = $ianmackenzie$elm_geometry$Vector3d$direction(zVector);
		if (!_v2.$) {
			var zDirection = _v2.a;
			return A2($ianmackenzie$elm_geometry$Frame3d$withZDirection, zDirection, _arguments.e7);
		} else {
			var _v3 = $ianmackenzie$elm_geometry$Direction3d$perpendicularBasis(_arguments.eG);
			var arbitraryZDirection = _v3.a;
			var arbitraryXDirection = _v3.b;
			return $ianmackenzie$elm_geometry$Frame3d$unsafe(
				{c1: _arguments.e7, dr: arbitraryXDirection, ds: _arguments.eG, dt: arbitraryZDirection});
		}
	}
};
var $ianmackenzie$elm_3d_camera$Camera3d$Types$Camera3d = $elm$core$Basics$identity;
var $ianmackenzie$elm_3d_camera$Camera3d$Types$Orthographic = function (a) {
	return {$: 1, a: a};
};
var $ianmackenzie$elm_3d_camera$Camera3d$orthographic = function (_arguments) {
	return {
		dc: $ianmackenzie$elm_3d_camera$Camera3d$Types$Orthographic(
			$ianmackenzie$elm_units$Quantity$abs(_arguments.fR)),
		fQ: _arguments.fQ
	};
};
var $elm$html$Html$span = _VirtualDom_node('span');
var $ianmackenzie$elm_geometry$Sphere3d$centerPoint = function (_v0) {
	var properties = _v0;
	return properties.eV;
};
var $ianmackenzie$elm_geometry$Sphere3d$radius = function (_v0) {
	var properties = _v0;
	return properties.cq;
};
var $ianmackenzie$elm_units$Quantity$plus = F2(
	function (_v0, _v1) {
		var y = _v0;
		var x = _v1;
		return x + y;
	});
var $ianmackenzie$elm_units$Quantity$ratio = F2(
	function (_v0, _v1) {
		var x = _v0;
		var y = _v1;
		return x / y;
	});
var $ianmackenzie$elm_1d_parameter$Parameter1d$range = F5(
	function (startIndex, index, divisor, _function, accumulated) {
		range:
		while (true) {
			var newValue = _function(index / divisor);
			var newAccumulated = A2($elm$core$List$cons, newValue, accumulated);
			if (_Utils_eq(index, startIndex)) {
				return newAccumulated;
			} else {
				var $temp$startIndex = startIndex,
					$temp$index = index - 1,
					$temp$divisor = divisor,
					$temp$function = _function,
					$temp$accumulated = newAccumulated;
				startIndex = $temp$startIndex;
				index = $temp$index;
				divisor = $temp$divisor;
				_function = $temp$function;
				accumulated = $temp$accumulated;
				continue range;
			}
		}
	});
var $ianmackenzie$elm_1d_parameter$Parameter1d$steps = F2(
	function (n, _function) {
		return (n < 1) ? _List_Nil : A5($ianmackenzie$elm_1d_parameter$Parameter1d$range, 0, n, n, _function, _List_Nil);
	});
var $ianmackenzie$elm_3d_scene$Scene3d$Mesh$collectSmoothTextured = F2(
	function (_v0, accumulated) {
		var position = _v0.cn;
		var normal = _v0.s;
		var uv = _v0.P;
		var _v1 = uv;
		var u = _v1.a;
		var v = _v1.b;
		return A2(
			$elm$core$List$cons,
			{
				s: $ianmackenzie$elm_geometry_linear_algebra_interop$Geometry$Interop$LinearAlgebra$Vector3d$toVec3(normal),
				cn: $ianmackenzie$elm_geometry_linear_algebra_interop$Geometry$Interop$LinearAlgebra$Point3d$toVec3(position),
				P: A2($elm_explorations$linear_algebra$Math$Vector2$vec2, u, v)
			},
			accumulated);
	});
var $ianmackenzie$elm_3d_scene$Scene3d$Mesh$texturedFaces = function (givenMesh) {
	var collectedVertices = A3(
		$elm$core$Array$foldr,
		$ianmackenzie$elm_3d_scene$Scene3d$Mesh$collectSmoothTextured,
		_List_Nil,
		$ianmackenzie$elm_triangular_mesh$TriangularMesh$vertices(givenMesh));
	if (!collectedVertices.b) {
		return $ianmackenzie$elm_3d_scene$Scene3d$Types$EmptyMesh;
	} else {
		var first = collectedVertices.a;
		var rest = collectedVertices.b;
		var webGLMesh = A2(
			$elm_explorations$webgl$WebGL$indexedTriangles,
			collectedVertices,
			$ianmackenzie$elm_triangular_mesh$TriangularMesh$faceIndices(givenMesh));
		var bounds = A2($ianmackenzie$elm_3d_scene$Scene3d$Mesh$vertexBounds, first, rest);
		return A4($ianmackenzie$elm_3d_scene$Scene3d$Types$MeshWithNormalsAndUvs, bounds, givenMesh, webGLMesh, 0);
	}
};
var $ianmackenzie$elm_geometry$Direction3d$xyZ = F2(
	function (_v0, _v1) {
		var theta = _v0;
		var phi = _v1;
		var cosPhi = $elm$core$Basics$cos(phi);
		return {
			eK: cosPhi * $elm$core$Basics$cos(theta),
			eL: cosPhi * $elm$core$Basics$sin(theta),
			cz: $elm$core$Basics$sin(phi)
		};
	});
var $ianmackenzie$elm_3d_scene$Scene3d$Primitives$sphere = function () {
	var radius = $ianmackenzie$elm_units$Length$meters(1);
	var n = 72;
	var thetaStartIndices = A2($elm$core$List$range, 0, n - 1);
	var thetaValues = A2(
		$ianmackenzie$elm_1d_parameter$Parameter1d$steps,
		n,
		A2(
			$ianmackenzie$elm_units$Quantity$interpolateFrom,
			$ianmackenzie$elm_units$Quantity$zero,
			$ianmackenzie$elm_units$Angle$turns(1)));
	var m = $elm$core$Basics$ceiling(n / 2);
	var phiStartIndices = A2($elm$core$List$range, 0, m - 1);
	var phiValues = A2(
		$ianmackenzie$elm_1d_parameter$Parameter1d$steps,
		m,
		A2(
			$ianmackenzie$elm_units$Quantity$interpolateFrom,
			$ianmackenzie$elm_units$Angle$degrees(90),
			$ianmackenzie$elm_units$Angle$degrees(-90)));
	var vertices = $elm$core$Array$fromList(
		$elm$core$List$concat(
			A2(
				$elm$core$List$map,
				function (theta) {
					return A2(
						$elm$core$List$map,
						function (phi) {
							return {
								s: $ianmackenzie$elm_geometry$Direction3d$toVector(
									A2($ianmackenzie$elm_geometry$Direction3d$xyZ, theta, phi)),
								cn: A3(
									$ianmackenzie$elm_geometry$Point3d$xyz,
									A2(
										$ianmackenzie$elm_units$Quantity$multiplyBy,
										$ianmackenzie$elm_units$Angle$cos(phi) * $ianmackenzie$elm_units$Angle$cos(theta),
										radius),
									A2(
										$ianmackenzie$elm_units$Quantity$multiplyBy,
										$ianmackenzie$elm_units$Angle$cos(phi) * $ianmackenzie$elm_units$Angle$sin(theta),
										radius),
									A2(
										$ianmackenzie$elm_units$Quantity$multiplyBy,
										$ianmackenzie$elm_units$Angle$sin(phi),
										radius)),
								P: _Utils_Tuple2(
									A2(
										$ianmackenzie$elm_units$Quantity$ratio,
										theta,
										$ianmackenzie$elm_units$Angle$turns(1)),
									A2(
										$ianmackenzie$elm_units$Quantity$ratio,
										A2(
											$ianmackenzie$elm_units$Quantity$plus,
											$ianmackenzie$elm_units$Angle$degrees(90),
											phi),
										$ianmackenzie$elm_units$Angle$degrees(180)))
							};
						},
						phiValues);
				},
				thetaValues)));
	var linearIndex = F2(
		function (i, j) {
			return (i * (m + 1)) + j;
		});
	var faces = $elm$core$List$concat(
		A2(
			$elm$core$List$map,
			function (i) {
				return $elm$core$List$concat(
					A2(
						$elm$core$List$map,
						function (j) {
							var topRightIndex = A2(linearIndex, i + 1, j);
							var topLeftIndex = A2(linearIndex, i, j);
							var bottomRightIndex = A2(linearIndex, i + 1, j + 1);
							var bottomLeftIndex = A2(linearIndex, i, j + 1);
							return _List_fromArray(
								[
									_Utils_Tuple3(bottomLeftIndex, bottomRightIndex, topRightIndex),
									_Utils_Tuple3(bottomLeftIndex, topRightIndex, topLeftIndex)
								]);
						},
						phiStartIndices));
			},
			thetaStartIndices));
	return $ianmackenzie$elm_3d_scene$Scene3d$Mesh$cullBackFaces(
		$ianmackenzie$elm_3d_scene$Scene3d$Mesh$texturedFaces(
			A2($ianmackenzie$elm_triangular_mesh$TriangularMesh$indexed, vertices, faces)));
}();
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$numStrips = 72;
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$numOutlineVertices = 2 * $ianmackenzie$elm_3d_scene$Scene3d$Entity$numStrips;
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$buildSphereShadowIndices = F2(
	function (stripIndex, accumulated) {
		buildSphereShadowIndices:
		while (true) {
			var f = $ianmackenzie$elm_3d_scene$Scene3d$Entity$numOutlineVertices + 1;
			var e = A2($elm$core$Basics$modBy, $ianmackenzie$elm_3d_scene$Scene3d$Entity$numOutlineVertices, (2 * stripIndex) + 3);
			var d = A2($elm$core$Basics$modBy, $ianmackenzie$elm_3d_scene$Scene3d$Entity$numOutlineVertices, (2 * stripIndex) + 2);
			var c = (2 * stripIndex) + 1;
			var b = 2 * stripIndex;
			var a = $ianmackenzie$elm_3d_scene$Scene3d$Entity$numOutlineVertices;
			var updated = A2(
				$elm$core$List$cons,
				_Utils_Tuple3(a, b, d),
				A2(
					$elm$core$List$cons,
					_Utils_Tuple3(b, e, d),
					A2(
						$elm$core$List$cons,
						_Utils_Tuple3(b, c, e),
						A2(
							$elm$core$List$cons,
							_Utils_Tuple3(c, f, e),
							accumulated))));
			if (!stripIndex) {
				return updated;
			} else {
				var $temp$stripIndex = stripIndex - 1,
					$temp$accumulated = updated;
				stripIndex = $temp$stripIndex;
				accumulated = $temp$accumulated;
				continue buildSphereShadowIndices;
			}
		}
	});
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$buildSphereShadowVertices = F2(
	function (stripIndex, accumulated) {
		buildSphereShadowVertices:
		while (true) {
			var angle = A3($ianmackenzie$elm_float_extra$Float$Extra$interpolateFrom, 0, 2 * $elm$core$Basics$pi, stripIndex / $ianmackenzie$elm_3d_scene$Scene3d$Entity$numStrips);
			var left = {dv: angle, cj: 0, cr: 1};
			var right = {dv: angle, cj: 1, cr: 1};
			var updated = A2(
				$elm$core$List$cons,
				left,
				A2($elm$core$List$cons, right, accumulated));
			if (!stripIndex) {
				return updated;
			} else {
				var $temp$stripIndex = stripIndex - 1,
					$temp$accumulated = updated;
				stripIndex = $temp$stripIndex;
				accumulated = $temp$accumulated;
				continue buildSphereShadowVertices;
			}
		}
	});
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$sphereShadowMesh = function () {
	var sphereShadowVertices = A2(
		$ianmackenzie$elm_3d_scene$Scene3d$Entity$buildSphereShadowVertices,
		$ianmackenzie$elm_3d_scene$Scene3d$Entity$numStrips - 1,
		_List_fromArray(
			[
				{dv: 0, cj: 0, cr: 0},
				{dv: 0, cj: 1, cr: 0}
			]));
	var sphereShadowIndices = A2($ianmackenzie$elm_3d_scene$Scene3d$Entity$buildSphereShadowIndices, $ianmackenzie$elm_3d_scene$Scene3d$Entity$numStrips - 1, _List_Nil);
	return A2($elm_explorations$webgl$WebGL$indexedTriangles, sphereShadowVertices, sphereShadowIndices);
}();
var $ianmackenzie$elm_3d_scene$Scene3d$UnoptimizedShaders$sphereShadowVertex = {
	src: '\n        precision highp float;\n        \n        attribute highp float angle;\n        attribute highp float offsetScale;\n        attribute highp float radiusScale;\n        \n        uniform highp vec4 modelScale;\n        uniform highp mat4 modelMatrix;\n        uniform highp mat4 viewMatrix;\n        uniform highp mat4 projectionMatrix;\n        uniform highp mat4 sceneProperties;\n        uniform highp mat4 shadowLight;\n        \n        const lowp float kDirectionalLight = 1.0;\n        const lowp float kPointLight = 2.0;\n        const lowp float kPerspectiveProjection = 0.0;\n        \n        vec4 getWorldPosition(vec3 modelPosition, vec4 modelScale, mat4 modelMatrix) {\n            vec4 scaledPosition = vec4(modelScale.xyz * modelPosition, 1.0);\n            return modelMatrix * scaledPosition;\n        }\n        \n        vec3 getDirectionToLight(vec3 surfacePosition, vec4 xyz_type, vec4 rgb_parameter) {\n            float lightType = xyz_type.w;\n            if (lightType == kDirectionalLight) {\n                return xyz_type.xyz;\n            } else if (lightType == kPointLight) {\n                vec3 lightPosition = xyz_type.xyz;\n                return normalize(lightPosition - surfacePosition);\n            } else {\n                return vec3(0.0, 0.0, 0.0);\n            }\n        }\n        \n        vec3 perpendicularTo(vec3 d) {\n            float absX = abs(d.x);\n            float absY = abs(d.y);\n            float absZ = abs(d.z);\n            if (absX <= absY) {\n                if (absX <= absZ) {\n                    float scale = 1.0 / length(d.zy);\n                    return vec3(0.0, -d.z * scale, d.y * scale);\n                } else {\n                    float scale = 1.0 / length(d.xy);\n                    return vec3(-d.y * scale, d.x * scale, 0.0);\n                }\n            } else {\n                if (absY <= absZ) {\n                    float scale = 1.0 / length(d.xz);\n                    return vec3(d.z * scale, 0.0, -d.x * scale);\n                } else {\n                    float scale = 1.0 / length(d.xy);\n                    return vec3(-d.y * scale, d.x * scale, 0.0);\n                }\n            }\n        }\n        \n        void main () {\n            vec4 worldCenter = getWorldPosition(vec3(0.0, 0.0, 0.0), modelScale, modelMatrix);\n            vec4 xyz_type = shadowLight[0];\n            vec4 rgb_parameter = shadowLight[1];\n            vec3 zDirection = getDirectionToLight(worldCenter.xyz, xyz_type, rgb_parameter);\n            vec3 xDirection = perpendicularTo(zDirection);\n            vec3 yDirection = cross(zDirection, xDirection);\n            float r = modelScale.x;\n            float adjustedRadius = r;\n            float zOffset = 0.0;\n            if (xyz_type.w == kPointLight) {\n                float distanceToLight = length(xyz_type.xyz - worldCenter.xyz);\n                float rSquared = r * r;\n                zOffset = rSquared / distanceToLight;\n                float zSquared = zOffset * zOffset;\n                adjustedRadius = sqrt(rSquared - zSquared) * radiusScale;\n            }\n            vec3 worldPosition =\n                worldCenter.xyz\n                    + zDirection * zOffset\n                    + xDirection * adjustedRadius * cos(angle)\n                    + yDirection * adjustedRadius * sin(angle);\n            vec3 directionToLight = getDirectionToLight(worldPosition, xyz_type, rgb_parameter);\n            float sceneDiameter = sceneProperties[3][1];\n            vec3 offset = -sceneDiameter * offsetScale * directionToLight;\n            vec4 offsetPosition = vec4(worldPosition + offset, 1.0);\n            gl_Position = projectionMatrix * (viewMatrix * offsetPosition);\n        }\n    ',
	attributes: {angle: 'dv', offsetScale: 'cj', radiusScale: 'cr'},
	uniforms: {modelMatrix: 'd', modelScale: 'e', projectionMatrix: 'f', sceneProperties: 'g', shadowLight: 'ct', viewMatrix: 'h'}
};
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$sphereShadow = function (givenSphere) {
	return $ianmackenzie$elm_3d_scene$Scene3d$Types$ShadowNode(
		F8(
			function (sceneProperties, modelScale, modelMatrix, isRightHanded, viewMatrix, projectionMatrix, shadowLight, settings) {
				return A5(
					$elm_explorations$webgl$WebGL$entityWith,
					A2($ianmackenzie$elm_3d_scene$Scene3d$Entity$shadowSettings, true, settings),
					$ianmackenzie$elm_3d_scene$Scene3d$UnoptimizedShaders$sphereShadowVertex,
					$ianmackenzie$elm_3d_scene$Scene3d$UnoptimizedShaders$shadowFragment,
					$ianmackenzie$elm_3d_scene$Scene3d$Entity$sphereShadowMesh,
					{
						aN: A3($elm_explorations$linear_algebra$Math$Vector3$vec3, 0, 0, 1),
						d: modelMatrix,
						e: modelScale,
						f: projectionMatrix,
						g: sceneProperties,
						ct: shadowLight,
						h: viewMatrix
					});
			}));
};
var $ianmackenzie$elm_3d_scene$Scene3d$Transformation$translateBy = function (displacement) {
	var v = $ianmackenzie$elm_geometry$Vector3d$unwrap(displacement);
	return {dK: true, u: 1, v: 0, w: 0, x: 0, y: 1, z: 0, A: 0, B: 0, C: 1, L: v.eK, M: v.eL, N: v.cz, cs: 1};
};
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$translateBy = F2(
	function (displacement, givenDrawable) {
		return A2(
			$ianmackenzie$elm_3d_scene$Scene3d$Entity$transformBy,
			$ianmackenzie$elm_3d_scene$Scene3d$Transformation$translateBy(displacement),
			givenDrawable);
	});
var $ianmackenzie$elm_3d_scene$Scene3d$Entity$sphere = F4(
	function (renderObject, renderShadow, givenMaterial, givenSphere) {
		var baseEntity = A2($ianmackenzie$elm_3d_scene$Scene3d$Entity$mesh, givenMaterial, $ianmackenzie$elm_3d_scene$Scene3d$Primitives$sphere);
		var untransformedEntity = function () {
			var _v1 = _Utils_Tuple2(renderObject, renderShadow);
			if (_v1.a) {
				if (_v1.b) {
					return $ianmackenzie$elm_3d_scene$Scene3d$Entity$group(
						_List_fromArray(
							[
								baseEntity,
								$ianmackenzie$elm_3d_scene$Scene3d$Entity$sphereShadow(givenSphere)
							]));
				} else {
					return baseEntity;
				}
			} else {
				if (_v1.b) {
					return $ianmackenzie$elm_3d_scene$Scene3d$Entity$sphereShadow(givenSphere);
				} else {
					return $ianmackenzie$elm_3d_scene$Scene3d$Entity$empty;
				}
			}
		}();
		var _v0 = $ianmackenzie$elm_geometry$Sphere3d$radius(givenSphere);
		var r = _v0;
		return A2(
			$ianmackenzie$elm_3d_scene$Scene3d$Entity$translateBy,
			A2(
				$ianmackenzie$elm_geometry$Vector3d$from,
				$ianmackenzie$elm_geometry$Point3d$origin,
				$ianmackenzie$elm_geometry$Sphere3d$centerPoint(givenSphere)),
			A2(
				$ianmackenzie$elm_3d_scene$Scene3d$Entity$preScale,
				_Utils_Tuple3(r, r, r),
				untransformedEntity));
	});
var $ianmackenzie$elm_3d_scene$Scene3d$sphereWithShadow = F2(
	function (givenMaterial, givenSphere) {
		return A4($ianmackenzie$elm_3d_scene$Scene3d$Entity$sphere, true, true, givenMaterial, givenSphere);
	});
var $elm$virtual_dom$VirtualDom$style = _VirtualDom_style;
var $elm$html$Html$Attributes$style = $elm$virtual_dom$VirtualDom$style;
var $ianmackenzie$elm_3d_scene$Scene3d$Light$CastsShadows = $elm$core$Basics$identity;
var $ianmackenzie$elm_3d_scene$Scene3d$Light$castsShadows = function (flag) {
	return flag;
};
var $elm_explorations$webgl$WebGL$Internal$Alpha = function (a) {
	return {$: 0, a: a};
};
var $elm_explorations$webgl$WebGL$alpha = $elm_explorations$webgl$WebGL$Internal$Alpha;
var $elm_explorations$webgl$WebGL$Internal$Antialias = {$: 3};
var $elm_explorations$webgl$WebGL$antialias = $elm_explorations$webgl$WebGL$Internal$Antialias;
var $elm_explorations$webgl$WebGL$Internal$ClearColor = F4(
	function (a, b, c, d) {
		return {$: 4, a: a, b: b, c: c, d: d};
	});
var $elm_explorations$webgl$WebGL$clearColor = $elm_explorations$webgl$WebGL$Internal$ClearColor;
var $elm$core$List$concatMap = F2(
	function (f, list) {
		return $elm$core$List$concat(
			A2($elm$core$List$map, f, list));
	});
var $elm_explorations$webgl$WebGL$Internal$Depth = function (a) {
	return {$: 1, a: a};
};
var $elm_explorations$webgl$WebGL$depth = $elm_explorations$webgl$WebGL$Internal$Depth;
var $elm$html$Html$Attributes$height = function (n) {
	return A2(
		_VirtualDom_attribute,
		'height',
		$elm$core$String$fromInt(n));
};
var $elm$virtual_dom$VirtualDom$keyedNode = function (tag) {
	return _VirtualDom_keyedNode(
		_VirtualDom_noScript(tag));
};
var $elm$html$Html$Keyed$node = $elm$virtual_dom$VirtualDom$keyedNode;
var $elm_explorations$webgl$WebGL$Internal$Stencil = function (a) {
	return {$: 2, a: a};
};
var $elm_explorations$webgl$WebGL$stencil = $elm_explorations$webgl$WebGL$Internal$Stencil;
var $elm$core$String$concat = function (strings) {
	return A2($elm$core$String$join, '', strings);
};
var $elm$core$String$fromFloat = _String_fromNumber;
var $avh4$elm_color$Color$toCssString = function (_v0) {
	var r = _v0.a;
	var g = _v0.b;
	var b = _v0.c;
	var a = _v0.d;
	var roundTo = function (x) {
		return $elm$core$Basics$round(x * 1000) / 1000;
	};
	var pct = function (x) {
		return $elm$core$Basics$round(x * 10000) / 100;
	};
	return $elm$core$String$concat(
		_List_fromArray(
			[
				'rgba(',
				$elm$core$String$fromFloat(
				pct(r)),
				'%,',
				$elm$core$String$fromFloat(
				pct(g)),
				'%,',
				$elm$core$String$fromFloat(
				pct(b)),
				'%,',
				$elm$core$String$fromFloat(
				roundTo(a)),
				')'
			]));
};
var $elm_explorations$webgl$WebGL$toHtmlWith = F3(
	function (options, attributes, entities) {
		return A3(_WebGL_toHtml, options, attributes, entities);
	});
var $ianmackenzie$elm_units$Pixels$toInt = function (_v0) {
	var numPixels = _v0;
	return numPixels;
};
var $ianmackenzie$elm_3d_scene$Scene3d$allLightsEnabled = A4($elm_explorations$linear_algebra$Math$Vector4$vec4, 1, 1, 1, 1);
var $ianmackenzie$elm_3d_scene$Scene3d$call = F3(
	function (renderPasses, lights, settings) {
		return A2(
			$elm$core$List$map,
			function (renderPass) {
				return A2(renderPass, lights, settings);
			},
			renderPasses);
	});
var $ianmackenzie$elm_3d_scene$Scene3d$Types$CieXyz = F3(
	function (a, b, c) {
		return {$: 0, a: a, b: b, c: c};
	});
var $ianmackenzie$elm_3d_scene$Scene3d$ColorConversions$chromaticityToCieXyz = F2(
	function (_v0, _v1) {
		var intensity = _v0;
		var x = _v1.eK;
		var y = _v1.eL;
		return A3($ianmackenzie$elm_3d_scene$Scene3d$Types$CieXyz, (intensity * x) / y, intensity, (intensity * ((1 - x) - y)) / y);
	});
var $ianmackenzie$elm_3d_scene$Scene3d$ColorConversions$cieXyzToLinearRgb = function (_v0) {
	var bigX = _v0.a;
	var bigY = _v0.b;
	var bigZ = _v0.c;
	return A3($elm_explorations$linear_algebra$Math$Vector3$vec3, ((3.2406 * bigX) - (1.5372 * bigY)) - (0.4986 * bigZ), (((-0.9689) * bigX) + (1.8758 * bigY)) + (0.0415 * bigZ), ((0.0557 * bigX) - (0.204 * bigY)) + (1.057 * bigZ));
};
var $ianmackenzie$elm_3d_scene$Scene3d$ColorConversions$chromaticityToLinearRgb = F2(
	function (intensity, chromaticity) {
		return $ianmackenzie$elm_3d_scene$Scene3d$ColorConversions$cieXyzToLinearRgb(
			A2($ianmackenzie$elm_3d_scene$Scene3d$ColorConversions$chromaticityToCieXyz, intensity, chromaticity));
	});
var $elm_explorations$linear_algebra$Math$Matrix4$fromRecord = _MJS_m4x4fromRecord;
var $ianmackenzie$elm_3d_scene$Scene3d$Transformation$modelMatrix = function (transformation) {
	return $elm_explorations$linear_algebra$Math$Matrix4$fromRecord(
		{dT: transformation.u, dU: transformation.x, dV: transformation.A, dW: transformation.L, dX: transformation.v, dY: transformation.y, dZ: transformation.B, d_: transformation.M, d$: transformation.w, d0: transformation.z, d1: transformation.C, d2: transformation.N, d3: 0, d4: 0, d5: 0, d6: 1});
};
var $ianmackenzie$elm_3d_scene$Scene3d$createRenderPass = F5(
	function (sceneProperties, viewMatrix, projectionMatrix, transformation, drawFunction) {
		var normalSign = transformation.dK ? 1 : (-1);
		var modelScale = A4($elm_explorations$linear_algebra$Math$Vector4$vec4, transformation.cs, transformation.cs, transformation.cs, normalSign);
		return A6(
			drawFunction,
			sceneProperties,
			modelScale,
			$ianmackenzie$elm_3d_scene$Scene3d$Transformation$modelMatrix(transformation),
			transformation.dK,
			viewMatrix,
			projectionMatrix);
	});
var $ianmackenzie$elm_3d_scene$Scene3d$collectRenderPasses = F6(
	function (sceneProperties, viewMatrix, projectionMatrix, currentTransformation, node, accumulated) {
		collectRenderPasses:
		while (true) {
			switch (node.$) {
				case 0:
					return accumulated;
				case 5:
					var transformation = node.a;
					var childNode = node.b;
					var $temp$sceneProperties = sceneProperties,
						$temp$viewMatrix = viewMatrix,
						$temp$projectionMatrix = projectionMatrix,
						$temp$currentTransformation = A2($ianmackenzie$elm_3d_scene$Scene3d$Transformation$compose, transformation, currentTransformation),
						$temp$node = childNode,
						$temp$accumulated = accumulated;
					sceneProperties = $temp$sceneProperties;
					viewMatrix = $temp$viewMatrix;
					projectionMatrix = $temp$projectionMatrix;
					currentTransformation = $temp$currentTransformation;
					node = $temp$node;
					accumulated = $temp$accumulated;
					continue collectRenderPasses;
				case 1:
					var meshDrawFunction = node.b;
					var updatedMeshes = A2(
						$elm$core$List$cons,
						A5($ianmackenzie$elm_3d_scene$Scene3d$createRenderPass, sceneProperties, viewMatrix, projectionMatrix, currentTransformation, meshDrawFunction),
						accumulated.S);
					return {S: updatedMeshes, ae: accumulated.ae, fB: accumulated.fB};
				case 3:
					var pointDrawFunction = node.b;
					var updatedPoints = A2(
						$elm$core$List$cons,
						A5($ianmackenzie$elm_3d_scene$Scene3d$createRenderPass, sceneProperties, viewMatrix, projectionMatrix, currentTransformation, pointDrawFunction),
						accumulated.ae);
					return {S: accumulated.S, ae: updatedPoints, fB: accumulated.fB};
				case 2:
					var shadowDrawFunction = node.a;
					var updatedShadows = A2(
						$elm$core$List$cons,
						A5($ianmackenzie$elm_3d_scene$Scene3d$createRenderPass, sceneProperties, viewMatrix, projectionMatrix, currentTransformation, shadowDrawFunction),
						accumulated.fB);
					return {S: accumulated.S, ae: accumulated.ae, fB: updatedShadows};
				default:
					var childNodes = node.a;
					return A3(
						$elm$core$List$foldl,
						A4($ianmackenzie$elm_3d_scene$Scene3d$collectRenderPasses, sceneProperties, viewMatrix, projectionMatrix, currentTransformation),
						accumulated,
						childNodes);
			}
		}
	});
var $elm_explorations$webgl$WebGL$Internal$ColorMask = F4(
	function (a, b, c, d) {
		return {$: 4, a: a, b: b, c: c, d: d};
	});
var $elm_explorations$webgl$WebGL$Settings$colorMask = $elm_explorations$webgl$WebGL$Internal$ColorMask;
var $elm_explorations$webgl$WebGL$Internal$DepthTest = F4(
	function (a, b, c, d) {
		return {$: 1, a: a, b: b, c: c, d: d};
	});
var $elm_explorations$webgl$WebGL$Settings$DepthTest$greaterOrEqual = function (_v0) {
	var write = _v0.ak;
	var near = _v0.ah;
	var far = _v0.ag;
	return A4($elm_explorations$webgl$WebGL$Internal$DepthTest, 518, write, near, far);
};
var $elm_explorations$webgl$WebGL$Internal$PolygonOffset = F2(
	function (a, b) {
		return {$: 6, a: a, b: b};
	});
var $elm_explorations$webgl$WebGL$Settings$polygonOffset = $elm_explorations$webgl$WebGL$Internal$PolygonOffset;
var $ianmackenzie$elm_3d_scene$Scene3d$createShadowStencil = _List_fromArray(
	[
		$elm_explorations$webgl$WebGL$Settings$DepthTest$greaterOrEqual(
		{ag: 1, ah: 0, ak: false}),
		A4($elm_explorations$webgl$WebGL$Settings$colorMask, false, false, false, false),
		A2($elm_explorations$webgl$WebGL$Settings$polygonOffset, 0.0, 1.0)
	]);
var $ianmackenzie$elm_3d_scene$Scene3d$initialStencilCount = 8;
var $ianmackenzie$elm_3d_scene$Scene3d$lowerFourBits = 15;
var $elm_explorations$webgl$WebGL$Settings$StencilTest$replace = 7681;
var $ianmackenzie$elm_3d_scene$Scene3d$dummyFragmentShader = {
	src: '\n        precision lowp float;\n\n        void main() {\n            gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);\n        }\n    ',
	attributes: {},
	uniforms: {}
};
var $elm_explorations$webgl$WebGL$Mesh1 = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $elm_explorations$webgl$WebGL$triangleStrip = $elm_explorations$webgl$WebGL$Mesh1(
	{dA: 1, dJ: 0, ef: 5});
var $ianmackenzie$elm_3d_scene$Scene3d$fullScreenQuadMesh = $elm_explorations$webgl$WebGL$triangleStrip(
	_List_fromArray(
		[
			{
			cn: A2($elm_explorations$linear_algebra$Math$Vector2$vec2, -1, -1)
		},
			{
			cn: A2($elm_explorations$linear_algebra$Math$Vector2$vec2, 1, -1)
		},
			{
			cn: A2($elm_explorations$linear_algebra$Math$Vector2$vec2, -1, 1)
		},
			{
			cn: A2($elm_explorations$linear_algebra$Math$Vector2$vec2, 1, 1)
		}
		]));
var $ianmackenzie$elm_3d_scene$Scene3d$fullScreenQuadVertexShader = {
	src: '\n        precision lowp float;\n\n        attribute vec2 position;\n\n        void main() {\n            gl_Position = vec4(position, 0.0, 1.0);\n        }\n    ',
	attributes: {position: 'cn'},
	uniforms: {}
};
var $elm_explorations$webgl$WebGL$Settings$StencilTest$test = function (stencilTest) {
	return A3(
		$elm_explorations$webgl$WebGL$Settings$StencilTest$testSeparate,
		{cU: stencilTest.cU, de: stencilTest.de, dq: stencilTest.dq},
		{bv: stencilTest.bv, bO: stencilTest.bO, bW: stencilTest.bW, bX: stencilTest.bX},
		{bv: stencilTest.bv, bO: stencilTest.bO, bW: stencilTest.bW, bX: stencilTest.bX});
};
var $ianmackenzie$elm_3d_scene$Scene3d$updateStencil = function (test) {
	return A5(
		$elm_explorations$webgl$WebGL$entityWith,
		_List_fromArray(
			[
				$elm_explorations$webgl$WebGL$Settings$StencilTest$test(test),
				A4($elm_explorations$webgl$WebGL$Settings$colorMask, false, false, false, false)
			]),
		$ianmackenzie$elm_3d_scene$Scene3d$fullScreenQuadVertexShader,
		$ianmackenzie$elm_3d_scene$Scene3d$dummyFragmentShader,
		$ianmackenzie$elm_3d_scene$Scene3d$fullScreenQuadMesh,
		{});
};
var $ianmackenzie$elm_3d_scene$Scene3d$resetStencil = $ianmackenzie$elm_3d_scene$Scene3d$updateStencil(
	{bv: $elm_explorations$webgl$WebGL$Settings$StencilTest$replace, cU: 0, de: $ianmackenzie$elm_3d_scene$Scene3d$initialStencilCount, bO: $elm_explorations$webgl$WebGL$Settings$StencilTest$always, dq: $ianmackenzie$elm_3d_scene$Scene3d$lowerFourBits, bW: $elm_explorations$webgl$WebGL$Settings$StencilTest$replace, bX: $elm_explorations$webgl$WebGL$Settings$StencilTest$replace});
var $elm_explorations$webgl$WebGL$Settings$StencilTest$greater = 516;
var $elm_explorations$webgl$WebGL$Settings$StencilTest$invert = 5386;
var $ianmackenzie$elm_3d_scene$Scene3d$singleLightMask = function (index) {
	return A2($elm$core$Basics$pow, 2, index + 4);
};
var $ianmackenzie$elm_3d_scene$Scene3d$storeStencilValue = function (lightIndex) {
	return $ianmackenzie$elm_3d_scene$Scene3d$updateStencil(
		{
			bv: $elm_explorations$webgl$WebGL$Settings$StencilTest$keep,
			cU: $ianmackenzie$elm_3d_scene$Scene3d$lowerFourBits,
			de: $ianmackenzie$elm_3d_scene$Scene3d$initialStencilCount,
			bO: $elm_explorations$webgl$WebGL$Settings$StencilTest$greater,
			dq: $ianmackenzie$elm_3d_scene$Scene3d$singleLightMask(lightIndex),
			bW: $elm_explorations$webgl$WebGL$Settings$StencilTest$invert,
			bX: $elm_explorations$webgl$WebGL$Settings$StencilTest$invert
		});
};
var $ianmackenzie$elm_3d_scene$Scene3d$createShadow = F3(
	function (shadowRenderPasses, lightIndex, lightMatrix) {
		return $elm$core$List$concat(
			_List_fromArray(
				[
					A3($ianmackenzie$elm_3d_scene$Scene3d$call, shadowRenderPasses, lightMatrix, $ianmackenzie$elm_3d_scene$Scene3d$createShadowStencil),
					_List_fromArray(
					[
						$ianmackenzie$elm_3d_scene$Scene3d$storeStencilValue(lightIndex),
						$ianmackenzie$elm_3d_scene$Scene3d$resetStencil
					])
				]));
	});
var $ianmackenzie$elm_3d_scene$Scene3d$createShadows = F2(
	function (shadowRenderPasses, shadowCasters) {
		return $elm$core$List$concat(
			A2(
				$elm$core$List$indexedMap,
				$ianmackenzie$elm_3d_scene$Scene3d$createShadow(shadowRenderPasses),
				shadowCasters));
	});
var $elm_explorations$webgl$WebGL$Settings$DepthTest$less = function (_v0) {
	var write = _v0.ak;
	var near = _v0.ah;
	var far = _v0.ag;
	return A4($elm_explorations$webgl$WebGL$Internal$DepthTest, 513, write, near, far);
};
var $elm_explorations$webgl$WebGL$Settings$DepthTest$default = $elm_explorations$webgl$WebGL$Settings$DepthTest$less(
	{ag: 1, ah: 0, ak: true});
var $elm_explorations$webgl$WebGL$Internal$Blend = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return {$: 0, a: a, b: b, c: c, d: d, e: e, f: f, g: g, h: h, i: i, j: j};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var $elm_explorations$webgl$WebGL$Settings$Blend$custom = function (_v0) {
	var r = _v0.cp;
	var g = _v0.b6;
	var b = _v0.c;
	var a = _v0.b;
	var color = _v0.b0;
	var alpha = _v0.a1;
	var expand = F2(
		function (_v1, _v2) {
			var eq1 = _v1.a;
			var f11 = _v1.b;
			var f12 = _v1.c;
			var eq2 = _v2.a;
			var f21 = _v2.b;
			var f22 = _v2.c;
			return $elm_explorations$webgl$WebGL$Internal$Blend(eq1)(f11)(f12)(eq2)(f21)(f22)(r)(g)(b)(a);
		});
	return A2(expand, color, alpha);
};
var $elm_explorations$webgl$WebGL$Settings$Blend$Blender = F3(
	function (a, b, c) {
		return {$: 0, a: a, b: b, c: c};
	});
var $elm_explorations$webgl$WebGL$Settings$Blend$customAdd = F2(
	function (_v0, _v1) {
		var factor1 = _v0;
		var factor2 = _v1;
		return A3($elm_explorations$webgl$WebGL$Settings$Blend$Blender, 32774, factor1, factor2);
	});
var $elm_explorations$webgl$WebGL$Settings$Blend$Factor = $elm$core$Basics$identity;
var $elm_explorations$webgl$WebGL$Settings$Blend$one = 1;
var $elm_explorations$webgl$WebGL$Settings$Blend$oneMinusSrcAlpha = 771;
var $elm_explorations$webgl$WebGL$Settings$Blend$srcAlpha = 770;
var $ianmackenzie$elm_3d_scene$Scene3d$defaultBlend = $elm_explorations$webgl$WebGL$Settings$Blend$custom(
	{
		b: 0,
		a1: A2($elm_explorations$webgl$WebGL$Settings$Blend$customAdd, $elm_explorations$webgl$WebGL$Settings$Blend$one, $elm_explorations$webgl$WebGL$Settings$Blend$oneMinusSrcAlpha),
		c: 0,
		b0: A2($elm_explorations$webgl$WebGL$Settings$Blend$customAdd, $elm_explorations$webgl$WebGL$Settings$Blend$srcAlpha, $elm_explorations$webgl$WebGL$Settings$Blend$oneMinusSrcAlpha),
		b6: 0,
		cp: 0
	});
var $ianmackenzie$elm_3d_scene$Scene3d$depthTestDefault = _List_fromArray(
	[$elm_explorations$webgl$WebGL$Settings$DepthTest$default, $ianmackenzie$elm_3d_scene$Scene3d$defaultBlend]);
var $ianmackenzie$elm_3d_camera$Viewpoint3d$eyePoint = function (_v0) {
	var frame = _v0;
	return $ianmackenzie$elm_geometry$Frame3d$originPoint(frame);
};
var $ianmackenzie$elm_geometry$Point3d$unsafe = function (givenCoordinates) {
	return givenCoordinates;
};
var $ianmackenzie$elm_3d_scene$Scene3d$Transformation$placementFrame = function (transformation) {
	return $ianmackenzie$elm_geometry$Frame3d$unsafe(
		{
			c1: $ianmackenzie$elm_geometry$Point3d$unsafe(
				{eK: transformation.L, eL: transformation.M, cz: transformation.N}),
			dr: $ianmackenzie$elm_geometry$Direction3d$unsafe(
				{eK: transformation.u, eL: transformation.v, cz: transformation.w}),
			ds: $ianmackenzie$elm_geometry$Direction3d$unsafe(
				{eK: transformation.x, eL: transformation.y, cz: transformation.z}),
			dt: $ianmackenzie$elm_geometry$Direction3d$unsafe(
				{eK: transformation.A, eL: transformation.B, cz: transformation.C})
		});
};
var $ianmackenzie$elm_geometry$Direction3d$relativeTo = F2(
	function (_v0, _v1) {
		var frame = _v0;
		var d = _v1;
		var _v2 = frame.dt;
		var k = _v2;
		var _v3 = frame.ds;
		var j = _v3;
		var _v4 = frame.dr;
		var i = _v4;
		return {eK: ((d.eK * i.eK) + (d.eL * i.eL)) + (d.cz * i.cz), eL: ((d.eK * j.eK) + (d.eL * j.eL)) + (d.cz * j.cz), cz: ((d.eK * k.eK) + (d.eL * k.eL)) + (d.cz * k.cz)};
	});
var $ianmackenzie$elm_geometry$Point3d$relativeTo = F2(
	function (_v0, _v1) {
		var frame = _v0;
		var p = _v1;
		var _v2 = frame.c1;
		var p0 = _v2;
		var deltaX = p.eK - p0.eK;
		var deltaY = p.eL - p0.eL;
		var deltaZ = p.cz - p0.cz;
		var _v3 = frame.dt;
		var k = _v3;
		var _v4 = frame.ds;
		var j = _v4;
		var _v5 = frame.dr;
		var i = _v5;
		return {eK: ((deltaX * i.eK) + (deltaY * i.eL)) + (deltaZ * i.cz), eL: ((deltaX * j.eK) + (deltaY * j.eL)) + (deltaZ * j.cz), cz: ((deltaX * k.eK) + (deltaY * k.eL)) + (deltaZ * k.cz)};
	});
var $ianmackenzie$elm_geometry$Frame3d$relativeTo = F2(
	function (otherFrame, frame) {
		return {
			c1: A2(
				$ianmackenzie$elm_geometry$Point3d$relativeTo,
				otherFrame,
				$ianmackenzie$elm_geometry$Frame3d$originPoint(frame)),
			dr: A2(
				$ianmackenzie$elm_geometry$Direction3d$relativeTo,
				otherFrame,
				$ianmackenzie$elm_geometry$Frame3d$xDirection(frame)),
			ds: A2(
				$ianmackenzie$elm_geometry$Direction3d$relativeTo,
				otherFrame,
				$ianmackenzie$elm_geometry$Frame3d$yDirection(frame)),
			dt: A2(
				$ianmackenzie$elm_geometry$Direction3d$relativeTo,
				otherFrame,
				$ianmackenzie$elm_geometry$Frame3d$zDirection(frame))
		};
	});
var $ianmackenzie$elm_geometry$BoundingBox3d$extrema = function (_v0) {
	var boundingBoxExtrema = _v0;
	return boundingBoxExtrema;
};
var $ianmackenzie$elm_geometry$BoundingBox3d$union = F2(
	function (firstBox, secondBox) {
		var b2 = $ianmackenzie$elm_geometry$BoundingBox3d$extrema(secondBox);
		var b1 = $ianmackenzie$elm_geometry$BoundingBox3d$extrema(firstBox);
		return {
			d8: A2($ianmackenzie$elm_units$Quantity$max, b1.d8, b2.d8),
			d9: A2($ianmackenzie$elm_units$Quantity$max, b1.d9, b2.d9),
			ea: A2($ianmackenzie$elm_units$Quantity$max, b1.ea, b2.ea),
			eb: A2($ianmackenzie$elm_units$Quantity$min, b1.eb, b2.eb),
			ec: A2($ianmackenzie$elm_units$Quantity$min, b1.ec, b2.ec),
			ed: A2($ianmackenzie$elm_units$Quantity$min, b1.ed, b2.ed)
		};
	});
var $ianmackenzie$elm_geometry$Point3d$coordinates = function (_v0) {
	var p = _v0;
	return _Utils_Tuple3(p.eK, p.eL, p.cz);
};
var $ianmackenzie$elm_units$Quantity$half = function (_v0) {
	var value = _v0;
	return 0.5 * value;
};
var $ianmackenzie$elm_geometry$BoundingBox3d$withDimensions = F2(
	function (_v0, givenCenterPoint) {
		var givenLength = _v0.a;
		var givenWidth = _v0.b;
		var givenHeight = _v0.c;
		var halfWidth = $ianmackenzie$elm_units$Quantity$half(
			$ianmackenzie$elm_units$Quantity$abs(givenWidth));
		var halfLength = $ianmackenzie$elm_units$Quantity$half(
			$ianmackenzie$elm_units$Quantity$abs(givenLength));
		var halfHeight = $ianmackenzie$elm_units$Quantity$half(
			$ianmackenzie$elm_units$Quantity$abs(givenHeight));
		var _v1 = $ianmackenzie$elm_geometry$Point3d$coordinates(givenCenterPoint);
		var x0 = _v1.a;
		var y0 = _v1.b;
		var z0 = _v1.c;
		return {
			d8: A2($ianmackenzie$elm_units$Quantity$plus, halfLength, x0),
			d9: A2($ianmackenzie$elm_units$Quantity$plus, halfWidth, y0),
			ea: A2($ianmackenzie$elm_units$Quantity$plus, halfHeight, z0),
			eb: A2($ianmackenzie$elm_units$Quantity$minus, halfLength, x0),
			ec: A2($ianmackenzie$elm_units$Quantity$minus, halfWidth, y0),
			ed: A2($ianmackenzie$elm_units$Quantity$minus, halfHeight, z0)
		};
	});
var $ianmackenzie$elm_3d_scene$Scene3d$updateViewBounds = F4(
	function (viewFrame, scale, modelBounds, current) {
		var originalCenter = modelBounds.eV;
		var modelZDimension = (2 * modelBounds.fe) * scale;
		var modelYDimension = (2 * modelBounds.fd) * scale;
		var modelXDimension = (2 * modelBounds.fc) * scale;
		var modelCenterZ = originalCenter.cz * scale;
		var modelCenterY = originalCenter.eL * scale;
		var modelCenterX = originalCenter.eK * scale;
		var k = $ianmackenzie$elm_geometry$Direction3d$unwrap(
			$ianmackenzie$elm_geometry$Frame3d$zDirection(viewFrame));
		var zDimension = ($elm$core$Basics$abs(modelXDimension * k.eK) + $elm$core$Basics$abs(modelYDimension * k.eL)) + $elm$core$Basics$abs(modelZDimension * k.cz);
		var j = $ianmackenzie$elm_geometry$Direction3d$unwrap(
			$ianmackenzie$elm_geometry$Frame3d$yDirection(viewFrame));
		var yDimension = ($elm$core$Basics$abs(modelXDimension * j.eK) + $elm$core$Basics$abs(modelYDimension * j.eL)) + $elm$core$Basics$abs(modelZDimension * j.cz);
		var i = $ianmackenzie$elm_geometry$Direction3d$unwrap(
			$ianmackenzie$elm_geometry$Frame3d$xDirection(viewFrame));
		var xDimension = ($elm$core$Basics$abs(modelXDimension * i.eK) + $elm$core$Basics$abs(modelYDimension * i.eL)) + $elm$core$Basics$abs(modelZDimension * i.cz);
		var nodeBounds = A2(
			$ianmackenzie$elm_geometry$BoundingBox3d$withDimensions,
			_Utils_Tuple3(xDimension, yDimension, zDimension),
			A2(
				$ianmackenzie$elm_geometry$Point3d$relativeTo,
				viewFrame,
				A3($ianmackenzie$elm_geometry$Point3d$meters, modelCenterX, modelCenterY, modelCenterZ)));
		if (!current.$) {
			var currentBounds = current.a;
			return $elm$core$Maybe$Just(
				A2($ianmackenzie$elm_geometry$BoundingBox3d$union, currentBounds, nodeBounds));
		} else {
			return $elm$core$Maybe$Just(nodeBounds);
		}
	});
var $ianmackenzie$elm_3d_scene$Scene3d$getViewBounds = F4(
	function (viewFrame, scale, current, nodes) {
		getViewBounds:
		while (true) {
			if (nodes.b) {
				var first = nodes.a;
				var rest = nodes.b;
				switch (first.$) {
					case 0:
						var $temp$viewFrame = viewFrame,
							$temp$scale = scale,
							$temp$current = current,
							$temp$nodes = rest;
						viewFrame = $temp$viewFrame;
						scale = $temp$scale;
						current = $temp$current;
						nodes = $temp$nodes;
						continue getViewBounds;
					case 1:
						var modelBounds = first.a;
						var updated = A4($ianmackenzie$elm_3d_scene$Scene3d$updateViewBounds, viewFrame, scale, modelBounds, current);
						var $temp$viewFrame = viewFrame,
							$temp$scale = scale,
							$temp$current = updated,
							$temp$nodes = rest;
						viewFrame = $temp$viewFrame;
						scale = $temp$scale;
						current = $temp$current;
						nodes = $temp$nodes;
						continue getViewBounds;
					case 2:
						var $temp$viewFrame = viewFrame,
							$temp$scale = scale,
							$temp$current = current,
							$temp$nodes = rest;
						viewFrame = $temp$viewFrame;
						scale = $temp$scale;
						current = $temp$current;
						nodes = $temp$nodes;
						continue getViewBounds;
					case 3:
						var modelBounds = first.a;
						var updated = A4($ianmackenzie$elm_3d_scene$Scene3d$updateViewBounds, viewFrame, scale, modelBounds, current);
						var $temp$viewFrame = viewFrame,
							$temp$scale = scale,
							$temp$current = updated,
							$temp$nodes = rest;
						viewFrame = $temp$viewFrame;
						scale = $temp$scale;
						current = $temp$current;
						nodes = $temp$nodes;
						continue getViewBounds;
					case 4:
						var childNodes = first.a;
						var $temp$viewFrame = viewFrame,
							$temp$scale = scale,
							$temp$current = A4($ianmackenzie$elm_3d_scene$Scene3d$getViewBounds, viewFrame, scale, current, childNodes),
							$temp$nodes = rest;
						viewFrame = $temp$viewFrame;
						scale = $temp$scale;
						current = $temp$current;
						nodes = $temp$nodes;
						continue getViewBounds;
					default:
						var transformation = first.a;
						var childNode = first.b;
						var localViewFrame = A2(
							$ianmackenzie$elm_geometry$Frame3d$relativeTo,
							$ianmackenzie$elm_3d_scene$Scene3d$Transformation$placementFrame(transformation),
							viewFrame);
						var localScale = scale * transformation.cs;
						var $temp$viewFrame = viewFrame,
							$temp$scale = scale,
							$temp$current = A4(
							$ianmackenzie$elm_3d_scene$Scene3d$getViewBounds,
							localViewFrame,
							localScale,
							current,
							_List_fromArray(
								[childNode])),
							$temp$nodes = rest;
						viewFrame = $temp$viewFrame;
						scale = $temp$scale;
						current = $temp$current;
						nodes = $temp$nodes;
						continue getViewBounds;
				}
			} else {
				return current;
			}
		}
	});
var $ianmackenzie$elm_3d_scene$Scene3d$Transformation$identity = {dK: true, u: 1, v: 0, w: 0, x: 0, y: 1, z: 0, A: 0, B: 0, C: 1, L: 0, M: 0, N: 0, cs: 1};
var $ianmackenzie$elm_3d_scene$Scene3d$initStencil = $ianmackenzie$elm_3d_scene$Scene3d$updateStencil(
	{bv: $elm_explorations$webgl$WebGL$Settings$StencilTest$replace, cU: 0, de: $ianmackenzie$elm_3d_scene$Scene3d$initialStencilCount, bO: $elm_explorations$webgl$WebGL$Settings$StencilTest$always, dq: 255, bW: $elm_explorations$webgl$WebGL$Settings$StencilTest$replace, bX: $elm_explorations$webgl$WebGL$Settings$StencilTest$replace});
var $ianmackenzie$elm_geometry$Vector3d$length = function (_v0) {
	var v = _v0;
	var largestComponent = A2(
		$elm$core$Basics$max,
		$elm$core$Basics$abs(v.eK),
		A2(
			$elm$core$Basics$max,
			$elm$core$Basics$abs(v.eL),
			$elm$core$Basics$abs(v.cz)));
	if (!largestComponent) {
		return $ianmackenzie$elm_units$Quantity$zero;
	} else {
		var scaledZ = v.cz / largestComponent;
		var scaledY = v.eL / largestComponent;
		var scaledX = v.eK / largestComponent;
		var scaledLength = $elm$core$Basics$sqrt(((scaledX * scaledX) + (scaledY * scaledY)) + (scaledZ * scaledZ));
		return scaledLength * largestComponent;
	}
};
var $ianmackenzie$elm_3d_scene$Scene3d$Types$Light = $elm$core$Basics$identity;
var $ianmackenzie$elm_3d_scene$Scene3d$Light$disabled = {c: 0, eU: false, b6: 0, da: 0, cp: 0, dn: 0, eK: 0, eL: 0, cz: 0};
var $ianmackenzie$elm_3d_scene$Scene3d$lightPair = F2(
	function (_v0, _v1) {
		var first = _v0;
		var second = _v1;
		return $elm_explorations$linear_algebra$Math$Matrix4$fromRecord(
			{dT: first.eK, dU: first.cp, dV: second.eK, dW: second.cp, dX: first.eL, dY: first.b6, dZ: second.eL, d_: second.b6, d$: first.cz, d0: first.c, d1: second.cz, d2: second.c, d3: first.dn, d4: first.da, d5: second.dn, d6: second.da});
	});
var $ianmackenzie$elm_3d_scene$Scene3d$lightingDisabled = _Utils_Tuple2(
	{
		bE: A2($ianmackenzie$elm_3d_scene$Scene3d$lightPair, $ianmackenzie$elm_3d_scene$Scene3d$Light$disabled, $ianmackenzie$elm_3d_scene$Scene3d$Light$disabled),
		cc: A2($ianmackenzie$elm_3d_scene$Scene3d$lightPair, $ianmackenzie$elm_3d_scene$Scene3d$Light$disabled, $ianmackenzie$elm_3d_scene$Scene3d$Light$disabled),
		cd: A2($ianmackenzie$elm_3d_scene$Scene3d$lightPair, $ianmackenzie$elm_3d_scene$Scene3d$Light$disabled, $ianmackenzie$elm_3d_scene$Scene3d$Light$disabled),
		ce: A2($ianmackenzie$elm_3d_scene$Scene3d$lightPair, $ianmackenzie$elm_3d_scene$Scene3d$Light$disabled, $ianmackenzie$elm_3d_scene$Scene3d$Light$disabled)
	},
	A4($elm_explorations$linear_algebra$Math$Vector4$vec4, 0, 0, 0, 0));
var $ianmackenzie$elm_units$Quantity$negate = function (_v0) {
	var value = _v0;
	return -value;
};
var $elm_explorations$webgl$WebGL$Settings$StencilTest$equal = 514;
var $elm_explorations$webgl$WebGL$Settings$DepthTest$lessOrEqual = function (_v0) {
	var write = _v0.ak;
	var near = _v0.ah;
	var far = _v0.ag;
	return A4($elm_explorations$webgl$WebGL$Internal$DepthTest, 515, write, near, far);
};
var $ianmackenzie$elm_3d_scene$Scene3d$upperFourBits = 240;
var $ianmackenzie$elm_3d_scene$Scene3d$outsideStencil = _List_fromArray(
	[
		$elm_explorations$webgl$WebGL$Settings$DepthTest$lessOrEqual(
		{ag: 1, ah: 0, ak: true}),
		$elm_explorations$webgl$WebGL$Settings$StencilTest$test(
		{bv: $elm_explorations$webgl$WebGL$Settings$StencilTest$keep, cU: $ianmackenzie$elm_3d_scene$Scene3d$upperFourBits, de: 0, bO: $elm_explorations$webgl$WebGL$Settings$StencilTest$equal, dq: 0, bW: $elm_explorations$webgl$WebGL$Settings$StencilTest$keep, bX: $elm_explorations$webgl$WebGL$Settings$StencilTest$keep}),
		$ianmackenzie$elm_3d_scene$Scene3d$defaultBlend
	]);
var $elm$core$Basics$isInfinite = _Basics_isInfinite;
var $ianmackenzie$elm_3d_camera$WebGL$Matrices$projectionMatrix = F2(
	function (_v0, _v1) {
		var camera = _v0;
		var nearClipDepth = _v1.fp;
		var farClipDepth = _v1.e9;
		var aspectRatio = _v1.eP;
		var _v2 = $ianmackenzie$elm_units$Quantity$abs(nearClipDepth);
		var n = _v2;
		var _v3 = $ianmackenzie$elm_units$Quantity$abs(farClipDepth);
		var f = _v3;
		var _v4 = camera.dc;
		if (!_v4.$) {
			var frustumSlope = _v4.a;
			return $elm$core$Basics$isInfinite(f) ? $elm_explorations$linear_algebra$Math$Matrix4$fromRecord(
				{dT: 1 / (aspectRatio * frustumSlope), dU: 0, dV: 0, dW: 0, dX: 0, dY: 1 / frustumSlope, dZ: 0, d_: 0, d$: 0, d0: 0, d1: -1, d2: (-2) * n, d3: 0, d4: 0, d5: -1, d6: 0}) : $elm_explorations$linear_algebra$Math$Matrix4$fromRecord(
				{dT: 1 / (aspectRatio * frustumSlope), dU: 0, dV: 0, dW: 0, dX: 0, dY: 1 / frustumSlope, dZ: 0, d_: 0, d$: 0, d0: 0, d1: (-(f + n)) / (f - n), d2: (((-2) * f) * n) / (f - n), d3: 0, d4: 0, d5: -1, d6: 0});
		} else {
			var viewportHeight = _v4.a;
			return $elm$core$Basics$isInfinite(f) ? $elm_explorations$linear_algebra$Math$Matrix4$fromRecord(
				{dT: 2 / (aspectRatio * viewportHeight), dU: 0, dV: 0, dW: 0, dX: 0, dY: 2 / viewportHeight, dZ: 0, d_: 0, d$: 0, d0: 0, d1: 0, d2: -1, d3: 0, d4: 0, d5: 0, d6: 1}) : $elm_explorations$linear_algebra$Math$Matrix4$fromRecord(
				{dT: 2 / (aspectRatio * viewportHeight), dU: 0, dV: 0, dW: 0, dX: 0, dY: 2 / viewportHeight, dZ: 0, d_: 0, d$: 0, d0: 0, d1: (-2) / (f - n), d2: (-(f + n)) / (f - n), d3: 0, d4: 0, d5: 0, d6: 1});
		}
	});
var $elm$core$Bitwise$shiftRightBy = _Bitwise_shiftRightBy;
var $ianmackenzie$elm_3d_scene$Scene3d$enabledFlag = F2(
	function (lightMask, lightIndex) {
		return ((1 & (lightMask >> lightIndex)) === 1) ? 0 : 1;
	});
var $ianmackenzie$elm_3d_scene$Scene3d$insideStencil = function (lightMask) {
	return _List_fromArray(
		[
			$elm_explorations$webgl$WebGL$Settings$DepthTest$lessOrEqual(
			{ag: 1, ah: 0, ak: true}),
			$elm_explorations$webgl$WebGL$Settings$StencilTest$test(
			{bv: $elm_explorations$webgl$WebGL$Settings$StencilTest$keep, cU: $ianmackenzie$elm_3d_scene$Scene3d$upperFourBits, de: lightMask, bO: $elm_explorations$webgl$WebGL$Settings$StencilTest$equal, dq: 0, bW: $elm_explorations$webgl$WebGL$Settings$StencilTest$keep, bX: $elm_explorations$webgl$WebGL$Settings$StencilTest$keep}),
			$ianmackenzie$elm_3d_scene$Scene3d$defaultBlend
		]);
};
var $ianmackenzie$elm_3d_scene$Scene3d$renderWithinShadows = F3(
	function (meshRenderPasses, lightMatrices, numShadowingLights) {
		return $elm$core$List$concat(
			A2(
				$elm$core$List$map,
				function (lightMask) {
					var stencilMask = lightMask << 4;
					var enabledLights = A4(
						$elm_explorations$linear_algebra$Math$Vector4$vec4,
						A2($ianmackenzie$elm_3d_scene$Scene3d$enabledFlag, lightMask, 0),
						A2($ianmackenzie$elm_3d_scene$Scene3d$enabledFlag, lightMask, 1),
						A2($ianmackenzie$elm_3d_scene$Scene3d$enabledFlag, lightMask, 2),
						A2($ianmackenzie$elm_3d_scene$Scene3d$enabledFlag, lightMask, 3));
					return A3(
						$ianmackenzie$elm_3d_scene$Scene3d$call,
						meshRenderPasses,
						_Utils_Tuple2(lightMatrices, enabledLights),
						$ianmackenzie$elm_3d_scene$Scene3d$insideStencil(stencilMask));
				},
				A2(
					$elm$core$List$range,
					1,
					A2($elm$core$Basics$pow, 2, numShadowingLights) - 1)));
	});
var $ianmackenzie$elm_geometry$Direction3d$reverse = function (_v0) {
	var d = _v0;
	return {eK: -d.eK, eL: -d.eL, cz: -d.cz};
};
var $elm_explorations$linear_algebra$Math$Matrix4$toRecord = _MJS_m4x4toRecord;
var $ianmackenzie$elm_3d_camera$Viewpoint3d$viewDirection = function (_v0) {
	var frame = _v0;
	return $ianmackenzie$elm_geometry$Direction3d$reverse(
		$ianmackenzie$elm_geometry$Frame3d$zDirection(frame));
};
var $ianmackenzie$elm_geometry_linear_algebra_interop$Geometry$Interop$LinearAlgebra$Frame3d$toMat4 = function (frame) {
	var p = $ianmackenzie$elm_geometry$Point3d$unwrap(
		$ianmackenzie$elm_geometry$Frame3d$originPoint(frame));
	var k = $ianmackenzie$elm_geometry$Direction3d$unwrap(
		$ianmackenzie$elm_geometry$Frame3d$zDirection(frame));
	var j = $ianmackenzie$elm_geometry$Direction3d$unwrap(
		$ianmackenzie$elm_geometry$Frame3d$yDirection(frame));
	var i = $ianmackenzie$elm_geometry$Direction3d$unwrap(
		$ianmackenzie$elm_geometry$Frame3d$xDirection(frame));
	return $elm_explorations$linear_algebra$Math$Matrix4$fromRecord(
		{dT: i.eK, dU: j.eK, dV: k.eK, dW: p.eK, dX: i.eL, dY: j.eL, dZ: k.eL, d_: p.eL, d$: i.cz, d0: j.cz, d1: k.cz, d2: p.cz, d3: 0, d4: 0, d5: 0, d6: 1});
};
var $ianmackenzie$elm_3d_camera$WebGL$Matrices$modelViewMatrix = F2(
	function (modelFrame, _v0) {
		var viewpointFrame = _v0;
		return $ianmackenzie$elm_geometry_linear_algebra_interop$Geometry$Interop$LinearAlgebra$Frame3d$toMat4(
			A2($ianmackenzie$elm_geometry$Frame3d$relativeTo, viewpointFrame, modelFrame));
	});
var $ianmackenzie$elm_3d_camera$WebGL$Matrices$viewMatrix = function (camera) {
	return A2($ianmackenzie$elm_3d_camera$WebGL$Matrices$modelViewMatrix, $ianmackenzie$elm_geometry$Frame3d$atOrigin, camera);
};
var $ianmackenzie$elm_3d_camera$Camera3d$viewpoint = function (_v0) {
	var camera = _v0;
	return camera.fQ;
};
var $ianmackenzie$elm_3d_camera$Viewpoint3d$xDirection = function (_v0) {
	var frame = _v0;
	return $ianmackenzie$elm_geometry$Frame3d$xDirection(frame);
};
var $ianmackenzie$elm_geometry$Vector3d$xyz = F3(
	function (_v0, _v1, _v2) {
		var x = _v0;
		var y = _v1;
		var z = _v2;
		return {eK: x, eL: y, cz: z};
	});
var $ianmackenzie$elm_3d_camera$Viewpoint3d$yDirection = function (_v0) {
	var frame = _v0;
	return $ianmackenzie$elm_geometry$Frame3d$yDirection(frame);
};
var $ianmackenzie$elm_3d_scene$Scene3d$toWebGLEntities = function (_arguments) {
	var viewpoint = $ianmackenzie$elm_3d_camera$Camera3d$viewpoint(_arguments.eT);
	var viewFrame = $ianmackenzie$elm_geometry$Frame3d$unsafe(
		{
			c1: $ianmackenzie$elm_3d_camera$Viewpoint3d$eyePoint(viewpoint),
			dr: $ianmackenzie$elm_3d_camera$Viewpoint3d$xDirection(viewpoint),
			ds: $ianmackenzie$elm_3d_camera$Viewpoint3d$yDirection(viewpoint),
			dt: $ianmackenzie$elm_geometry$Direction3d$reverse(
				$ianmackenzie$elm_3d_camera$Viewpoint3d$viewDirection(viewpoint))
		});
	var _v0 = $ianmackenzie$elm_3d_scene$Scene3d$Entity$group(_arguments.e4);
	var rootNode = _v0;
	var _v1 = A4(
		$ianmackenzie$elm_3d_scene$Scene3d$getViewBounds,
		viewFrame,
		1,
		$elm$core$Maybe$Nothing,
		_List_fromArray(
			[rootNode]));
	if (_v1.$ === 1) {
		return _List_Nil;
	} else {
		var viewBounds = _v1.a;
		var viewMatrix = $ianmackenzie$elm_3d_camera$WebGL$Matrices$viewMatrix(viewpoint);
		var nearClipDepth = A2(
			$ianmackenzie$elm_units$Quantity$multiplyBy,
			0.99,
			A2(
				$ianmackenzie$elm_units$Quantity$max,
				$ianmackenzie$elm_units$Quantity$abs(_arguments.eX),
				$ianmackenzie$elm_units$Quantity$negate(
					$ianmackenzie$elm_geometry$BoundingBox3d$maxZ(viewBounds))));
		var _v2 = $ianmackenzie$elm_geometry$BoundingBox3d$dimensions(viewBounds);
		var xDimension = _v2.a;
		var yDimension = _v2.b;
		var zDimension = _v2.c;
		var sceneDiameter = $ianmackenzie$elm_geometry$Vector3d$length(
			A3($ianmackenzie$elm_geometry$Vector3d$xyz, xDimension, yDimension, zDimension));
		var farClipDepth = A2(
			$ianmackenzie$elm_units$Quantity$multiplyBy,
			1.01,
			A2(
				$ianmackenzie$elm_units$Quantity$plus,
				sceneDiameter,
				$ianmackenzie$elm_units$Quantity$negate(
					$ianmackenzie$elm_geometry$BoundingBox3d$minZ(viewBounds))));
		var projectionMatrix = A2(
			$ianmackenzie$elm_3d_camera$WebGL$Matrices$projectionMatrix,
			_arguments.eT,
			{eP: _arguments.eP, e9: farClipDepth, fp: nearClipDepth});
		var projectionType = $elm_explorations$linear_algebra$Math$Matrix4$toRecord(projectionMatrix).d6;
		var eyePointOrDirectionToCamera = (!projectionType) ? $ianmackenzie$elm_geometry$Point3d$toMeters(
			$ianmackenzie$elm_3d_camera$Viewpoint3d$eyePoint(viewpoint)) : $ianmackenzie$elm_geometry$Direction3d$unwrap(
			$ianmackenzie$elm_geometry$Direction3d$reverse(
				$ianmackenzie$elm_3d_camera$Viewpoint3d$viewDirection(viewpoint)));
		var _v3 = function () {
			var _v4 = _arguments.aG;
			switch (_v4.$) {
				case 0:
					return _Utils_Tuple2(0, 0);
				case 1:
					return _Utils_Tuple2(1, 0);
				case 2:
					return _Utils_Tuple2(2, 0);
				case 3:
					var overexposureLimit = _v4.a;
					return _Utils_Tuple2(3, overexposureLimit);
				case 4:
					var overexposureLimit = _v4.a;
					return _Utils_Tuple2(4, overexposureLimit);
				default:
					return _Utils_Tuple2(5, 0);
			}
		}();
		var toneMapType = _v3.a;
		var toneMapParam = _v3.b;
		var _v5 = _arguments.ay;
		var exposureLuminance = _v5;
		var _v6 = A2($ianmackenzie$elm_3d_scene$Scene3d$ColorConversions$chromaticityToLinearRgb, exposureLuminance, _arguments.aJ);
		var referenceWhite = _v6;
		var sceneProperties = $elm_explorations$linear_algebra$Math$Matrix4$fromRecord(
			{
				dT: 0,
				dU: eyePointOrDirectionToCamera.eK,
				dV: $elm_explorations$linear_algebra$Math$Vector3$getX(referenceWhite),
				dW: _arguments.eA,
				dX: 0,
				dY: eyePointOrDirectionToCamera.eL,
				dZ: $elm_explorations$linear_algebra$Math$Vector3$getY(referenceWhite),
				d_: $ianmackenzie$elm_units$Length$inMeters(sceneDiameter),
				d$: 0,
				d0: eyePointOrDirectionToCamera.cz,
				d1: $elm_explorations$linear_algebra$Math$Vector3$getZ(referenceWhite),
				d2: toneMapType,
				d3: 0,
				d4: projectionType,
				d5: 0,
				d6: toneMapParam
			});
		var renderPasses = A6(
			$ianmackenzie$elm_3d_scene$Scene3d$collectRenderPasses,
			sceneProperties,
			viewMatrix,
			projectionMatrix,
			$ianmackenzie$elm_3d_scene$Scene3d$Transformation$identity,
			rootNode,
			{S: _List_Nil, ae: _List_Nil, fB: _List_Nil});
		var _v7 = _arguments.aA;
		switch (_v7.$) {
			case 0:
				var lightMatrices = _v7.a;
				return $elm$core$List$concat(
					_List_fromArray(
						[
							A3(
							$ianmackenzie$elm_3d_scene$Scene3d$call,
							renderPasses.S,
							_Utils_Tuple2(lightMatrices, $ianmackenzie$elm_3d_scene$Scene3d$allLightsEnabled),
							$ianmackenzie$elm_3d_scene$Scene3d$depthTestDefault),
							A3($ianmackenzie$elm_3d_scene$Scene3d$call, renderPasses.ae, $ianmackenzie$elm_3d_scene$Scene3d$lightingDisabled, $ianmackenzie$elm_3d_scene$Scene3d$depthTestDefault)
						]));
			case 1:
				var lightMatrices = _v7.a;
				return $elm$core$List$concat(
					_List_fromArray(
						[
							A3($ianmackenzie$elm_3d_scene$Scene3d$call, renderPasses.S, $ianmackenzie$elm_3d_scene$Scene3d$lightingDisabled, $ianmackenzie$elm_3d_scene$Scene3d$depthTestDefault),
							_List_fromArray(
							[$ianmackenzie$elm_3d_scene$Scene3d$initStencil]),
							A3($ianmackenzie$elm_3d_scene$Scene3d$call, renderPasses.fB, lightMatrices.bE, $ianmackenzie$elm_3d_scene$Scene3d$createShadowStencil),
							_List_fromArray(
							[
								$ianmackenzie$elm_3d_scene$Scene3d$storeStencilValue(0)
							]),
							A3(
							$ianmackenzie$elm_3d_scene$Scene3d$call,
							renderPasses.S,
							_Utils_Tuple2(lightMatrices, $ianmackenzie$elm_3d_scene$Scene3d$allLightsEnabled),
							$ianmackenzie$elm_3d_scene$Scene3d$outsideStencil),
							A3($ianmackenzie$elm_3d_scene$Scene3d$call, renderPasses.ae, $ianmackenzie$elm_3d_scene$Scene3d$lightingDisabled, $ianmackenzie$elm_3d_scene$Scene3d$depthTestDefault)
						]));
			default:
				var shadowCasters = _v7.a;
				var allLightMatrices = _v7.b;
				return $elm$core$List$concat(
					_List_fromArray(
						[
							A3(
							$ianmackenzie$elm_3d_scene$Scene3d$call,
							renderPasses.S,
							_Utils_Tuple2(allLightMatrices, $ianmackenzie$elm_3d_scene$Scene3d$allLightsEnabled),
							$ianmackenzie$elm_3d_scene$Scene3d$depthTestDefault),
							_List_fromArray(
							[$ianmackenzie$elm_3d_scene$Scene3d$initStencil]),
							A2($ianmackenzie$elm_3d_scene$Scene3d$createShadows, renderPasses.fB, shadowCasters),
							A3(
							$ianmackenzie$elm_3d_scene$Scene3d$renderWithinShadows,
							renderPasses.S,
							allLightMatrices,
							$elm$core$List$length(shadowCasters)),
							A3($ianmackenzie$elm_3d_scene$Scene3d$call, renderPasses.ae, $ianmackenzie$elm_3d_scene$Scene3d$lightingDisabled, $ianmackenzie$elm_3d_scene$Scene3d$depthTestDefault)
						]));
		}
	}
};
var $elm$html$Html$Attributes$width = function (n) {
	return A2(
		_VirtualDom_attribute,
		'width',
		$elm$core$String$fromInt(n));
};
var $ianmackenzie$elm_3d_scene$Scene3d$composite = F2(
	function (_arguments, scenes) {
		var commonWebGLOptions = _List_fromArray(
			[
				$elm_explorations$webgl$WebGL$depth(1),
				$elm_explorations$webgl$WebGL$stencil(0),
				$elm_explorations$webgl$WebGL$alpha(true),
				A4($elm_explorations$webgl$WebGL$clearColor, 0, 0, 0, 0)
			]);
		var _v0 = function () {
			var _v1 = _arguments.a2;
			switch (_v1.$) {
				case 0:
					return _Utils_Tuple3(commonWebGLOptions, '0', 1);
				case 1:
					return _Utils_Tuple3(
						A2($elm$core$List$cons, $elm_explorations$webgl$WebGL$antialias, commonWebGLOptions),
						'1',
						1);
				default:
					var value = _v1.a;
					return _Utils_Tuple3(commonWebGLOptions, '0', value);
			}
		}();
		var webGLOptions = _v0.a;
		var key = _v0.b;
		var scalingFactor = _v0.c;
		var _v2 = _arguments.e_;
		var width = _v2.a;
		var height = _v2.b;
		var heightInPixels = $ianmackenzie$elm_units$Pixels$toInt(height);
		var heightCss = A2(
			$elm$html$Html$Attributes$style,
			'height',
			$elm$core$String$fromInt(heightInPixels) + 'px');
		var widthInPixels = $ianmackenzie$elm_units$Pixels$toInt(width);
		var aspectRatio = widthInPixels / heightInPixels;
		var webGLEntities = A2(
			$elm$core$List$concatMap,
			function (scene) {
				return $ianmackenzie$elm_3d_scene$Scene3d$toWebGLEntities(
					{eP: aspectRatio, eT: _arguments.eT, eX: _arguments.eX, e4: scene.e4, ay: scene.ay, aA: scene.aA, eA: scalingFactor, aG: scene.aG, aJ: scene.aJ});
			},
			scenes);
		var widthCss = A2(
			$elm$html$Html$Attributes$style,
			'width',
			$elm$core$String$fromInt(widthInPixels) + 'px');
		var _v3 = _arguments.eR;
		var givenBackgroundColor = _v3;
		var backgroundColorString = $avh4$elm_color$Color$toCssString(givenBackgroundColor);
		return A3(
			$elm$html$Html$Keyed$node,
			'div',
			_List_fromArray(
				[
					A2($elm$html$Html$Attributes$style, 'padding', '0px'),
					widthCss,
					heightCss
				]),
			_List_fromArray(
				[
					_Utils_Tuple2(
					key,
					A3(
						$elm_explorations$webgl$WebGL$toHtmlWith,
						webGLOptions,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$width(
								$elm$core$Basics$round(widthInPixels * scalingFactor)),
								$elm$html$Html$Attributes$height(
								$elm$core$Basics$round(heightInPixels * scalingFactor)),
								widthCss,
								heightCss,
								A2($elm$html$Html$Attributes$style, 'display', 'block'),
								A2($elm$html$Html$Attributes$style, 'background-color', backgroundColorString)
							]),
						webGLEntities))
				]));
	});
var $ianmackenzie$elm_3d_scene$Scene3d$custom = function (_arguments) {
	return A2(
		$ianmackenzie$elm_3d_scene$Scene3d$composite,
		{a2: _arguments.a2, eR: _arguments.eR, eT: _arguments.eT, eX: _arguments.eX, e_: _arguments.e_},
		_List_fromArray(
			[
				{e4: _arguments.e4, ay: _arguments.ay, aA: _arguments.aA, aG: _arguments.aG, aJ: _arguments.aJ}
			]));
};
var $ianmackenzie$elm_3d_scene$Scene3d$Types$Chromaticity = $elm$core$Basics$identity;
var $ianmackenzie$elm_3d_scene$Scene3d$Light$chromaticity = function (xy) {
	return xy;
};
var $ianmackenzie$elm_3d_scene$Scene3d$Light$daylight = $ianmackenzie$elm_3d_scene$Scene3d$Light$chromaticity(
	{eK: 0.31271, eL: 0.32902});
var $ianmackenzie$elm_3d_scene$Scene3d$Light$directional = F2(
	function (_v0, light) {
		var shadowFlag = _v0;
		var _v1 = $ianmackenzie$elm_geometry$Direction3d$unwrap(light.e$);
		var x = _v1.eK;
		var y = _v1.eL;
		var z = _v1.cz;
		var _v2 = A2($ianmackenzie$elm_3d_scene$Scene3d$ColorConversions$chromaticityToLinearRgb, light.cL, light.b$);
		var rgb = _v2;
		return {
			c: $elm_explorations$linear_algebra$Math$Vector3$getZ(rgb),
			eU: shadowFlag,
			b6: $elm_explorations$linear_algebra$Math$Vector3$getY(rgb),
			da: 0,
			cp: $elm_explorations$linear_algebra$Math$Vector3$getX(rgb),
			dn: 1,
			eK: -x,
			eL: -y,
			cz: -z
		};
	});
var $ianmackenzie$elm_3d_scene$Scene3d$Exposure = $elm$core$Basics$identity;
var $ianmackenzie$elm_units$Luminance$nits = function (numNits) {
	return numNits;
};
var $ianmackenzie$elm_3d_scene$Scene3d$exposureValue = function (ev100) {
	return $ianmackenzie$elm_units$Luminance$nits(
		1.2 * A2($elm$core$Basics$pow, 2, ev100));
};
var $ianmackenzie$elm_units$Illuminance$lux = function (numLux) {
	return numLux;
};
var $ianmackenzie$elm_3d_scene$Scene3d$Multisampling = {$: 1};
var $ianmackenzie$elm_3d_scene$Scene3d$multisampling = $ianmackenzie$elm_3d_scene$Scene3d$Multisampling;
var $ianmackenzie$elm_3d_scene$Scene3d$NoToneMapping = {$: 0};
var $ianmackenzie$elm_3d_scene$Scene3d$noToneMapping = $ianmackenzie$elm_3d_scene$Scene3d$NoToneMapping;
var $ianmackenzie$elm_units$Illuminance$inLux = function (_v0) {
	var numLux = _v0;
	return numLux;
};
var $ianmackenzie$elm_3d_scene$Scene3d$Light$soft = function (light) {
	soft:
	while (true) {
		if (_Utils_eq(light.fj, $ianmackenzie$elm_units$Quantity$zero) && _Utils_eq(light.fk, $ianmackenzie$elm_units$Quantity$zero)) {
			return $ianmackenzie$elm_3d_scene$Scene3d$Light$disabled;
		} else {
			if (A2(
				$ianmackenzie$elm_units$Quantity$greaterThan,
				$ianmackenzie$elm_units$Quantity$abs(light.fj),
				$ianmackenzie$elm_units$Quantity$abs(light.fk))) {
				var $temp$light = {
					b$: light.b$,
					fj: light.fk,
					fk: light.fj,
					eG: $ianmackenzie$elm_geometry$Direction3d$reverse(light.eG)
				};
				light = $temp$light;
				continue soft;
			} else {
				var nitsBelow = $elm$core$Basics$abs(
					$ianmackenzie$elm_units$Illuminance$inLux(light.fk) / $elm$core$Basics$pi);
				var nitsAbove = $elm$core$Basics$abs(
					$ianmackenzie$elm_units$Illuminance$inLux(light.fj) / $elm$core$Basics$pi);
				var _v0 = $ianmackenzie$elm_geometry$Direction3d$unwrap(light.eG);
				var x = _v0.eK;
				var y = _v0.eL;
				var z = _v0.cz;
				var _v1 = A2(
					$ianmackenzie$elm_3d_scene$Scene3d$ColorConversions$chromaticityToLinearRgb,
					$ianmackenzie$elm_units$Quantity$float(1),
					light.b$);
				var rgb = _v1;
				return {
					c: nitsAbove * $elm_explorations$linear_algebra$Math$Vector3$getZ(rgb),
					eU: false,
					b6: nitsAbove * $elm_explorations$linear_algebra$Math$Vector3$getY(rgb),
					da: nitsBelow / nitsAbove,
					cp: nitsAbove * $elm_explorations$linear_algebra$Math$Vector3$getX(rgb),
					dn: 3,
					eK: x,
					eL: y,
					cz: z
				};
			}
		}
	}
};
var $ianmackenzie$elm_3d_scene$Scene3d$Light$overhead = function (_arguments) {
	return $ianmackenzie$elm_3d_scene$Scene3d$Light$soft(
		{b$: _arguments.b$, fj: _arguments.cL, fk: $ianmackenzie$elm_units$Quantity$zero, eG: _arguments.eG});
};
var $ianmackenzie$elm_units$Temperature$inKelvins = function (_v0) {
	var numKelvins = _v0;
	return numKelvins;
};
var $ianmackenzie$elm_3d_scene$Scene3d$Light$colorTemperature = function (temperature) {
	var t = A3(
		$elm$core$Basics$clamp,
		1667,
		25000,
		$ianmackenzie$elm_units$Temperature$inKelvins(temperature));
	var x = (t <= 4000) ? ((((((-0.2661239) * 1.0e9) / ((t * t) * t)) - ((0.2343589 * 1.0e6) / (t * t))) + ((0.8776956 * 1.0e3) / t)) + 0.17991) : ((((((-3.0258469) * 1.0e9) / ((t * t) * t)) + ((2.1070379 * 1.0e6) / (t * t))) + ((0.2226347 * 1.0e3) / t)) + 0.24039);
	var y = (t <= 2222) ? (((((-1.1063814) * ((x * x) * x)) - (1.3481102 * (x * x))) + (2.18555832 * x)) - 0.20219683) : ((t <= 4000) ? (((((-0.9549476) * ((x * x) * x)) - (1.37418593 * (x * x))) + (2.09137015 * x)) - 0.16748867) : ((((3.081758 * ((x * x) * x)) - (5.8733867 * (x * x))) + (3.75112997 * x)) - 0.37001483));
	return $ianmackenzie$elm_3d_scene$Scene3d$Light$chromaticity(
		{eK: x, eL: y});
};
var $ianmackenzie$elm_units$Temperature$Temperature = $elm$core$Basics$identity;
var $ianmackenzie$elm_units$Temperature$kelvins = function (numKelvins) {
	return numKelvins;
};
var $ianmackenzie$elm_3d_scene$Scene3d$Light$skylight = $ianmackenzie$elm_3d_scene$Scene3d$Light$colorTemperature(
	$ianmackenzie$elm_units$Temperature$kelvins(12000));
var $ianmackenzie$elm_3d_scene$Scene3d$Light$sunlight = $ianmackenzie$elm_3d_scene$Scene3d$Light$colorTemperature(
	$ianmackenzie$elm_units$Temperature$kelvins(5600));
var $ianmackenzie$elm_3d_scene$Scene3d$MultiplePasses = F2(
	function (a, b) {
		return {$: 2, a: a, b: b};
	});
var $ianmackenzie$elm_3d_scene$Scene3d$SingleUnshadowedPass = function (a) {
	return {$: 0, a: a};
};
var $ianmackenzie$elm_3d_scene$Scene3d$eraseLight = function (_v0) {
	var light = _v0;
	return light;
};
var $ianmackenzie$elm_3d_scene$Scene3d$lightCastsShadows = function (_v0) {
	var properties = _v0;
	return properties.eU;
};
var $ianmackenzie$elm_3d_scene$Scene3d$noLights = $ianmackenzie$elm_3d_scene$Scene3d$SingleUnshadowedPass($ianmackenzie$elm_3d_scene$Scene3d$lightingDisabled.a);
var $elm$core$List$partition = F2(
	function (pred, list) {
		var step = F2(
			function (x, _v0) {
				var trues = _v0.a;
				var falses = _v0.b;
				return pred(x) ? _Utils_Tuple2(
					A2($elm$core$List$cons, x, trues),
					falses) : _Utils_Tuple2(
					trues,
					A2($elm$core$List$cons, x, falses));
			});
		return A3(
			$elm$core$List$foldr,
			step,
			_Utils_Tuple2(_List_Nil, _List_Nil),
			list);
	});
var $ianmackenzie$elm_3d_scene$Scene3d$singleLight = function (_v0) {
	var light = _v0;
	return $elm_explorations$linear_algebra$Math$Matrix4$fromRecord(
		{dT: light.eK, dU: light.cp, dV: 0, dW: 0, dX: light.eL, dY: light.b6, dZ: 0, d_: 0, d$: light.cz, d0: light.c, d1: 0, d2: 0, d3: light.dn, d4: light.da, d5: 0, d6: 0});
};
var $ianmackenzie$elm_3d_scene$Scene3d$eightLights = F8(
	function (first, second, third, fourth, fifth, sixth, seventh, eigth) {
		var _v0 = A2(
			$elm$core$List$partition,
			$ianmackenzie$elm_3d_scene$Scene3d$lightCastsShadows,
			_List_fromArray(
				[
					$ianmackenzie$elm_3d_scene$Scene3d$eraseLight(first),
					$ianmackenzie$elm_3d_scene$Scene3d$eraseLight(second),
					$ianmackenzie$elm_3d_scene$Scene3d$eraseLight(third),
					$ianmackenzie$elm_3d_scene$Scene3d$eraseLight(fourth)
				]));
		var enabledShadowCasters = _v0.a;
		var disabledShadowCasters = _v0.b;
		if (!enabledShadowCasters.b) {
			return $ianmackenzie$elm_3d_scene$Scene3d$SingleUnshadowedPass(
				{
					bE: A2($ianmackenzie$elm_3d_scene$Scene3d$lightPair, first, second),
					cc: A2($ianmackenzie$elm_3d_scene$Scene3d$lightPair, third, fourth),
					cd: A2($ianmackenzie$elm_3d_scene$Scene3d$lightPair, fifth, sixth),
					ce: A2($ianmackenzie$elm_3d_scene$Scene3d$lightPair, seventh, eigth)
				});
		} else {
			var sortedLights = _Utils_ap(enabledShadowCasters, disabledShadowCasters);
			if ((((sortedLights.b && sortedLights.b.b) && sortedLights.b.b.b) && sortedLights.b.b.b.b) && (!sortedLights.b.b.b.b.b)) {
				var light0 = sortedLights.a;
				var _v3 = sortedLights.b;
				var light1 = _v3.a;
				var _v4 = _v3.b;
				var light2 = _v4.a;
				var _v5 = _v4.b;
				var light3 = _v5.a;
				return A2(
					$ianmackenzie$elm_3d_scene$Scene3d$MultiplePasses,
					A2($elm$core$List$map, $ianmackenzie$elm_3d_scene$Scene3d$singleLight, enabledShadowCasters),
					{
						bE: A2($ianmackenzie$elm_3d_scene$Scene3d$lightPair, light0, light1),
						cc: A2($ianmackenzie$elm_3d_scene$Scene3d$lightPair, light2, light3),
						cd: A2($ianmackenzie$elm_3d_scene$Scene3d$lightPair, fifth, sixth),
						ce: A2($ianmackenzie$elm_3d_scene$Scene3d$lightPair, seventh, eigth)
					});
			} else {
				return $ianmackenzie$elm_3d_scene$Scene3d$noLights;
			}
		}
	});
var $ianmackenzie$elm_3d_scene$Scene3d$threeLights = F3(
	function (first, second, third) {
		return A8($ianmackenzie$elm_3d_scene$Scene3d$eightLights, first, second, third, $ianmackenzie$elm_3d_scene$Scene3d$Light$disabled, $ianmackenzie$elm_3d_scene$Scene3d$Light$disabled, $ianmackenzie$elm_3d_scene$Scene3d$Light$disabled, $ianmackenzie$elm_3d_scene$Scene3d$Light$disabled, $ianmackenzie$elm_3d_scene$Scene3d$Light$disabled);
	});
var $ianmackenzie$elm_3d_scene$Scene3d$sunny = function (_arguments) {
	var sun = A2(
		$ianmackenzie$elm_3d_scene$Scene3d$Light$directional,
		$ianmackenzie$elm_3d_scene$Scene3d$Light$castsShadows(_arguments.fB),
		{
			b$: $ianmackenzie$elm_3d_scene$Scene3d$Light$sunlight,
			e$: _arguments.fJ,
			cL: $ianmackenzie$elm_units$Illuminance$lux(80000)
		});
	var sky = $ianmackenzie$elm_3d_scene$Scene3d$Light$overhead(
		{
			b$: $ianmackenzie$elm_3d_scene$Scene3d$Light$skylight,
			cL: $ianmackenzie$elm_units$Illuminance$lux(20000),
			eG: _arguments.eG
		});
	var environment = $ianmackenzie$elm_3d_scene$Scene3d$Light$overhead(
		{
			b$: $ianmackenzie$elm_3d_scene$Scene3d$Light$daylight,
			cL: $ianmackenzie$elm_units$Illuminance$lux(15000),
			eG: $ianmackenzie$elm_geometry$Direction3d$reverse(_arguments.eG)
		});
	var lights = A3($ianmackenzie$elm_3d_scene$Scene3d$threeLights, sun, sky, environment);
	return $ianmackenzie$elm_3d_scene$Scene3d$custom(
		{
			a2: $ianmackenzie$elm_3d_scene$Scene3d$multisampling,
			eR: _arguments.eR,
			eT: _arguments.eT,
			eX: _arguments.eX,
			e_: _arguments.e_,
			e4: _arguments.e4,
			ay: $ianmackenzie$elm_3d_scene$Scene3d$exposureValue(15),
			aA: lights,
			aG: $ianmackenzie$elm_3d_scene$Scene3d$noToneMapping,
			aJ: $ianmackenzie$elm_3d_scene$Scene3d$Light$daylight
		});
};
var $ianmackenzie$elm_geometry$Sphere3d$translateBy = F2(
	function (displacement, sphere) {
		return A2(
			$ianmackenzie$elm_geometry$Sphere3d$withRadius,
			$ianmackenzie$elm_geometry$Sphere3d$radius(sphere),
			A2(
				$ianmackenzie$elm_geometry$Point3d$translateBy,
				displacement,
				$ianmackenzie$elm_geometry$Sphere3d$centerPoint(sphere)));
	});
var $author$project$Main$viewWorld = function (world) {
	return _List_fromArray(
		[
			$ianmackenzie$elm_3d_scene$Scene3d$sunny(
			{
				eR: $ianmackenzie$elm_3d_scene$Scene3d$backgroundColor($avh4$elm_color$Color$black),
				eT: $ianmackenzie$elm_3d_camera$Camera3d$orthographic(
					{
						fQ: $ianmackenzie$elm_3d_camera$Viewpoint3d$lookAt(
							{
								e7: A3($ianmackenzie$elm_geometry$Point3d$meters, 0, -5, 5),
								fa: $ianmackenzie$elm_geometry$Point3d$origin,
								eG: $ianmackenzie$elm_geometry$Direction3d$positiveZ
							}),
						fR: $ianmackenzie$elm_units$Length$meters(12)
					}),
				eX: $ianmackenzie$elm_units$Length$meters(0.001),
				e_: _Utils_Tuple2(
					$ianmackenzie$elm_units$Pixels$int(800),
					$ianmackenzie$elm_units$Pixels$int(600)),
				e4: A2(
					$elm$core$List$cons,
					A2(
						$ianmackenzie$elm_3d_scene$Scene3d$cylinderWithShadow,
						$ianmackenzie$elm_3d_scene$Scene3d$Material$matte($avh4$elm_color$Color$green),
						A3(
							$ianmackenzie$elm_geometry$Cylinder3d$centeredOn,
							A3($ianmackenzie$elm_geometry$Point3d$meters, 0, 0, -1.5),
							$ianmackenzie$elm_geometry$Direction3d$positiveZ,
							{
								dM: $ianmackenzie$elm_units$Length$meters(3),
								cq: $ianmackenzie$elm_units$Length$meters(7)
							})),
					_Utils_ap(
						A4(
							$author$project$Ecs$System$foldl2,
							F3(
								function (pos, graphics, entities) {
									var _v0 = $author$project$Main$gameHexToPoint(pos);
									var x = _v0.a;
									var y = _v0.b;
									switch (graphics.$) {
										case 0:
											return entities;
										case 1:
											var c = graphics.a;
											var s = graphics.b;
											return A2(
												$elm$core$List$cons,
												A2(
													$ianmackenzie$elm_3d_scene$Scene3d$cylinderWithShadow,
													$ianmackenzie$elm_3d_scene$Scene3d$Material$matte(c),
													A2(
														$ianmackenzie$elm_geometry$Cylinder3d$translateBy,
														A3($ianmackenzie$elm_geometry$Vector3d$meters, x, y, 0),
														s)),
												entities);
										default:
											var c = graphics.a;
											var s = graphics.b;
											return A2($elm$core$List$cons, world.cK, entities);
									}
								}),
							world.aa,
							world.aT,
							_List_Nil),
						A4(
							$author$project$Ecs$System$foldl2,
							F3(
								function (_v2, graphics, entities) {
									var _v3 = _v2.b;
									var x = _v3.a;
									var y = _v3.b;
									switch (graphics.$) {
										case 0:
											var c = graphics.a;
											var s = graphics.b;
											return A2(
												$elm$core$List$cons,
												A2(
													$ianmackenzie$elm_3d_scene$Scene3d$sphereWithShadow,
													$ianmackenzie$elm_3d_scene$Scene3d$Material$matte(c),
													A2(
														$ianmackenzie$elm_geometry$Sphere3d$translateBy,
														A3($ianmackenzie$elm_geometry$Vector3d$meters, x, y, 0),
														s)),
												entities);
										case 1:
											return entities;
										default:
											return entities;
									}
								}),
							world.av,
							world.aT,
							_List_Nil))),
				fB: true,
				fJ: $ianmackenzie$elm_geometry$Direction3d$negativeZ,
				eG: $ianmackenzie$elm_geometry$Direction3d$positiveZ
			}),
			A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					A2($elm$html$Html$Attributes$style, 'display', 'flex'),
					A2($elm$html$Html$Attributes$style, 'flex-direction', 'column')
				]),
			A4(
				$author$project$Ecs$System$foldl2,
				F3(
					function (pollen, _v5, res) {
						return A2(
							$elm$core$List$cons,
							A2(
								$elm$html$Html$span,
								_List_Nil,
								_List_fromArray(
									[
										$elm$html$Html$text(
										'Hive pollen count: ' + $elm$core$String$fromInt(pollen))
									])),
							res);
					}),
				world.p,
				world.bC,
				_List_Nil)),
			A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					A2($elm$html$Html$Attributes$style, 'display', 'flex'),
					A2($elm$html$Html$Attributes$style, 'flex-direction', 'column')
				]),
			A4(
				$author$project$Ecs$System$foldl2,
				F3(
					function (pollen, ai, res) {
						return A2(
							$elm$core$List$cons,
							A2(
								$elm$html$Html$span,
								_List_Nil,
								_List_fromArray(
									[
										$elm$html$Html$text(
										'Bee pollen count: ' + $elm$core$String$fromInt(pollen))
									])),
							res);
					}),
				world.p,
				world.au,
				_List_Nil))
		]);
};
var $author$project$Main$view = function (model) {
	return {
		eS: function () {
			switch (model.$) {
				case 0:
					return _List_fromArray(
						[
							$elm$html$Html$text('Loading...')
						]);
				case 1:
					var world = model.a;
					return $author$project$Main$viewWorld(world);
				default:
					var err = model.a;
					return _List_fromArray(
						[
							$elm$html$Html$text(err)
						]);
			}
		}(),
		fL: 'Bees!!'
	};
};
var $author$project$Main$main = $elm$browser$Browser$document(
	{fi: $author$project$Main$init, fI: $author$project$Main$subscriptions, fM: $author$project$Main$update, fP: $author$project$Main$view});
_Platform_export({'Main':{'init':$author$project$Main$main(
	$elm$json$Json$Decode$succeed(0))(0)}});}(this));