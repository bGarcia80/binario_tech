/**
 * @overview Event
 * @copyright Dreamlab Onet.pl sp. z. o o 2012
 */


/**
 * @class Event
 * @classdesc Provides event value object
 * @param {String} type
 * @param {Object} data
 * @param {EventDispatcher} target
 */
var Event = function (type, data, target) {
    this.type = type;
    this.data = data;
    this.target = target;
};

exports.Event = Event;
