/**
 * @overview MemcachedSocket
 * @copyright Dreamlab Onet.pl sp. z. o o 2012
 */

var Assertions = require('../common/Assertions.js'),
    Types = require('../common/Types.js'),
    EventDispatcher = require('../event/EventDispatcher.js').EventDispatcher,
    Event = require('../event/Event.js').Event,
    ErrorEvent = require('../event/ErrorEvent.js').ErrorEvent;

/**
 * @class MemcachedSocket
 * @classdesc Low-Level API to Memcached
 * @extends EventDispatcher
 * @param {Object} options
 */
var MemcachedSocket = exports.MemcachedSocket = function (options) {
    EventDispatcher.call(this);
    this._options = options;
    this._socket = null;
    this._socketBuffer = [];
    this._operation = {};

    this._head = null;
    this._ending = new Buffer("\r\n", "binary");
    this._ready = false;

    //GLOBAL
    this._headWritten = false;
    this._totalSize = 0;
    this._currentSize = 0;
    this._currentChunk = 0;

    //SET
    this._totalChunks = 0;
    this._doneChunks = 0;
    this._waitForReplyAttached = false;

    //GET
    this._buffers = [];
    this._buffersLength = 0;
    this._onDataAttached = false;
};

MemcachedSocket.prototype = Object.create(EventDispatcher.prototype);

/**
 * sets socket, if the socket is already connected READY event is emmited
 * if not the ON_CONNECT listener is attached. When ON_CONNECT is emmited
 * READY is emmited afterwards
 * @method
 * @params {Socket} socket
 * @fires MemcachedSocket.Event.READY
 */
MemcachedSocket.prototype.setSocket = function (socket) {
    this._socket = socket;

    var self = this;

    this.start();
    if (this._socket._connected) {
        this._flushBuffer();
        this._ready = true;
        this.dispatchEvent(new Event(MemcachedSocket.Event.READY, null));
    } else {
        this._socket.on("connect", function () {
            self._flushBuffer();
            self._ready = true;
            self.dispatchEvent(new Event(MemcachedSocket.Event.READY, null));
        });
    }
};

/**
 * and someone tries to addListener for READY event the event is immediately dispatched
 * Overloaded EventDispatcher.addEventListener, if the class is in ready state
 */
MemcachedSocket.prototype.addEventListener = function (ev, fn, ctx) {
    if (ev == MemcachedSocket.Event.READY && this._ready) {
        var e = new Event(MemcachedSocket.Event.READY, null);
        if (ctx) {
            fn.apply(ctx, e);
        } else {
            fn(e);
        }

        return;
    }
    EventDispatcher.prototype.addEventListener.apply(this, arguments);
};

/**
 * Initializes the memcache operation which is going to be exectued
 * @method
 * @param {String} method
 * @param {String} key
 * @param {Object} opts
 */
MemcachedSocket.prototype.init = function (method, key, opts) {
    this._operation = {
        method: method,
        key: key,
        opts: opts
    };
};

/**
 * Performs the given operation
 * @method
 * @fires MemcachedSocket.Event.ERROR
 * @fires MemcachedSocket.Event.END
 * @fires MemcachedSocket.Event.PROGRESS
 */
