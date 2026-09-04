/**
 * @overview MySQLPool
 * @copyright Dreamlab Onet.pl sp. z. o o 2012
 */

var Pool = require('../pattern/Pool.js').Pool;
var mysql = require('mysql');

/**
 * @class MySQLPool
 * @classdesc MySQL connection pool
 * @param {Object} config
 */
var MySQLPool = function (config) {
    Pool.call(this);
    this._queuedQueries = [];
    if (config && config.hasOwnProperty('num_connections')) {
        this._num_connections = config.num_connections;
        delete config.num_connections;
    } else {
        this._num_connections = 5;
    }
    this._config = config;
    this._queueTimeout = null;
    this._debug = false;
    this._debugIntervalTime = 10000;
    this._debugInterval;
    this._queryCount = 0;
};

MySQLPool.prototype = Object.create(Pool.prototype);


MySQLPool.prototype.debug = function (enabled) {
    this._debug = enabled;
    
    if (this._debug) {
        var that = this;
        this._debugInterval = setInterval(function () {
            console.info("MySQLPool::debug pool status, spare: %d, known: %d, waiting: %d", that._spareObjects.length, that._knownObjects.length, that._waitingCallbacks.length);
        }, this._debugIntervalTime);
    } else if (this._debugInterval) {
        clearInterval(this._debugInterval);
    }
}

/**
 * Destroys all connected clients
 * @method
 * @returns {null}
 */
MySQLPool.prototype._destroySpareClients = function () {
    var length = this.getSpareLength(), i;
    for (i = 0; i < length; i++) {
        (this._spareObjects.shift()).destroy();
    }
};


/**
 * Create clients
 * @method
 */
MySQLPool.prototype.connect = function () {
    this._createSpareClients();
}

/**
 * Create spare clients
 * @method
 * @returns {null}
 */
MySQLPool.prototype._createSpareClients = function () {
    var c, i = 0;
    for (; i < this._num_connections; i++) {
        c = mysql.createConnection(this._config);
        c.connect();

        this.add(c);
    }
    this._executeQueuedQueries();
};

/**
 * Execute queued queries
 * @method
 * @returns {null}
 */
MySQLPool.prototype._executeQueuedQueries = function () {
    var length = this._queuedQueries.length;
    
    if (this._queueTimeout) {
        clearTimeout(this._queueTimeout);
        this._queueTimeout = null;
    }
    
    if (length > 0) {
        length = length > this.getSpareLength() ? this.getSpareLength() : length;
        for (var i = 0; i < length; i++) {
            this.query.apply(this, this._queuedQueries.shift());
        }
    }
};

/**
 * Query database
 * @method
 * @param {String} sql
 * @param {Array} params
 * @param {Function} cb
 * @param {Number} [retryCount=1]
 */
MySQLPool.prototype.query = function (sql, params, cb, retryCount) {
    retryCount = retryCount+1 || 1;
    var that = this;
    if (this._debug) {
        var clientTime = (new Date()).getTime();
        var queryCount = ++this._queryCount;
        console.info("MySQLPool::debug getting socket for query, num: %d", queryCount);
    }
    this.get(function(client) {
        if (that._debug) {
            var queryTime = (new Date()).getTime();
            console.info("MySQLPool::debug got socket for query, num: %d, time: %d", queryCount, queryTime - clientTime);
            console.info("MySQLPool::debug executing query, num: %d, sql: %s", queryCount, sql);
        }
        var res = client.query(sql, params, function (err, result, fields) {
            if (that._debug) {
                console.info("MySQLPool::debug query executed, num: %d, time: %d", queryCount, (new Date()).getTime() - queryTime);
            }
            if (err && err.hasOwnProperty('code') && err.code == 'PROTOCOL_CONNECTION_LOST' && retryCount<5) { // system error
                that._queuedQueries.push([sql, params, cb, retryCount]);
                if (!that._queueTimeout) {
                    that._queueTimeout = setTimeout(function () {
                        that._executeQueuedQueries();
                    }, 500);
                }
            } else {
                that.release(client);
                //musialem tutaj tak zrobic zeby biblioteka do mysqla sie nie wywalala
				try {
					cb(err, result, fields, res);
				} catch (ex) {
					console.error("MySQL callback uncaught exception, message: %s, stack: %s", ex.message, ex.stack);
				}
            }
        });
    });
};

MySQLPool.prototype.destroy = function () {};

exports.MySQLPool = MySQLPool;
