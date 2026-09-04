var Pool = require('../pattern/Pool.js').Pool;
var PGClient = require('pg').native.Client;
var CursorQueryWorker = require('./pg/CursorQueryWorker.js').CursorQueryWorker;

var PGPool = function (config) {
    Pool.call(this);

    this._queuedQueries = [];

    if (config) {
        if (config.hasOwnProperty('num_connections')) {
            this.setMaxLength(config.num_connections);
            delete config.num_connections;
        } else {
            this.setMaxLength(PGPool.DEFAULT_CONN_COUNT);
        }
        this.setConnectionOptions(config);
    }
};

PGPool.prototype = Object.create(Pool.prototype);

PGPool.prototype.connect = function () {
    this._handleConnectionCount();
};

PGPool.prototype.getMaxLength = function () {
    return this._num_connections;
};

PGPool.prototype.setMaxLength = function (count) {
    return this._num_connections = count;
};

PGPool.prototype.getConnectionOptions = function () {
    return this._config;
};

PGPool.prototype.setConnectionOptions = function (config) {
    return this._config = config;
};

PGPool.prototype._handleConnectionCount = function () {
    var connections = this.getMaxLength() - this.getKnownLength();

    if (connections > 0) {
        console.log('PGPool:', 'connection shortage:', connections);
        this._createConnections(connections);
    } else if (connections < 0) {
        connections = -connections;
        console.info('PGPool:', 'connection overhead:', connections);
        this._removeConnections(connections);
    }
    this._executeQueuedQueries();
};

PGPool.prototype._createConnections = function (n) {
    var toCount = n;
    var that = this;
    var isError = false;

    var onConnection = function (err) {
        if (err) {
            isError = true;
        }

        /* semafór */
        if (--toCount) return;
        /* *** */

        if (isError) {
            that.scheduleRenew();
        }
    };
    for (var i = 0; i < n; i++) {
        this._createConnection(this.getConnectionOptions(), onConnection);
    }
};

PGPool.prototype._removeConnections = function (n) {
    var that = this;

    for (var i = 0; i < n; i++) {
        if (this.getKnownLength() == 0) {
            break;
        }
        this.get(function (client) {
            that._removeClient(client);
        });
    }
};

PGPool.prototype._createConnection = function (options, callback) {
    var host = options.host;
    console.log('PGPool:', 'creating connection to host:', host);
    var that = this;
    var client = new PGClient(options);

    /* timeout connectu do PostgreSQL */
    var connectionTimeouted = false;
    var connectTimeout = setTimeout(function () {
        console.warn('PGPool:', 'connect timeout error', PGPool.CONNECT_TIMEOUT, 'ms', 'host:', host);
        connectionTimeouted = true;
        that._removeClient(client);
        callback(new Error('PostgreSQL Connection error - operation timeout'));
    }, PGPool.CONNECT_TIMEOUT);

    var connectError = function (err) {
        console.warn('PGPool:', 'connect host:', host, 'error:', err);
        /* sprawdzam czy jestem po timeoucie */
        if (connectionTimeouted) return;
        /* czyszcze timeout - udalo sie zakonczyc faze polączenia */
        clearTimeout(connectTimeout);
        
        that._removeClient(client);
        callback(err);
    };

    var connectSuccess = function () {
        console.info('PGPool:', 'connection established host:', host);
        /* usuwam listener */
        client.removeListener('error', connectError);

        /* sprawdzam czy jestem po timeoucie */
        if (connectionTimeouted) return;
        /* czyszcze timeout - udalo sie zakonczyc faze polączenia */
        clearTimeout(connectTimeout);

        client.on('error', function (err) {
            console.warn('PGPool:', 'error event', err);
            that._removeClient(client);
        });
        callback(null);
    };

    client.once('connect',  connectSuccess);    /* event połaczenia */
    client.once('error'  ,  connectError);      /* event błedu połaczenia */
    client.connect();
    this.add(client);
};