MemcachedSocket.prototype.start = function () {
    var o = this._operation,
        self = this,
        key = o.key;

    switch (o.method) {
    case MemcachedSocket.Operation.SET:
        this._totalSize = o.opts.length;

        if (o.opts.chunkSize) {
            //TODO: ta logike trzeba przeniesci w inne miejsce tak zeby tego nie liczyc co chunk
            var chunks = o.opts.length / o.opts.chunkSize;

            this._totalChunks = Math.ceil(chunks);
            this._totalSize = o.opts.chunkSize;
            this._currentChunk++;

            if (chunks < this._totalChunks && this._currentChunk == this._totalChunks) {
                this._totalSize = Math.floor((chunks - (this._totalChunks - 1)) * o.opts.chunkSize);
            }

            key = this._getChunkKey(key, this._currentChunk);
        }

        var headArgs = [MemcachedSocket.Operation.SET, key, 0, o.opts.lifetime, this._totalSize];

        if (!o.opts.waitForReply) {
            headArgs.push('noreply');
        }

        this._head = this._getHead(headArgs);

        if (o.opts.waitForReply && !this._waitForReplyAttached) {
            this._waitForReplyAttached = true;

            this._socket.on('data', function (result) {
                var r = self._parseResponse(result);

                if (r.error) {
                    self.dispatchEvent(new ErrorEvent(MemcachedSocket.Event.ERROR, result, MemcachedSocket.Exception.UNKNOWN_ERROR, "UNKNOWN ERROR"));
                    self.dispatchEvent(new Event(MemcachedSocket.Event.END, null));
                } else if (r.not_stored) {
                    self.dispatchEvent(new ErrorEvent(MemcachedSocket.Event.ERROR, result, MemcachedSocket.Exception.NOT_STORED, "NOT STORED"));
                    self.dispatchEvent(new Event(MemcachedSocket.Event.END, null));
                } else if (r.stored) {
                    self._doneChunks += r.stored;
                    if (!o.opts.chunkSize || (o.opts.chunkSize && self._doneChunks == self._totalChunks)) {
                        self.dispatchEvent(new Event(MemcachedSocket.Event.END, true));
                    }
                }
            });
        }

        if (o.opts.data) {
            if (o.opts.chunkSize) {
                var c = (this._currentChunk - 1) * o.opts.chunkSize;
                this.write(o.opts.data.slice(c, c + this._totalSize));
            } else {
                this.write(o.opts.data);
            }
        }
        break;
    case MemcachedSocket.Operation.GET:
        var headRead = false,
            emitEnd = false,
            timeout = null;

        if (o.opts.chunkSize) {
            this._currentChunk++;
            key = this._getChunkKey(key, this._currentChunk);
        }

        this._head = this._getHead([MemcachedSocket.Operation.GET, key]);

        if (o.opts.timeout && (!o.opts.chunkSize || (o.opts.chunkSize && this._currentChunk == 1))) {
            timeout = setTimeout(function () {
                self.dispatchEvent(new ErrorEvent(MemcachedSocket.Event.ERROR, null, MemcachedSocket.Exception.TIMEDOUT, "TIMED OUT"));
                self.dispatchEvent(new Event(MemcachedSocket.Event.END, null));
            }, o.opts.timeout);
        }

        if (!this._onDataAttached) {
            this._onDataAttached = true;

            this._socket.on('data', function (buffer) {
                var bLength = buffer.length;

                if (!headRead) {
                    if (o.opts.timeout && (!o.opts.chunkSize || (o.opts.chunkSize && self._currentChunk == 1))) {
                        clearTimeout(timeout);
                    }

                    if (buffer[0] == 0x45) { //END
                        if (!o.opts.chunkSize || (o.opts.chunkSize && self._currentChunk == 1)) {
                            return self.dispatchEvent(new Event(MemcachedSocket.Event.END, null));
                        } else {
                            emitEnd = true;
                        }
                    } else if (buffer[0] == 0x42) { //BAD COMMAND FORMAT
                        self.dispatchEvent(new ErrorEvent(MemcachedSocket.Event.ERROR, buffer, MemcachedSocket.Exception.BAD_COMMAND_FORMAT, "BAD COMMAND FORMAT"));
                        return self.dispatchEvent(new Event(MemcachedSocket.Event.END, null));
                    } else {
                        for (var i = 0, l = bLength; i < l; i++) {
                            if (buffer[i] == 0x0d && buffer[i + 1] == 0x0a) {
                                buffer = buffer.slice(i + 2, bLength);
                                bLength -= i + 2;
                                break;
                            }
                        }
                    }
                    headRead = true;
                }

                if (!emitEnd) {
                    if (buffer[bLength - 1] == 0x0a && buffer[bLength - 2] == 0x0d && buffer[bLength - 5] == 0x45) {
                        bLength -= 7;
                        buffer = buffer.slice(0, bLength);
                        emitEnd = true;
                    }

                    //na wypadek gdyby END przyszedl w osobnym pakiecie
                    if (bLength > 0) {
                        self._buffers.push(buffer);
                        self._buffersLength += bLength;
                        self.dispatchEvent(new Event(MemcachedSocket.Event.PROGRESS, buffer));
                    }

                    if (o.opts.chunkSize && self._buffersLength % o.opts.chunkSize == 0) {
                        emitEnd = false;
                        headRead = false;
                        self.start();
                        return;
                    }

                }

                if (emitEnd) {
                    var data = new Buffer(self._buffersLength), p = 0;

                    for (var i = 0, l = self._buffers.length; i < l; i++) {
                        self._buffers[i].copy(data, p);
                        p += self._buffers[i].length;
                    }
                    self.dispatchEvent(new Event(MemcachedSocket.Event.END, data));
                }
            });
        }
        this._socket.write(this._head);
        break;
    case MemcachedSocket.Operation.DELETE:
        var headArgs = [MemcachedSocket.Operation.DELETE, key, 0];

        if (!o.opts.waitForReply) {
            headArgs.push('noreply');
        }

        this._head = this._getHead(headArgs);

        if (o.opts.waitForReply) {
            this._socket.on('data', function (result) {
                var r = self._parseResponse(result);

                if (r.not_deleted) {
                    self.dispatchEvent(new ErrorEvent(MemcachedSocket.Event.ERROR, result, MemcachedSocket.Exception.NOT_DELETED, "NOT_DELETED"));
                    self.dispatchEvent(new Event(MemcachedSocket.Event.END, null));
                } else if (r.error) {
                    self.dispatchEvent(new ErrorEvent(MemcachedSocket.Event.ERROR, result, MemcachedSocket.Exception.UNKNOWN_ERROR, "UNKNOWN ERROR"));
                    self.dispatchEvent(new Event(MemcachedSocket.Event.END, null));
                } else {
                    self.dispatchEvent(new Event(MemcachedSocket.Event.END, true));
                }
            });
        }

        this.write(null, {
            headOnly: true
        });

        break;
    }
};

