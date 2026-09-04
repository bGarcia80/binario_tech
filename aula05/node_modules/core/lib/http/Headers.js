/**
 * @overview Headers
 * @copyright Dreamlab Onet.pl sp. z. o o 2012
 */

var Types = require('../common/Types.js').Types;

/**
 * Http Headers
 * @class Headers
 * @classdesc Object that represents http headers
 * @param {Object} headers
 * @param {Boolean} normalize
 * @return {Headers}
 */
var Headers = exports.Headers = function (headers, normalize) {
    if (headers && (normalize || Types.isUndefined(normalize))) {
        this._headers = {};
        this.normalize(headers);
    } else {
        this._headers = headers ? Object.create(headers) : {};
    }
};

/**
 * Returns header in raw format
 * @param {String} name
 * @method
 * @returns {String|null}
 */
Headers.prototype.getRawHeader = function (name) {
    var headerName = name.toLowerCase(), header = this._headers[headerName];

    if (Types.isUndefined(header)) {
        return null;
    }

    return header;
};

/**
 * Returns header value
 * @param {String} name
 * @method
 * @returns {String|Array[String]}
 */
Headers.prototype.getHeader = function (name) {
    var header = this.getRawHeader(name);

    if (!header) {
        return null;
    }

    if (Types.isArray(header) && header.length == 1) {
        return header[0];
    } else {
        return header;
    }
};

/**
 * Remove message header
 * @param {String} name
 * @returns {Boolean}
 * @method
 */
Headers.prototype.removeHeader = function (name) {
    var headerName = name.toLowerCase(), headers = this._headers;

    if (headers[headerName]) {
        headers[headerName] = undefined;
        return true;
    }

    return false;
};

/**
 * Sets message header
 * @param {String} name
 * @param {String} value
 * @param {Boolean} overwrite
 * @returns {Headers}
 * @method
 */
Headers.prototype.setHeader = function (name, value, overwrite) {
    var headerName = name.toLowerCase();
    var headers = this._headers;
    var headerValue = headers[headerName];

    /* nadpisuje nagłowek lub nie mam go w ogole */
    if (overwrite || !headerValue) {
        headers[headerName] = value instanceof Array ? [].concat(value) : [value];
        return this;
    }

    var newValueLength;
    var newValue;
    if (!(value instanceof Array)) {
        newValue = [value];
        newValueLength = 1;
    } else {
        newValue = value;
        newValueLength = value.length;
    }

    var headerValueLength = headerValue.length;
    if (!headers.hasOwnProperty(headerName)) {
        /* tablica o dlugosci stare naglowki + nowe */
        headers[headerName] = new Array(headerValueLength + newValueLength);
        for (var i = 0, l = headerValueLength; i < l; i++) {
            headers[headerName][i] = headerValue[i];
        }
    }

    for (var i = 0, l = newValueLength; i < l; i++) {
        headers[headerName][headerValueLength + i] = newValue[i];
    }

    return this;
};

/**
 * Returns headers value pair object
 * @returns {Object}
 * @method
 */
Headers.prototype.getHeaders = function () {
    var headers = this._headers,
        key,
        newHeaders = {};

    for (key in headers) {
        if (headers[key]) {
            newHeaders[key] = headers[key];
        }
    }

    return newHeaders;
};

/**
 * Remove message headers
 * @returns {Headers}
 * @method
 */
Headers.prototype.removeHeaders = function () {
    this._headers = {};
    return this;
};

/**
 * Normalizes given header object into another header object
 * @param {Object} headers
 * @method
 */
Headers.prototype.normalize = function (headers) {
    var key;
    var keys = Object.keys(headers);

    for (var i = 0, len = keys.length; i < len; i++) {
        key = keys[i];
        this.setHeader(key, headers[key], true);
    }
};
