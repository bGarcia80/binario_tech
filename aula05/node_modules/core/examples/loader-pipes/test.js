var http = require('http');
var Loader = require('../../lib/index.js').Net.Loader;
var CacheLoader = require('../../lib/index.js').Net.CacheLoader;
var Request = require('../../lib/index.js').Net.Request;
var Response = require('../../lib/index.js').Net.Response;


var server = http.createServer(function (req, res) {

    console.log('-------------------------- REQ');

    var request = new Request('http://www.onet.pl');
    var loader = new Loader();

    loader.addEventListener(Loader.Event.HEADERS, function (e) {
        var response = e.data.response;
        var cacheLoader = new CacheLoader();
        cacheLoader.upload(request, response);
        res.writeHead(response.getStatusCode(), response.getHeaders());
        response.addEventListener(Response.Event.WRITE, function (e) {
            res.write(e.data);
        });
        response.addEventListener(Response.Event.END, function (e) {
            res.end();
        });
    });

    loader.load(request);


    /*
    loader.addEventListener(Loader.Event.PROGRESS, function (e) {
        console.log('--- on Loader PROGRESS');
        //res.write(e.data);
    });

    loader.addEventListener(Loader.Event.LOADED, function (e) {
        console.log('--- on Loader LOADED');
        //res.end();
    });

    loader.addEventListener(Loader.Event.ERROR, function (e) {
        console.log("on Loader ERROR", e.message);
        res.end();
    });
    */

});

server.listen(8080, '0.0.0.0');
console.log('Server running at http://0.0.0.0:8080/');