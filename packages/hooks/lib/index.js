"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "useDebounce", {
  enumerable: true,
  get: function get() {
    return _useDebounce.default;
  }
});
Object.defineProperty(exports, "useThrottle", {
  enumerable: true,
  get: function get() {
    return _useThrottle.default;
  }
});
Object.defineProperty(exports, "useRequest", {
  enumerable: true,
  get: function get() {
    return _useRequest.default;
  }
});

var _useDebounce = _interopRequireDefault(require("./useDebounce"));

var _useThrottle = _interopRequireDefault(require("./useThrottle"));

var _useRequest = _interopRequireDefault(require("./useRequest"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }