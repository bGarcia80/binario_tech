xdescribe('JsonRpcBatchResponse', function () {
    var JsonRpcBatchResponse;
    var JsonRpcRespons;
    var JsonRpcError;
    var JsonRpcAbstract;
    it('require', function () {
        expect(function () {
            JsonRpcBatchResponse = require('../../lib/jsonrpc/JsonRpcBatchResponse.js').JsonRpcBatchResponse;
            JsonRpcResponse = require('../../lib/jsonrpc/JsonRpcResponse.js').JsonRpcResponse;
            JsonRpcError = require('../../lib/jsonrpc/JsonRpcError.js').JsonRpcError;
            JsonRpcAbstract = require("../../lib/jsonrpc/JsonRpcAbstract.js").JsonRpcAbstract;
        }).not.toThrow();
        expect(JsonRpcBatchResponse).toBeTruthy();
        expect(JsonRpcResponse).toBeTruthy();
        expect(JsonRpcError).toBeTruthy();
        expect(JsonRpcAbstract).toBeTruthy();
    });

    it('calls the toJson() function', function () {
        var mockJsonRpcBatchResponse = new JsonRpcBatchResponse();
        spyOn(mockJsonRpcBatchResponse, "toJson");
        mockJsonRpcBatchResponse.toString();
        expect(mockJsonRpcBatchResponse.toJson).toHaveBeenCalled();
    });

    it('check get', function (){

        var response = [{'id': '1', 'method': 'get', 'params': 'test_ok'},{ 'id': '2', 'method': 'set', 'params': 'test_ok2'}];
        var testBatchResponse = new JsonRpcBatchResponse(response);
        expect(testBatchResponse.get(3)).toEqual(undefined);
        expect(testBatchResponse.get().toString()).toEqual('{"jsonrpc":"2.0","id":"1","result":null},{"jsonrpc":"2.0","id":"2","result":null}');
        expect(testBatchResponse.get('1').toString()).toEqual('{"jsonrpc":"2.0","id":"1","result":null}');
        expect(testBatchResponse.get('1').toString()).not.toEqual('{"jsonrpc":"2.0","id":"2","result":null}');
        expect(testBatchResponse._items.length).toEqual(2);
        expect(testBatchResponse.toString()).toEqual(JSON.stringify(testBatchResponse.toJson()));
    });

})