/**
 * Writes data to the socket
 * @method
 * @param {Buffer|null} data
 * @param {Object} opts
 * @fires MemcachedSocket.Event.END
 */
MemcachedSocket.prototype.write = function (data, opts) {
    var self = this,
        opts = opts || {},
        o = this._operation,
        tmp = data,
        dataSliced = false,
        bytesSliced = 0;

    if (!this._socket) {
        this._socketBuffer.push(data);
        return;
    }

    if (!this._headWritten) {
        if (opts.headOnly) {
            this._socket.write(this._head, "binary", function () {
                if(!o.opts.waitForReply) {
                    process.nextTick(function () {
                        self.dispatchEvent(new Event(MemcachedSocket.Event.END, true));
                    });
                }
            });
        } else {
            this._socket.write(this._head);
        }

        this._headWritten = true;
    }

    if (data) {
        if (this._currentSize + data.length > this._totalSize) {
            bytesSliced = this._totalSize - this._currentSize;
            tmp = data.slice(0, bytesSliced);
            dataSliced = true;
        }

        this._socket.write(tmp);
        this._currentSize += tmp.length;
    }

    if (this._currentSize == this._totalSize && !opts.headOnly) {
        this._socket.write(this._ending, "binary", function () {
            if(!o.opts.waitForReply) {
                self._doneChunks++;

                if (!o.opts.chunkSize || (o.opts.chunkSize && self._doneChunks == self._totalChunks)) {
                    self.dispatchEvent(new Event(MemcachedSocket.Event.END, true));
                }
            }
        });

        if (o.opts.chunkSize && this._currentChunk < this._totalChunks) {
            this._currentSize = 0;
            this._headWritten = false;
            this.start();
        }
    }

    if (dataSliced) {
        this.write(data.slice(bytesSliced));
    }
};

