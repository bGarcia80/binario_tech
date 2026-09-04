var rewire = require('rewire');
var ErrorEvent = require('../../lib/event/ErrorEvent.js').ErrorEvent;
var EventDispatcher = require('../../lib/event/EventDispatcher.js').EventDispatcher;
var Loader;

describe('Loader', function () {
    it('require', function () {
        Loader = require('../../lib/http/Loader.js').Loader
    });

    it('should create new instance', function () {
        var Request = require('../../lib/http/Request.js').Request;
        var req = new Request();
        expect(function(){
            new Loader(req);
        }).not.toThrow();
    });
    
    it('should handle https connections', function () {
        var LoaderMock = rewire('../../lib/http/Loader.js');
        Loader = LoaderMock.Loader; 
        
        var https = LoaderMock.__get__('https');
        spyOn(https, 'request').andReturn({
            addListener: function () {},
            end: function () {}
        });
        
        var http = LoaderMock.__get__('http');
        spyOn(http, 'request').andCallThrough();
        
        var Request = require('../../lib/http/Request.js').Request;
        var req = new Request('https://google.com/');
        var loader = new Loader(req);
        loader.load();
        loader._clearTimer();
        
        // powinnismy uzyc https
        expect(https.request).toHaveBeenCalled();
        // nie powinnismy uzyc http
        expect(http.request).not.toHaveBeenCalled();
    });
});