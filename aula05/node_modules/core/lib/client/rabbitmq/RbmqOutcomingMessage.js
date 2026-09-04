var uuid = require('node-uuid');

var RbmqMessage = require('./RbmqMessage').RbmqMessage;

var RbmqOutcomingMessage = function(body, params) {
    /* defaults */
    params = params || {};

    setDefault('headers', params, {});
    setDefault('mandatory', params, false);
    setDefault('immediate', params, false);
    setDefault('contentEncoding', params, 'UTF-8');
    setDefault('contentType', params, 'application/json');
    setDefault('messageId', params, uuid.v4());

    function setDefault(key, dict, defaultValue) {
        if (!dict.hasOwnProperty(key)) {
            dict[key] = defaultValue;
        }
    }

    this._published = false;

    RbmqMessage.call(this, body, params);
};

RbmqOutcomingMessage.prototype = Object.create(RbmqMessage.prototype);

RbmqOutcomingMessage.prototype.setHeader = function(name, value) {
    this._data.headers[name] = value;
    return this;
};

RbmqOutcomingMessage.prototype.setPublished = function() {
    this._published = true;
    return this;
};

RbmqOutcomingMessage.prototype.isPublished = function() {
    return this._published;
};

RbmqOutcomingMessage.Event = {};
RbmqOutcomingMessage.Event.PUBLISHED = 'RbmqOutcomingMessage.Event.PUBLISHED';
RbmqOutcomingMessage.Event.REJECTED = 'RbmqOutcomingMessage.Event.REJECTED';

exports.RbmqOutcomingMessage = RbmqOutcomingMessage;
