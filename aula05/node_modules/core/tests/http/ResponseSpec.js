describe('Response', function(){
    
    var Response = null;
    
    it('require Response', function(){
    	Response = require('../../lib/index.js').http.Response;
    	expect(Response).toBeTruthy();
        
        beforeEach(function(){
            Response = require('../../lib/index.js').http.Response;
        });
	});
       
    it('Response - construction #1', function(){
        expect(function(){
            new Response();
        }).not.toThrow();
    });
    
    it('Response - construction #2', function(){
        var http = require('http');
        var httpResponse = new http.ServerResponse('GET');
        expect(function(){
            new Response(httpResponse);
        }).not.toThrow();
    });
    
    it('Response - construction #3', function(){
        var httpString = 'HTTP/1.1 200 OK\r\n' +
                      'Pragma: no-cache\r\n' +
                      'Content-Type: text/plain; charset=utf8\r\n' +
                      '\r\n' +
                      'body-data';
        var httpBuffer = new Buffer(httpString, 'binary');
        var response = new Response(httpBuffer);
        expect(response.getHeader('pragma')).toBe('no-cache');
        expect(response.getHttpVersion()).toBe('1.1');
        expect(response.getStatusCode()).toBe(200);
        expect(response.getBody().toUTF8String()).toBe('body-data');
    });
    
    it('Response - construction #4', function(){
        var httpString = 'HTTP/1.0 200 OK\r\n' +
                      'Pragma: no-cache\r\n' +
                      '\r\n' +
                      'body-data';
        var httpBuffer = new Buffer(httpString, 'binary');
        var response = new Response(httpBuffer);
        expect(response.getHeader('pragma')).toBe('no-cache');
        expect(response.getHttpVersion()).toBe('1.0');
        expect(response.getStatusCode()).toBe(200);
        
        // nie ma ustawionego kodowania wiec ma byc wyjatek
        expect(function(){
            response.getBody().toUTF8String();
        }).toThrow();
        // jezeli zapytamy o stringa powinnismy dostac base64
        expect(response.getBody().toString()).toBe('Ym9keS1kYXRh');
    });
    
    it('Request - toBuffer #1', function(){
        var response = new Response();
        expect(function(){
            response.toBuffer();
        }).toThrow();
    });
    
    it('Response - toBuffer #2', function(){
        var BinaryData = require('../../lib/index.js').data.BinaryData;
        var response = new Response();
        response.setBody(new BinaryData("test-body", BinaryData.Encoding.TEXT, BinaryData.CharacterEncoding.UTF8));
        expect(response.toBuffer().toString()).toBe('HTTP/1.0 null undefined\r\ncontent-length:9\r\n\r\ntest-body');
    });
    
    it('Response - toBuffer #3', function(){
        var BinaryData = require('../../lib/index.js').data.BinaryData;
        var response = new Response();
        response.setHttpVersion = '1.1';
        response.setStatusCode(201);
        response.setBody(new BinaryData("test-body", BinaryData.Encoding.TEXT, BinaryData.CharacterEncoding.UTF8));
        expect(response.toBuffer().toString()).toBe('HTTP/1.0 201 Created\r\ncontent-length:9\r\n\r\ntest-body');
    });
    
    it('Response - toBinaryData #1', function(){
        var response = new Response();
        expect(function(){
            response.toBinaryData();
        }).toThrow();
    });
    
    it('Response - toBinaryData #2', function(){
        var BinaryData = require('../../lib/index.js').data.BinaryData;
        var response = new Response();
        response.setBody(new BinaryData("test-body", BinaryData.Encoding.TEXT, BinaryData.CharacterEncoding.UTF8));
        expect(response.toBinaryData().toUTF8String()).toBe('HTTP/1.0 null undefined\r\ncontent-length:9\r\n\r\ntest-body');
    });
    
    it('Response - toBinaryData #3', function(){
        var BinaryData = require('../../lib/index.js').data.BinaryData;
        var response = new Response();
        response.setHttpVersion = '1.1';
        response.setStatusCode(201);
        response.setBody(new BinaryData("test-body", BinaryData.Encoding.TEXT, BinaryData.CharacterEncoding.UTF8));
        expect(response.toBinaryData().toUTF8String()).toBe('HTTP/1.0 201 Created\r\ncontent-length:9\r\n\r\ntest-body');
    });
    
    it('Response - setStatusCode #1', function(){
        var response = new Response();
        response.setStatusCode(200);
        expect(response.getStatusCode()).toBe(200);
    });
    
    it('Response - setStatusCode #2', function(){
        var response = new Response();
        expect(function(){
            response.setStatusCode('503');
        }).toThrow();
        expect(function(){
            response.setStatusCode();
        }).toThrow();
        expect(function(){
            response.setStatusCode('');
        }).toThrow();
        expect(function(){
            response.setStatusCode({});
        }).toThrow();
    });
    
    it('Response - setBody #1', function(){
        var BinaryData = require('../../lib/index.js').data.BinaryData;
        var response = new Response();
        expect(response.getBody()).toBe(null);
        response.setBody(new BinaryData("test-body", BinaryData.Encoding.TEXT, BinaryData.CharacterEncoding.UTF8));
        expect(response.getBody()).toBeTruthy();
        expect(response.getBody().toUTF8String()).toBe('test-body');
    });
    
    it('Response - setBody #2', function(){
        var response = new Response();
        expect(response.getBody()).toBe(null);
    });
    
    it('Response - isContentType #1', function(){
        var response = new Response();
        expect(response.isContentType('text')).toBe(false);
        expect(function(){
            response.isContentType(200);
        }).toThrow();        
    });
    
    it('Response - isContentType #2', function(){
        var response = new Response();
        expect(response.isContentType('text')).toBe(false);
        expect(response.isContentType('text/html')).toBe(false);
        expect(response.isContentType('*/html')).toBe(false);
        expect(function(){
            response.isContentType(200);
        }).toThrow();        
    });
    
    it('Response - isContentType #3', function(){
        var response = new Response();
        response.setHeader('content-type', 'text/plain');
        expect(response.isContentType('text')).toBe(false);
        expect(response.isContentType('text/html')).toBe(false);
        expect(response.isContentType('*/html')).toBe(false);
        expect(response.isContentType('*/plain')).toBe(true);
        expect(response.isContentType('text/*')).toBe(true);
        expect(function(){
            response.isContentType(200);
        }).toThrow();
    });
    
    it('Response - isContentType #4', function(){
        var response = new Response();
        response.setHeader('content-type', 'text/plain; charset=utf-8');
        expect(response.isContentType('text')).toBe(false);
        expect(response.isContentType('text/html')).toBe(false);
        expect(response.isContentType('*/html')).toBe(false);
        expect(response.isContentType('*/plain')).toBe(true);
        expect(response.isContentType('text/*')).toBe(true);
        expect(function(){
            response.isContentType(200);
        }).toThrow();        
    });
    
    it('Response - isCharset #1', function(){
        var response = new Response();
        response.setHeader('content-type', 'text/plain; charset=utf-8');
        expect(response.isCharset('utf8')).toBe(false);
        expect(response.isCharset('utf-8')).toBe(true);
        expect(response.isCharset('Utf-8')).toBe(true);
        expect(response.isCharset('UtF-8')).toBe(true);
        expect(response.isCharset('UTF-8')).toBe(true);
        expect(function(){
            response.isCharset(2012);
        }).toThrow();        
    });
    
    it('Response - isCharset #2', function(){
        var response = new Response();
        expect(response.isCharset('utf8')).toBe(false);
        expect(response.isCharset('utf-8')).toBe(false);
        expect(response.isCharset('Utf-8')).toBe(false);
        expect(response.isCharset('UtF-8')).toBe(false);
        expect(response.isCharset('UTF-8')).toBe(false);
        expect(function(){
            response.isCharset(2012);
        }).toThrow();       
        expect(function(){
            response.isCharset();
        }).toThrow();       
    });
    
    it('Response - getCharset #1', function(){
        var response = new Response();
        response.setHeader('content-type', 'text/plain; charset=utf-8');
        expect(response.getCharset()).toBe('utf-8');
    });
    
    it('Response - getCharset #2', function(){
        var response = new Response();
        expect(response.getCharset()).toBe(null);
    });
    
    it('Response - getEncoding #1', function(){
        var response = new Response();
        response.setHeader('content-type', 'text/plain; charset=utf-8');
        expect(response.getEncoding()).toBe('utf-8');
        response.setHeader('content-type', 'text/plain; charset=utf8', true);
        expect(response.getEncoding()).toBe('utf8');
        response.setHeader('content-type', 'text/plain', true);
        expect(response.getEncoding()).toBe(null);
        response.setHeader('content-type', 'application/javascript', true);
        expect(response.getEncoding()).toBe(null);
        response.setHeader('content-type', 'application/x-javascript', true);
        expect(response.getEncoding()).toBe(null);
        response.setHeader('content-type', 'application/xhtml+xml', true);
        expect(response.getEncoding()).toBe(null);
        response.setHeader('content-type', 'application/json', true);
        expect(response.getEncoding()).toBe(null);
        response.setHeader('content-type', 'binary/stream', true);
        expect(response.getEncoding()).toBe('base64');
        response.setHeader('content-type', 'application/octet-stream', true);
        expect(response.getEncoding()).toBe('base64');
    });
    
    it('Response - toJson #1', function(){
        var response = new Response();

        expect(response.toJson()).toEqual({
            "statusCode": null,
            "httpVersion": "1.0",
            "headers": {},
            "body": null
        });
    });
    
    it('Response - toJson #2', function(){
        var BinaryData = require('../../lib/index.js').data.BinaryData;
        var response = new Response();
        response.setBody(new BinaryData("test-body", BinaryData.Encoding.TEXT, BinaryData.CharacterEncoding.UTF8));
        
        expect(response.toJson()).toEqual({
			"statusCode": null,
			"httpVersion": '1.0',
			"headers": {
                 "content-length": [9]
            },
			"body": 'test-body'
		});
    });
    
    it('Response - toJson #3', function(){
        var BinaryData = require('../../lib/index.js').data.BinaryData;
        var response = new Response();
        response.setStatusCode(200);
        response.setHttpVersion('1.1');
        response.setHeader('hoSt', 'www.onet.pl')
        response.setBody(new BinaryData("test-body", BinaryData.Encoding.TEXT, BinaryData.CharacterEncoding.UTF8));
        
        expect(response.toJson()).toEqual({
			"statusCode": 200,
			"httpVersion": '1.1',
			"headers": {
                 "content-length": [9],
                 "host": ["www.onet.pl"]
            },
			"body": 'test-body'
		});
    });
    
    it('Response - isCachingDisabled #1', function(){
        var response = new Response();
        expect(response.isCachingDisabled()).toBeFalsy();
    });
    
    it('Response - isCachingDisabled #2', function(){
        var response = new Response();
        response.setHeader('Pragma', 'no-cache');
        expect(response.isCachingDisabled()).toBeTruthy();
    });
    
    it('Response - isCachingDisabled #3', function(){
        var response = new Response();
        response.setHeader('Cache-Control', 'no-cache');
        expect(response.isCachingDisabled()).toBeTruthy();
    });
    
    it('Response - isCachingDisabled #4', function(){
        var response = new Response();
        response.setHeader('Cache-Control', 'private');
        expect(response.isCachingDisabled()).toBeTruthy();
    });
    
    it('Response - isCachingDisabled #5', function(){
        var response = new Response();
        response.setHeader('Cache-Control', 'no-cache, private');
        expect(response.isCachingDisabled()).toBeTruthy();
    });
    
    it('Response - isCachingDisabled #6', function(){
        var response = new Response();
        response.setHeader('Cache-Control', 'private, no-cache');
        expect(response.isCachingDisabled()).toBeTruthy();
    });
    
    it('Response - isCachingDisabled #7', function(){
        var response = new Response();
        response.setHeader('Pragma', 'no-cache');
        response.setHeader('Cache-Control', 'private, no-cache');
        expect(response.isCachingDisabled()).toBeTruthy();
    });
    
    it('Response - isCachingDisabled #7', function(){
        var response = new Response();
        response.setHeader('Cache-Control', 'max-age=0');
        expect(response.isCachingDisabled()).toBeFalsy();
    });
    
    it('Response - getCacheTimeInSeconds #1', function(){
        var response = new Response();
        expect(response.getCacheTimeInSeconds()).toBe(0);
    });
    
    it('Response - getCacheTimeInSeconds #2', function(){
        var response = new Response();
        response.setHeader('pragma', 'no-cache');
        expect(response.getCacheTimeInSeconds()).toBe(0);
    });
    
    it('Response - getCacheTimeInSeconds #3', function(){
        var response = new Response();
        response.setHeader('pragma', 'no-cache');
        response.setHeader('cache-control', 'max-age=3600');
        expect(response.getCacheTimeInSeconds()).toBe(0);
    });
    
    it('Response - getCacheTimeInSeconds #4', function(){
        var response = new Response();
        response.setHeader('cache-control', 'private, max-age=3600');
        expect(response.getCacheTimeInSeconds()).toBe(0);
    });
    
    it('Response - getCacheTimeInSeconds #5', function(){
        var response = new Response();
        response.setHeader('cache-control', 'max-age=3600');
        expect(response.getCacheTimeInSeconds()).toBe(3600);
    });
    
    it('Response - getCacheTimeInSeconds #6', function(){
        var response = new Response();
        response.setHeader('expires', 'Fri, 16 Dec 2000 09:21:40 GMT');
        expect(response.getCacheTimeInSeconds()).toBe(0);
    });
    
    it('Response - getCacheTimeInSeconds #6', function(){
        var response = new Response();
        response.setHeader('expires', 'Fri, 16 Dec 3000 09:21:40 GMT');
        expect(response.getCacheTimeInSeconds()).toBeGreaterThan(0);
    });
    
    it('Response - getCacheTimeInSeconds #6', function(){
        var response = new Response();
        response.setHeader('pragma', 'no-cache');
        response.setHeader('expires', 'Fri, 16 Dec 3000 09:21:40 GMT');
        expect(response.getCacheTimeInSeconds()).toBe(0);
    });
    
    it('Response - isEmptyBody #1', function(){
        var response = new Response();
        expect(response.isEmptyBody()).toBe(true);
    });
    
    it('Response - isEmptyBody #2', function(){
        var BinaryData = require('../../lib/index.js').data.BinaryData;
        var response = new Response();
        response.setBody(new BinaryData("test-body", BinaryData.Encoding.TEXT, BinaryData.CharacterEncoding.UTF8));
        expect(response.isEmptyBody()).toBe(false);
    });
    
    it('Response - isExpired #1', function(){
        var response = new Response();
        expect(response.isExpired()).toBe(true);
    });
    
    it('Response - isExpired #2', function(){
        var response = new Response();
        response.setHeader('expires', 'Fri, 16 Dec 2000 09:21:40 GMT');
        expect(response.isExpired()).toBe(true);
    });
    
    it('Response - isExpired #3', function(){
        var response = new Response();
        response.setHeader('expires', 'Fri, 16 Dec 4000 09:21:40 GMT');
        expect(response.isExpired()).toBe(false);
    });
    
    it('Response - isExpired #4', function(){
        var response = new Response();
        response.setHeader('pragma', 'no-cache');
        response.setHeader('expires', 'Fri, 16 Dec 3000 09:21:40 GMT');
        expect(response.isExpired()).toBe(false);
    });
    
    it('Response - isExpired #5', function(){
        var response = new Response();
        response.setHeader('pragma', 'no-cache');
        response.setHeader('expires', 'Fri, 16 Dec 1000 09:21:40 GMT');
        expect(response.isExpired()).toBe(true);
    });
    
    it('Response - isModified #1', function(){
        var response = new Response();
        expect(function(){
            response.isModified()
        }).toThrow();
    });
    
    it('Response - isModified #2', function(){
        var Request = require('../../lib/index.js').http.Request;
        var response = new Response();
        var request = new Request();
        expect(response.isModified(request)).toBe(true);
    });
    
    it('Response - isModified #2', function(){
        var Request = require('../../lib/index.js').http.Request;
        var request = new Request();
        request.setHeader('if-modified-since', 'Fri, 16 Dec 1000 09:21:40 GMT');
        
        var response = new Response();
        response.setHeader('last-modified', 'Fri, 16 Dec 1000 09:21:40 GMT')
        
        expect(response.isModified(request)).toBe(false);
    });
    
    it('Response - isModified #3', function(){
        var Request = require('../../lib/index.js').http.Request;
        var request = new Request();
        request.setHeader('if-modified-since', 'Fri, 16 Dec 1000 09:21:40 GMT');
        
        var response = new Response();
        response.setHeader('last-modified', 'Fri, 16 Dec 2000 09:21:40 GMT')
        
        expect(response.isModified(request)).toBe(true);
    });
    
    it('Response - isModified #4', function(){
        var Request = require('../../lib/index.js').http.Request;
        var request = new Request();
        request.setHeader('if-modified-since', 'Fri, 16 Dec 1000 09:21:40 GMT');
        
        var response = new Response();
        
        expect(response.isModified(request)).toBe(true);
    });
    
    it('Response - isModified #5', function(){
        var Request = require('../../lib/index.js').http.Request;
        var request = new Request();
        
        var response = new Response();
        response.setHeader('last-modified', 'Fri, 16 Dec 2000 09:21:40 GMT')
        
        expect(response.isModified(request)).toBe(true);
    });
    
    

});
