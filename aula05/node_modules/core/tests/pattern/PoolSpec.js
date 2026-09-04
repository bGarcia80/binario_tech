describe('Pool', function () {
    var Pool;
    describe('require', function () {
        it('should not throw exception', function () {
            expect(function () {
                Pool = require('../../lib/pattern/Pool.js').Pool;
            }).not.toThrow();
        });

        it('should be truthy', function () {
            expect(Pool).toBeTruthy();
        });
    });

    describe('constructor', function () {
        beforeEach(function () {
            this.pool = new Pool();
        });

        it('should not have spare objects', function () {
            expect(this.pool.getSpareLength()).toEqual(0);
        });

        it('should not have waiting callbacks', function () {
            expect(this.pool.getWaitingLength()).toEqual(0);
        });
    });

    describe('adding object', function () {
        beforeEach(function () {
            this.pool = new Pool();
            this.fakeObj = 'a';
            this.pool.add(this.fakeObj);
        });

        it('should have one spare object', function () {
            expect(this.pool.getSpareLength()).toEqual(1);
        });

        it('should not have waiting callbacks', function () {
            expect(this.pool.getWaitingLength()).toEqual(0);
        });
    });

    describe('get object', function () {
        beforeEach(function () {
            this.pool = new Pool();
            this.callbackMock = jasmine.createSpy();
            this.fakeObj = 'a';
            this.pool.add(this.fakeObj);
            this.pool.get(this.callbackMock);
        });

        it('should call mock callback', function () {
            expect(this.callbackMock).toHaveBeenCalledWith(this.fakeObj);
        });

        it('should not have spare objects', function () {
            expect(this.pool.getSpareLength()).toEqual(0);
        });
    });

    describe('get and release object', function () {
        beforeEach(function () {
            var that = this;
            this.pool = new Pool();
            this.callbackMock = function (client) {
                that.pool.release(client);
            };
            this.fakeObj = 'a';
            this.pool.add(this.fakeObj);
            this.pool.get(this.callbackMock);
        });

        it('should not have waiting callback', function () {
            expect(this.pool.getWaitingLength()).toEqual(0);
        });

        it('should have spare objects', function () {
            expect(this.pool.getSpareLength()).toEqual(1);
        });
    });

    describe('add object', function () {
        beforeEach(function () {
            this.pool = new Pool;
            this.pool.add('a');
        });

        it('should have one spare object', function () {
            expect(this.pool.getSpareLength()).toEqual(1);
        });

    });

    describe('mark known objects for deletion', function () {
        beforeEach(function () {
        this.pool = new Pool();
        this.fakeObj1 = 'a';
        this.fakeObj2 = 'b';
        this.pool.add(this.fakeObj1);
        this.pool.markForDeletion();
        this.pool.add(this.fakeObj2);
        });

        it('should have one spare element', function () {
            expect(this.pool.getSpareLength()).toEqual(1);
        });

        it('should not have waiting callbacks', function () {
            expect(this.pool.getWaitingLength()).toEqual(0);
        });

        it('should returns fakeObj2', function () {
            var that = this;
            this.pool.get(function () {
                expect(arguments[0]).toEqual(that.fakeObj2);
            });

        });
    });

   describe('queued stats', function () {
        beforeEach(function () {
            this.pool = new Pool();
            this.cb = jasmine.createSpy();
            this.pool.get(this.cb.bind(this));
            this.queued1 = this.pool.getQueued();
        });

        it('should not execute fake callback', function () {
            expect(this.cb).not.toHaveBeenCalled();
        });

        it('should returns one request queued', function () {
            expect(this.queued1).toEqual(1);
        });

   });

   describe('queued callbacks overflow with disabled queuing', function () {
        beforeEach(function () {
            this.pool = new Pool();
            this.pool.setMaxQueued(0);
            this.cb = jasmine.createSpy();
            this.pool.get(this.cb);
        });

        it('should execute fake callback', function () {
            expect(this.cb).toHaveBeenCalled();
        });

        it('should execute fake callback with error', function () {
            expect(this.cb.mostRecentCall.args[0]).toEqual(Pool.ERROR.MAX_QUEUED_REACHED);
        });
   });

   describe('queued callbacks overflow with one cb allowed for queuing', function () {
        beforeEach(function () {
            this.pool = new Pool();
            this.pool.setMaxQueued(1);
            this.cb1 = jasmine.createSpy();
            this.cb2 = jasmine.createSpy();
            this.pool.get(this.cb1);
            this.pool.get(this.cb2);
        });

        it('should not execute first fake callback (queued)', function () {
            expect(this.cb1).not.toHaveBeenCalled();
        });

        it('should not execute second fake callback', function () {
            expect(this.cb2).toHaveBeenCalled();
        });

        it('should execute second fake callback with error', function () {
            expect(this.cb2.mostRecentCall.args[0]).toEqual(Pool.ERROR.MAX_QUEUED_REACHED);
        });
   });
});
