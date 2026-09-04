/**
 * @overview Mime
 * @copyright Dreamlab Onet.pl sp. z. o o 2012
 */

var mime = require("mime");

mime.define({
    'text/yaml': ['yaml'],
    'text/less': ['less']
});

/**
 * Mime
 * @class Mime
 * @classdesc Mime
 *
 * @requires mime
 *
 * @return {Mime}
 */
var Mime = function () {};

/**
 * Returns the mime type for specified path
 * @param {String} path
 * @returns {String}
 * @static
 */
Mime.prototype.getType = function (path) {
    return mime.lookup(path);
};

Mime.prototype.getCharset = function (path) {
    var contentType = this.getType(path);
    var retVal = mime.charsets.lookup(contentType);

    if(retVal) {
        return retVal;
    } else if (contentType == 'application/json') {
            return 'UTF-8';
    }
};

exports.Mime = Mime;
