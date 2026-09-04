var MySQLPool;
describe('MySQLPool', function () {
    it('require', function () {
        expect(function () {
            MySQLPool = require('../../lib/client/MySQLPool.js').MySQLPool;
        }).not.toThrow();
        expect(MySQLPool).toBeTruthy();        
    });
    
    it('create clients', function () {
        var mysql = require('mysql'), created = 0,  pool;
        runs(function () {
            spyOn(mysql, 'createConnection');
            mysql.createConnection.andCallFake(function () {
                created++;
                return {
                    'connect': function () {
                        
                    }
                }
            });
        });
        
        runs(function () {
            pool = new MySQLPool();
            pool.connect();
        });
        
        waitsFor(function () {
            return created > 0;
        });
        
        runs(function () {
            expect(created).toEqual(5);
        });
    });
    
    it('create custom num clients', function () {
        var mysql = require('mysql'), created = 0, pool;
        
        runs(function () {
            spyOn(mysql, 'createConnection');
        
            mysql.createConnection.andCallFake(function () {
                created++;
                return {
                    'connect': function () {
                        
                    }
                }
            });
        });
        
        runs(function () {
            pool = new MySQLPool({'num_connections': 1});
            pool.connect();
        });
        
        waitsFor(function () {
            return created > 0;
        });
        
        runs(function () {
            expect(created).toEqual(1);
        });
    });
    
    it('destroy clients', function () {
        var mysql = require('mysql'), created = 0, pool;
        
        runs(function () {
            spyOn(mysql, 'createConnection');
            
            mysql.createConnection.andCallFake(function () {
                created++;
                return {
                    'destroy': function () {
                        created--;
                    },
                    'connect': function () {
                        
                    }
                }
            });
        });
        
        runs(function () {
            pool = new MySQLPool();
            pool.connect();
        })
        
        waitsFor(function () {
            return created > 0;
        });
        
        runs(function () {
            pool._destroySpareClients();
        })
        
        waitsFor(function () {
            return created == 0;
        });
        
        runs(function () {
            expect(created).toEqual(0);
        });
    });


    it('execute queued queries', function () {
        var pool, executed = 0, mysql = require('mysql');
        
        runs(function () {
            spyOn(mysql, 'createConnection');
            mysql.createConnection.andCallFake(function () {
                //created++;
                //pool._queuedQueries.push('test');
                return {
                    'query': function () {
                        executed++;
                    },
                    'connect': function () {
                        
                    }
                }
            });
        });
        
        runs(function () {
            pool = new MySQLPool();
            pool._queuedQueries.push(['test']);
            pool.connect();
        })
        
        waitsFor(function () {
            return executed > 0;
        })
        
        runs(function () {
            expect(executed).toEqual(1);
        })
    });
    
    it('execute query callback', function () {
        var pool, mysql = require('mysql'), created = 0, executed = 0;
      
        runs(function () {
            spyOn(mysql, 'createConnection');
            mysql.createConnection.andCallFake(function () {
                created++;
                return {
                    "query": function (sql, params, cb) {
                        cb(0, {'a': 'test'}, ['a']);
                    },
                    'connect': function () {
                        
                    }
                }
            });
            
            pool = new MySQLPool();
            pool.connect();
        });
        
        waitsFor(function () {
            return created > 0;
        });
        
        runs(function () {
            pool.query('test1', 'test2', function () {
                executed++;
            });
        });
        
        waitsFor(function () {
            return executed > 0;
        });
        
        runs(function () {
            expect(executed).toEqual(1);
        });
    });
    
    it('retry query', function () {
        var pool, mysql = require('mysql'), created = 0, retries = 0, err, cbcalls = 0,
        error = {'code': 'PROTOCOL_CONNECTION_LOST'};
        
        runs(function () {
            spyOn(mysql,'createConnection');
            mysql.createConnection.andCallFake(function () {
                created++;
                return {
                    'query': function (sql, params, cb) {
                        retries++;
                        cb(error);
                    },
                    'destroy': function () {
                        created--;
                    },
                    'connect': function () {
                        
                    }
                }
            });
            
            pool = new MySQLPool();
            pool.connect();
        });
        
        waitsFor(function () {
            return created > 0;
        });
        
        runs(function () {
            pool.query('test', 'test', function (e) {
                cbcalls++;
                err = e;
            });
        });
        
        waitsFor(function () {
            return err != undefined;
        });
        
        runs(function () {
            expect(retries).toEqual(5);
            expect(err).toEqual(error);
            expect(cbcalls).toEqual(1);
        });
    });
});
