var Event = require('../../event/Event').Event;
var RbmqChannel = require('./RbmqChannel').RbmqChannel;
var RbmqIncomingMessage = require('./RbmqIncomingMessage').RbmqIncomingMessage;

var RbmqQueue = function(rbmqConnection, config) {
    RbmqChannel.call(this, rbmqConnection, config);
};

RbmqQueue.prototype = Object.create(RbmqChannel.prototype);

RbmqQueue.prototype.setConfig = function(config) {
    var newConfig = {
        name: config.name,
        options: {
            durable: config.durable,
            autoDelete: config.autoDelete,
            passive: config.passive,
            type: config.type || 'topic',
            exclusive: config.exclusive,
            noDeclare: config.noDeclare || false,
            arguments: {}
        },
        bindings: config.bindings || []
    };

    if (config.hasOwnProperty('subscribe')) {
        newConfig.subscribe = config.subscribe;
    }

    if (config.hasOwnProperty('deadLetterExchange')) {
        newConfig.options.arguments['x-dead-letter-exchange'] = config.deadLetterExchange;
    }

    if (config.hasOwnProperty('deadLetterRoutingKey')) {
        newConfig.options.arguments['x-dead-letter-routing-key'] = config.deadLetterRoutingKey;
    }

    if (config.hasOwnProperty('ttl') && config.ttl) {
        newConfig.options.arguments['x-message-ttl'] = config.ttl;
    }

    RbmqChannel.prototype.setConfig.call(this, newConfig);
};

RbmqQueue.prototype.open = function() {
    this._rbmqChannel = this._rbmqConnection._rbmq.queue(this._config.name, this._config.options);
    RbmqChannel.prototype.open.call(this);
};

RbmqQueue.prototype._onChannelOpened = function() {
    var that = this;
    var config = this._config;

    if (config.hasOwnProperty('subscribe')) {
        var options = {
            ack: true
        };

        if (config.subscribe.hasOwnProperty('ack')) {
            options.ack = config.subscribe.ack;
        }

        if (config.subscribe.hasOwnProperty('prefetchCount')) {
            options.prefetchCount = this._config.subscribe.prefetchCount;
        }

        this._rbmqChannel.subscribe(options, function(message, headers, deliveryInfo, m) {
            var msg = new RbmqIncomingMessage(message, headers, deliveryInfo, m);
            that.dispatchEvent(new Event(RbmqQueue.Event.MESSAGE_RECEIVED, msg));
        });
    }

    if (!this._config.options.noDeclare) {
        for (var i = 0, l = config.bindings.length; i < l; i++) {
            this._rbmqChannel.bind(config.bindings[i].exchange, config.bindings[i].routingKey);
        }
    }

    RbmqChannel.prototype._onChannelOpened.call(this);
};

RbmqQueue.Event = {};
RbmqQueue.Event.OPENED = RbmqChannel.Event.OPENED;
RbmqQueue.Event.CLOSED = RbmqChannel.Event.CLOSED;
RbmqQueue.Event.MESSAGE_RECEIVED = 'RbmqQueue.Event.MESSAGE_RECEIVED';

exports.RbmqQueue = RbmqQueue;