PGPool.prototype._removeClient = function (client) {
    client.end();                   /* zamykam połaczenie */
    this.markForDeletion(client);   /* oznaczam do usunięcia */
    this.release(client);           /* zawalniam klienta */
    this.scheduleRenew();           /* kolejkuje odswiezenie */
};

PGPool.prototype.scheduleRenew = function () {
    if (this._renewTimer) return;

    var that = this;
    this._renewTimer = setTimeout(function () {
        that._renewTimer = null;
        that._handleConnectionCount();
    }, 1000);
};

PGPool.prototype.query = function (sql, params, callback, retryCount) {
    retryCount = retryCount+1 || 1;
    var that = this;

    if (callback == undefined) {
        callback = params;
        params = null;
    }

    this.get(function (client) {
        client.query(sql, params, function (err, result) {
            if (err && that._isFatalError(err)) {
                console.warn('PGPool:', 'fatal query error', err);
                that._removeClient(client);

                if (retryCount < PGPool.QUERY_MAX_RETRY) {
                    that._enqueueQuery([that.query, sql, params, callback, retryCount]);
                } else {
                    callback(err, result);
                }
            } else {
                if (err) {
                    console.info('PGPool:', 'query error', err);
                }
                that.release(client);
                callback(err, result);
            }
        });
    });
};

PGPool.prototype.queryWithCursors = function (sql, params, cursors, callback, retryCount) {
    retryCount = retryCount+1 || 1;
    var that = this;

    this.get(function (client) {
        var worker = new CursorQueryWorker(client);

        worker.addEventListener(CursorQueryWorker.Event.LOADED, function (event) {
            that.release(client);           /* zwalniam klienta */
            callback(null, event.data);     /* odsyłam dane */
        });

        worker.addEventListener(CursorQueryWorker.Event.ERROR, function (event) {
            var error = event.data;

            if (that._isFatalError(error)) {
                console.warn('PGPool:', 'fatal queryWithCursors error', error);
                that._removeClient(client);

                if (retryCount < PGPool.QUERY_MAX_RETRY) {
                    that._enqueueQuery([that.queryWithCursors, sql, params, cursors, callback, retryCount]);
                } else {
                    callback(error, null);
                }
            } else {
                console.info('PGPool:', 'queryWithCursors error', error);
                that.release(client);   /* zwalniam klienta */
                callback(error, null);
            }
        });

        worker.query(sql, params, cursors);
    });
};

PGPool.prototype._enqueueQuery = function (params) {
    var that = this;
    
    this._queuedQueries.push(params);

    if (!this._queueTimeout) {
        this._queueTimeout = setTimeout(function () {
            that._executeQueuedQueries();
        }, PGPool.QUERY_RETRY_TIME);
    }
};

PGPool.prototype._isFatalError = function (error) {
    var fatals = {
        'severity': ['FATAL'],
        'code': ['EPIPE'],
        'message': ['connection pointer is NULL\n']
    }

    if (error) {
        for (var fatal in fatals) {
            if (fatals.hasOwnProperty(fatal)) {
                if (error.hasOwnProperty(fatal) && fatals[fatal].indexOf(error[fatal]) != -1) {
                    return true;
                }
            }
        }
    }

    return false;
};

PGPool.prototype._executeQueuedQueries = function () {
    var length = this._queuedQueries.length;
    var query;
    var fnc;

    if (this._queueTimeout) {
        clearTimeout(this._queueTimeout);
        this._queueTimeout = null;
    }

    if (length > 0) {
        length = length > this.getSpareLength() ? this.getSpareLength() : length;
        for (var i = 0; i < length; i++) {
            query = this._queuedQueries.shift();
            fnc = query.shift();
            fnc.apply(this, query);
        }
    }
};

PGPool.prototype.destroy = function () {
    clearTimeout(this._queueTimeout);
    clearTimeout(this._renewTimer);
};

PGPool.DEFAULT_CONN_COUNT = 5;
PGPool.CONNECT_TIMEOUT = 1000;
PGPool.QUERY_MAX_RETRY = 5;
PGPool.QUERY_RETRY_TIME = 100;

exports.PGPool = PGPool;
