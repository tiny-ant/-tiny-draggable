"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useThrottle;

var _react = require("react");

var _lodashEs = require("lodash-es");

var _usePersistFn = _interopRequireDefault(require("./usePersistFn"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function useThrottle(fn) {
  var wait = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 300;
  var options = arguments.length > 2 ? arguments[2] : undefined;
  return (0, _react.useRef)((0, _lodashEs.throttle)((0, _usePersistFn.default)(fn), wait, options)).current;
}

;