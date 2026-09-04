var Net = require('net');

/**
 * @class Socket
 * @classdesc Wrapper for node socket
 * @param {Number} port
 * @param {String} host
 */
var Socket = exports.Socket = function (port, host) {
    this._data = [];
    this._listeners = ['connect', 'data', 'end', 'timeout', 'drain', 'error', 'close'];
    this._hasReconnected = false;
    this._drained = true;
    this._connected = false;

    this._c = null;

    this._port = port;
    this._host = host;
    this._socket = Net.createConnection(port, host);
};

/**
 * overloads socket "addeventlistener"
 * @method
 * @param {String} eventName
 * @param {Function} eventCallback
 */
Socket.prototype.on = Socket.prototype.addEventListener = function (eventName, eventCallback) {
    return this._socket.on(eventName, eventCallback);
};

/**
 * if data can be written it is going it be written if not its put into the queue
 * @method
 * @param {Buffer} data
 * @param {String} encoding
 * @param {Function} callback
 */
Socket.prototype.write = function (data, encoding, callback) {
    if (this._drained && this._socket.writable) {
        this._write(data, encoding, callback);
    } else {
        this._data.push({data: data, encoding: encoding, callback: callback});
    }
};

/**
 * writes data to socket
 * @private
 * @borrows Socket.write
 */
Socket.prototype._write = function (data, encoding, callback) {
    this._drained = this._socket.write(data, encoding, callback);
};

/** 
 * gets socket bufferSize
 * @retruns {Number}
 */
Socket.prototype.bufferSize = function () {
    return this._socket.bufferSize;
};

/**
 * writes data from the queue to the socket
 * @method
 * @private
 */
Socket.prototype._executeWrites = function () {
    if (this._data[0]) {
        this._write(this._data[0].data, this._data[0].encoding, this._data[0].callback);
    }
};

/**
 * redefines event handles, removes all handlers and attaches base ones
 * @method
 * @private
 */
Socket.prototype._refineHandlers = function () {
    var self = this;
    var i = null;
    var l = null;

    this._listeners.push('sClose');

    for (i = 0, l = this._listeners.length; i < l; i += 1) {
        this._socket.removeAllListeners(this._listeners[i]);
    }

    this._hasReconnected = false;

    this._socket.on('connect', function () {
        self._connected = true;

        if (self._hasReconnected) {
            console.info('Socket: reconnected! ' + self._host + ':' + self._port);
            self._executeWrites();
        } else {
            console.info('Socket: connected! ' + self._host + ':' + self._port);
        }
    });

    this._socket.on('drain', function () {
        if (self._data.length > 0) {
            do {
                var tmp = self._data.shift();

                if (!tmp) {
                    break;
                }

                self._write(tmp.data, tmp.encoding, tmp.callback);
            } while (self._drained);
        } else {
            self._drained = true;
        }
    });

    this._socket.on('close', function (byError) {
        self._connected = false;

        if (byError) {
            console.error('Socket: closed! (on error)');
        } else {
            console.info('Socket: closed! (NOT on error)');
        }
        self._onClose(this);
    });

    this._socket.on('error', function (error) {
        console.error('Socket: error! -> ' + error.message);
    });
};

/**
 * socket close handler
 * @method
 * @private
 * @param {Socket} socket
 */
Socket.prototype._onClose = function (socket) {
    var that = this;
    setTimeout(function () {
        console.info('Socket: trying to reconnect socket: ' + that._host + ':' + that._port);
        that._hasReconnected = true;
        socket.connect(that._port, that._host);
    }, 100);
};

/**
 * destroys the socket
 */
Socket.prototype.destroy = function() {
    this._socket.destroy();
};
