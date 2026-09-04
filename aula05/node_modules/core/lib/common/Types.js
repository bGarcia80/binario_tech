/**
 * @overview Types
 * @copyright Dreamlab Onet.pl sp. z. o o 2012
 */

/**
 * @class Types
 */
var Types = {};

/**
 * Checks if ar is an Array
 * @static
 * @param {Object} ar
 * @returns {Boolean}
 */
Types.isArray = function (ar) {
    return ar instanceof Array || Array.isArray(ar) || (ar && ar !== Object.prototype && Types.isArray(ar.__proto__));
};

/**
 * Checks if bool is a Boolean
 * @static
 * @param {Object} bool
 * @returns {Boolean}
 */
Types.isBoolean = function (bool) {
    return typeof bool == "boolean";
};

/**
 * Checks if d is a Date
 * @static
 * @param {Object} d
 * @returns {Boolean}
 */
Types.isDate = function (d) {
    return d instanceof Date || (typeof d === 'object' && Object.prototype.toString.call(d) === '[object Date]');
};

/**
 * Checks if fn is a Function
 * @static
 * @param {Object} fn
 * @returns {Boolean}
 */
Types.isFunction = function (fn) {
    return typeof fn == "function";
};

/**
 * Checks if cls2 is type or subtype of cls1
 * @static
 * @param {Object} cls1
 * @param {Object} cls2
 * @returns {Boolean}
 */
Types.isInstanceOf = function (cls1, cls2) {
    return cls1 instanceof cls2;
};

/**
 * Checks if val is a Null
 * @static
 * @param {Object} val
 * @returns {Boolean}
 */
Types.isNull = function (val) {
    return val === null;
};

/**
 * Checks if nr is a Number
 * @static
 * @param {Object} nr
 * @returns {Boolean}
 */
Types.isNumber = function (nr) {
    return typeof nr == "number";
};

/**
 * Checks if obj is a Object
 * @static
 * @param {Object} obj
 * @returns {Boolean}
 */
Types.isObject = function (obj) {
    return obj !== null && typeof obj == "object" && Object.prototype.toString.call(obj) == '[object Object]' && obj.constructor.toString() == 'function Object() { [native code] }';
};

/**
 * Checks if re is a RegExp
 * @static
 * @param {Object} re
 * @returns {Boolean}
 */
Types.isRegExp = function (re) {
    return re instanceof RegExp || (typeof re === 'object' && Object.prototype.toString.call(re) === '[object RegExp]');
};

/**
 * Checks if str is a String
 * @static
 * @param {Object} str
 * @returns {Boolean}
 */
Types.isString = function (str) {
    return typeof str == "string";
};

/**
 * Checks if val is undefined
 * @static
 * @param {Object} val
 * @returns {Boolean}
 */
Types.isUndefined = function (val) {
    return typeof val == "undefined";
};

/**
 * Checks type of obj
 * @static
 * @param {Object} obj
 * @returns {String}
 */
Types.typeOf = function (obj) {
    if (Types.isArray(obj)) {
        return 'array';
    }
    if (Types.isBoolean(obj)) {
        return 'boolean';
    }
    if (Types.isDate(obj)) {
        return 'date';
    }
    if (Types.isFunction(obj)) {
        return 'function';
    }
    if (Types.isNull(obj)) {
        return 'null';
    }
    if (Types.isNumber(obj)) {
        return 'number';
    }
    if (Types.isObject(obj)) {
        return 'object';
    }
    if (Types.isRegExp(obj)) {
        return 'regexp';
    }
    if (Types.isString(obj)) {
        return 'string';
    }
    if (Types.isUndefined(obj)) {
        return 'undefined';
    }

    return 'unknown';
};

exports.Types = Types;
