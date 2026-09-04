var net = require('net'), MemcachedSocket = null;

var getKey = function (k, i) {
    if (i == 1) {
        return k;
    } else {
        return k + "_chunk_" + i;
    }
};

var getHead = function (p) {
    return new Buffer(p.join(' ') + "\r\n", "binary");;
};

var ending = new Buffer("\r\n");

describe("MemcachedSocket", function () {

    var length,
        key,
        value,
        dataValue,
        lifetime,
        chunkSize,
        socketMock,
        readyCallCount,
        sck,
        progressSpy,
        errorSpy,
        readySpy,
        endSpy;

    beforeEach(function () {
        length = 32;
        key = "eloszka";
        value = "12345678";
        dataValue = value + value + value + value;
        lifetime = 1234;
        chunkSize = 8;
        socketMock = {
            _connected: true,
            cb: null,
            a: false,
            b: false,
            events: {},
            write: function (buff, encoding, cb) {
                if (cb) {
                    cb();
                }
            },
            on: function (ev, cb) {
                this.events[ev] = cb;
            }
        },
        readyCallCount = 0;

        if (MemcachedSocket) {
            sck = new MemcachedSocket;
        }

        progressSpy = jasmine.createSpy();
        errorSpy = jasmine.createSpy();
        readySpy = jasmine.createSpy();
        endSpy = jasmine.createSpy();
    });

    it("require", function () {
        MemcachedSocket = require('../../lib/client/MemcachedSocket.js').MemcachedSocket;

        expect(MemcachedSocket).toBeTruthy();
    });

    describe("set", function () {
        it("with chunks using static data with reply", function () {
            socketMock.write = function (buff, encoding, cb) {
                if (buff.toString() == value) {
                    this.a = true;
                }

                if (buff.toString() == ending.toString()) {
                    this.b = true;
                }

                if (this.a && this.b) {
                    this.a = false;
                    this.b = false;
                    this.events.data(new Buffer("STORED\r\n"));
                }

                if (cb) {
                    cb();
                }
            };

            spyOn(socketMock, 'write').andCallThrough();

            runs(function () {
                sck.init(MemcachedSocket.Operation.SET, key, {
                    lifetime: lifetime,
                    length: length,
                    waitForReply: true,
                    chunkSize: chunkSize,
                    data: new Buffer(dataValue)
                });
                sck.addEventListener(MemcachedSocket.Event.READY, readySpy);
                sck.addEventListener(MemcachedSocket.Event.PROGRESS, progressSpy);
                sck.addEventListener(MemcachedSocket.Event.ERROR, errorSpy);
                sck.addEventListener(MemcachedSocket.Event.END, endSpy);
                sck.setSocket(socketMock);
            });

            waitsFor(function () {
                return readySpy.callCount;
            }, 'eventReady');

            runs(function () {
                var calls = socketMock.write.argsForCall,
                    l = socketMock.write.callCount,
                    i = 0,
                    chunk = 0;

                expect(l).toEqual(12);

                for (; i < l; i += 3) {
                    //naglowek
                    chunk++;
                    expect(calls[i][0].toString()).toEqual(getHead([MemcachedSocket.Operation.SET, getKey(key, chunk), 0, lifetime, chunkSize]).toString());
                    //dane
                    expect(calls[i + 1][0].toString()).toEqual((new Buffer(value)).toString());
                    //zakonczenie
                    expect(calls[i + 2][0].toString()).toEqual(ending.toString());
                }
            });

            waitsFor(function () {
                return endSpy.callCount;
            }, 'eventEnd');

            runs(function () {
                expect(readySpy.callCount).toEqual(1);

                expect(progressSpy).not.toHaveBeenCalled();
                expect(errorSpy).not.toHaveBeenCalled();

                expect(endSpy.callCount).toEqual(1);
                expect(endSpy.argsForCall[0][0].data).toBeTruthy();
            });
        });

        it("with chunks using static data withOUT reply", function () {
            spyOn(socketMock, 'write').andCallThrough();

            runs(function () {
                sck.init(MemcachedSocket.Operation.SET, key, {
                    lifetime: lifetime,
                    length: length,
                    waitForReply: false,
                    chunkSize: chunkSize,
                    data: new Buffer(dataValue)
                });
                sck.addEventListener(MemcachedSocket.Event.READY, readySpy);
                sck.addEventListener(MemcachedSocket.Event.PROGRESS, progressSpy);
                sck.addEventListener(MemcachedSocket.Event.ERROR, errorSpy);
                sck.addEventListener(MemcachedSocket.Event.END, endSpy);
                sck.setSocket(socketMock);
            });

            waitsFor(function () {
                return readySpy.callCount;
            }, 'eventReady');

            runs(function () {
                var calls = socketMock.write.argsForCall,
                    l = socketMock.write.callCount,
                    i = 0,
                    chunk = 0;

                expect(l).toEqual(12);

                for (; i < l; i += 3) {
                    //naglowek
                    chunk++;
                    expect(calls[i][0].toString()).toEqual(getHead([MemcachedSocket.Operation.SET, getKey(key, chunk), 0, lifetime, chunkSize, 'noreply']).toString());
                    //dane
                    expect(calls[i + 1][0].toString()).toEqual((new Buffer(value)).toString());
                    //zakonczenie
                    expect(calls[i + 2][0].toString()).toEqual(ending.toString());
                }
            });

            waitsFor(function () {
                return endSpy.callCount;
            }, 'eventEnd');

            runs(function () {
                expect(readySpy.callCount).toEqual(1);

                expect(progressSpy).not.toHaveBeenCalled();
                expect(errorSpy).not.toHaveBeenCalled();

                expect(endSpy.callCount).toEqual(1);
                expect(endSpy.argsForCall[0][0].data).toBeTruthy();
            });
        });

        it("with chunks using streamed data with reply", function () {
            socketMock.write = function (buff, encoding, cb) {
                if (buff.toString() == value) {
                    this.a = true;
                }

                if (buff.toString() == ending.toString()) {
                    this.b = true;
                }

                if (this.a && this.b) {
                    this.a = false;
                    this.b = false;
                    this.events.data(new Buffer("STORED\r\n"));
                }

                if (cb) {
                    cb();
                }
            };

            spyOn(socketMock, 'write').andCallThrough();

            runs(function () {
                sck.init(MemcachedSocket.Operation.SET, key, {
                    lifetime: lifetime,
                    length: length,
                    waitForReply: true,
                    chunkSize: chunkSize,
                });
                sck.addEventListener(MemcachedSocket.Event.READY, function () {
                    for(var i = 0, l = 4; i < l; i++) {
                        sck.write(new Buffer(value));
                    }
                    readyCallCount++;
                });
                sck.addEventListener(MemcachedSocket.Event.PROGRESS, progressSpy);
                sck.addEventListener(MemcachedSocket.Event.ERROR, errorSpy);
                sck.addEventListener(MemcachedSocket.Event.END, endSpy);
                sck.setSocket(socketMock);
            });

            waitsFor(function () {
                return readyCallCount;
            }, 'eventReady');

            runs(function () {
                var calls = socketMock.write.argsForCall,
                    l = socketMock.write.callCount,
                    i = 0,
                    chunk = 0;

                expect(l).toEqual(12);

                for (; i < l; i += 3) {
                    //naglowek
                    chunk++;
                    expect(calls[i][0].toString()).toEqual(getHead([MemcachedSocket.Operation.SET, getKey(key, chunk), 0, lifetime, chunkSize]).toString());
                    //dane
                    expect(calls[i + 1][0].toString()).toEqual((new Buffer(value)).toString());
                    //zakonczenie
                    expect(calls[i + 2][0].toString()).toEqual(ending.toString());
                }
            });

            waitsFor(function () {
                return endSpy.callCount;
            }, 'eventEnd');

            runs(function () {
                expect(readyCallCount).toEqual(1);

                expect(progressSpy).not.toHaveBeenCalled();
                expect(errorSpy).not.toHaveBeenCalled();

                expect(endSpy.callCount).toEqual(1);
                expect(endSpy.argsForCall[0][0].data).toBeTruthy();
            });
        });

        it("with chunks using streamed data withOUT reply", function () {
            spyOn(socketMock, 'write').andCallThrough();

            runs(function () {
                sck.init(MemcachedSocket.Operation.SET, key, {
                    lifetime: lifetime,
                    length: length,
                    waitForReply: false,
                    chunkSize: chunkSize,
                });
                sck.addEventListener(MemcachedSocket.Event.READY, function () {
                    for(var i = 0, l = 4; i < l; i++) {
                        sck.write(new Buffer(value));
                    }
                    readyCallCount++;
                });
                sck.addEventListener(MemcachedSocket.Event.PROGRESS, progressSpy);
                sck.addEventListener(MemcachedSocket.Event.ERROR, errorSpy);
                sck.addEventListener(MemcachedSocket.Event.END, endSpy);
                sck.setSocket(socketMock);
            });

            waitsFor(function () {
                return readyCallCount;
            }, 'eventReady');

            runs(function () {
                var calls = socketMock.write.argsForCall,
                    l = socketMock.write.callCount,
                    i = 0,
                    chunk = 0;

                expect(l).toEqual(12);

                for (; i < l; i += 3) {
                    //naglowek
                    chunk++;
                    expect(calls[i][0].toString()).toEqual(getHead([MemcachedSocket.Operation.SET, getKey(key, chunk), 0, lifetime, chunkSize, 'noreply']).toString());
                    //dane
                    expect(calls[i + 1][0].toString()).toEqual((new Buffer(value)).toString());
                    //zakonczenie
                    expect(calls[i + 2][0].toString()).toEqual(ending.toString());
                }
            });

            waitsFor(function () {
                return endSpy.callCount;
            }, 'eventEnd');

            runs(function () {
                expect(readyCallCount).toEqual(1);

                expect(progressSpy).not.toHaveBeenCalled();
                expect(errorSpy).not.toHaveBeenCalled();

                expect(endSpy.callCount).toEqual(1);
                expect(endSpy.argsForCall[0][0].data).toBeTruthy();
            });
        });

        it("with chunks using streamed, given input is bigger than chunkSize", function () {
            spyOn(socketMock, 'write').andCallThrough();

            runs(function () {
                sck.init(MemcachedSocket.Operation.SET, key, {
                    lifetime: lifetime,
                    length: length,
                    waitForReply: false,
                    chunkSize: chunkSize,
                });
                sck.addEventListener(MemcachedSocket.Event.READY, function () {
                    for(var i = 0, l = 2; i < l; i++) {
                        sck.write(new Buffer(value + value));
                    }
                    readyCallCount++;
                });
                sck.addEventListener(MemcachedSocket.Event.PROGRESS, progressSpy);
                sck.addEventListener(MemcachedSocket.Event.ERROR, errorSpy);
                sck.addEventListener(MemcachedSocket.Event.END, endSpy);
                sck.setSocket(socketMock);
            });

            waitsFor(function () {
                return readyCallCount;
            }, 'eventReady');

            runs(function () {
                var calls = socketMock.write.argsForCall,
                    l = socketMock.write.callCount,
                    i = 0,
                    chunk = 0;

                expect(l).toEqual(12);

                for (; i < l; i += 3) {
                    //naglowek
                    chunk++;
                    expect(calls[i][0].toString()).toEqual(getHead([MemcachedSocket.Operation.SET, getKey(key, chunk), 0, lifetime, chunkSize, 'noreply']).toString());
                    //dane
                    expect(calls[i + 1][0].toString()).toEqual((new Buffer(value)).toString());
                    //zakonczenie
                    expect(calls[i + 2][0].toString()).toEqual(ending.toString());
                }
            });

            waitsFor(function () {
                return endSpy.callCount;
            }, 'eventEnd');

            runs(function () {
                expect(readyCallCount).toEqual(1);

                expect(progressSpy).not.toHaveBeenCalled();
                expect(errorSpy).not.toHaveBeenCalled();

                expect(endSpy.callCount).toEqual(1);
                expect(endSpy.argsForCall[0][0].data).toBeTruthy();
            });
        });

        it("with chunks using streamed, last chunk is smaller than other", function () {
            var length = 28, tmpValue = "1234", tmpChunkSize = 4;

            spyOn(socketMock, 'write').andCallThrough();

            runs(function () {
                sck.init(MemcachedSocket.Operation.SET, key, {
                    lifetime: lifetime,
                    length: length,
                    waitForReply: false,
                    chunkSize: chunkSize,
                });
                sck.addEventListener(MemcachedSocket.Event.READY, function () {
                    for(var i = 0, l = 4; i < l; i++) {
                        if (i < 3) {
                            sck.write(new Buffer(value));
                        } else {
                            sck.write(new Buffer(tmpValue));
                        }
                    }
                    readyCallCount++;
                });
                sck.addEventListener(MemcachedSocket.Event.PROGRESS, progressSpy);
                sck.addEventListener(MemcachedSocket.Event.ERROR, errorSpy);
                sck.addEventListener(MemcachedSocket.Event.END, endSpy);
                sck.setSocket(socketMock);
            });

            waitsFor(function () {
                return readyCallCount;
            }, 'eventReady');

            runs(function () {
                var calls = socketMock.write.argsForCall,
                    l = socketMock.write.callCount,
                    i = 0,
                    chunk = 0;

                expect(l).toEqual(12);

                for (; i < l; i += 3) {
                    chunk++;

                    if (chunk < 4) {
                        //naglowek
                        expect(calls[i][0].toString()).toEqual(getHead([MemcachedSocket.Operation.SET, getKey(key, chunk), 0, lifetime, chunkSize, 'noreply']).toString());
                        //dane
                        expect(calls[i + 1][0].toString()).toEqual((new Buffer(value)).toString());
                    } else {
                        //naglowek
                        expect(calls[i][0].toString()).toEqual(getHead([MemcachedSocket.Operation.SET, getKey(key, chunk), 0, lifetime, tmpChunkSize, 'noreply']).toString());
                        //dane
                        expect(calls[i + 1][0].toString()).toEqual((new Buffer(tmpValue)).toString());
                    }

                    //zakonczenie
                    expect(calls[i + 2][0].toString()).toEqual(ending.toString());
                }
            });

            waitsFor(function () {
                return endSpy.callCount;
            }, 'eventEnd');

            runs(function () {
                expect(readyCallCount).toEqual(1);

                expect(progressSpy).not.toHaveBeenCalled();
                expect(errorSpy).not.toHaveBeenCalled();

                expect(endSpy.callCount).toEqual(1);
                expect(endSpy.argsForCall[0][0].data).toBeTruthy();
            });
        });

        it("withOUT chunks using static data with STORED reply", function () {
            socketMock.write = function (buff, encoding, cb) {
                if (buff.toString() == dataValue) {
                    this.a = true;
                }

                if (buff.toString() == ending.toString()) {
                    this.b = true;
                }

                if (this.a && this.b) {
                    this.a = false;
                    this.b = false;
                    this.events.data(new Buffer("STORED\r\n"));
                }

                if (cb) {
                    cb();
                }
            };

            spyOn(socketMock, 'write').andCallThrough();

            runs(function () {
                sck.init(MemcachedSocket.Operation.SET, key, {
                    lifetime: lifetime,
                    length: length,
                    waitForReply: true,
                    data: new Buffer(dataValue)
                });
                sck.addEventListener(MemcachedSocket.Event.READY, readySpy);
                sck.addEventListener(MemcachedSocket.Event.PROGRESS, progressSpy);
                sck.addEventListener(MemcachedSocket.Event.ERROR, errorSpy);
                sck.addEventListener(MemcachedSocket.Event.END, endSpy);
                sck.setSocket(socketMock);
            });

            waitsFor(function () {
                return readySpy.callCount;
            }, 'eventReady');

            runs(function () {
                var calls = socketMock.write.argsForCall;

                expect(calls.length).toEqual(3);

                //naglowek
                expect(calls[0][0].toString()).toEqual(getHead([MemcachedSocket.Operation.SET, getKey(key, 1), 0, lifetime, length]).toString());
                //dane
                expect(calls[1][0].toString()).toEqual((new Buffer(dataValue)).toString());
                //zakonczenie
                expect(calls[2][0].toString()).toEqual(ending.toString());
            });

            waitsFor(function () {
                return endSpy.callCount;
            }, 'eventEnd');

            runs(function () {
                expect(readySpy.callCount).toEqual(1);

                expect(progressSpy).not.toHaveBeenCalled();
                expect(errorSpy).not.toHaveBeenCalled();

                expect(endSpy.callCount).toEqual(1);
                expect(endSpy.argsForCall[0][0].data).toBeTruthy();
            });
        });

        it("withOUT chunks using static data with NOT STORED reply", function () {
            spyOn(socketMock, 'write').andCallThrough();

            runs(function () {
                sck.init(MemcachedSocket.Operation.SET, key, {
                    lifetime: lifetime,
                    length: length,
                    waitForReply: true,
                    data: new Buffer(dataValue)
                });
                sck.addEventListener(MemcachedSocket.Event.READY, readySpy);
                sck.addEventListener(MemcachedSocket.Event.PROGRESS, progressSpy);
                sck.addEventListener(MemcachedSocket.Event.ERROR, errorSpy);
                sck.addEventListener(MemcachedSocket.Event.END, endSpy);
                sck.setSocket(socketMock);
            });

            waitsFor(function () {
                return readySpy.callCount;
            }, 'eventReady');

            runs(function () {
                var calls = socketMock.write.argsForCall;

                expect(calls.length).toEqual(3);

                //naglowek
                expect(calls[0][0].toString()).toEqual(getHead([MemcachedSocket.Operation.SET, getKey(key, 1), 0, lifetime, length]).toString());
                //dane
                expect(calls[1][0].toString()).toEqual((new Buffer(dataValue)).toString());
                //zakonczenie
                expect(calls[2][0].toString()).toEqual(ending.toString());

                socketMock.events.data(new Buffer("NOT STORED\r\n"));
            });

            waitsFor(function () {
                return endSpy.callCount;
            }, 'eventEnd');

            runs(function () {
                expect(readySpy.callCount).toEqual(1);

                expect(progressSpy).not.toHaveBeenCalled();

                expect(errorSpy.argsForCall[0][0].code).toEqual(MemcachedSocket.Exception.NOT_STORED);

                expect(endSpy.callCount).toEqual(1);
                expect(endSpy.argsForCall[0][0].data).toBeNull();
            });
        });

        it("withOUT chunks using static data with UNKNOWN reply", function () {
            spyOn(socketMock, 'write').andCallThrough();

            runs(function () {
                sck.init(MemcachedSocket.Operation.SET, key, {
                    lifetime: lifetime,
                    length: length,
                    waitForReply: true,
                    data: new Buffer(dataValue)
                });
                sck.addEventListener(MemcachedSocket.Event.READY, readySpy);
                sck.addEventListener(MemcachedSocket.Event.PROGRESS, progressSpy);
                sck.addEventListener(MemcachedSocket.Event.ERROR, errorSpy);
                sck.addEventListener(MemcachedSocket.Event.END, endSpy);
                sck.setSocket(socketMock);
            });

            waitsFor(function () {
                return readySpy.callCount;
            }, 'eventReady');

            runs(function () {
                var calls = socketMock.write.argsForCall;

                expect(calls.length).toEqual(3);

                //naglowek
                expect(calls[0][0].toString()).toEqual(getHead([MemcachedSocket.Operation.SET, getKey(key, 1), 0, lifetime, length]).toString());
                //dane
                expect(calls[1][0].toString()).toEqual((new Buffer(dataValue)).toString());
                //zakonczenie
                expect(calls[2][0].toString()).toEqual(ending.toString());

                socketMock.events.data(new Buffer("EXISTS\r\n"));
            });

            waitsFor(function () {
                return endSpy.callCount;
            }, 'eventEnd');

            runs(function () {
                expect(readySpy.callCount).toEqual(1);

                expect(progressSpy).not.toHaveBeenCalled();

                expect(errorSpy.argsForCall[0][0].code).toEqual(MemcachedSocket.Exception.UNKNOWN_ERROR);

                expect(endSpy.callCount).toEqual(1);
                expect(endSpy.argsForCall[0][0].data).toBeNull();
            });
        });

        it("withOUT chunks using static data withOUT reply", function () {
            spyOn(socketMock, 'write').andCallThrough();

            runs(function () {
                sck.init(MemcachedSocket.Operation.SET, key, {
                    lifetime: lifetime,
                    length: length,
                    waitForReply: false,
                    data: new Buffer(dataValue)
                });
                sck.addEventListener(MemcachedSocket.Event.READY, readySpy);
                sck.addEventListener(MemcachedSocket.Event.PROGRESS, progressSpy);
                sck.addEventListener(MemcachedSocket.Event.ERROR, errorSpy);
                sck.addEventListener(MemcachedSocket.Event.END, endSpy);
                sck.setSocket(socketMock);
            });

            waitsFor(function () {
                return readySpy.callCount;
            }, 'eventReady');

            runs(function () {
                var calls = socketMock.write.argsForCall;

                expect(calls.length).toEqual(3);

                //naglowek
                expect(calls[0][0].toString()).toEqual(getHead([MemcachedSocket.Operation.SET, getKey(key, 1), 0, lifetime, length, 'noreply']).toString());
                //dane
                expect(calls[1][0].toString()).toEqual((new Buffer(dataValue)).toString());
                //zakonczenie
                expect(calls[2][0].toString()).toEqual(ending.toString());
            });

            waitsFor(function () {
                return endSpy.callCount;
            }, 'eventEnd');

            runs(function () {
                expect(readySpy.callCount).toEqual(1);

                expect(progressSpy).not.toHaveBeenCalled();

                expect(errorSpy).not.toHaveBeenCalled();

                expect(endSpy.callCount).toEqual(1);
                expect(endSpy.argsForCall[0][0].data).toBeTruthy();
            });
        });

        it("withOUT chunks using streamed data with reply", function () {
            socketMock.write = function (buff, encoding, cb) {
                if (buff.toString() == value) {
                    this.a = true;
                }

                if (buff.toString() == ending.toString()) {
                    this.b = true;
                }

                if (this.a && this.b) {
                    this.a = false;
                    this.b = false;
                    this.events.data(new Buffer("STORED\r\n"));
                }

                if (cb) {
                    cb();
                }
            };

            spyOn(socketMock, 'write').andCallThrough();

            runs(function () {
                sck.init(MemcachedSocket.Operation.SET, key, {
                    lifetime: lifetime,
                    length: length,
                    waitForReply: true,
                });
                sck.addEventListener(MemcachedSocket.Event.READY, function () {
                    for(var i = 0, l = 4; i < l; i++) {
                        sck.write(new Buffer(value));
                    }
                    readyCallCount++;
                });
                sck.addEventListener(MemcachedSocket.Event.PROGRESS, progressSpy);
                sck.addEventListener(MemcachedSocket.Event.ERROR, errorSpy);
                sck.addEventListener(MemcachedSocket.Event.END, endSpy);
                sck.setSocket(socketMock);
            });

            waitsFor(function () {
                return readyCallCount;
            }, 'eventReady');

            runs(function () {
                var calls = socketMock.write.argsForCall,
                    chunk = 0;

                expect(calls.length).toEqual(6);

                //naglowek
                chunk++;
                expect(calls[0][0].toString()).toEqual(getHead([MemcachedSocket.Operation.SET, getKey(key, chunk), 0, lifetime, length]).toString());
                //dane
                expect(calls[1][0].toString()).toEqual((new Buffer(value)).toString());
                expect(calls[2][0].toString()).toEqual((new Buffer(value)).toString());
                expect(calls[3][0].toString()).toEqual((new Buffer(value)).toString());
                expect(calls[4][0].toString()).toEqual((new Buffer(value)).toString());
                //zakonczenie
                expect(calls[5][0].toString()).toEqual(ending.toString());
            });

            waitsFor(function () {
                return endSpy.callCount;
            }, 'eventEnd');

            runs(function () {
                expect(readyCallCount).toEqual(1);

                expect(progressSpy).not.toHaveBeenCalled();

                expect(errorSpy).not.toHaveBeenCalled();

                expect(endSpy.callCount).toEqual(1);
                expect(endSpy.argsForCall[0][0].data).toBeTruthy();
            });
        });

        it("withOUT chunks using streamed data withOUT reply", function () {
            spyOn(socketMock, 'write').andCallThrough();

            runs(function () {
                sck.init(MemcachedSocket.Operation.SET, key, {
                    lifetime: lifetime,
                    length: length,
                    waitForReply: false,
                });
                sck.addEventListener(MemcachedSocket.Event.READY, function () {
                    for(var i = 0, l = 4; i < l; i++) {
                        sck.write(new Buffer(value));
                    }
                    readyCallCount++;
                });
                sck.addEventListener(MemcachedSocket.Event.PROGRESS, progressSpy);
                sck.addEventListener(MemcachedSocket.Event.Error, errorSpy)
                sck.addEventListener(MemcachedSocket.Event.END, endSpy);
                sck.setSocket(socketMock);
            });

            waitsFor(function () {
                return readyCallCount;
            }, 'eventReady');

            runs(function () {
                var calls = socketMock.write.argsForCall;

                expect(calls.length).toEqual(6);

                //naglowek
                expect(calls[0][0].toString()).toEqual(getHead([MemcachedSocket.Operation.SET, getKey(key, 1), 0, lifetime, length, 'noreply']).toString());
                //dane
                expect(calls[1][0].toString()).toEqual((new Buffer(value)).toString());
                expect(calls[2][0].toString()).toEqual((new Buffer(value)).toString());
                expect(calls[3][0].toString()).toEqual((new Buffer(value)).toString());
                expect(calls[4][0].toString()).toEqual((new Buffer(value)).toString());
                //zakonczenie
                expect(calls[5][0].toString()).toEqual(ending.toString());
            });

            waitsFor(function () {
                return endSpy.callCount;
            }, 'eventEnd');

            runs(function () {
                expect(readyCallCount).toEqual(1);

                expect(progressSpy).not.toHaveBeenCalled();

                expect(errorSpy).not.toHaveBeenCalled();

                expect(endSpy.callCount).toEqual(1);
                expect(endSpy.argsForCall[0][0].data).toBeTruthy();
            });
        });
    });

    describe("get", function () {
        it("with chunks", function () {
            var currentChunk = 0, totalChunks = 4;
            socketMock.write = function (buff, encoding, cb) {
                if (currentChunk < totalChunks) {
                    currentChunk++;
                    this.events.data(new Buffer("VALUE " + key + " 0 8\r\n" + value + "\r\nEND\r\n"));
                } else {
                    this.events.data(new Buffer("END\r\n"));
                }

                if (cb) {
                    cb();
                }
            };

            runs(function () {
                sck.init(MemcachedSocket.Operation.GET, key, {
                    chunkSize: chunkSize
                });
                sck.addEventListener(MemcachedSocket.Event.READY, readySpy);
                sck.addEventListener(MemcachedSocket.Event.ERROR, errorSpy);
                sck.addEventListener(MemcachedSocket.Event.PROGRESS, progressSpy);
                sck.addEventListener(MemcachedSocket.Event.END, endSpy);
                sck.setSocket(socketMock);
            });

            waitsFor(function () {
                return readySpy.callCount;
            }, 'eventReady');

            runs(function () {
                var calls = progressSpy.argsForCall,
                    l = progressSpy.callCount,
                    i = 0;

                expect(l).toEqual(4);

                for (; i < l; i++) {
                    expect(calls[i][0].data.toString()).toEqual((new Buffer(value)).toString());
                }
            });

            waitsFor(function () {
                return endSpy.callCount;
            }, 'eventEnd');

            runs(function () {
                expect(readySpy.callCount).toEqual(1);

                expect(errorSpy).not.toHaveBeenCalled();

                expect(endSpy.callCount).toEqual(1);
                expect(endSpy.argsForCall[0][0].data.toString()).toEqual((new Buffer(dataValue)).toString());
            });
        });

        it("withOUT chunks", function () {
            var tmpValue = '', count = -1, maxCount = 20, timer = null;
            socketMock.write = function (buff, encoding, cb) {
                var self = this;
                timer = setInterval(function () {
                    count++;

                    if (count == 0) {
                        tmpValue += value;
                        self.events.data(new Buffer("VALUE " + key + " 0 160\r\n" + value));
                    } else if (count > 0 && count < maxCount) {
                        tmpValue += value;
                        self.events.data(new Buffer(value));
                    } else {
                        self.events.data(new Buffer("\r\nEND\r\n"));
                        clearInterval(timer);
                    }
                }, 1);

                if (cb) {
                    cb();
                }
            };

            spyOn(socketMock, 'write').andCallThrough();

            runs(function () {
                sck.init(MemcachedSocket.Operation.GET, key, {
                    timeout: 1000
                });
                sck.addEventListener(MemcachedSocket.Event.READY, readySpy);
                sck.addEventListener(MemcachedSocket.Event.ERROR, errorSpy);
                sck.addEventListener(MemcachedSocket.Event.PROGRESS, progressSpy);
                sck.addEventListener(MemcachedSocket.Event.END, endSpy);
                sck.setSocket(socketMock);
            });

            waitsFor(function () {
                return readySpy.callCount && progressSpy.callCount == 20;
            }, 'eventReady');

            runs(function () {
                var calls = progressSpy.argsForCall,
                    l = progressSpy.callCount,
                    i = 0;

                expect(l).toEqual(20);

                for (; i < l; i++) {
                    expect(calls[i][0].data.toString()).toEqual((new Buffer(value)).toString());
                }
            });

            waitsFor(function () {
                return endSpy.callCount;
            }, 'eventEnd');

            runs(function () {
                expect(readySpy.callCount).toEqual(1);

                expect(errorSpy).not.toHaveBeenCalled();

                expect(endSpy.callCount).toEqual(1);
                expect(endSpy.argsForCall[0][0].data.toString()).toEqual((new Buffer(tmpValue)).toString());
            });
        });

        it("timedout", function () {
            runs(function () {
                sck.init(MemcachedSocket.Operation.GET, key, {
                    timeout: 1000
                });
                sck.addEventListener(MemcachedSocket.Event.READY, readySpy);
                sck.addEventListener(MemcachedSocket.Event.ERROR, errorSpy);
                sck.addEventListener(MemcachedSocket.Event.PROGRESS, progressSpy);
                sck.addEventListener(MemcachedSocket.Event.END, endSpy);
                sck.setSocket(socketMock);
            });

            waitsFor(function () {
                return readySpy.callCount && errorSpy.callCount; 
            }, 'eventReady');

            runs(function () {
                expect(readySpy.callCount).toEqual(1);

                expect(progressSpy).not.toHaveBeenCalled();

                expect(errorSpy.callCount).toEqual(1);
                expect(errorSpy.argsForCall[0][0].code).toEqual(MemcachedSocket.Exception.TIMEDOUT);
            });

            waitsFor(function () {
                return endSpy.callCount;
            }, 'eventEnd');

            runs(function () {
                expect(endSpy.callCount).toEqual(1);
                expect(endSpy.argsForCall[0][0].data).toBeNull();
            });
        });

        it("no data for given key", function () {
            socketMock.write = function (buff, encoding, cb) {
                this.events.data(new Buffer("END\r\n"));
            };
            runs(function () {
                sck.init(MemcachedSocket.Operation.GET, key, {});
                sck.addEventListener(MemcachedSocket.Event.READY, readySpy);
                sck.addEventListener(MemcachedSocket.Event.ERROR, errorSpy);
                sck.addEventListener(MemcachedSocket.Event.PROGRESS, progressSpy);
                sck.addEventListener(MemcachedSocket.Event.END, endSpy);
                sck.setSocket(socketMock);
            });

            waitsFor(function () {
                return readySpy.callCount && endSpy.callCount; 
            }, 'eventReady');

            runs(function () {
                expect(readySpy.callCount).toEqual(1);

                expect(progressSpy).not.toHaveBeenCalled();

                expect(errorSpy).not.toHaveBeenCalled();

                expect(endSpy.callCount).toEqual(1);
                expect(endSpy.argsForCall[0][0].data).toBeNull();
            });
        });

        it("bad command format", function () {
            socketMock.write = function (buff, encoding, cb) {
                this.events.data(new Buffer("BAD COMMAND FORMAT\r\n"));
            };
            runs(function () {
                sck.init(MemcachedSocket.Operation.GET, key, {});
                sck.addEventListener(MemcachedSocket.Event.READY, readySpy);
                sck.addEventListener(MemcachedSocket.Event.ERROR, errorSpy);
                sck.addEventListener(MemcachedSocket.Event.PROGRESS, progressSpy);
                sck.addEventListener(MemcachedSocket.Event.END, endSpy);
                sck.setSocket(socketMock);
            });

            waitsFor(function () {
                return readySpy.callCount && endSpy.callCount; 
            }, 'eventReady');


            runs(function () {
                expect(readySpy.callCount).toEqual(1);

                expect(progressSpy).not.toHaveBeenCalled();

                expect(errorSpy.callCount).toEqual(1);
                expect(errorSpy.argsForCall[0][0].code).toEqual(MemcachedSocket.Exception.BAD_COMMAND_FORMAT);

                expect(endSpy.callCount).toEqual(1);
                expect(endSpy.argsForCall[0][0].data).toBeNull();
            });
        });
    });

    describe("delete", function() {
        it("with reply: deleted", function () {
            socketMock.write = function (buff, encoding, cb) {
                this.events.data(new Buffer("DELETED\r\n"));

                if (cb) {
                    cb();
                }
            };

            runs(function () {
                sck.init(MemcachedSocket.Operation.DELETE, key, {
                    waitForReply: true
                });
                sck.addEventListener(MemcachedSocket.Event.READY, readySpy);
                sck.addEventListener(MemcachedSocket.Event.PROGRESS, progressSpy);
                sck.addEventListener(MemcachedSocket.Event.ERROR, errorSpy);
                sck.addEventListener(MemcachedSocket.Event.END, endSpy);
                sck.setSocket(socketMock);
            });

            waitsFor(function () {
                return readySpy.callCount && endSpy.callCount;
            }, "delete done");

            runs(function () {
                expect(readySpy.callCount).toEqual(1);

                expect(progressSpy).not.toHaveBeenCalled();
                expect(errorSpy).not.toHaveBeenCalled();

                expect(endSpy.callCount).toEqual(1);
                expect(endSpy.argsForCall[0][0].data).toBeTruthy();
            });
        });

        it("with reply: not deleted", function () {
            socketMock.write = function (buff, encoding, cb) {
                this.events.data(new Buffer("NOT DELETED\r\n"));

                if (cb) {
                    cb();
                }
            };

            runs(function () {
                sck.init(MemcachedSocket.Operation.DELETE, key, {
                    waitForReply: true
                });
                sck.addEventListener(MemcachedSocket.Event.READY, readySpy);
                sck.addEventListener(MemcachedSocket.Event.PROGRESS, progressSpy);
                sck.addEventListener(MemcachedSocket.Event.ERROR, errorSpy);
                sck.addEventListener(MemcachedSocket.Event.END, endSpy);
                sck.setSocket(socketMock);
            });

            waitsFor(function () {
                return readySpy.callCount && endSpy.callCount;
            }, "delete done");

            runs(function () {
                expect(readySpy.callCount).toEqual(1);

                expect(progressSpy).not.toHaveBeenCalled();

                expect(errorSpy.callCount).toEqual(1);
                expect(errorSpy.argsForCall[0][0].code).toEqual(MemcachedSocket.Exception.NOT_DELETED);

                expect(endSpy.callCount).toEqual(1);
                expect(endSpy.argsForCall[0][0].data).toBeNull();
            });
        });

        it("with reply: unknown error", function () {
            socketMock.write = function (buff, encoding, cb) {
                this.events.data(new Buffer("AAAAAAAAAAAAAAAAAAAAAAa\r\n"));

                if (cb) {
                    cb();
                }
            };

            runs(function () {
                sck.init(MemcachedSocket.Operation.DELETE, key, {
                    waitForReply: true
                });
                sck.addEventListener(MemcachedSocket.Event.READY, readySpy);
                sck.addEventListener(MemcachedSocket.Event.PROGRESS, progressSpy);
                sck.addEventListener(MemcachedSocket.Event.ERROR, errorSpy);
                sck.addEventListener(MemcachedSocket.Event.END, endSpy);
                sck.setSocket(socketMock);
            });

            waitsFor(function () {
                return readySpy.callCount && endSpy.callCount;
            }, "delete done");

            runs(function () {
                expect(readySpy.callCount).toEqual(1);

                expect(progressSpy).not.toHaveBeenCalled();

                expect(errorSpy.callCount).toEqual(1);
                expect(errorSpy.argsForCall[0][0].code).toEqual(MemcachedSocket.Exception.UNKNOWN_ERROR);

                expect(endSpy.callCount).toEqual(1);
                expect(endSpy.argsForCall[0][0].data).toBeNull();
            });
        });

        it("withOUT reply", function () {
            runs(function () {
                sck.init(MemcachedSocket.Operation.DELETE, key, {
                    waitForReply: false
                });
                sck.addEventListener(MemcachedSocket.Event.READY, readySpy);
                sck.addEventListener(MemcachedSocket.Event.PROGRESS, progressSpy);
                sck.addEventListener(MemcachedSocket.Event.ERROR, errorSpy);
                sck.addEventListener(MemcachedSocket.Event.END, endSpy);
                sck.setSocket(socketMock);
            });

            waitsFor(function () {
                return readySpy.callCount && endSpy.callCount;
            }, "delete done");

            runs(function () {
                expect(readySpy.callCount).toEqual(1);

                expect(progressSpy).not.toHaveBeenCalled();
                expect(errorSpy).not.toHaveBeenCalled();

                expect(endSpy.callCount).toEqual(1);
                expect(endSpy.argsForCall[0][0].data).toBeTruthy();
            });
        });
    });

    describe("misc", function () {
        it("waiting for connect event", function () {
            socketMock._connected = false;

            runs(function () {
                sck.init(MemcachedSocket.Operation.GET, key, {});
                sck.addEventListener(MemcachedSocket.Event.READY, readySpy);
                sck.setSocket(socketMock);
            });

            waitsFor(function () {
                return socketMock.events.hasOwnProperty("connect");
            });

            runs(function () {
                expect(readySpy).not.toHaveBeenCalled();

                socketMock.events.connect();
            });

            waitsFor(function () {
                return readySpy.callCount;
            });

            runs(function () {
                expect(readySpy.callCount).toEqual(1);
            });
        });
    });
});
