'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AsyncStorage = require('react-native').AsyncStorage;
var Model = require('./model.js');
var Util = require('./util.js');

var Store = function () {
    function Store(opts) {
        _classCallCheck(this, Store);

        this.dbName = opts.dbName;
    }

    _createClass(Store, [{
        key: '_getCurrentVersion',
        value: function () {
            var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(versionKey) {
                var currentVersion;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.next = 2;
                                return AsyncStorage.getItem(versionKey);

                            case 2:
                                currentVersion = _context.sent;

                                currentVersion = currentVersion || 0;
                                return _context.abrupt('return', parseFloat(currentVersion));

                            case 5:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            return function _getCurrentVersion(_x) {
                return ref.apply(this, arguments);
            };
        }()
    }, {
        key: 'migrate',
        value: function () {
            var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
                var migrations, versionKey, currentVersion, target, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, migration;

                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                migrations = require('./migrations.js');
                                versionKey = this.dbName + '_version';
                                _context2.next = 4;
                                return this._getCurrentVersion(versionKey);

                            case 4:
                                currentVersion = _context2.sent;
                                target = migrations.slice(-1)[0];

                                if (!(currentVersion == target.version)) {
                                    _context2.next = 8;
                                    break;
                                }

                                return _context2.abrupt('return');

                            case 8:
                                _iteratorNormalCompletion = true;
                                _didIteratorError = false;
                                _iteratorError = undefined;
                                _context2.prev = 11;
                                _iterator = migrations[Symbol.iterator]();

                            case 13:
                                if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                                    _context2.next = 23;
                                    break;
                                }

                                migration = _step.value;

                                if (!(migration.version <= currentVersion)) {
                                    _context2.next = 17;
                                    break;
                                }

                                return _context2.abrupt('continue', 20);

                            case 17:
                                migration.perform();
                                _context2.next = 20;
                                return AsyncStorage.setItem(versionKey, migration.version.toString());

                            case 20:
                                _iteratorNormalCompletion = true;
                                _context2.next = 13;
                                break;

                            case 23:
                                _context2.next = 29;
                                break;

                            case 25:
                                _context2.prev = 25;
                                _context2.t0 = _context2['catch'](11);
                                _didIteratorError = true;
                                _iteratorError = _context2.t0;

                            case 29:
                                _context2.prev = 29;
                                _context2.prev = 30;

                                if (!_iteratorNormalCompletion && _iterator.return) {
                                    _iterator.return();
                                }

                            case 32:
                                _context2.prev = 32;

                                if (!_didIteratorError) {
                                    _context2.next = 35;
                                    break;
                                }

                                throw _iteratorError;

                            case 35:
                                return _context2.finish(32);

                            case 36:
                                return _context2.finish(29);

                            case 37:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this, [[11, 25, 29, 37], [30,, 32, 36]]);
            }));

            return function migrate() {
                return ref.apply(this, arguments);
            };
        }()
    }, {
        key: 'model',
        value: function model(modelName) {
            return new Model(modelName, this.dbName);
        }

        // clear store

    }, {
        key: 'clear',
        value: function () {
            var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                _context3.next = 2;
                                return AsyncStorage.removeItem(this.dbName);

                            case 2:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            return function clear() {
                return ref.apply(this, arguments);
            };
        }()
    }]);

    return Store;
}();

module.exports = Store;

// Store.model("user").get({ id:1 },{fite}).then().fail();