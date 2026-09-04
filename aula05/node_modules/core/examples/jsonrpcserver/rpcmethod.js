var Class = require('./core/lib/class/Class.js').Class;
var JsonRpcMethod = require('./core/lib/jsonrpc/JsonRpcMethod.js').JsonRpcMethod;

var Response = require('./core/lib/net/Response.js').Response;

var Event = require('./core/lib/event/Event.js').Event;
var ErrorEvent = require('./core/lib/event/ErrorEvent.js').ErrorEvent;

var getMethod = function () {
	this.Extends = JsonRpcMethod;

	this.execute = function (params) {
		//this.dispatchEvent(new ErrorEvent(JsonRpcMethod.Event.ERROR, null, -1337, "fajny blad"));
		var r = new Response();
		r._setBody("eqweqweqweqweqweqweqweqw");
		this.dispatchEvent(new Event(JsonRpcMethod.Event.OK, r));
	};
};

getMethod = new Class(new getMethod());
exports.getMethod = getMethod;
