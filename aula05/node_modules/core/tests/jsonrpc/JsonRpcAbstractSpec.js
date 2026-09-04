describe('JsonRpcAbstract', function () {
    var JsonRpcAbstract;
    it('require', function () {
        expect(function () {
            JsonRpcAbstract = require('../../lib/jsonrpc/JsonRpcAbstract.js').JsonRpcAbstract;
        }).not.toThrow();
        expect(JsonRpcAbstract).toBeTruthy();
    })
    
    it('check constructor', function () {
        expect(function () {
            new JsonRpcAbstract({'data1': -1, 'data2': 'msg', 'dataN': 'some data'});
            new JsonRpcAbstract('{"data1": -1, "data2": "msg", "dataN": "some data"}');
        }).not.toThrow();
        
        expect(function () {
            new JsonRpcAbstract("{'data1': -1, 'data2': 'msg', 'dataN': 'some data'");
        }).toThrow(JsonRpcAbstract.Exceptions.INPROPER_JSON_STRING);
    })
})
