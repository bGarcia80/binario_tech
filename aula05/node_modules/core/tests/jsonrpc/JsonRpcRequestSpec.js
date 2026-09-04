describe('JsonRpcRequest', function () {
    var JsonRpcRequest;
    it('require', function () {
        expect(function () {
            JsonRpcRequest = require('../../lib/jsonrpc/JsonRpcRequest.js').JsonRpcRequest;
        }).not.toThrow();
        expect(JsonRpcRequest).toBeTruthy();
    });
    
    it('check constructor', function () {
        expect(function () {
            new JsonRpcRequest(1);
        }).not.toThrow("Id should be a string");
        
        expect(function () {
            new JsonRpcRequest('1', 2);
        }).toThrow("Method should be a string");
        
        expect(function () {
            new JsonRpcRequest();
        }).not.toThrow();

        expect(function () {
            new JsonRpcRequest('1', '2', '3');
        }).not.toThrow();
            
            
            
    });
    
    it('check setters/getters', function () {
        var req = new JsonRpcRequest();
        
        expect(function () {
            req.setVersion(1);
        }).toThrow("Version should be a string");
        
        req.setVersion('2.0');
        expect(req.getVersion()).toEqual('2.0');
        
        req.setId('2');
        expect(req.getId()).toEqual('2');
        
        req.setMethod('3');
        expect(req.getMethod()).toEqual('3');
        
        expect(function () {
            req.setParam(1, 2);
        }).toThrow("Key should be a string");
        req.setParam('1', 2);
        expect(req.getParam('1')).toEqual(2);
        expect(req.getParam('2')).toEqual(null);
        
        expect(req.toJson()).toEqual({
            'jsonrpc' : '2.0',
            'id' : '2',
            'method' : '3',
            'params' : {
                '1' : 2
            }
        });
        
        expect(req.toString()).toEqual(JSON.stringify(req.toJson()));

        req.setParams('4');
        expect(req.getParams()).toEqual('4');

    })
    
})
