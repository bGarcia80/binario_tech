var assertions = require('../common/Assertions.js').Assertions;
var net = require('net');
var ConnectionPool = require('../http/ConnectionPool.js').ConnectionPool;

var Memcache = function (pool) {
    this._lifetime = 10;
    this._kChunkLength = 800 * 1024;
    this._firstByteTimeout = 1000;
    this._connectionPool = pool;
};

Memcache.prototype.get = function (key, callback) {
    assertions.isString(key, Memcache.Exception.WRONG_TYPE);

    var that = this;

    var counter = 0;
    var buffers = [];
    var dataLength = 0;

    this._connectionPool.getSocket(function (socket) {
        //TODO: jest mozliwosc ze connection pool nie da mi socketa na czas
        
        var timeout = setTimeout(function () {
            // oddaje socket do puli
            //socket.destroy(); //nie mozna tak robic mowie jak kubek
            that._connectionPool.givebackSocket(socket);
            console.error('emerg', 'MEMCACHE timeout after 1000ms for key: ' + key);
            callback(null);
        }, that._firstByteTimeout);

        var chunker = function (data) {
            // dostalem pierwszy pakiet czyszcze timeout
            clearTimeout(timeout);
            // sprawdzam bo moze byc null gdy nie ma takiego klucza
            if (data) {

                buffers.push(data);
                dataLength += data.length;

                if (data.length == that._kChunkLength) {
                    // teraz musze pobrac kolejny chunk
                    //console.log('i need download another chunk');
                    counter += 1;
                    that._getChunk(socket, that._getKeyChunked(key, counter), chunker);
                } else {
                    // to juz koniec bo chunk nie jest wielkosci max
                    that._connectionPool.givebackSocket(socket);
                    callback(that._mergeBufferArray(buffers, dataLength));
                }
            } else {
                // jezeli nie ma danych to koniec
                that._connectionPool.givebackSocket(socket);
                callback(that._mergeBufferArray(buffers, dataLength));
            }
        };
            
        // pobieram pierwszy chunk
        that._getChunk(socket, that._getKeyChunked(key, counter), chunker);
    });
};

Memcache.prototype._mergeBufferArray = function (buffers, dataLength) {
    if (dataLength == 0) {
        return null;
    }

    var buffer = new Buffer(dataLength);
    var bufferPosition = 0;

    for (var i = 0, l = buffers.length; i < l; i++) {
        buffers[i].copy(buffer, bufferPosition);
        bufferPosition += buffers[i].length;
    }

    return buffer;
};

Memcache.prototype._getChunk = function (socket, key, callback) {

    socket._socket.removeAllListeners('data');

    // INFO: get chunk nigdy nie powinien zwracac socketa
    // oddawac do connection poola powinien tylko 'get'
    var resultBuff = new Buffer('get ' + key +'\r\n', 'binary');
    var dataLength = 0;
    var buffers = [];
    var i = 0;
    var l = 0;

    socket.on('data', function (e) {
        
        // jezeli pierwszy pakiet oraz przyszlo cos innego niz V
        // VALUE <key> <flags> <bytes> [<cas unique>]\r\n
        if (dataLength==0 && e[0]!=86) {
            // jezeli nie ENd to bedzie komunikat o bledzie
            if ((e[0] == 69 && e[1] == 78) == false) {
                console.warn('MEMCACHE/getChunk ERROR:', resultBuff.toString(), e.toString());
            }
            socket._socket.removeAllListeners('data');
            callback(null);
            return;
        }

        dataLength += e.length;
        buffers.push(e);
        
        var elementBuff = null;
        
        if(e.length > 4) {
            // jezeli buffer jest wiekszy niz 4 to znaczy ze znacznik konca
            // zmiesci sie i moge go szukac tylko w ostatnim bufferze
            elementBuff = e;
            
        } else {
            // jezeli buffer jest mniejszy niz 4 to znaczy ze znacznik konca
            // moze byc pociety miedzy kilka bufferow i musze poszukac wstecz
            
            var bufferIndexStart = 0;
            var bufferChunksLength = 0;
            for(i=buffers.length-1; i>=0; i--){
                bufferChunksLength += buffers[i].length;
                bufferIndexStart = i;
                if(bufferChunksLength>4){
                    break;
                }
            }

            elementBuff = new Buffer(bufferChunksLength);
            var buffPosition = 0;
            for (i = bufferIndexStart, l = buffers.length; i < l; i++) {
                buffers[i].copy(elementBuff, buffPosition);
                buffPosition += buffers[i].length;
            }
        }
        

        if (elementBuff.toString('ascii', elementBuff.length - 5) === 'END\r\n') {
            var _buffer = new Buffer(dataLength);
            var bufferPosition = 0;
            for (i = 0, l = buffers.length; i < l; i++) {
                buffers[i].copy(_buffer, bufferPosition);
                bufferPosition += buffers[i].length;
            }

            var dataStart = 0;
            for (i = 0, l = _buffer.length; i < l; i++) {
                if (_buffer[i] === 13 && _buffer[i+1] === 10) {
                    dataStart = i+2;
                    break;
                }
            }
            callback(_buffer.slice(dataStart, _buffer.length-7));
        }
        
    });

    
    socket.write(resultBuff);
};

