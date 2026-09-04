/**
 * @overview Memcached
 * @copyright Dreamlab Onet.pl sp. z. o o 2012
 */

var Pool = require('../pattern/Pool.js').Pool,
    MemcachedSocket = require('./MemcachedSocket.js').MemcachedSocket,
    Socket = require('../http/Socket.js').Socket;

/**
 * @class Memcached
 * @classdesc Memcached Client
 * @param {Object} connection
 * @param {Object} options
 */
var Memcached = exports.Memcached = function (connection, options) {
    var i, socket;

    this._options = options || {};
    this._options.__proto__ = {
        poolSize: 10,
        getOptions: {
            chunkSize: 800 * 1024,
            timeout: 1000
        },
        setOptions: {
            chunkSize: 800 * 1024,
            lifetime: 3600,
            waitForReply: false
        },
        deleteOptions: {
            waitForReply: false
        }
    };

    this._connection = connection;

    this._pool = new Pool();

    for (i = 0; i < this._options.poolSize; i++) {
        socket = new Socket(connection.port, connection.host);
        socket._refineHandlers();

        this._pool.add(socket);
    }
};

/**
 * GET
 * @method
 * @param {String} key
 * @param {Object} opts
 * @param {Function} callback
 * @returns {MemcachedSocket}
 */
Memcached.prototype.get = function (key, opts, callback) {
    var s = new MemcachedSocket(), self = this;

    var options = opts || {};
    options.__proto__ = this._options.getOptions;

    s.init(MemcachedSocket.Operation.GET, key, options);

    if (callback) {
        s.addEventListener(MemcachedSocket.Event.END, callback);
    }

    this._pool.get(function (socket) {
        s.setSocket(socket);
    });

    s.addEventListener(MemcachedSocket.Event.END, function () {
        s._socket._refineHandlers();
        self._pool.release(s._socket);
    });

    return s;
};

/**
 * SET
 * @method
 * @param {String} key
 * @param {Object} opts
 * @param {Function} callback
 * @returns {MemcachedSocket}
 */
Memcached.prototype.set = function (key, opts, callback) {
    var s = new MemcachedSocket(), self = this;

    var options = opts;
    options.__proto__ = this._options.setOptions;

    s.init(MemcachedSocket.Operation.SET, key, options);

    if (callback) {
        s.addEventListener(MemcachedSocket.Event.END, callback);
    }

    this._pool.get(function (socket) {
        s.setSocket(socket);
    });

    s.addEventListener(MemcachedSocket.Event.END, function () {
        s._socket._refineHandlers();
        self._pool.release(s._socket);
    });

    return s;
};

/**
 * DELETE
 * @method
 * @param {String} key
 * @param {Object} opts
 * @param {Function} callback
 * @returns {MemcachedSocket}
 */
Memcached.prototype.delete = function (key, opts, callback) {
    var s = new MemcachedSocket(), self = this;

    var options = opts || {};
    options.__proto__ = this._options.deleteOptions;

    s.init(MemcachedSocket.Operation.DELETE, key, options);

    if (callback) {
        s.addEventListener(MemcachedSocket.Event.END, callback);
    }

    this._pool.get(function (socket) {
        s.setSocket(socket);
    });

    s.addEventListener(MemcachedSocket.Event.END, function () {
        s._socket._refineHandlers();
        self._pool.release(s._socket);
    });

    return s;
};
