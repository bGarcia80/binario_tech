var RbmqMessage = require('./RbmqMessage').RbmqMessage;

var RbmqIncomingMessage = function RbmqIncomingMessage(body, headers, deliveryInfo, m) {
    var data = deliveryInfo;

    // node-amqp parse text/json and application/json. Otherwise returns { data: Buffer(...), contentType: ... } structure
    if (deliveryInfo.contentType != 'text/json' && deliveryInfo.contentType != 'application/json') {
        body = body.data;
    }

    this._m = m;
    this._completed = false;

    RbmqMessage.call(this, body, data);
};

RbmqIncomingMessage.prototype = Object.create(RbmqMessage.prototype);

Object.keys(RbmqMessage.Attributes).forEach(function(key) {
    var methodName = key.charAt(0).toUpperCase() + key.substr(1);

    RbmqIncomingMessage.prototype['set' + methodName] = function(value) {
        throw new Error('Cannot modify RbmqIncomingMessage attributes');
    };
});

RbmqIncomingMessage.prototype.setBody = function() {
    throw new Error('Cannot modify RbmqIncomingMessage body');
};

RbmqIncomingMessage.prototype.acknowledge = function() {
    console.log('RbmqIncomingMessage/acknowledge', this.getMessageId());

    if (this._completed) {
        throw new Error('Message already acknowledged or rejected');
    }

    this._m.acknowledge();
    this._completed = true;
};

RbmqIncomingMessage.prototype.reject = function(requeue) {
    console.log('RbmqIncomingMessage/reject', this.getMessageId(), requeue);

    if (this._completed) {
        throw new Error('Message already acknowledged or rejected');
    }

    this._m.reject(requeue);
    this._completed = true;
};

exports.RbmqIncomingMessage = RbmqIncomingMessage;
