"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = require("react");

var _useDebounce = _interopRequireDefault(require("./useDebounce"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function useRequest(apiCall, option) {
  var {
    debounce = false,
    debounceTime = 300
  } = option || {};
  var [loading, setLoading] = (0, _react.useState)(false);
  var [res, setRes] = (0, _react.useState)({
    ok: true,
    data: null,
    errMsg: null,
    status: 0
  });

  var request = /*#__PURE__*/function () {
    var _ref = _asyncToGenerator(function* (args) {
      setLoading(true);
      var res;

      try {
        res = yield apiCall(args);
      } catch (err) {
        res = err;
      }

      setLoading(false);
      setRes(res);
      return res;
    });

    return function request(_x) {
      return _ref.apply(this, arguments);
    };
  }();

  var debounceRun = (0, _useDebounce.default)(request, debounceTime);
  var run = debounce ? debounceRun.current : request;
  return {
    run,
    res,
    loading,
    errMsg: (res === null || res === void 0 ? void 0 : res.errMsg) || null
  };
}

var _default = useRequest;
exports.default = _default;