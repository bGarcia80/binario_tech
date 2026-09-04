/**
 * @overview JsonRpcServer
 * @copyright Dreamlab Onet.pl sp. z. o o 2012
 */

var Server = require('../http/Server.js').Server;
var JsonRpcRequestProcessor = require('./JsonRpcRequestProcessor.js').JsonRpcRequestProcessor;

/**
 * @class JsonRpcServer
 * @classdesc JsonRpcServer
 * @extends Server
 * 
 * @requires Server
 * @requires JsonRpcRequestProcessor
 *
 * @returns {JsonRpcServer}
 */
var JsonRpcServer  = exports.JsonRpcServer = function () {
    this._methods = {};
    Server.call(this, JsonRpcRequestProcessor);
};

JsonRpcServer.prototype = Object.create(Server.prototype);

/**
 * Add method to JsonRpc Server
 * @param {String} methodName
 * @param {JsonRpcMethod} method
 * @returns {Boolean}
 * @method
 */
JsonRpcServer.prototype.addMethod = function (methodName, method) {
    if (!this._methods.hasOwnProperty(methodName)) {
        this._methods[methodName] = method;
        return true;
    }
    return false;
};

/**
 * Returns JsonRpc method
 * @param {String} methodName
 * @returns {JsonRpcMethod|false}
 * @method
 */
JsonRpcServer.prototype.getMethod = function (methodName) {
    if (this._methods.hasOwnProperty(methodName)) {
        return this._methods[methodName];
    }
    return false;
};

/**
 * Removes method from the JsonRpc server
 * @param {String} methodName
 * @returns {Boolean}
 * @method
 */
JsonRpcServer.prototype.removeMethod = function (methodName) {
    if (this._methods.hasOwnProperty(methodName)) {
        delete this._methods[methodName];
        return true;
    }
    return false;
};

/**
 * @static
 * @constant
 * @namespace
 */
JsonRpcServer.Exceptions = {};

/**
 * @static
 * @constant
 * @type {String}
 * @default
 */
JsonRpcServer.Exceptions.WRONG_CLASS = "Method has to be an instanceof JsonRpcMethod";
