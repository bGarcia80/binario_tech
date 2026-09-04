var amqp = require('amqp-dl');

var Event = require('../../event/Event').Event;
var EventDispatcher = require('../../event/EventDispatcher').EventDispatcher;
var PackageJson = require('../../../package.json');

var RbmqConnection = function(config) {
    EventDispatcher.call(this);

    this._connected = false;
    this._hosts = [];

    this.setConfig(config);
    this._rbmq = null;

    this._reconnectTimeout = RbmqConnection.RECONNECT_TIMEOUT;
    this._reconnectTimer   = null;
    this._resetReconnectTimer = null;
    this._reconnect = true;

    this._logging = true;
};

RbmqConnection.prototype = Object.create(EventDispatcher.prototype);

RbmqConnection.prototype.getServerProperties = function () {
    if (!this._rbmq || !this._connected) {
        return null;
    }

    return this._rbmq.serverProperties;
};

/**
 * Get host:port from hosts pool
 *
 * if _hostWeightEnabled is set to true, weight will be included
 *
 * @param {Object} config Config object [{host: '', port: }]
 */
 RbmqConnection.prototype._updateHost = function () {
     this._logging && console.log('RbmqConnection/_updateHost');

     if (this._config.hostWeightEnabled) {

         //take first element from array based on weight
         //set to client and put element to the end of the array
         var item = this._hosts.shift();
         this._config.host = item.host;
         this._config.port = item.port;

         this._hosts.push(item);
         return;
     }

     var hostIdx = Math.floor(Math.random() * this._hosts.length);
     this._config.host = this._hosts[hostIdx].host;
     this._config.port = this._hosts[hostIdx].port;
 };

/**
 * If hostWeight is enabled sort hosts from max weight to lowest
 */
 RbmqConnection.prototype._sortHosts = function () {
     if (!this._config.hostWeightEnabled) {
         return;
     }

     var xW, yW;
     this._hosts.sort(function (x, y) {
         xW = x.weight || 0;
         yW = y.weight || 0;
         return yW - xW;
     });
 };

RbmqConnection.prototype.isConnected = function() {
    return this._connected;
};

RbmqConnection.prototype.setLogging = function(logging) {
    this._logging = logging;
};

RbmqConnection.prototype.setConfig = function(config) {
    if (config.hasOwnProperty('clientProperties')) {
        if (!config.clientProperties.hasOwnProperty('version')) {
            config.clientProperties.version =  PackageJson.version;
        }

        config.clientProperties.core = PackageJson.version;
    }

    if (!config.hasOwnProperty('clientProperties')) {
        config.clientProperties = {
            product: PackageJson.name,
            version: PackageJson.version
        };
    }

    if (config.hasOwnProperty('hosts')) {
        this._hosts = config.hosts;
    } else {
        this._hosts = [{
            host: config.host,
            port: config.port,
            weight: config.weight || 0
        }];
    }

    var _newConfig = {
        login: config.login,
        password: config.password,
        vhost: config.vhost || '/',
        heartbeat: config.heartbeat || 5,
        clientProperties: config.clientProperties,
        connectionTimeout: config.timeout || RbmqConnection.DEFAULT_CONNECTION_TIMEOUT,
        hostWeightEnabled: config.hostWeightEnabled || false
    };

    var reconnect = false;

    if (JSON.stringify(_newConfig) != JSON.stringify(this._config)) {
        reconnect = true;
    }

    if (config.forceReconnect) {
        reconnect = true;
    }

    if (reconnect && this._connected) {
        this._scheduleReconnect();
    }

    this._config = _newConfig;
    this._sortHosts();
};

RbmqConnection.prototype._connect = function() {
    this._updateHost();

    this._logging && console.log('RbmqConnection/connect: %s:%s', this._config.host, this._config.port);

    this._rbmq = amqp.createConnection(this._config, {
        reconnect: false
    });

    var that = this;

    this._rbmq.on('ready', function() {
        that._onConnectionReady();
    });

    this._rbmq.on('error', function(err) {
        that._onConnectionError(err);
    });

    this._rbmq.on('close', function() {
        that._onConnectionClosed();
    });

    this._rbmq.on('connect', function () {
        /* resetowanie timera */
        that._resetReconnectTimer = setTimeout(function() {
            that._reconnectTimeout = RbmqConnection.RECONNECT_TIMEOUT;
        }, RbmqConnection.RECONNECT_TIMEOUT_MAX);
    });
};

RbmqConnection.prototype.connect = function() {
    this._scheduleReconnect();
};

RbmqConnection.prototype.disconnect = function(reconnect) {
    this._logging && console.log('RbmqConnection/disconnect');
    this._reconnect = reconnect ? true : false;

    if (this._rbmq) {
        this._rbmq.disconnect();
    }
};

RbmqConnection.prototype.reconnect = function() {
    this._logging && console.log('RbmqConnection/reconnect');
    this.disconnect(true);
};

RbmqConnection.prototype._scheduleReconnect = function(timeout) {
    var that = this;

    if (this._reconnectTimer) {
        //console.log('reconnectTimer exists skipping');
        return;
    }

    if (this._resetReconnectTimer) {
        clearTimeout(this._resetReconnectTimer);
        this._resetReconnectTimer = null;
    }

    if (!timeout && timeout !== 0) {
        timeout = Math.min(Math.floor(this._reconnectTimeout * 1.05), RbmqConnection.RECONNECT_TIMEOUT_MAX);
        this._reconnectTimeout = timeout;
    }

    this._reconnectTimer = setTimeout(function () {
        that._reconnectTimer = null;

        if (that._connected) {
            that.reconnect();
        } else {
            that._connect();
        }
    }, timeout);
};

RbmqConnection.prototype._onConnectionReady = function() {
    /**
     * if connection is ready sort hosts again
     */
    this._sortHosts();
    this._logging && console.info('RbmqConnection/_onConnectionReady', this._config.host, this._config.port);
    this._connected = true;
    this.dispatchEvent(new Event(RbmqConnection.Event.CONNECTED));
};

RbmqConnection.prototype._onConnectionError = function(err) {
    this._logging && console.error('RbmqConnection/_onConnectionError', this._config.host, this._config.port, err);

    if (this._reconnect) {
        this._scheduleReconnect();
    }
};

RbmqConnection.prototype._onConnectionClosed = function() {
    this._logging && console.info('RbmqConnection/_onConnectionClosed', this._config.host, this._config.port);
    if (this._connected) {
        this._connected = false;
        this.dispatchEvent(new Event(RbmqConnection.Event.DISCONNECTED));
    }

    if (this._rbmq) {
        this._rbmq = null;
    }

    if (this._reconnect) {
        this._scheduleReconnect();
    }
};

RbmqConnection.Event = {};
RbmqConnection.Event.CONNECTED = 'RbmqConnection.Event.CONNECTED';
RbmqConnection.Event.DISCONNECTED = 'RbmqConnection.Event.DISCONNECTED';

RbmqConnection.DEFAULT_CONNECTION_TIMEOUT = 500;
RbmqConnection.RECONNECT_TIMEOUT = 96;
RbmqConnection.RECONNECT_TIMEOUT_MAX = 60000;

exports.RbmqConnection = RbmqConnection;
