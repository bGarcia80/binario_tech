/**
 * @overview JsonRpcAbstract
 * @copyright Dreamlab Onet.pl sp. z. o o 2012
 */

/**
 * JsonRpcAbstract
 * @class JsonRpcAbstract
 * @classdesc JsonRpcAbstract provides the basic functionality for JsonRpc* classes
 * @throws JsonRpcAbstract.Exceptions.INPROPER_JSON_STRING
 * @throws JsonRpcAbstract.Exceptions.INPROPER_JSON
 * @return {JsonRpcAbstract}
 * 
 * @example constructor handles data in format: (data1, data2, dataN);
 * @example constructor handles data in format: ( {'data1': -1, 'data2': 'msg', 'dataN': 'some data'} );
 * @example constructor handles data in format: ("{'data1': -1, 'data2': 'msg', 'dataN': 'some data'}");
 */
var JsonRpcAbstract = exports.JsonRpcAbstract = function () {
    this._jsonrpc = "2.0";

    var args = [].slice.call(arguments, 0);

    if (args.length) {
        if (args.length == 1) {
            if (args[0] && typeof args[0] == 'string' && args[0].constructor == String) {
                try {
                    args = this._parse(JSON.parse(args[0]));
                } catch (e) {
                    throw new Error(JsonRpcAbstract.Exceptions.INPROPER_JSON_STRING);
                }
            } else if (args[0] && typeof args[0] == "object" && args[0].constructor == Object) {
                try {
                    args = this._parse(args[0]);
                } catch (e) {
                    throw new Error(JsonRpcAbstract.Exceptions.INPROPER_JSON);
                }
            }
        }

        this._init(args);
    }
};

/**
 * Initialize object
 * @param {Array} args
 * @return {undefined}
 * @method
 * @private
 */
JsonRpcAbstract.prototype._init = function (args) {};

/**
 * Parses json literal into array of parameters
 * @param {Object} json
 * @return {Array}
 * @method
 * @private
 */
JsonRpcAbstract.prototype._parse = function (json) {
    return [];
};

/**
 * Returns JSON representation of a json rpc message
 * @method
 * @returns {Object}
 */
JsonRpcAbstract.prototype.toJson = function () {
    return {};
};

/**
 * Returns String representation of a json rpc message
 * @method
 * @returns {String}
 */
JsonRpcAbstract.prototype.toString = function () {
    return JSON.stringify(this.toJson());
};


/**
 * @static
 * @constant
 * @namespace
 */
JsonRpcAbstract.Exceptions = {};

/**
 * @constant
 * @type {String}
 * @default
 */
JsonRpcAbstract.Exceptions.INPROPER_JSON_STRING = 'Inproper JSON string given';

/**
 * @constant
 * @type {String}
 * @default
 */
JsonRpcAbstract.Exceptions.INPROPER_JSON = 'Inproper JSON given';

/**
 * @constant
 * @type {String}
 * @default
 */
JsonRpcAbstract.Exceptions.INVALID_JSON_RPC = 'Invalid JSON-RPC given';
