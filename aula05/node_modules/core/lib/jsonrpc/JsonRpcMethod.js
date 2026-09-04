/**
 * @overview JsonRpcResponse
 * @copyright Dreamlab Onet.pl sp. z. o o 2012
 */

var EventDispatcher = require('../event/EventDispatcher.js').EventDispatcher;

/**
 * @class JsonRpcMethod
 * @classdesc JsonRpcMethod
 * @extends EventDispatcher
 * 
 * @requires EventDispatcher
 *
 * @param {Request} request
 * @param {Response} response
 * @param {Server} server
 * @returns {JsonRpcMethod}
 */
var JsonRpcMethod = exports.JsonRpcMethod = function (request, response, server) {
    EventDispatcher.call(this);
    this._request = request;
    this._response = response;
    this.server = server;
};

JsonRpcMethod.prototype = Object.create(EventDispatcher.prototype);

/**
 * Executes JsonRpc Method
 * @param {Object} params
 * @returns {undefined}
 * @method
 */
JsonRpcMethod.prototype.execute = function (params) {};


/**
 * @static
 * @constant
 * @namespace
 */
JsonRpcMethod.Event = {};

/**
 * @static
 * @constant
 * @type {String}
 * @default
 */
JsonRpcMethod.Event.WRONG_PARAMS = 'JsonRpcMethod_WRONG_PARAMS';

/**
 * @static
 * @constant
 * @type {String}
 * @default
 */
JsonRpcMethod.Event.ERROR = 'JsonRpcMethod_ERROR';

/**
 * @static
 * @constant
 * @type {String}
 * @default
 */
JsonRpcMethod.Event.OK = 'JsonRpcMethod_OK';