/**
 * flushes the local buffer to the socket buffer,
 * used to cache writes when there is no socket (has not been given yet or is awaiting for connection)
 * @method
 * @private
 */
MemcachedSocket.prototype._flushBuffer = function () {
    var i = 0, l = this._socketBuffer.length;

    for (; i < l; i++) {
        this.write(this._socketBuffer[i]);
    }

    this._socketBuffer = [];
};

/**
 * creates the memcached message header
 * @method
 * @private
 * @params {Array} head
 */
MemcachedSocket.prototype._getHead = function (head) {
    return new Buffer(head.join(' ') + "\r\n", "binary");
};

/**
 * parses the memcache response
 * @method
 * @private
 * @param {Buffer} buffer
 * @returns {Object}
 */
MemcachedSocket.prototype._parseResponse = function (buffer) {
    var data = buffer.toString().split("\r\n"),
        i = 0,
        l = data.length,
        status = {
            stored: 0,
            deleted: 0,

            not_stored: 0,
            not_deleted: 0,

            error: 0
        };

    for (; i < l; i++) {
        switch (data[i]) {
        case '':
            break;
        case 'STORED':
            ++status.stored;
            break;
        case 'DELETED':
            ++status.deleted;
            break;
        case 'NOT STORED':
            ++status.not_stored;
            break;
        case 'NOT DELETED':
            ++status.not_deleted;
            break;
        default:
            ++status.error;
            break;
        }
    }

    return status;
};

/**
 * creates the chunked key
 * @method
 * @private
 * @param {String} key
 * @param {Number} chunk
 * @returns {String}
 */
MemcachedSocket.prototype._getChunkKey = function (key, chunk) {
    if (chunk == 1) {
        return key;
    } else {
        return key + "_chunk_" + chunk;
    }
};

/**
 * @static
 * @namespace
 * @constant
 */
MemcachedSocket.Operation = {};

/**
 * @static
 * @constant
 * @type {String}
 * @default
 */
MemcachedSocket.Operation.SET = "set";

/**
 * @static
 * @constant
 * @type {String}
 * @default
 */
MemcachedSocket.Operation.GET = "get";

/**
 * @static
 * @constant
 * @type {String}
 * @default
 */
MemcachedSocket.Operation.DELETE = "delete";

/**
 * @static
 * @namespace
 * @constant
 */
MemcachedSocket.Exception = {};

/**
 * @static
 * @constant
 * @type {Number}
 * @default
 */
MemcachedSocket.Exception.UNKNOWN_ERROR = -1;

/**
 * @static
 * @constant
 * @type {Number}
 * @default
 */
MemcachedSocket.Exception.TIMEDOUT = -2;

/**
 * @static
 * @constant
 * @type {Number}
 * @default
 */
MemcachedSocket.Exception.BAD_COMMAND_FORMAT = -3;

/**
 * @static
 * @constant
 * @type {Number}
 * @default
 */
MemcachedSocket.Exception.NOT_STORED = -4;

/**
 * @static
 * @constant
 * @type {Number}
 * @default
 */
MemcachedSocket.Exception.NOT_DELETED = -5;

/**
 * @static
 * @namespace
 * @constant
 */
MemcachedSocket.Event = {};

/**
 * @static
 * @constant
 * @type {String}
 * @default
 */
MemcachedSocket.Event.READY = "MemcachedSocket_Event_READY";

/**
 * @static
 * @constant
 * @type {String}
 * @default
 */
MemcachedSocket.Event.PROGRESS = "MemcachedSocket_Event_PROGRESS";

/**
 * @static
 * @constant
 * @type {String}
 * @default
 */
MemcachedSocket.Event.ERROR = "MemcachedSocket_Event_ERROR";

/**
 * @static
 * @constant
 * @type {String}
 * @default
 */
MemcachedSocket.Event.END = "MemcachedSocket_Event_END";
