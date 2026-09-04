describe('S3', function () {
    var S3 = null;
    it('require', function () {
        expect(function () {
            S3 = require('../../lib/client/S3.js').S3;
        }).not.toThrow();
        expect(S3).toBeTruthy();
    });
    
    it('create client', function () {
        var knox = require('knox'), created = 0, s3;

        runs(function () {
            spyOn(knox, 'createClient');
            knox.createClient.andCallFake(function () {
                created++;
            })
            s3 = new S3();
        });
        
        waitsFor(function () {
            return created > 0;
        })
        
        runs(function () {
            expect(created).toEqual(1);
        })
    });
    
    it('get file', function () {
        var knox = require('knox'), events = require('events'),
            created = 0, s3, err, res, body = 'aaaa';
        
        runs(function () {
            spyOn(knox, 'createClient');
            knox.createClient.andCallFake(function () {
                var Client = function () {
                    this.statusCode = 200;
                    this.headers = {};
                };
                Client.prototype = Object.create(events.EventEmitter.prototype);
                Client.prototype.get = function (filename, headers) {
                    return this;
                }
                Client.prototype.end = function () {
                    process.nextTick((function () {
                        this.emit('response', this);
                        process.nextTick((function() {
                            this.emit('data', new Buffer(body));
                            process.nextTick((function () {
                                this.emit('end');
                            }).bind(this));
                        }).bind(this), 0);
                    }).bind(this));
                }
                created++;
                return new Client();
            });
            s3 = new S3();
        });
        
        waitsFor(function () {
            return created > 0;
        });
        
        runs(function () {
            s3.get('aaaa', function (e, r) {
                err = e;
                res = r;
            });
        });
        
        waitsFor(function () {
            return res != undefined;
        })
        
        runs(function () {
            var res_body = res.getBody();
            expect(err).toBeFalsy();
            expect(new Buffer(res_body.toString(), 'base64').toString()).toEqual(body);
        });
    });
    
    it('put file', function () {
        var knox = require('knox'), events = require('events'),
            created = 0, s3, err, body = 'aaaa';
        
        runs(function () {
            spyOn(knox, 'createClient');
            knox.createClient.andCallFake(function () {
                var Client = function () {
                    this.statusCode = 200;
                    this.headers = {};
                };
                Client.prototype = Object.create(events.EventEmitter.prototype);
                Client.prototype.put = function (filename, headers) {
                    return this;
                }
                Client.prototype.end = function () {
                    process.nextTick((function () {
                        this.emit('response', this);
                    }).bind(this));
                }
                created++;
                return new Client();
            });
            s3 = new S3();
            s3.addEventListener(S3.Event.LOADED, function () {
                err = false;
            }, this);
        });
        
        waitsFor(function () {
            return created > 0;
        });
        
        runs(function () {
            s3.set('aaaa');
        });
        
        waitsFor(function () {
            return err != undefined;
        })
        
        runs(function () {
            expect(err).toBeFalsy();
        });
    });
})