Memcache.prototype._setChunk = function (socket, key, value, callback, lifeTime, waitForReply) {
    socket._socket.removeAllListeners('data');

    var that = this;
    var cmdBuffStart = new Buffer('set ' + key + ' 0 ' + lifeTime + ' ' + value.length + (!waitForReply ? ' noreply' : '') + '\r\n', 'binary');
    var cmdBuffEnd = new Buffer('\r\n', 'binary');
    var resultBuff = new Buffer(cmdBuffStart.length + value.length + cmdBuffEnd.length);
    cmdBuffStart.copy(resultBuff);
    value.copy(resultBuff, cmdBuffStart.length);
    cmdBuffEnd.copy(resultBuff, (cmdBuffStart.length + value.length));

    var dataLength = 0, buffers = [];

    if (waitForReply) {
        socket.on('data', function (e) {
            // jezeli S(tored))
            if (e[0]== 83 && e[1] == 84) {
                callback(true);
                return;
            }
            dataLength += e.length;
            buffers.push(e);
            if (e.slice(e.length - 2).toString('ascii') === '\r\n') {
                //that._connectionPool.givebackSocket(socket);
                var _buffer = new Buffer(dataLength), bufferPosition = 0;
                for (var i = 0, l = buffers.length; i < l; i++) {
                    buffers[i].copy(_buffer, bufferPosition);
                    bufferPosition += buffers[i].length;
                }
                callback(false, _buffer.slice(0, _buffer.length-2));
            }
        });
    }

    socket.write(resultBuff, function () {
        if (!waitForReply) {
            callback(true);
        }
    });
};

Memcache.prototype.set = function (key, value, callback, lifeTime, waitForReply) {
    //TODO dac zeby bylo reply i wtedy oddawac socket
    assertions.isString(key, Memcache.Exception.WRONG_TYPE);

    var that = this;
    if (lifeTime == 0) {
        // cachujemy na zawsze
    } else {
        lifeTime = lifeTime || this._lifetime;
    }        
    waitForReply = waitForReply || false;

    var counter = 0;
    var chunkPos = null;

    // pobieram wolny socket
    this._connectionPool.getSocket(function (socket) {

        // jezeli ktos nasetowal np string to zamieniam go na buffer
        if (!Buffer.isBuffer(value)) {
            value = new Buffer(value, 'utf8');
        }

        // licze w ilu chunkach bedzie zapisana wartosc
        counter = Math.ceil(value.length / that._kChunkLength);
        counter = counter > 0 ? counter : 1;



        var setChunk = function (i) {
            //console.log('chunk', i, key);
            chunkPos = that._getChunkPositions(i, value.length);
            //console.log('CHUNK FROM: ' + chunkPos.start + " to " + chunkPos.stop);
            that._setChunk(socket, that._getKeyChunked(key, i), value.slice(chunkPos.start, chunkPos.stop) , function (isChunkSuccess) {
                counter--;
                i++;
                if (counter <= 0) {
                    //console.log('Thats ALL! CALLING BACK...');
                    that._connectionPool.givebackSocket(socket);
                    if (callback) {
                        callback(true);
                    }
                } else {
                    setChunk(i);
                }
            }, lifeTime, waitForReply);
        };
        setChunk(0);            
    });
};


