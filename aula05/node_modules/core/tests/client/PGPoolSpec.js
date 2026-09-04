var rewire = require('rewire');
var modulePath = '../../lib/client/PGPool.js';
describe('PGPool', function () {
    describe('require', function () {
        it ('should be truthy', function () {
            var PGPool = require(modulePath).PGPool;
            expect(PGPool).toBeTruthy();
        });

        it('should not throw exception ',function () {
            expect(function () {
                var PGPool = require(modulePath).PGPool;
            }).not.toThrow();
        });
    });

    describe('methods', function () {
        var PGPoolMock;
        var PGPool;

        beforeEach(function () {
            PGPoolMock = rewire(modulePath);
            PGPool = PGPoolMock.PGPool;
        });

        describe('_handleConnectionCount', function () {
            beforeEach(function () {
                this.instance = new PGPool();
                this.instance.setMaxLength(10);
                this.instance._createConnections = jasmine.createSpy('_createConnections');
                this.instance._removeConnections = jasmine.createSpy('_removeConnections');
            });

            describe('when connection shortated', function () {
                beforeEach(function () {
                    spyOn(this.instance, 'getKnownLength').andReturn(5);
                    this.instance._handleConnectionCount();
                })

                it('should call _createConnections', function () {
                    expect(this.instance._createConnections).toHaveBeenCalled();
                });
            });

            describe('when connection overhead', function () {
                beforeEach(function () {
                    spyOn(this.instance, 'getKnownLength').andReturn(15);
                    this.instance._handleConnectionCount();
                })

                it('should call _removeConnections', function () {
                    expect(this.instance._removeConnections).toHaveBeenCalled();
                });
            });
        });

        describe('_createConnections', function () {
            var retValue = null;
            beforeEach(function () {
                this.instance = new PGPool();
                spyOn(this.instance, '_createConnection').andCallFake(function (cfg, cb) {
                    cb(retValue);
                });

                spyOn(this.instance, 'scheduleRenew').andReturn(null);;
            });

            describe('many connections', function () {
                beforeEach(function () {
                    this.instance._createConnections(5);
                });

                it('should try to create connections', function () {
                    expect(this.instance._createConnection.callCount).toEqual(5);
                });

                it('should not call scheduleRenew', function () {
                    expect(this.instance.scheduleRenew).not.toHaveBeenCalled();
                });
            });

            describe('when errror', function () {
                beforeEach(function () {
                    retValue = 'error';
                    this.instance._createConnections(5);
                });

                it('should try to create connections', function () {
                    expect(this.instance._createConnection.callCount).toEqual(5);
                });

                it('should not call scheduleRenew', function () {
                    expect(this.instance.scheduleRenew).toHaveBeenCalled();
                });
            });
        });

        describe('_createConnection', function () {
            var PGClient;
            var EventEmitter = require('events').EventEmitter;
            var ClientMock = function (config) {
                EventEmitter.call(this);
            };
            ClientMock.prototype = Object.create(EventEmitter.prototype);
            ClientMock.prototype.connect = function () {};
            ClientMock.prototype.end = function () {};

            beforeEach(function () {
                PGPoolMock.__set__('PGClient', ClientMock);
                this.instance = new PGPool();
            });

            describe('on success', function () {
                beforeEach(function () {
                    spyOn(ClientMock.prototype, 'connect').andCallFake(function () {
                        this.emit('connect', null);
                    })
                    spyOn(ClientMock.prototype, 'removeListener');
                    this.callback = jasmine.createSpy('callback');
                    this.instance._createConnection({}, this.callback);
                });
                
                it('should add client to pool', function () {
                    expect(this.instance.getKnownLength()).toEqual(1);
                });

                it('should spawn callback', function () {
                    expect(this.callback).toHaveBeenCalled();
                });
            });

        });
        
        describe('_removeConnections', function () {
            var EventEmitter = require('events').EventEmitter;
            var ClientMock = function (config) {
                EventEmitter.call(this);
            };
            ClientMock.prototype = Object.create(EventEmitter.prototype);
            ClientMock.prototype.connect = function () {};
            ClientMock.prototype.end = jasmine.createSpy('ClientMock.end');

            beforeEach(function () {
                this.instance = new PGPool();
            });

            afterEach(function () {
                this.instance.destroy();
            });

            describe('many clients', function () {
                beforeEach(function () {
                    spyOn(this.instance, 'get').andCallThrough();
                    this.instance.add(new ClientMock());
                    this.instance.add(new ClientMock());
                    this.instance.add(new ClientMock());
                    this.instance._removeConnections(2); 
                });

                it('should try to get clients from pool', function () {
                    expect(this.instance.get).toHaveBeenCalled();
                });

                it('should try to get given number of clients', function () {
                    expect(this.instance.get.callCount).toEqual(2);
                });

                it('should try to remove given number of clients', function () {
                    expect(this.instance.getKnownLength()).toEqual(1);
                });
            });

            describe('when no clients', function () {
                beforeEach(function () {
                    spyOn(this.instance, 'get').andCallThrough();
                    this.instance._removeConnections(2);
                });

                it('should not try to get clients', function () {
                    expect(this.instance.get).not.toHaveBeenCalled();
                });
            });

            describe('operations on client', function () {
                beforeEach(function () {
                    this.client = new ClientMock();
                    this.instance.add(this.client);
                    this.instance._removeConnections(1);
                });

                it('should end clients connection', function () {
                    expect(this.client.end).toHaveBeenCalled();
                });
            });
        });

        describe('query', function () {
            var retErr;
            var retData;
            beforeEach(function () {
                this.instance = new PGPool();
                var clientMock = {
                    query: function (sql, params, callback) {
                        callback(retErr, retData);
                    }
                }
                spyOn(this.instance, 'get').andCallFake(function (callback) {
                    callback(clientMock);
                });
            });

            describe('when no error', function () {
                beforeEach(function () {
                    retErr = null;
                    retData = 'data';
                    this.callback = jasmine.createSpy('queryCallback');
                    this.instance.query('sql', 'params', this.callback);
                });

                it('should spawn callback', function () {
                    expect(this.callback).toHaveBeenCalled();
                });

                it('should return data in callback', function () {
                    expect(this.callback.mostRecentCall.args[1]).toEqual(retData);
                });

                it('should not return error in callback', function () {
                    expect(this.callback.mostRecentCall.args[0]).toBeNull();
                });

                it('should not put query to queue', function () {
                    expect(this.instance._queuedQueries.length).toEqual(0);
                });
            });

            describe('when error', function () {
                beforeEach(function () {
                    retErr = new Error('Query error');
                    retData = null;
                    spyOn(PGPool.prototype, '_isFatalError').andReturn(false);
                    this.callback = jasmine.createSpy('queryCallback');
                    this.instance.query('sql', 'params', this.callback);
                });

                it('should spawn callback', function () {
                    expect(this.callback).toHaveBeenCalled();
                });

                it('should return data in callback', function () {
                    expect(this.callback.mostRecentCall.args[1]).toEqual(retData);
                });

                it('should return error in callback', function () {
                    expect(this.callback.mostRecentCall.args[0]).toEqual(retErr);
                });

                it('should not put query to queue', function () {
                    expect(this.instance._queuedQueries.length).toEqual(0);
                });
            });

            describe('when fatal error', function () {
                beforeEach(function () {
                    retErr = new Error('Fatal error');
                    retData = null;
                    spyOn(PGPool.prototype, '_isFatalError').andReturn(true);
                    spyOn(this.instance, '_removeClient');
                    this.callback = jasmine.createSpy('queryCallback');
                });
                
                afterEach(function () {
                    this.instance.destroy(); 
                });

                describe('limit not reached', function () {
                    beforeEach(function () {
                        this.instance.query('sql', 'params', this.callback, 1);
                    });

                    it('should not spawn callback', function () {
                        expect(this.callback).not.toHaveBeenCalled();
                    });

                    it('should put query to queue', function () {
                        expect(this.instance._queuedQueries.length).toEqual(1);
                    });

                    it('should remove broken client', function () {
                        expect(this.instance._removeClient).toHaveBeenCalled();
                    });
                });

                describe('limit reached', function () {
                    beforeEach(function () {
                        this.instance.query('sql', 'params', this.callback, 5);
                    });

                    it('should spawn callback', function () {
                        expect(this.callback).toHaveBeenCalled();
                    });

                    it('should not put query to queue', function () {
                        expect(this.instance._queuedQueries.length).toEqual(0);
                    });

                    it('should remove broken client', function () {
                        expect(this.instance._removeClient).toHaveBeenCalled();
                    });
                });
            });
        });

        describe('queryWithCursors', function () {
            var ClientMock = function (config) {};
            ClientMock.prototype.query = function () {};
            ClientMock.prototype.end = jasmine.createSpy('ClientMock.end');

            beforeEach(function () {
                this.instance = new PGPool();
                this.client = new ClientMock();
                this.instance.add(this.client);
            });

            afterEach(function () {
                this.instance.destroy();
            });

            describe('when error during transaction', function () {
                var methodQuery = 'SELECT * FROM api.get_users()';

                describe('after BEGIN', function () {
                    beforeEach(function () {
                        spyOn(this.client, 'query').andCallFake(function (sql, params, callback) {
                            if (sql == 'BEGIN')
                                return callback('error', null);
                            return callback(null, 'data');
                        });

                        this.callback = jasmine.createSpy('query_callback');
                        this.instance.queryWithCursors(methodQuery, [], ['entries'], this.callback);
                    });

                    it('should release client to pool', function () {
                        expect(this.instance.getSpareLength()).toEqual(1);
                    });

                    it('should spawn callback with error', function () {
                        expect(this.callback).toHaveBeenCalled();
                        expect(this.callback).toHaveBeenCalledWith('error', null);
                    });

                    it('should call 2 queries', function () {
                        expect(this.client.query.callCount).toEqual(2);
                    });

                    it('should end transaction', function () {
                        expect(this.client.query.mostRecentCall.args[0]).toEqual('COMMIT');
                    });
                });

                describe('after method call', function () {
                    beforeEach(function () {
                        spyOn(this.client, 'query').andCallFake(function (sql, params, callback) {
                            if (sql == methodQuery)
                                return callback('error', null);
                            return callback(null, 'data');
                        });

                        this.callback = jasmine.createSpy('query_callback');
                        this.instance.queryWithCursors(methodQuery, [], ['entries'], this.callback);
                    });

                    it('should release client to pool', function () {
                        expect(this.instance.getSpareLength()).toEqual(1);
                    });

                    it('should spawn callback with error', function () {
                        expect(this.callback).toHaveBeenCalled();
                        expect(this.callback).toHaveBeenCalledWith('error', null);
                    });

                    it('should call 3 queries', function () {
                        expect(this.client.query.callCount).toEqual(3);
                    });

                    it('should end transaction', function () {
                        expect(this.client.query.mostRecentCall.args[0]).toEqual('COMMIT');
                    });
                });
            });

            describe('when no error', function () {
                var methodQuery = 'SELECT * FROM api.get_users()';

                describe('when empty result from procedure', function () {
                    var methodResult;

                    beforeEach(function () {
                        methodResult = JSON.parse('{"rowCount":0,"rows":[]}');
                        spyOn(this.client, 'query').andCallFake(function (sql, params, callback) {
                            if (sql == methodQuery)
                                return callback(null, methodResult);
                            return callback(null, 'data');
                        });

                        this.callback = jasmine.createSpy('query_callback');
                        this.instance.queryWithCursors(methodQuery, [], ['entries'], this.callback);
                    });

                    it('should return original result', function () {
                        expect(this.callback).toHaveBeenCalledWith(null, methodResult);
                    });

                    it('should end transaction', function () {
                        expect(this.client.query.mostRecentCall.args[0]).toEqual('COMMIT');
                    });

                    it('should release client to pool', function () {
                        expect(this.instance.getSpareLength()).toEqual(1);
                    });
                });

                describe('when normal result from procedure', function () {
                    var methodResult;
                    var cursorResult;

                    beforeEach(function () {
                        methodResult = JSON.parse('{"rowCount":1,"rows":[{"status":"OK","entries":"hits"}]}');
                        cursorResult = JSON.parse('{"rowCount":2,"rows":[{"id":1,"name":"stefan"},{"id":2,"name":"marian"}]}');

                        spyOn(this.client, 'query').andCallFake(function (sql, params, callback) {
                            if (sql == methodQuery)
                                return callback(null, methodResult);
                            else if (sql == 'FETCH ALL FROM "hits"')
                                return callback(null, cursorResult);
                            else
                                return callback(null, 'data');
                        });

                        this.callback = jasmine.createSpy('query_callback');
                        this.instance.queryWithCursors(methodQuery, [], ['entries'], this.callback);
                    });

                    it('should spawn callback', function () {
                        expect(this.callback).toHaveBeenCalled();
                    });

                    it('should end transaction', function () {
                        expect(this.client.query.mostRecentCall.args[0]).toEqual('COMMIT');
                    });

                    it('should release client to pool', function () {
                        expect(this.instance.getSpareLength()).toEqual(1);
                    });

                    describe('result', function () {
                        beforeEach(function () {
                            this.result = this.callback.mostRecentCall.args[1];
                        });

                        it('should be defined', function () {
                            expect(this.result).toBeDefined();
                        });

                        it('should have one row', function () {
                            expect(this.result.rowCount).toEqual(1);
                            expect(this.result.rows.length).toEqual(1);
                        });

                        it('should be filled with data from cursor', function () {
                            expect(this.result.rows[0].entries).toEqual(cursorResult.rows);
                        });
                    });
                });
            });
        });
    });
});