/**
 * @overview MySQLPool
 * @copyright Dreamlab Onet.pl sp. z. o o 2012
 */
var Event = require('../event/Event.js').Event;
var ErrorEvent = require('../event/ErrorEvent.js').ErrorEvent;
var EventDispatcher = require('../event/EventDispatcher.js').EventDispatcher;
var Crypto = require('../crypto/Crypto.js').Crypto;
var BinaryData = require("../data/BinaryData.js").BinaryData;
var Response = require("../http/Response.js").Response;
var knox = require('knox');

/**
 * @class S3
 * @classdesc S3 client
 * @param {Object} configuration
 * @extends EventDispatcher
 */
var S3 = function(configuration){
    this._client = knox.createClient(configuration);
    EventDispatcher.call(this);
};

S3.prototype = Object.create(EventDispatcher.prototype);

/**
 * Fetch file from S3
 * @method
 * @param {String} file
 * @param {Function} cb
 */
S3.prototype.get = function (file, cb) {
    var request = this._client.get(file).on('response', function(res){
        var dataLength = 0, buffers = [];
        res.on('data', function (buffer) {
            buffers.push(buffer);
            dataLength += buffer.length;
        });
        res.on('end', function () {
            var resultBuffer = new Buffer(dataLength);
            var bufferPosition = 0;
            for(var i = 0, l = buffers.length; i < l; i++){
                buffers[i].copy(resultBuffer, bufferPosition);
                bufferPosition += buffers[i].length;
            }
            var response = new Response();
            response.setStatusCode(res.statusCode);
            response.setHeaders(res.headers);
            response._setBody(resultBuffer);
//            response.setBody(new BinaryData(resultBuffer, BinaryData.Encoding.BINARY));
            cb(false, response);
        });
    });
    request.on('error', function(err){
        cb(err);
    });
    request.end();
};

/**
 * Put file to S3
 * @method
 * @param {String|Buffer} data
 */
S3.prototype.set = function (data) {
    var that = this;
    var req = this._client.put(Crypto.md5(data), {
        'Content-Length': data.length,
        'Content-Type': 'application/octet-stream'
    });
    req.on('response', function (res) {
        if (200 == res.statusCode) {
            that.dispatchEvent(new Event(S3.Event.LOADED, null));
        } else {
            that.dispatchEvent(new ErrorEvent(S3.Event.ERROR, {res: res, req:req}, -5, 'S3 Error'));
        }
    });
    req.end(data);
};

/**
 * @static
 * @constant
 * @namespace
 */
S3.Event = {};

/**
 * @static
 * @constant
 * @type {String}
 * @default
 */
S3.Event.LOADED = 'S3.Event.LOADED';

/**
 * @static
 * @constant
 * @type {String}
 * @default
 */
S3.Event.ERROR = 'S3.Event.ERROR';
exports.S3 = S3;
