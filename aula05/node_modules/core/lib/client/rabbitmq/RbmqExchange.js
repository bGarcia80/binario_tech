var Event = require('../../event/Event').Event;

var RbmqChannel = require('./RbmqChannel').RbmqChannel;
var RbmqOutcomingMessage = require('./RbmqOutcomingMessage').RbmqOutcomingMessage;

var RbmqExchange = function(rbmqConnection, config) {
    RbmqChannel.call(this, rbmqConnection, config);
};

RbmqExchange.prototype = Object.create(RbmqChannel.prototype);

RbmqExchange.prototype.setConfig = function(config) {
    var publishConfig = config.publish || {};
    var newConfig = {
        name: config.name,
        options: {
            durable: config.durable,
            autoDelete: config.autoDelete,
            passive: config.passive,
            type: config.type || 'topic',
            confirm: publishConfig.confirm || false,
            noDeclare: config.noDeclare || false,
            arguments: {}
        },
        bindings: config.bindings || [],
        publish: publishConfig
    };

    if (config.hasOwnProperty('alternateExchange')) {
        newConfig.options.arguments['alternate-exchange'] = config.alternateExchange;
    }

    RbmqChannel.prototype.setConfig.call(this, newConfig);
};

RbmqExchange.prototype.open = function() {
    this._rbmqChannel = this._rbmqConnection._rbmq.exchange(this._config.name, this._config.options);
    RbmqChannel.prototype.open.call(this);
};

RbmqExchange.prototype._onChannelOpened = function() {
    var config = this._config;
    var that = this;

    if (!config.options.noDeclare) {
        for (var i = 0, l = config.bindings.length; i < l; i++) {
            this._rbmqChannel.bind(config.bindings[i].exchange, config.bindings[i].routingKey);
        }
    }

    // for mandatory/immediate messages channel will return basic-return (without message deliveryTag!)
    this._rbmqChannel.on('basic-return', function(args) {
        that.dispatchEvent(new Event(RbmqChannel.Event.RETURN, args));
    });

    RbmqChannel.prototype._onChannelOpened.call(this);
};

RbmqExchange.prototype.publish = function(message) {
    function cb(err) {
        if (!err) {
            message.setPublished();
            message.dispatchEvent(new Event(RbmqOutcomingMessage.Event.PUBLISHED, {
                message: message
            }));
        } else {
            message.dispatchEvent(new Event(RbmqOutcomingMessage.Event.REJECTED, {
                message: message,
                error: err
            }));
        }
    };

    if (!message instanceof RbmqOutcomingMessage) {
        return cb(new Error('Incorrect message given. Should be RbmqOutcomingMessage'));
    }

    if (!this._opened) {
        return cb(new Error('Exchange disconnected'));
    }

    if (message.getRoutingKey() === undefined) {
        message.setRoutingKey(this._config.publish.routingKey || '');
    }

    if (!message.getDeliveryMode()) {
        message.setDeliveryMode(this._config.publish.deliveryMode || RbmqMessage.DMODE_PERSISTENT);
    }

    var options = this._config.options;
    var task;
    var that = this;

    // since getBody might be overriden, we need to use message._body for publish here !
    if (options.confirm) {
        task = this._rbmqChannel.publish(message.getRoutingKey(), message._body, message.getArguments(), function(done, err) {
            return cb(err || done);
        });
    } else {
        task = this._rbmqChannel.publish(message.getRoutingKey(), message._body, message.getArguments());

        // if not options.confirm node-amqp never call callback :/
        return cb();
    }
};

RbmqExchange.Event = {};
RbmqExchange.Event.OPENED = RbmqChannel.Event.OPENED;
RbmqExchange.Event.CLOSED = RbmqChannel.Event.CLOSED;
RbmqExchange.Event.RETURN = RbmqChannel.Event.RETURN;

exports.RbmqExchange = RbmqExchange;
