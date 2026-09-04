/**
 * @overview JsonRpcBatchResponse
 * @copyright Dreamlab Onet.pl sp. z. o o 2012
 */

var JsonRpcResponse = require('./JsonRpcResponse.js').JsonRpcResponse;
var JsonRpcError = require('./JsonRpcError.js').JsonRpcError;
var JsonRpcAbstract = require('./JsonRpcAbstract.js').JsonRpcAbstract;

/**
 * @class JsonRpcBatchResponse
 * @classdesc JsonRpcBatchResponse
 *
 * @requires JsonRpcAbstract
 * @requires JsonRpcError
 * @requires JsonRpcResponse
 *
 * @param {Number} id
 * @param {Object} result
 * @param {Object} error
 * @returns {JsonRpcBatchResponse}
 *
 * @example empty object: new JsonRpcBatchResponse()
 * @example specifining parameters: new JsonRpcBatchResponse(id, result, error);
 * @example from object literal: new JsonRpcBatchResponse({
 * 'id': 1, 'result': Object, 'error': {'code': -1, 'message': 'msg', 'data': 'some data'
 * }});
 * @example from json string: new JsonRpcBatchResponse("{
 * 'id': 1, 'result': Object, 'error': {'code': -1, 'message': 'msg', 'data': 'some data'
 * }}");
 */
var JsonRpcBatchResponse = function (data) {
    this._items = [];
    if(data !== undefined) {
        for (var i = 0; i < data.length; i++) {
            this._items.push( new JsonRpcResponse(data[i]));
        }
    }
};


JsonRpcBatchResponse.prototype.get = function(id) {
    if(id) {
        for(var i=0;i<this._items.length;i++) {
            if(this._items[i].getId() == id) {
                return this._items[i];
            }
        }
    }

    return this._items;
};


/**
 * Returns JSON representation of a jsonrpc response
 * @method
 * @returns {Object} in format: {[jsonrpc: "1.1", id: 20, result:Object, error: {code: -1, message: 'msg', data: 'data'}]}
 *
 */
JsonRpcBatchResponse.prototype.toJson = function () {
    var batchArray = [];
    for (var i=0; i< this._items.length; i++){
        batchArray.push(this._items[i].toJson());
    }
    return batchArray;
};

JsonRpcBatchResponse.prototype.toString = function () {
    return JSON.stringify(this.toJson());
};

exports.JsonRpcBatchResponse = JsonRpcBatchResponse;
