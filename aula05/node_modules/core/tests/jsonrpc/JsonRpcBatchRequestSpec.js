xdescribe('JsonRpcBatchRequest', function () {
    var JsonRpcBatchRequest;
    var JsonRpcRequest;
    it('require', function () {
        expect(function () {
            JsonRpcBatchRequest = require('../../lib/jsonrpc/JsonRpcBatchRequest.js').JsonRpcBatchRequest;
            JsonRpcRequest = require('../../lib/jsonrpc/JsonRpcRequest.js').JsonRpcRequest;
        }).not.toThrow();
        expect(JsonRpcBatchRequest).toBeTruthy();
        expect(JsonRpcRequest).toBeTruthy();
    });

    it('calls the toJson() function', function () {
        var mockJsonRpcBatchRequest = new JsonRpcBatchRequest();
        spyOn(mockJsonRpcBatchRequest, "toJson");
        mockJsonRpcBatchRequest.toString();
        expect(mockJsonRpcBatchRequest.toJson).toHaveBeenCalled();
    });

    it('check add', function (){
        var testBatchRequest = new JsonRpcBatchRequest();
        testBatchRequest.add(new JsonRpcRequest({'id': '1', 'method': 'get', 'params': 'test_ok'}));
        testBatchRequest.add(new JsonRpcRequest({'id': '2', 'method': 'set', 'params': 'test_ok'}));
        expect(testBatchRequest._items.length).toEqual(2);
        expect(testBatchRequest._items.length).not.toEqual(1);

        expect(testBatchRequest.toString()).toEqual(JSON.stringify(testBatchRequest.toJson()));
    });


})
