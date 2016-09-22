'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AsyncStorage = require('react-native').AsyncStorage;
var Util = require('./util.js');
var Filter = require('./filter.js');

var Model = function () {
    function Model(modelName, dbName) {
        _classCallCheck(this, Model);

        this.dbName = dbName;
        this.modelName = modelName;
        this.offset = 0;
        this.limit = 10;
        this.modelFilter = new Filter();
    }

    _createClass(Model, [{
        key: 'createDatabase',
        value: function () {
            var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.next = 2;
                                return AsyncStorage.setItem(this.dbName, JSON.stringify({}));

                            case 2:
                                return _context.abrupt('return', this.getDatabase());

                            case 3:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            return function createDatabase() {
                return ref.apply(this, arguments);
            };
        }()
    }, {
        key: 'getDatabase',
        value: function () {
            var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
                var database;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _context2.next = 2;
                                return AsyncStorage.getItem(this.dbName);

                            case 2:
                                database = _context2.sent;

                                if (!database) {
                                    _context2.next = 7;
                                    break;
                                }

                                return _context2.abrupt('return', Object.assign({}, JSON.parse(database)));

                            case 7:
                                return _context2.abrupt('return', this.createDatabase());

                            case 8:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            return function getDatabase() {
                return ref.apply(this, arguments);
            };
        }()
    }, {
        key: 'initModel',
        value: function () {
            var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                _context3.next = 2;
                                return this.getDatabase();

                            case 2:
                                this.database = _context3.sent;

                                this.model = this.database[this.modelName] ? this.database[this.modelName] : {
                                    'totalrows': 0,
                                    'autoinc': 1,
                                    'rows': {}
                                };
                                this.database[this.modelName] = this.database[this.modelName] || this.model;

                            case 5:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            return function initModel() {
                return ref.apply(this, arguments);
            };
        }()

        //destroy

    }, {
        key: 'destroy',
        value: function () {
            var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee4() {
                var database;
                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                _context4.next = 2;
                                return AsyncStorage.getItem(this.dbName);

                            case 2:
                                database = _context4.sent;

                                if (!database) {
                                    _context4.next = 9;
                                    break;
                                }

                                _context4.next = 6;
                                return AsyncStorage.removeItem(this.dbName);

                            case 6:
                                _context4.t0 = _context4.sent;
                                _context4.next = 10;
                                break;

                            case 9:
                                _context4.t0 = null;

                            case 10:
                                return _context4.abrupt('return', _context4.t0);

                            case 11:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            return function destroy() {
                return ref.apply(this, arguments);
            };
        }()

        // add

    }, {
        key: 'add',
        value: function () {
            var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(data) {
                var autoinc;
                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                _context5.next = 2;
                                return this.initModel();

                            case 2:
                                autoinc = this.model.autoinc++;

                                if (!this.model.rows[autoinc]) {
                                    _context5.next = 5;
                                    break;
                                }

                                return _context5.abrupt('return', Util.error("ReactNativeStore error: Storage already contains _id '" + autoinc + "'"));

                            case 5:
                                if (!data._id) {
                                    _context5.next = 7;
                                    break;
                                }

                                return _context5.abrupt('return', Util.error("ReactNativeStore error: Don't need _id with add method"));

                            case 7:
                                data._id = autoinc;
                                this.model.rows[autoinc] = data;
                                this.model.totalrows++;
                                this.database[this.modelName] = this.model;
                                _context5.next = 13;
                                return AsyncStorage.setItem(this.dbName, JSON.stringify(this.database));

                            case 13:
                                return _context5.abrupt('return', this.model.rows[data._id]);

                            case 14:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));

            return function add(_x) {
                return ref.apply(this, arguments);
            };
        }()

        // multi add

    }, {
        key: 'multiAdd',
        value: function () {
            var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee6(data) {
                var key, value, autoinc;
                return regeneratorRuntime.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                _context6.next = 2;
                                return this.initModel();

                            case 2:
                                _context6.t0 = regeneratorRuntime.keys(data);

                            case 3:
                                if ((_context6.t1 = _context6.t0()).done) {
                                    _context6.next = 16;
                                    break;
                                }

                                key = _context6.t1.value;
                                value = data[key];
                                autoinc = this.model.autoinc++;

                                if (!this.model.rows[autoinc]) {
                                    _context6.next = 9;
                                    break;
                                }

                                return _context6.abrupt('return', Util.error("ReactNativeStore error: Storage already contains _id '" + autoinc + "'"));

                            case 9:
                                if (!value._id) {
                                    _context6.next = 11;
                                    break;
                                }

                                return _context6.abrupt('return', Util.error("ReactNativeStore error: Don't need _id with add method"));

                            case 11:
                                value._id = autoinc;
                                this.model.rows[autoinc] = value;
                                this.model.totalrows++;
                                _context6.next = 3;
                                break;

                            case 16:
                                this.database[this.modelName] = this.model;
                                _context6.next = 19;
                                return AsyncStorage.setItem(this.dbName, JSON.stringify(this.database));

                            case 19:
                                return _context6.abrupt('return', this.model.rows);

                            case 20:
                            case 'end':
                                return _context6.stop();
                        }
                    }
                }, _callee6, this);
            }));

            return function multiAdd(_x2) {
                return ref.apply(this, arguments);
            };
        }()

        // update

    }, {
        key: 'update',
        value: function () {
            var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee7(data, filter) {
                var results, rows, filterResult, row, element, i;
                return regeneratorRuntime.wrap(function _callee7$(_context7) {
                    while (1) {
                        switch (_context7.prev = _context7.next) {
                            case 0:
                                _context7.next = 2;
                                return this.initModel();

                            case 2:
                                filter = filter || {};
                                if (data._id) delete data._id;
                                results = [];
                                rows = this.model["rows"];
                                filterResult = this.modelFilter.apply(rows, filter);
                                _context7.t0 = regeneratorRuntime.keys(rows);

                            case 8:
                                if ((_context7.t1 = _context7.t0()).done) {
                                    _context7.next = 23;
                                    break;
                                }

                                row = _context7.t1.value;
                                _context7.t2 = regeneratorRuntime.keys(filterResult);

                            case 11:
                                if ((_context7.t3 = _context7.t2()).done) {
                                    _context7.next = 21;
                                    break;
                                }

                                element = _context7.t3.value;

                                if (!(rows[row]['_id'] === filterResult[element]['_id'])) {
                                    _context7.next = 19;
                                    break;
                                }

                                for (i in data) {
                                    rows[row][i] = data[i];
                                }
                                results.push(rows[row]);
                                this.database[this.modelName] = this.model;
                                _context7.next = 19;
                                return AsyncStorage.setItem(this.dbName, JSON.stringify(this.database));

                            case 19:
                                _context7.next = 11;
                                break;

                            case 21:
                                _context7.next = 8;
                                break;

                            case 23:
                                return _context7.abrupt('return', results.length ? results : null);

                            case 24:
                            case 'end':
                                return _context7.stop();
                        }
                    }
                }, _callee7, this);
            }));

            return function update(_x3, _x4) {
                return ref.apply(this, arguments);
            };
        }()

        // remove a single entry by id

    }, {
        key: 'updateById',
        value: function () {
            var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee8(data, id) {
                var result;
                return regeneratorRuntime.wrap(function _callee8$(_context8) {
                    while (1) {
                        switch (_context8.prev = _context8.next) {
                            case 0:
                                _context8.next = 2;
                                return this.update(data, {
                                    where: {
                                        _id: id
                                    }
                                });

                            case 2:
                                result = _context8.sent;
                                return _context8.abrupt('return', result ? result[0] : null);

                            case 4:
                            case 'end':
                                return _context8.stop();
                        }
                    }
                }, _callee8, this);
            }));

            return function updateById(_x5, _x6) {
                return ref.apply(this, arguments);
            };
        }()

        // remove

    }, {
        key: 'remove',
        value: function () {
            var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee9(filter) {
                var results, rowsToDelete, rows, filterResult, row, element, i;
                return regeneratorRuntime.wrap(function _callee9$(_context9) {
                    while (1) {
                        switch (_context9.prev = _context9.next) {
                            case 0:
                                _context9.next = 2;
                                return this.initModel();

                            case 2:
                                filter = filter || {};
                                results = [];
                                rowsToDelete = [];
                                rows = this.model["rows"];
                                filterResult = this.modelFilter.apply(rows, filter);

                                for (row in rows) {
                                    for (element in filterResult) {
                                        if (rows[row]['_id'] === filterResult[element]['_id']) rowsToDelete.push(row);
                                    }
                                }
                                for (i in rowsToDelete) {
                                    row = rowsToDelete[i];

                                    results.push(this.model["rows"][row]);
                                    delete this.model["rows"][row];
                                    this.model["totalrows"]--;
                                }
                                this.database[this.modelName] = this.model;
                                _context9.next = 12;
                                return AsyncStorage.setItem(this.dbName, JSON.stringify(this.database));

                            case 12:
                                return _context9.abrupt('return', results.length ? results : null);

                            case 13:
                            case 'end':
                                return _context9.stop();
                        }
                    }
                }, _callee9, this);
            }));

            return function remove(_x7) {
                return ref.apply(this, arguments);
            };
        }()

        // remove a single entry by id

    }, {
        key: 'removeById',
        value: function () {
            var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee10(id) {
                var result;
                return regeneratorRuntime.wrap(function _callee10$(_context10) {
                    while (1) {
                        switch (_context10.prev = _context10.next) {
                            case 0:
                                _context10.next = 2;
                                return this.remove({
                                    where: {
                                        _id: id
                                    }
                                });

                            case 2:
                                result = _context10.sent;
                                return _context10.abrupt('return', result ? result[0] : null);

                            case 4:
                            case 'end':
                                return _context10.stop();
                        }
                    }
                }, _callee10, this);
            }));

            return function removeById(_x8) {
                return ref.apply(this, arguments);
            };
        }()

        // find

    }, {
        key: 'find',
        value: function () {
            var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee11(filter) {
                var results, rows;
                return regeneratorRuntime.wrap(function _callee11$(_context11) {
                    while (1) {
                        switch (_context11.prev = _context11.next) {
                            case 0:
                                _context11.next = 2;
                                return this.initModel();

                            case 2:
                                filter = filter || {};
                                results = [];
                                rows = this.model["rows"];

                                results = this.modelFilter.apply(rows, filter);
                                return _context11.abrupt('return', results.length ? results : null);

                            case 7:
                            case 'end':
                                return _context11.stop();
                        }
                    }
                }, _callee11, this);
            }));

            return function find(_x9) {
                return ref.apply(this, arguments);
            };
        }()

        // find a single entry by id

    }, {
        key: 'findById',
        value: function () {
            var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee12(id) {
                var result;
                return regeneratorRuntime.wrap(function _callee12$(_context12) {
                    while (1) {
                        switch (_context12.prev = _context12.next) {
                            case 0:
                                _context12.next = 2;
                                return this.find({
                                    where: {
                                        _id: id
                                    }
                                });

                            case 2:
                                result = _context12.sent;
                                return _context12.abrupt('return', result ? result[0] : null);

                            case 4:
                            case 'end':
                                return _context12.stop();
                        }
                    }
                }, _callee12, this);
            }));

            return function findById(_x10) {
                return ref.apply(this, arguments);
            };
        }()

        // get

    }, {
        key: 'get',
        value: function get(filter) {
            filter = filter || {};
            filter.limit = 1;
            return this.find(filter);
        }
    }]);

    return Model;
}();

module.exports = Model;