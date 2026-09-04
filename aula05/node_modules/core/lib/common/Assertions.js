/**
 * @overview Assertions
 * @copyright Dreamlab Onet.pl sp. z. o o 2012
 */

var assert = require('assert');
var Types = require('./Types.js').Types;

/**
 * Assertions
 * @class Assertions
 */
var Assertions = {};

/**
 * Throws if value is not a Array
 * @static
 * @throw AssertionError
 * @param {Object} value
 * @param {String} [message]
 */
Assertions.isArray = function (value, message) {
    if (!Types.isArray(value)) {
        assert.fail(Types.typeOf(value), 'array', message, '==', Assertions.isArray);
    }
};

/**
 * Throws if value is not a Boolean
 * @static
 * @throw AssertionError
 * @param {Object} value
 * @param {String} [message]
 */
Assertions.isBoolean = function (value, message) {
    if (!Types.isBoolean(value)) {
        assert.fail(Types.typeOf(value), 'boolean', message, '==', Assertions.isBoolean);
    }
};

/**
 * Throws if value is not a Date
 * @static
 * @throw AssertionError
 * @param {Object} value
 * @param {String} [message]
 */
Assertions.isDate = function (value, message) {
    if (!Types.isDate(value)) {
        assert.fail(Types.typeOf(value), 'date', message, '==', Assertions.isDate);
    }
};

/**
 * Throws if value is not a Function
 * @static
 * @throw AssertionError
 * @param {Object} value
 * @param {String} [message]
 */
Assertions.isFunction = function (value, message) {
    if (!Types.isFunction(value)) {
        assert.fail(Types.typeOf(value), 'function', message, '==', Assertions.isFunction);
    }
};


/**
 * Throws if obj2 is not type or subtype of obj1
 * @static
 * @throw AssertionError
 * @param {Object} obj1
 * @param {Object} obj2
 * @param {String} [message]
 */
Assertions.isInstanceOf = function (obj1, obj2, message) {
    if (!Types.isInstanceOf(obj1, obj2)) {
        assert.fail('not a instanceof', 'instanceof', message, '==', Assertions.isInstanceOf);
    }
};

/**
 * Throws if value is not a Null
 * @static
 * @throw AssertionError
 * @param {Object} value
 * @param {String} [message]
 */
Assertions.isNull = function (value, message) {
    if (!Types.isNull(value)) {
        assert.fail(Types.typeOf(value), 'null', message, '==', Assertions.isNull);
    }
};

/**
 * Throws if value is not a Number
 * @static
 * @throw AssertionError
 * @param {Object} value
 * @param {String} [message]
 */
Assertions.isNumber = function (value, message) {
    if (!Types.isNumber(value)) {
        assert.fail(Types.typeOf(value), 'number', message, '==', Assertions.isNumber);
    }
};

/**
 * Throws if value is not a Object
 * @static
 * @throw AssertionError
 * @param {Object} value
 * @param {String} [message]
 */
Assertions.isObject = function (value, message) {
    if (!Types.isObject(value)) {
        assert.fail(Types.typeOf(value), 'object', message, '==', Assertions.isObject);
    }
};

/**
 * Throws if value is not a RegExp
 * @static
 * @throw AssertionError
 * @param {Object} value
 * @param {String} [message]
 */
Assertions.isRegExp = function (value, message) {
    if (!Types.isRegExp(value)) {
        assert.fail(Types.typeOf(value), 'regexp', message, '==', Assertions.isRegExp);
    }
};

/**
 * Throws if value is not a String
 * @static
 * @throw AssertionError
 * @param {Object} value
 * @param {String} [message]
 */
Assertions.isString = function (value, message) {
    if (!Types.isString(value)) {
        assert.fail(Types.typeOf(value), 'string', message, '==', Assertions.isString);
    }
};

/**
 * Throws if value is not a undefined
 * @static
 * @throw AssertionError
 * @param {Object} value
 * @param {String} [message]
 */
Assertions.isUndefined = function (value, message) {
    if (!Types.isUndefined(value)) {
        assert.fail(Types.typeOf(value), 'undefined', message, '==', Assertions.isUndefined);
    }
};

/**
 * Throws if value is not type of one from types set
 * @static
 * @throw AssertionError
 * @param {Object} value
 * @param {Array} types Array of methods to check value types: isArray, isBoolean etc.
 * @param {String} [message]
 */
Assertions.guard = function (value, types, message) {
    var lastError, i, l;

    for (i = 0, l = types.length; i < l; i++) {
        try {
            types[i](value, message);
            return;
        } catch (e) {
            lastError = e;
        }
    }
    throw lastError;
};

Assertions.equal = assert.equal;

exports.Assertions = Assertions;
