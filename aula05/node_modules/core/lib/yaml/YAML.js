/**
 * @overview YAML
 * @copyright Dreamlab Onet.pl sp. z. o o 2012
 */

var jsyaml = require('js-yaml');
var fs   = require('fs');
/**
 * YAML
 * @class YAML
 * @classdesc YAML
 *
 * @requires libyaml
 *
 * @return {YAML}
 */
var YAML = exports.YAML = {};

/**
 * Parses yaml string into json
 * @param {String} data
 * @returns {Object}
 * @static
 */
YAML.parse = function (data) {
    return [jsyaml.safeLoad(data)];
}

/**
 * Encodes json into yaml string
 * @param {Object} obj
 * @returns {String}
 * @static
 */
YAML.stringify = function (data) {
    return jsyaml.safeDump(JSON.parse(JSON.stringify(data)));
}
/**
 * Parses yaml from file into json
 * @param {String} filepath
 * @returns {Object}
 * @static
 */
YAML.parseFileSync = function (filepath) {
    return [jsyaml.safeLoad(fs.readFileSync(filepath, 'utf8'))];
};
