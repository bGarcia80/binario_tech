var Event = require('../../event/Event').Event;
var EventDispatcher = require('../../event/EventDispatcher').EventDispatcher;
var RbmqConnection = require('./RbmqConnection').RbmqConnection;

var RbmqChannel = function(rbmqConnection, config) {
    EventDispatcher.call(this);

    this._config = null;
    this._opened = false;
    this._rbmqConnection = rbmqConnection;
    this._rbmqChannel = null;

    this.setConfig(config);
};

RbmqChannel.prototype = Object.create(EventDispatcher.prototype);

RbmqChannel.prototype.setConfig = function(config) {
    this._config = config;
};

RbmqChannel.prototype.isOpened = function() {
    return this._opened;
};

RbmqChannel.prototype.open = function() {
    var that = this;

    this._rbmqChannel.on('open', function() {
        that._onChannelOpened();
    });

    this._rbmqChannel.on('close', function() {
        that._onChannelClosed();
    });

    this._rbmqConnection.addEventListener(RbmqConnection.Event.DISCONNECTED, this._onChannelClosed, this);
};

RbmqChannel.prototype._onChannelOpened = function() {
    console.log('RbmqChannel/_onChannelOpened');
    this._opened = true;
    this.dispatchEvent(new Event(RbmqChannel.Event.OPENED));
};

RbmqChannel.prototype._onChannelClosed = function() {
    console.log('RbmqChannel/_onChannelClosed');
    this._opened = false;
    if (this._rbmqChannel) {
        this._rbmqConnection.removeEventListener(RbmqConnection.Event.DISCONNECTED, this._onChannelClosed);
        this._rbmqChannel.removeAllListeners();
        this._rbmqChannel = null;
    }
    this.dispatchEvent(new Event(RbmqChannel.Event.CLOSED));
};

RbmqChannel.Event = {};
RbmqChannel.Event.OPENED = 'RbmqChannel.Event.OPENED';
RbmqChannel.Event.CLOSED = 'RbmqChannel.Event.CLOSED';

exports.RbmqChannel = RbmqChannel;
