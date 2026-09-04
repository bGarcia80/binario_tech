describe('JsonRpcResponse', function () {
    var JsonRpcResponse;
    it('require', function () {
        JsonRpcResponse = require('../../lib/jsonrpc/JsonRpcResponse.js').JsonRpcResponse;
        expect(JsonRpcResponse).toBeTruthy();
    })

    it('check constructor', function () {
        expect(function () {
            new JsonRpcResponse(1);
        }).toThrow("Id should be a String");

        expect(function () {
            new JsonRpcResponse('1');
        }).toThrow();

        expect(function () {
            new JsonRpcResponse('1',2);
        }).not.toThrow();

        expect(function () {
            new JsonRpcResponse('1',2, {code:-1, message:'New msg', data: 'new data'});
        }).not.toThrow();

        expect(function () {
            new JsonRpcResponse('1',2, {code:'-10', message:'New msg', data: 'new data'});
        }).toThrow();

    });

    describe('check methods', function () {
        var JsonRpcResponse= null;
        beforeEach(function () {
            JsonRpcResponse = require('../../lib/jsonrpc/JsonRpcResponse.js').JsonRpcResponse;
            this.jsonRpcResponse = new JsonRpcResponse();
        });

        it('setId should set 1', function () {
            this.jsonRpcResponse.setId('1');
            expect(this.jsonRpcResponse.getId()).toEqual('1');
        });

        it('setResult should set 2', function () {
            this.jsonRpcResponse.setResult(2);
            expect(this.jsonRpcResponse.getResult()).toEqual(2);
        });

        it('setError should set code:-1, message: New msg , data: new data' , function () {
            this.jsonRpcResponse.setError(-1, 'New msg', 'new data');
            expect(this.jsonRpcResponse.getError().toJson()).toEqual(this.jsonRpcResponse.toJson()['error']);
        });

        afterEach(function () {
            this.jsonRpcResponse = new JsonRpcResponse('1', 2);
        });

        it('check isError is false', function () {
            expect(this.jsonRpcResponse.isError()).toBe(false);
        });
    });


})
