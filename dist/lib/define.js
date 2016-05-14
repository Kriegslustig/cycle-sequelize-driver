'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defineKey = undefined;

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _toArray2 = require('babel-runtime/helpers/toArray');

var _toArray3 = _interopRequireDefault(_toArray2);

var _for = require('babel-runtime/core-js/symbol/for');

var _for2 = _interopRequireDefault(_for);

exports.createDefinitions = createDefinitions;
exports.executeDefinitions = executeDefinitions;

var _rx = require('rx');

var _immutable = require('immutable');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defineKey = exports.defineKey = (0, _for2.default)('sequelize define action');

function createDefinitions() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return [defineKey].concat([typeof args[0] === 'string' ? [].concat(args) : args]);
}

function executeDefinitions(sequelize, definitions) {
  var models = definitions.reduce(function (m, _ref) {
    var _ref2 = (0, _toArray3.default)(_ref);

    var name = _ref2[0];

    var args = _ref2.slice(1);

    return m.set(name, sequelize.define.apply(sequelize, [name].concat((0, _toConsumableArray3.default)(args))));
  }, (0, _immutable.Map)());
  return _rx.Observable.create(function (observer) {
    _promise2.default.all.apply(_promise2.default, (0, _toConsumableArray3.default)(models.map(function (m) {
      return m.sync();
    }))).then(function () {
      for (var _len2 = arguments.length, createdModels = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        createdModels[_key2] = arguments[_key2];
      }

      observer.onNext(createdModels.reduce(function (state, _ref3) {
        var _ref4 = (0, _slicedToArray3.default)(_ref3, 2);

        var name = _ref4[0];
        var model = _ref4[1];
        return state.set(name, model);
      }, (0, _immutable.Map)()));
      observer.onCompleted();
    }).catch(function (err) {
      return observer.onError(err);
    });
  });
}