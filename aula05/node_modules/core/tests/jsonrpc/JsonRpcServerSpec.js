describe('JsonRpcServer', function () {
    var JsonRpcServer;
    it('require', function () {
        JsonRpcServer = require('../../lib/jsonrpc/JsonRpcServer.js').JsonRpcServer;
        expect(JsonRpcServer).toBeTruthy();
    });

    describe('check methods', function (){
        var JsonRpcServer = null;
        var result = null;
        beforeEach(function(){
            JsonRpcServer = require('../../lib/jsonrpc/JsonRpcServer.js').JsonRpcServer;
            this.jsonRpcServer = new JsonRpcServer();
            this.jsonRpcServer.addMethod('getTest', 'test');
        });

        it('check when add new method', function() {
            expect(this.jsonRpcServer.addMethod('getttTest', 'test')).toEqual(true);
        });

        it('check when exist method', function() {
            expect(this.jsonRpcServer.addMethod('getTest', 'test')).toEqual(false);
        });

        it('check when get exist method', function() {
            expect(this.jsonRpcServer.getMethod('getTest')).toEqual('test');
        });

        it('check when get not exist method', function() {
            expect(this.jsonRpcServer.getMethod('setTest')).toEqual(false);
        });

        it('check when delete exist method', function() {
            expect(this.jsonRpcServer.removeMethod('getTest')).toEqual(true);
        });

        it('check when delete not exist method', function() {
            expect(this.jsonRpcServer.removeMethod('setTest')).toEqual(false);
        });

    });
});
