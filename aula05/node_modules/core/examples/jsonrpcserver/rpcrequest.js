var Loader = require('./core/lib/net/Loader.js').Loader;
var Request = require('./core/lib/net/Request.js').Request;
var JsonRpcRequest = require('./core/lib/jsonrpc/JsonRpcRequest.js').JsonRpcRequest;

var json = new JsonRpcRequest();
json.setId("qwe123");
json.setMethod("get");

var r = new Request();
r.setUrl('http://localhost:8080/');
r.setMethod(Request.POST);
r.setBody(json.toString());

var l = new Loader(r);
l.addEventListener(Loader.Event.LOADED, function () {
	console.log('LOADLED', arguments[0].data)
	console.log(arguments[0].data._body._data.data.toString());
}).addEventListener(Loader.Event.ERROR, function () {
	console.log('ERROR', arguments);
}).load();
