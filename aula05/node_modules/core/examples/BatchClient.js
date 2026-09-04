var Loader = require('core').http.Loader;
var OpalLoader = require('dl').opal.OpalLoader;
var OpalRequest = require('dl').opal.OpalRequest;
var JsonRpcBatchRequest = require('core').jsonrpc.JsonRpcBatchRequest;
var JsonRpcRequest = require('core').jsonrpc.JsonRpcRequest;
var BinaryData = require("core").data.BinaryData;


var myArgs = process.argv.splice(2);
console.log("Args ", myArgs);
if ( myArgs.length != 2 ){
    console.log('You have to give args: [batch or requset] [opal url]');
    process.exit(1);
}

if (myArgs[0] === 'batch'){
    var jsonBatch = new JsonRpcBatchRequest();
    jsonBatch.add(new JsonRpcRequest({'id': '1', 'method': 'get', 'params': 'test_ok'}));
    jsonBatch.add(new JsonRpcRequest({'id': '2', 'method': 'set', 'params': 'test_ok2'}));

    console.log("Request:\n",jsonBatch.toJson());
    var opalRequest = new OpalRequest({
        url: myArgs[1]
    });
    // mozna tez wywolac w taki sposob
    opalRequest.setBatchBody(jsonBatch);
    //opalRequest.setBody(new BinaryData(jsonBatch.toString(), BinaryData.Encoding.TEXT, BinaryData.CharacterEncoding.UTF8));
    var loader = new OpalLoader(opalRequest);

    loader.addEventListener(OpalLoader.Event.JSON_RESPONSE, function (e) {
        var rpc = e.data.getBody();
        console.log("Response:\n", rpc.get('1'));
    });

    loader.addEventListener(Loader.Event.ERROR, function (e) {
        console.log("Response:\n", e);
    });
    loader.load();

}else if ( myArgs[0] === 'request'){
    var request = new OpalRequest({
            url: myArgs[1],
            method: "get",
            params: "testowa"
        });

    console.log("Request:\n",request.toJson());
    var loader = new OpalLoader(request);

    loader.addEventListener(OpalLoader.Event.JSON_RESPONSE, function (e) {
        var rpc = e.data.getBody();
        console.log("Response:\n", rpc);
    });

    loader.addEventListener(Loader.Event.ERROR, function (e) {
        console.log("Response:\n", e);
    });
    loader.load();
}else{
    console.log('Not found: ',myArgs[0], ' \nYou have to give [batch or request]');
}