Memcache.prototype.add = function (key, value, callback, lifeTime, waitForReply) {
    //TODO dac zeby bylo reply i wtedy oddawac socket
    assertions.isString(key, Memcache.Exception.WRONG_TYPE);

    var that = this;
    if (lifeTime == 0) {
        // cachujemy na zawsze
    } else {
        lifeTime = lifeTime || this._lifetime;
    }        
    waitForReply = waitForReply || false;

    var counter = 0;
    var chunkPos = null;

    // pobieram wolny socket
    this._connectionPool.getSocket(function (socket) {

        // jezeli ktos nasetowal np string to zamieniam go na buffer
        if (!Buffer.isBuffer(value)) {
            value = new Buffer(value, 'utf8');
        }

        // licze w ilu chunkach bedzie zapisana wartosc
        counter = Math.ceil(value.length / that._kChunkLength);
        counter = counter > 0 ? counter : 1;



        var addChunk = function (i) {
            //console.log('chunk', i, key);
            chunkPos = that._getChunkPositions(i, value.length);
            //console.log('CHUNK FROM: ' + chunkPos.start + " to " + chunkPos.stop);
            that._addChunk(socket, that._getKeyChunked(key, i), value.slice(chunkPos.start, chunkPos.stop) , function (isChunkSuccess) {
                counter--;
                i++;
                if (counter <= 0) {
                    //console.log('Thats ALL! CALLING BACK...');
                    that._connectionPool.givebackSocket(socket);
                    if (callback) {
                        callback(isChunkSuccess);
                    }
                } else {
                    addChunk(i);
                }
            }, lifeTime, waitForReply);
        };
        addChunk(0);            
    });
};


Memcache.prototype._addChunk = function (socket, key, value, callback, lifeTime, waitForReply) {
    socket._socket.removeAllListeners('data');

    var that = this;
    var cmdBuffStart = new Buffer('add ' + key + ' 0 ' + lifeTime + ' ' + value.length + (!waitForReply ? ' noreply' : '') + '\r\n', 'binary');
    var cmdBuffEnd = new Buffer('\r\n', 'binary');
    var resultBuff = new Buffer(cmdBuffStart.length + value.length + cmdBuffEnd.length);
    cmdBuffStart.copy(resultBuff);
    value.copy(resultBuff, cmdBuffStart.length);
    cmdBuffEnd.copy(resultBuff, (cmdBuffStart.length + value.length));

    var dataLength = 0, buffers = [];

    if (waitForReply) {
        socket.on('data', function (e) {
            // jezeli S(tored))
            if (e[0]== 83 && e[1] == 84) {
                callback(Memcache.STORED);
                return;
            } else if (e[0]== 78 && e[1] == 79) {
                callback(Memcache.NOT_STORED);
                return;
            }
            dataLength += e.length;
            buffers.push(e);
            if (e.slice(e.length - 2).toString('ascii') === '\r\n') {
                //that._connectionPool.givebackSocket(socket);
                var _buffer = new Buffer(dataLength), bufferPosition = 0;
                for (var i = 0, l = buffers.length; i < l; i++) {
                    buffers[i].copy(_buffer, bufferPosition);
                    bufferPosition += buffers[i].length;
                }
                callback(false, _buffer.slice(0, _buffer.length-2));
            }
        });
    }

    socket.write(resultBuff, function () {
        if (!waitForReply) {
            callback(true);
        }
    });
};

Memcache.prototype._getKeyChunked = function (key, chunkNumber) {
    // pierwszy chunk jest identyczny z kluczem 
    // aby api memcache'a zostalo takie samo
    if (chunkNumber == 0) {
        return key;
    } else {
        return key + "_chunk_" + chunkNumber;
    }
};

Memcache.prototype._getChunkPositions = function (chunkIndex, length) {
    var start = 0;
    var stop = 0;
    start = chunkIndex * this._kChunkLength;
    stop = start + this._kChunkLength;
    if (stop > length) {
        stop = length;
    }
    return {start:start, stop:stop};
};

Memcache.prototype['delete'] = function (key, callback) {
    var that = this;

    //TODO dac zeby bylo reply i wtedy oddawac socket
    assertions.isString(key, Memcache.Exception.WRONG_TYPE);

    this._connectionPool.getSocket(function (socket) {
        var resultBuff = new Buffer('delete ' + key + ' noreply\r\n', 'binary');
        socket.write(resultBuff, function () {
            that._connectionPool.givebackSocket(socket);
        });
    });
};

Memcache.prototype.setLifetime = function (lifetime) {
    assertions.isNumber(lifetime, Memcache.Exception.WRONG_LIFETIME_TYPE);
    this._lifetime = lifetime;
    return this;
};

Memcache.prototype.getLifetime = function () {
    return this._lifetime;
};


Memcache.Exception = {};
Memcache.Exception.WRONG_KEY_TYPE = "Key has to be a string";
Memcache.Exception.WRONG_VALUE_TYPE = "Value has to be a string, number or object";
Memcache.Exception.WRONG_LIFETIME_TYPE = "Lifetime has to be a number";


Memcache.STORED = 'Memcache.STORED';
Memcache.NOT_STORED = 'Memcache.NOT_STORED';

exports.Memcache = Memcache;
