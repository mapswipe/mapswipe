"use strict";
// Replicate resolve and reject values from:
// https://github.com/facebook/react-native/blob/master/Libraries/Storage/AsyncStorage.js
// Haven't implemented callbacks as not yet used in react-native-store
// Haven't implemented multiGet/Set as not yet used in react-native-store

var cache = {};
var mock = {
    setItem: jest.genMockFunction().mockImplementation(function (key, value) {
        return new Promise(function (resolve, reject) {
            if (typeof key !== 'string' || typeof value !== 'string') reject(new Error('key and value must be string'));
            resolve(cache[key] = value);
        });
    }),
    getItem: jest.genMockFunction().mockImplementation(function (key) {
        return new Promise(function (resolve, reject) {
            if (cache.hasOwnProperty(key)) resolve(cache[key]);
            resolve(null);
        });
    }),
    removeItem: jest.genMockFunction().mockImplementation(function (key) {
        return new Promise(function (resolve, reject) {
            if (cache.hasOwnProperty(key)) resolve(delete cache[key]);
            reject('No such item!');
        });
    }),
    clear: jest.genMockFunction().mockImplementation(function () {
        return new Promise(function (resolve, reject) {
            resolve(cache = {});
        });
    }),
    getAllKeys: jest.genMockFunction().mockImplementation(function () {
        return new Promise(function (resolve, reject) {
            resolve(Object.keys(cache));
        });
    }),
    _forceClear: function _forceClear() {
        cache = {};
    }
};

module.exports = mock;