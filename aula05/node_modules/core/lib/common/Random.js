/**
 * @overview Random
 * @copyright Dreamlab Onet.pl sp. z. o o 2012
 */

var letters = 'abcdefghijklmnopqrstuvwxyz';
var digits = exports.digits = '0123456789';
var lower = exports.lower = letters;
var upper = exports.upper = letters.toUpperCase();
var alpha = exports.alpha = lower + upper;
var alnum = exports.alnum = lower + upper + digits;

/**
 * Random generator
 * @class Random
 */
var Random = {};

/**
 * Generate random string
 * @static
 * @param {Number} [length=10]  random string length
 * @param {String} [chars=lower case letters] string whith chars to generate random string
 * @returns {String}
 */
Random.randomString = function (length, chars) {
    length = length || 10;
    chars = chars || alpha;

    var text = '', i;

    for (i = 0; i < length; i++) {
        text += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return text;
};

/**
 * Generate random number
 * @static
 * @param {Number} [max=99999]
 * @params {Number} [min=0]
 * @returns {Number}
 */
Random.randomInt = function (max, min) {
    max = max || 99999;
    min = min || 0;

    return Math.floor(Math.random() * (max - min + 1)) + min;
};

exports.Random = Random;
