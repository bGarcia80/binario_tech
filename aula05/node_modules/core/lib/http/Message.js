/**
 * @overview Message
 * @copyright Dreamlab Onet.pl sp. z. o o 2012
 */

var Assertions = require('../common/Assertions.js').Assertions;
var EventDispatcher = require('../event/EventDispatcher.js').EventDispatcher;
var Headers = require('./Headers.js').Headers;


/**
 * Http Message
 * @class Message
 * @classdesc Object that represents http message
 * @extends EventDispatcher
 * @return {Message}
 */
var Message = function (params) {
    EventDispatcher.call(this);
    this.headers = new Headers();
    this._body = null;
    this._httpVersion = '1.0';
    this._cookieKey = 'message-cookie';
};

Message.prototype = Object.create(EventDispatcher.prototype);

/**
 * Initialize object with data
 * @method
 * @param {Object} params
 */
Message.prototype.init = function (params) {
    if (params && typeof params == 'object' && params.constructor == Object) {
        var methodName, key;
        for (key in params) {
            if (params.hasOwnProperty(key)) {
                methodName = key.charAt(0).toUpperCase() + key.substr(1);
                if (typeof this['set' + methodName] == 'function') {
                    if (typeof this['_set' + methodName] == 'function') {
                        this['_set' + methodName](params[key]);
                    } else {
                        this['set' + methodName](params[key]);
                    }
                }
            }
        }
    }
};

/**
 * Sets message headers
 * @param {Object} headers
 * @param {Boolean} normalize
 * @throws Message.Exception.HEADERS_HAVE_TO_BE_AN_OBJECT
 * @returns {Message}
 * @method
 */
Message.prototype.setHeaders = function (headers, normalize) {
    Assertions.isObject(headers, Message.Exception.HEADERS_HAVE_TO_BE_AN_OBJECT);
    this.headers = new Headers(headers, normalize);
    return this;
};

/**
 * Sets message header
 * @param {String} name
 * @param {String} value
 * @param {Boolean} overwrite
 * @returns {Message}
 * @method
 */
Message.prototype.setHeader = function (name, value, overwrite) {
    this.headers.setHeader(name, value, overwrite);
    return this;
};

/**
 * Remove message header
 * @param {String} name
 * @returns {Boolean}
 * @method
 */
Message.prototype.removeHeader = function (name) {
    return this.headers.removeHeader(name);
};

/**
 * Remove message headers
 * @returns {Message}
 * @method
 */
Message.prototype.removeHeaders = function () {
    this.headers.removeHeaders();
    return this;
};

/**
 * Returns message headers value pair object
 * @returns {Object}
 * @method
 */
Message.prototype.getHeaders = function () {
    return this.headers.getHeaders();
};

/**
 * Returns message header
 * @returns {String|Array}
 * @method
 */
Message.prototype.getHeader = function (name) {
    if (name.toLowerCase() == 'host') {
        var host = this.headers.getHeader(name);
        if (host) {
            return host.toLowerCase();
        } else {
            return host;
        }
    } else {
        return this.headers.getHeader(name);
    }    
}

/**
 * Sets the message body data
 * @param {Object} body
 * @returns {Message}
 * @method
 */
Message.prototype.setBody = function (body) {
    this._body = body;
    return this;            
};

/**
 * Returns the message body data
 * @returns {Object}
 * @method
 */
Message.prototype.getBody = function () {
    return this._body;
};

/**
 * Sets the http version of a message
 * @param {Number} httpVersion
 * @returns {Message}
 * @method
 */
Message.prototype.setHttpVersion = function (httpVersion) {
    this._httpVersion = httpVersion;
    return this;
};

/**
 * Returns the http version of a message
 * @returns {Number}
 * @method
 */
Message.prototype.getHttpVersion = function () {
    return this._httpVersion;
};


Message.Exception = {};

/**
 * @constant
 * @type {String}
 * @default
 */
Message.Exception.WRONG_BUFFER = "Buffer doesn't contain full http response";

/**
 * @constant
 * @type {String}
 * @default
 */
Message.Exception.HEADERS_HAVE_TO_BE_AN_OBJECT = "Headers have to be an Object";

/**
 * @constant
 * @type {String}
 * @default
 */
Message.Exception.HEADER_NAME_HAS_TO_BE_A_STRING = "Header name has to be a string";

exports.Message = Message;
