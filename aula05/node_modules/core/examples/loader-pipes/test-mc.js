var http = require('http');
var CacheLoader = require('../../lib/index.js').Net.CacheLoader;
var Request = require('../../lib/index.js').Net.Request;
var Response = require('../../lib/index.js').Net.Response;

var url = "http://www.onet.pl:8080";
//var url = "http://estest.s3.amazonaws.com/pl_PL.zip";
//var url = "http://estest.s3.amazonaws.com/TortoiseSVN-1.7.5.22551-win32-svn-1.7.3.msi"

var server = http.createServer(function (req, res) {
    console.log('-------------------------- REQ');
    
    var request = new Request(url);
    
    var loader = new CacheLoader();
    
    loader.addEventListener(CacheLoader.Event.HEADERS, function (e) {
        console.log('--- on Loader HEADERS');
        res.writeHead(e.data.statusCode, e.data.headers);
       
        var response = e.data.response;
        response.addEventListener(Response.Event.WRITE, function (e) {
            console.log('----- on RES WRITE');
            res.write(e.data);
        });
        response.addEventListener(Response.Event.END, function (e) {
            console.log('--- on RES END');
            res.end();
        });
    });
    
    loader.addEventListener(CacheLoader.Event.PROGRESS, function (e) {
        console.log('--- on Loader PROGRESS');
        //res.write(e.data);
    });
    
    loader.addEventListener(CacheLoader.Event.LOADED, function (e) {
        console.log('--- on Loader LOADED');
        //res.end();
    });
    
    loader.addEventListener(CacheLoader.Event.ERROR, function (e) {
        console.log("on Loader ERROR", e.message);
        res.end();
    });
    
    loader.load(request);
    
});

server.listen(8080, '0.0.0.0');
console.log('Server running at http://0.0.0.0:8080/');