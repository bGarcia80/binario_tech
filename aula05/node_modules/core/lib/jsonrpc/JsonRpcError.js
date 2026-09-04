/**
 * @overview JsonRpcError
 * @copyright Dreamlab Onet.pl sp. z. o o 2012
 */

var JsonRpcAbstract = require('./JsonRpcAbstract.js').JsonRpcAbstract;
var Types = require('../common/Types.js').Types;

/**
 * @class JsonRpcError
 * @classdesc JsonRpcError
 * @extends JsonRpcAbstract
 * @requires JsonRpcAbstract
 * 
 * @param {Number} code
 * @param {String} message
 * @param {Object} data
 * @returns {JsonRpcError}
 * 
 * @example empty object: new JsonRpcError()
 * @example specifining parameters: new JsonRpcError(errorCode, errorMessage, data);
 * @example from object literal: new JsonRpcError({'code': -1, 'message': 'msg', 'data': 'some data'});
 * @example from json string: new JsonRpcError("{'code': -1, 'message': 'msg', 'data': 'some data'}");
 */
var JsonRpcError = exports.JsonRpcError = function (code, message, data) {
    this._code = null;
    this._message = null;
    this._data = null;
    JsonRpcAbstract.apply(this, arguments);
};

JsonRpcError.prototype = Object.create(JsonRpcAbstract.prototype);

/**
 * Initialize object from object literal
 * @param {Array} args object literal in format: [errorCode:Number, errorMessage:String, data:Object]
 * @return {undefined}
 * @throws JsonRpcAbstract.Exceptions.INVALID_JSON_RPC
 * @method
 * @private
 */
JsonRpcError.prototype._init = function (args) {
    if (Types.isNumber(args[0])) {
        this.setCode(args[0]);
    } else {
        throw new Error(JsonRpcAbstract.Exceptions.INVALID_JSON_RPC);
    }

    if (Types.isString(args[1])) {
        this.setMessage(args[1]);
    } else {
        throw new Error(JsonRpcAbstract.Exceptions.INVALID_JSON_RPC);
    }

    if (args[2]) {
        this.setData(args[2]);
    }
};

/**
 * Parses error json into array of parameters
 * @param {Object} json object literal in format: {'code': -1, 'message': 'msg', 'data': 'some data'}
 * @return {Array}
 * @method
 * @private
 */
JsonRpcError.prototype._parse = function (json) {
    return [
        json.code,
        json.message,
        json.data
    ];
};

/**
 * Sets error code
 * @param {Number} code
 * @returns JsonRpcError
 * @method
 */
JsonRpcError.prototype.setCode = function (code) {
    if (!Types.isNumber(code)) {
        throw new Error("Code must be a Number!");
    }
    this._code = code;

    return this;
};

/**
 * Returns error code
 * @returns {Number}
 * @method
 */
JsonRpcError.prototype.getCode = function () {
    return this._code;
};

/**
 * Sets error message
 * @param {String} message error message
 * @throws Message must be a String!
 * @returns {JsonRpcError}
 * @method
 */
JsonRpcError.prototype.setMessage = function (message) {
    if (!Types.isString(message)) {
        throw new Error("Message must be a String!");
    }
    this._message = message;
    return this;
};

/**
 * Returns error message
 * @returns {String}
 * @method
 */
JsonRpcError.prototype.getMessage = function () {
    return this._message;
};

/**
 * Sets error data object
 * @param {Object} data error data
 * @returns {JsonRpcError}
 * @method
 */
JsonRpcError.prototype.setData = function (data) {
    if (data instanceof JsonRpcError) {
        this._data = data.toJson();
    } else {
        this._data = data;
    }
    return this;
};

/**
 * Returns error data object
 * @returns {Object}
 * @method
 */
JsonRpcError.prototype.getData = function () {
    return this._data;
};

/**
 * Returns JSON representation of a jsonrpc error
 * @method
 * @returns {Object} in format: {code: -1, message: 'msg', data: 'data'}
 */
JsonRpcError.prototype.toJson = function () {
    var data = {
        code: this._code,
        message: this._message
    };
    if (this._data) {
        data.data = this._data;
    }
    return data;
};

/**
 * Creates new instance based on the given instance (factory method)
 * @static
 * @param {JsonRpcError} jsonRpcError
 * @throws JsonRpcError.Exceptions.WRONG_CLASS
 * @returns {JsonRpcError}
 */
JsonRpcError.factory = function (jsonRpcError) {
    if (!(jsonRpcError instanceof JsonRpcError)) {
        throw JsonRpcError.Exceptions.WRONG_CLASS;
    }
    var factory = new JsonRpcError(jsonRpcError.getCode(), jsonRpcError.getMessage(), jsonRpcError.getData());
    return factory;
};

/**
 * @static
 * @constant
 * @namespace
 */
JsonRpcError.Exceptions = {};

/**
 * @static
 * @constant
 * @default
 * @type {String}
 */
JsonRpcError.Exceptions.WRONG_CLASS = 'Given something is not a instance of JsonRpcError class';
