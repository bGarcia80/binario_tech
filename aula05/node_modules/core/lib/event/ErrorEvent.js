/**
 * @overview ErrorEvent
 * @copyright Dreamlab Onet.pl sp. z. o o 2012
 */

var Event = require('./Event.js').Event;

/**
 * @class ErrorEvent
 * @classdesc ErrorEvent will be thrown when no one will listen for that event in EventDispatcher
 * @extends Event
 * @requires Event
 *
 * @param {String} type
 * @param {Object} data
 * @param {Number} code
 * @param {String} message
 * @method
 */
var ErrorEvent = function(type, data, code, message) {
    if(data instanceof ErrorEvent){
        data = data.toJson();
    }
    Event.call(this, type, data);
    this.code = code;
    this.message = message;
};
  
ErrorEvent.prototype = Object.create(Event.prototype);

/**
 * Returns JSON representation of a error event
 * @returns {Object}
 * @method
 */
ErrorEvent.prototype.toJson = function () {
    var tmpObj = {
        code : this.code,
        type : this.type,
        data : this.data,
        message :  this.message
    };
    return tmpObj;
}
/**
 * Displays error as html content
 * @return {String}
 * @method
 */
ErrorEvent.prototype.toHtmlString = function () {
    var el = null;
    var retVal = "<pre>";
    for(el in this){
        if(this.hasOwnProperty(el) && typeof this[el]!='function' ){
            retVal+="\t" + el+': '+this[el]+"\n";
        }
    }
    retVal += "</pre>";
    return retVal;
};


ErrorEvent.prototype.getCode = function () {
    return this.code;
}

ErrorEvent.prototype.getMessage = function () {
    return this.message;
}

exports.ErrorEvent = ErrorEvent;
