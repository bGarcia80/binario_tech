var JsonRpcAbstract = require('../../lib/jsonrpc/JsonRpcAbstract.js').JsonRpcAbstract
describe('JsonRpcError', function () {
    var JsonRpcError;
    it('require', function () {
        expect(function () {
            JsonRpcError = require('../../lib/jsonrpc/JsonRpcError.js').JsonRpcError;
        }).not.toThrow();
        expect(JsonRpcError).toBeTruthy();
    });
    
    it('create instance', function () {
        var err;
        expect(function () {
            err = new JsonRpcError(1, 'a', {'b': 2});
        }).not.toThrow();
        expect(err).toBeTruthy();
    });
    
    it('check setters/getters', function () {
        var err = new JsonRpcError(1, 'a', {'b': 2});
        expect(err.getCode()).toEqual(1);
        expect(err.getMessage()).toEqual('a');
        expect(err.getData()).toEqual({'b': 2});
        
        err.setCode(3);
        expect(err.getCode()).toEqual(3);
        err.setMessage('c');
        expect(err.getMessage()).toEqual('c');
        err.setData({'d': 4});
        expect(err.getData()).toEqual({'d': 4});
    });
    
    it('serialize to JSON', function () {
        var e1 = new JsonRpcError(1, 'a');
        expect(e1.toJson()).toEqual({'code': 1, 'message': 'a'});
        var e2 = new JsonRpcError(2, 'b', {'c': 3});
        expect(e2.toJson()).toEqual({'code': 2, 'message': 'b', 'data': {'c': 3}});
    });
    
    it('check factory', function () {
        var e1 = new JsonRpcError(1, 'a', {'b': 2});
        var e2 = JsonRpcError.factory(e1);
        expect(e1.toJson()).toEqual(e2.toJson());
        expect(function () {
            JsonRpcError.factory('a');
        }).toThrow(JsonRpcError.Exceptions.WRONG_CLASS);
    });
    
    it('check arguments', function () {
        expect(function () {
            new JsonRpcError(null);
        }).toThrow(JsonRpcAbstract.Exceptions.INVALID_JSON_RPC);
        
        expect(function () {
            new JsonRpcError(1, 1);
        }).toThrow(JsonRpcAbstract.Exceptions.INVALID_JSON_RPC);
    })
});
