/**
 * @overview JsonRpcError
 * @copyright Dreamlab Onet.pl sp. z. o o 2012
 */

var JsonRpcAbstract = require("./JsonRpcAbstract.js").JsonRpcAbstract;
var Types = require("../common/Types.js").Types;

/**
 * @class JsonRpcRequest
 * @classdesc JsonRpcRequest
 * @extends JsonRpcAbstract
 * 
 * @requires JsonRpcAbstract
 * @requires Types
 *
 * @param {Number} id
 * @param {String} method
 * @param {Object} params
 * @returns {JsonRpcRequest}
 * 
 * @example empty object: new JsonRpcRequest()
 * @example specifining parameters: new JsonRpcRequest(id, method, params);
 * @example from object literal: new JsonRpcRequest({'id': 1, 'method': 'msg', 'params': 'some data'});
 * @example from json string: new JsonRpcRequest("{'id': 1, 'method': 'msg', 'params': 'some data'}");
 */
var JsonRpcRequest = exports.JsonRpcRequest = function (id, method, params) {
    this._id = null;
    this._method = null;
    this._params = {};
    JsonRpcAbstract.apply(this, arguments);
};

JsonRpcRequest.prototype = Object.create(JsonRpcAbstract.prototype);

/**
 * Initialize object from object literal
 * @param {Array} args object literal in format: [id:Number, method:String, params:Object]
 * @return {undefined}
 * @throws JsonRpcAbstract.Exceptions.INVALID_JSON_RPC
 * @method
 * @private
 */
JsonRpcRequest.prototype._init = function (args) {
    if (args[0]) {
        this.setId(args[0]);
    } else {
        throw new Error(JsonRpcAbstract.Exceptions.INVALID_JSON_RPC);
    }

    if (args[1]) {
        this.setMethod(args[1]);
    } else {
        throw new Error(JsonRpcAbstract.Exceptions.INVALID_JSON_RPC);
    }

    if (args[2]) {
        this.setParams(args[2]);
    }
};

/**
 * Parses request json into array of parameters
 * @param {Object} json object literal in format: {'id':Number, 'method':String, 'params': Object}
 * @return {Array}
 * @method
 * @private
 */
JsonRpcRequest.prototype._parse = function (json) {
    if (Types.isArray(json) && json.length == 1) {
        json = json[0];
    }

    return [
        json.id,
        json.method,
        json.params
    ];
};

/**
 * Sets JsonRpc Id
 * @param {Number} id
 * @returns {JsonRpcRequest}
 * @throws Id should be a string
 * @method
 */
JsonRpcRequest.prototype.setId = function (id) {
    if (typeof id !== 'string' && typeof id !== 'number') {
        throw new Error("Id should be a string");
    }
    this._id = id;
    return this;
};

/**
 * Returns JsonRpc Id
 * @returns {Number}
 * @method
 */
JsonRpcRequest.prototype.getId = function () {
    return this._id;
};

/**
 * Sets JsonRpc method
 * @param {String} method
 * @returns {JsonRpcRequest}
 * @throws Method should be a string
 * @method
 */
JsonRpcRequest.prototype.setMethod = function (method) {
    if (typeof method !== 'string') {
        throw new Error("Method should be a string");
    }
    this._method = method;
    return this;
};

/**
 * Returns JsonRpc method
 * @returns {String}
 * @method
 */
JsonRpcRequest.prototype.getMethod = function () {
    return this._method;
};

/**
 * Sets JsonRpc version
 * @param {String} version
 * @returns {JsonRpcRequest}
 * @throws Version should be a string
 * @method
 */
JsonRpcRequest.prototype.setVersion = function (version) {
    if (typeof version !== 'string') {
        throw new Error("Version should be a string");
    }
    this._jsonrpc = version;
    return this;
};

/**
 * Returns JsonRpc version
 * @returns {String}
 * @method
 */
JsonRpcRequest.prototype.getVersion = function () {
    return this._jsonrpc;
};

/**
 * Sets JsonRpc params object
 * @param {Object} params
 * @returns {JsonRpcRequest}
 * @method
 */
JsonRpcRequest.prototype.setParams = function (params) {
    this._params = params;
    return this;
};

/**
 * Returns JsonRpc params object
 * @returns {Object}
 * @method
 */
JsonRpcRequest.prototype.getParams = function () {
    return this._params;
};

/**
 * Sets JsonRpc param in params object
 * @param {String} key
 * @param {Object} value
 * @returns {JsonRpcRequest}
 * @throws "Key should be a string"
 * @method
 */
JsonRpcRequest.prototype.setParam = function (key, value) {
    if (typeof key !== 'string') {
        throw new Error("Key should be a string");
    }
    this._params[key] = value;
    return this;
};

/**
 * Returns JsonRpc param from params object
 * @param {String} key
 * @returns {Object|null}
 * @method
 */
JsonRpcRequest.prototype.getParam = function (key) {
    if (this._params.hasOwnProperty(key)) {
        return this._params[key];
    }
    return null;
};

/**
 * Returns JSON representation of a JsonRpcRequest in format:
 * {"jsonrpc":String, "id":Number, "method":String, params:Object}
 * @method
 * @returns {Object}
 */
JsonRpcRequest.prototype.toJson = function () {
    return {
        "jsonrpc": this._jsonrpc,
        "id": this._id,
        "method": this._method,
        "params": this._params
    };
};

/**
 * Returns String representation of a JsonRpcRequest
 * @method
 * @returns {String}
 */
JsonRpcRequest.prototype.toString = function () {
    return JSON.stringify(this.toJson());
};
