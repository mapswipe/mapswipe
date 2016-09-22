'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

jest.dontMock('../filter.js');
jest.dontMock('../model.js');
var astore = require.requireActual('./mockStorage.js');
jest.setMock('react-native', {
    AsyncStorage: astore
});

// To view log of any syncstorage calls, use inside code:
// console.log('set calls', astore.setItem.mock.calls)

describe('model Tests', function () {
    var _this = this;

    var Model;

    beforeEach(function () {
        var Model_ = require('../model.js');
        Model = new Model_('modelName', 'dbName');
    });

    afterEach(function () {
        astore._forceClear();
    });

    pit('should test create database', function () {
        return Model.getDatabase().then(function (resp) {
            expect(resp).toEqual({});
            expect(astore.getItem).toBeCalled();
            expect(astore.setItem).toBeCalledWith('dbName', '{}');
        });
    });

    pit('should add the data to AsyncStorage', function () {
        return Model.add({
            foo: 'bar'
        }).then(function (resp) {
            expect(resp).toEqual({
                _id: 1,
                foo: 'bar'
            });
            var dbJson = '{"modelName":{"totalrows":1,"autoinc":2,"rows":{"1":{"foo":"bar","_id":1}}}}';
            expect(astore.setItem).toBeCalledWith('dbName', dbJson);
        });
    });

    pit('should test findById', function () {
        return Model.findById(3).then(function (resp) {
            expect(resp).toEqual(null);
        });
    });

    pit('should destroy the model', function () {
        return Model.add({
            foo: 'bar'
        }).then(function (resp) {
            Model.destroy();
        }).then(function (resp) {
            expect(astore.removeItem).toBeCalledWith('dbName');
        });
    });

    pit('should update existing rows on filter', _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
        var testData, resp, expected, dbJson;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        testData = [{
                            foo: 0,
                            bar: 0,
                            foobar: 'foobar'
                        }, {
                            foo: 0,
                            bar: 1,
                            foobar: 'foobar'
                        }, {
                            foo: 1,
                            bar: 0,
                            foobar: 'foo'
                        }, {
                            foo: 1,
                            bar: 1,
                            foobar: 'foobar'
                        }];
                        _context.next = 3;
                        return Model.multiAdd(testData);

                    case 3:
                        _context.next = 5;
                        return Model.update({
                            foobar: 'bar'
                        }, {
                            where: {
                                bar: 1
                            }
                        });

                    case 5:
                        resp = _context.sent;
                        expected = [{
                            _id: 2,
                            foo: 0,
                            bar: 1,
                            foobar: 'bar'
                        }, {
                            _id: 4,
                            foo: 1,
                            bar: 1,
                            foobar: 'bar'
                        }];

                        expect(resp).toEqual(expected);
                        dbJson = {
                            "modelName": {
                                "totalrows": 4,
                                "autoinc": 5,
                                "rows": {
                                    1: {
                                        "foo": 0,
                                        "bar": 0,
                                        "foobar": "foobar",
                                        "_id": 1
                                    },
                                    2: {
                                        "foo": 0,
                                        "bar": 1,
                                        "foobar": "bar",
                                        "_id": 2
                                    },
                                    3: {
                                        "foo": 1,
                                        "bar": 0,
                                        "foobar": "foo",
                                        "_id": 3
                                    },
                                    4: {
                                        "foo": 1,
                                        "bar": 1,
                                        "foobar": "bar",
                                        "_id": 4
                                    }
                                }
                            }
                        };

                        expect(astore.setItem).toBeCalledWith('dbName', JSON.stringify(dbJson));

                    case 10:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, _this);
    })));

    pit('should update row with given id', _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
        var testData, resp, expected;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        testData = [{
                            foo: 0,
                            bar: 0,
                            foobar: 'foobar'
                        }, {
                            foo: 0,
                            bar: 1,
                            foobar: 'foobar'
                        }, {
                            foo: 1,
                            bar: 0,
                            foobar: 'foo'
                        }, {
                            foo: 1,
                            bar: 1,
                            foobar: 'foobar'
                        }];
                        _context2.next = 3;
                        return Model.multiAdd(testData);

                    case 3:
                        _context2.next = 5;
                        return Model.updateById({
                            foobar: 'barfoo'
                        }, 2);

                    case 5:
                        resp = _context2.sent;
                        expected = {
                            _id: 2,
                            foo: 0,
                            bar: 1,
                            foobar: 'barfoo'
                        };

                        expect(resp).toEqual(expected);

                    case 8:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, _this);
    })));

    pit('should remove rows based on filter', _asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
        var testData, resp, dbJson;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        testData = [{
                            foo: 0,
                            bar: 0,
                            foobar: 'foobar'
                        }, {
                            foo: 0,
                            bar: 1,
                            foobar: 'foobar'
                        }, {
                            foo: 1,
                            bar: 0,
                            foobar: 'foo'
                        }, {
                            foo: 1,
                            bar: 1,
                            foobar: 'foobar'
                        }];
                        _context3.next = 3;
                        return Model.multiAdd(testData);

                    case 3:
                        astore.setItem.mockClear();
                        _context3.next = 6;
                        return Model.remove({
                            where: {
                                foo: 1
                            }
                        });

                    case 6:
                        resp = _context3.sent;
                        dbJson = {
                            "modelName": {
                                "totalrows": 2,
                                "autoinc": 5,
                                "rows": {
                                    1: {
                                        "foo": 0,
                                        "bar": 0,
                                        "foobar": "foobar",
                                        "_id": 1
                                    },
                                    2: {
                                        "foo": 0,
                                        "bar": 1,
                                        "foobar": "foobar",
                                        "_id": 2
                                    }
                                }
                            }
                        };

                        expect(astore.setItem).toBeCalledWith('dbName', JSON.stringify(dbJson));

                    case 9:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, _this);
    })));

    pit('should remove rows based on id', _asyncToGenerator(regeneratorRuntime.mark(function _callee4() {
        var testData, resp, dbJson;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        testData = [{
                            foo: 0,
                            bar: 0,
                            foobar: 'foobar'
                        }, {
                            foo: 0,
                            bar: 1,
                            foobar: 'foobar'
                        }, {
                            foo: 1,
                            bar: 0,
                            foobar: 'foo'
                        }, {
                            foo: 1,
                            bar: 1,
                            foobar: 'foobar'
                        }];
                        _context4.next = 3;
                        return Model.multiAdd(testData);

                    case 3:
                        astore.setItem.mockClear();
                        _context4.next = 6;
                        return Model.removeById(1);

                    case 6:
                        resp = _context4.sent;
                        dbJson = {
                            "modelName": {
                                "totalrows": 3,
                                "autoinc": 5,
                                "rows": {
                                    2: {
                                        "foo": 0,
                                        "bar": 1,
                                        "foobar": "foobar",
                                        "_id": 2
                                    },
                                    3: {
                                        "foo": 1,
                                        "bar": 0,
                                        "foobar": "foo",
                                        "_id": 3
                                    },
                                    4: {
                                        "foo": 1,
                                        "bar": 1,
                                        "foobar": "foobar",
                                        "_id": 4
                                    }
                                }
                            }
                        };

                        expect(astore.setItem).toBeCalledWith('dbName', JSON.stringify(dbJson));

                    case 9:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, _this);
    })));
});