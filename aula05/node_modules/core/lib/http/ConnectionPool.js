var EventDispatcher = require('../event/EventDispatcher.js').EventDispatcher;
var Socket = require('./Socket.js').Socket;

var ConnectionPool = function(options){
    EventDispatcher.call(this);
    this._sockets = [];
    this._knownSockets = [];
    
    this._callbacks = [];
    this._options = options;
    this._connect();    
};

ConnectionPool.prototype = Object.create(EventDispatcher.prototype);

ConnectionPool.prototype._connect = function () {
    var that = this;
    for (var i = 0; i < this._options.connections; i++) {
        var socket = new Socket(this._options.port, this._options.host);
        console.info('ConnectionPool: Created socket [' + i + ']. Connecting...');
        this._refineSocketHandlers(socket);
        socket.on('connect', function () {
            console.info('ConnectionPool: Socket connected: ' + socket._host + ':' + socket._port);
            if (that._callbacks.length > 0) {
                var cb = that._callbacks.shift();
                cb(socket);
            }
        });
        this._sockets.push(socket);
        this._knownSockets.push(socket);
    }
};

ConnectionPool.prototype.givebackSocket = function (socket) {
    var self = this;

    if (socket.bufferSize() == 0) {
        this._givebackSocket(socket);
    } else {
        socket.on('drain', function () {
            self._givebackSocket(socket);
        });
    }
};

ConnectionPool.prototype._givebackSocket = function (socket) {
    this._refineSocketHandlers(socket);
    
    if(this._sockets.indexOf(socket) == -1) {
        this._sockets.push(socket);
    }

    if (this._sockets.length > 0 &&  this._callbacks.length > 0) {
        socket = this._sockets.shift();
        var cb = this._callbacks.shift();
        cb(socket);
    }
};

ConnectionPool.prototype.getSocket = function (cb) {
    if (this._sockets.length > 0) {
        var socket = this._sockets.shift();
        cb(socket);
    } else {
        console.error('emerg', 'ConnectionPool: there is no socket avalible. Please increase "connections" variable!');
        this._callbacks.push(cb);
    }

    // obsluz pozostale callbacki
    var socketStale, cbx;
    while (this._sockets.length > 0 && this._callbacks.length > 0) {
        socketStale = this._sockets.shift();
        cbx = this._callbacks.shift();
        cbx(socketStale);
    }
};

ConnectionPool.prototype._refineSocketHandlers = function (socket) {
    socket._refineHandlers();
};

exports.ConnectionPool = ConnectionPool;
