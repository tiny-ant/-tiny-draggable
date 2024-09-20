"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = require("react");

/**
 * makes a persist wrapper to call fn which may changes with its dependencies.
 * @param fn
 * @returns
 */
function usePersistFn(fn) {
  var fnRef = (0, _react.useRef)(fn);
  var persistFn = (0, _react.useRef)();
  fnRef.current = fn; // fnRef is unchanged, but fnRef.current changes every time fn changes.

  if (!persistFn.current) {
    // keep a stable wrapper that can access the newest fn instance between React component renders.
    persistFn.current = function f() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return fnRef.current.apply(this, args);
    };
  }

  return persistFn.current;
}

var _default = usePersistFn;
exports.default = _default;