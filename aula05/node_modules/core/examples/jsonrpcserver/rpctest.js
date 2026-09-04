var JsonRpcServer = require('./core/lib/jsonrpc/JsonRpcServer.js').JsonRpcServer;
var getMethod = require('./rpcmethod.js').getMethod;

var server = new JsonRpcServer();
server.addMethod('get', getMethod);
server.getClusterNode().listen(8080, '0.0.0.0');
