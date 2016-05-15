'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createKey = undefined;

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _for = require('babel-runtime/core-js/symbol/for');

var _for2 = _interopRequireDefault(_for);

exports.createCreates = createCreates;
exports.executeCreates = executeCreates;

var _rx = require('rx');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @typedef {[ string, [ object, object ] ]} createOp
 */

var createKey = exports.createKey = (0, _for2.default)('sequelize create action');

function createCreates(collection) {
  for (var _len = arguments.length, parameters = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    parameters[_key - 1] = arguments[_key];
  }

  return [createKey, [collection, Array.prototype.isPrototypeOf(parameters[0]) ? parameters : [parameters]]];
}

/**
 * @param sequelize {object} An instance of sequelize
 * @param creations {array<collection, array<createOp>>} Creation operations
 */
function executeCreates(state, _ref) {
  var _ref2 = (0, _slicedToArray3.default)(_ref, 2);

  var collection = _ref2[0];
  var creationOps = _ref2[1];

  return _rx.Observable.create(function (observer) {
    var model = state.get(collection);
    if (!model) {
      observer.onError(new Error('Collection has not been defined yet: ' + collection));
      observer.onComplete();
      return;
    }

    var options = creationOps.reduce(function (m, _ref3) {
      var _ref4 = (0, _slicedToArray3.default)(_ref3, 2);

      var o = _ref4[0];
      var t = _ref4[1];
      return (0, _assign2.default)({}, m, t);
    }, {});
    state.get(collection).bulkCreate(creationOps.map(function (_ref5) {
      var _ref6 = (0, _slicedToArray3.default)(_ref5, 2);

      var o = _ref6[0];
      var t = _ref6[1];
      return o;
    }), options).then(function () {
      return observer.onComplete();
    }).catch(function (err) {
      observer.onError(err);
      observer.onComplete();
    });
    observer.onNext();
  });
}