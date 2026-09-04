/**
 * @overview AbstractDecorator
 * @copyright Dreamlab Onet.pl sp. z. o o 2012
 */

var EventDispatcher = require('../../event/EventDispatcher.js').EventDispatcher;

/**
 * @class AbstractDecorator
 * @classdoc AbstractDecorator
 * @extends EventDispatcher
 * 
 * @requires EventDispatcher
 * 
 * @return {AbstractDecorator}
 */
var AbstractDecorator = function () {
    EventDispatcher.call(this);
};

AbstractDecorator.prototype = Object.create(EventDispatcher.prototype);

/**
 * Initialize decorator object
 * @method
 * @return {undefined}
 */
AbstractDecorator.prototype.initialize = function () {
    this.parent();
    //throw "Cannot instantiate abstract class";
};

/**
 * @constant
 * @static
 * @type {String}
 * @default
 */
AbstractDecorator.COMPLETE = "complete";

/**
 * @constant
 * @static
 * @type {String}
 * @default
 */
AbstractDecorator.ERROR = "error";

exports.AbstractDecorator = AbstractDecorator;
