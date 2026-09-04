var Memcached;
var net = require('net');

describe("Memcached", function () {
    var connection = {
            host: "localhost",
            port: 5522
        },
        server,
        memcached,
        endSpy;

    

    beforeEach(function () {
        delete require.cache[require.resolve('../../lib/http/Socket.js')];
        delete require.cache[require.resolve('../../lib/client/Memcached.js')];
        
        spyOn(require('../../lib/http/Socket.js'), "Socket").andCallFake(function () {
            this._cb = null;
            this._connected = true;
            this._refineHandlers = function () {};
            this.write = function (buf, enc, cb) {
                if (this._cb) {
                    this._cb(new Buffer("END\r\n"));
                }
                if (cb) {
                    cb();
                }
            };
            this.on = function (ev, cb) {
                this._cb = cb;
            };
        });

        endSpy = jasmine.createSpy();
    });
    
   
    it("require", function () {
        Memcached = require('../../lib/client/Memcached.js').Memcached;
        expect(Memcached).toBeTruthy();
    });

    it("set", function () {
        runs(function () {
            memcached = new Memcached(connection);
            var tmp = memcached.set("eloszka", {
                data: "1234",
                length: 4
            }, endSpy);
        });

        waitsFor(function () {
            return endSpy.callCount == 1;
        });

        runs(function () {
            expect(endSpy.argsForCall[0][0].data).toBeTruthy();
        });
    });

    it("get", function () {
        runs(function () {
            memcached = new Memcached(connection);
            var tmp = memcached.get("eloszka", null, endSpy);
        });

        waitsFor(function () {
            return endSpy.callCount == 1;
        });

        runs(function () {
            expect(endSpy.argsForCall[0][0].data).toBeNull();
        });
    });
});
