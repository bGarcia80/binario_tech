/**
 * @overview JsonRpcBatchRequest
 * @copyright Dreamlab Onet.pl sp. z. o o 2012
 */


/**
 * @class JsonRpcBatchRequest
 * @classdesc JsonRpcBatchRequest
 * 
 * @requires Types
 *
 * @returns {JsonRpcBatchRequest}
 * 
 * @example empty object: new JsonRpcBatchRequest()
 */
var JsonRpcBatchRequest  = exports.JsonRpcBatchRequest = function () {
    this._items = [];
};

/**
 * Add request to request array
 * @param {JsonRpcBatchRequest} json object literal in format: 
 * @return {J}
 * @method
 */
JsonRpcBatchRequest.prototype.add = function (JsonRpcBatchRequestItem) {
    this._items.push(JsonRpcBatchRequestItem);
};


/**
 * Returns JSON representation of a JsonRpcBatchRequest in format:
 * [{"jsonrpc":String, "id":Number, "method":String, params:Object}]
 * @method
 * @returns {Object}
 */
JsonRpcBatchRequest.prototype.toJson = function () {
    var batchArray = [];
    for (var i=0; i< this._items.length; i++){
        batchArray.push(this._items[i].toJson());
    }
    return batchArray;
};

/**
 * Returns String representation of a JsonRpcBatchRequest
 * @method
 * @returns {String}
 */
JsonRpcBatchRequest.prototype.toString = function () {
    return JSON.stringify(this.toJson());
};

