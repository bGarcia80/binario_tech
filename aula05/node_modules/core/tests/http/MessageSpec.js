describe('Message', function(){
    
    var Message = null;
    
    it('require Message', function(){
    	Message = require('../../lib/index.js').http.Message;
    	expect(Message).toBeTruthy();
        
        beforeEach(function(){
            Message = require('../../lib/index.js').http.Message;
        });
	});
    
    
    it('Message - construction #1', function(){
        var params = {
            httpVersion: '1.1',
            headers: {
                Pragma: 'no-cache'
            },
            body: 'body-data'
        }
        var message = new Message();
        message.init(params);
        expect(message.getHttpVersion()).toBe('1.1');
        expect(message.getHeaders()).toEqual({pragma:['no-cache']});
        expect(message.getHeader('Pragma')).toBe('no-cache');
        expect(message.getBody()).toBe('body-data');
    });

    it('Message - construction #2', function(){
        var httpString = 'GET /index.html HTTP/1.1\r\n' +
                      'Pragma: no-cache\r\n' +
                      '\r\n' +
                      'body-data';
        var httpBuffer = new Buffer(httpString, 'binary');
        expect(function(){
            var message = new Message();
            message.initMessage(httpBuffer);
        }).toThrow();
    });
  
    it('Message - toBuffer #1', function(){
        var message = new Message();
        message.setBody('data');
        // tutaj jest cos nie tak
        expect(function(){
            message.toBuffer()
        }).toThrow();
    });
    
    it('Message - toBinaryData #1', function(){
        var message = new Message();
        expect(function(){
            // ta funkcja dziala tylko z obiektem Response
            message.toBinaryData();
        }).toThrow();
    });
    
    it('Message - setHeaders #1', function(){
        var headers = {
            pragma: 'no-cache'
        }
        var message = new Message();
        message.setHeaders(headers);
        
        expect(message.getHeaders()).toEqual({pragma:['no-cache']});
        expect(message.getHeader('Pragma')).toBe('no-cache');
    });
    
    it('Message - setHeaders #2', function(){
        var headers = {};
        var message = new Message();
        message.setHeaders(headers);
        
        expect(message.getHeaders()).toEqual({});
        expect(message.getHeader('Pragma')).toBe(null);
    });
    
    it('Message - setHeaders #3', function(){
        var message = new Message();
        expect(function () { message.setHeaders(''); }).toThrow(Message.Exception.HEADERS_HAVE_TO_BE_AN_OBJECT);
    });
    
    it('Message - setHeader #1', function(){
        var message = new Message();
        message.setHeader('Pragma', 'no-cache');
        expect(message.getHeader('pragma')).toBe('no-cache');
    });
    
    it('Message - setHeader #2', function(){
        var message = new Message();
        message.setHeader('Pragma', 'no-cache');
        expect(message.getHeader('pragma')).toBe('no-cache');
        message.setHeader('Pragma', 'private');
        expect(message.getHeader('pragma')).toEqual(['no-cache', 'private']);
    });
    
    it('Message - setHeader #3', function(){
        var message = new Message();
        message.setHeader('Pragma', 'no-cache');
        expect(message.getHeader('pragma')).toBe('no-cache');
        message.setHeader('Pragma', 'private', true);
        expect(message.getHeader('pragma')).toEqual('private');
    });
    
    xit('Message - setHeader #4', function(){
        var message = new Message();
        message.setHeader('HoSt', 'www.onet.pl');
        expect(message.getHeader('host')).toBe('www.onet.pl');
        message.setHeader('hOsT', 'onet.pl');
        expect(message.getHeader('host')).toEqual('onet.pl');
        message.setHeader('HOst', 'www.onet.pl', true);
        expect(message.getHeader('host')).toEqual('www.onet.pl');
    });
    
    xit('Message - setHeader #5', function(){
        var message = new Message();
        message.setHeader('Cookie', 'site=onet');
        expect(message.getHeader('Cookie')).toBe('site=onet');
        message.setHeader('Cookie', 'area=main');
        expect(message.getHeader('Cookie')).toEqual('area=main');
        message.setHeader('Cookie', 'noads=1&nobanner=1', true);
        expect(message.getHeader('Cookie')).toEqual('noads=1&nobanner=1');
    });
    
    it('Message - setHeader #6', function(){
        var message = new Message();
        message.setHeader('Set-Cookie', 'site=onet');
        expect(message.getHeader('Set-Cookie')).toBe('site=onet');
        message.setHeader('Set-Cookie', 'area=main');
        expect(message.getHeader('Set-Cookie')).toEqual(['site=onet', 'area=main']);
        message.setHeader('Set-Cookie', 'noads=1&nobanner=1', true);
        expect(message.getHeader('Set-Cookie')).toEqual('noads=1&nobanner=1');
    });
    
    it('Message - setHeader #7', function(){
        var message = new Message();
        message.setHeader('Pragma', 'no-cache');
        expect(message.getHeader('Pragma')).toBe('no-cache');
        message.setHeader('Pragma', 'private');
        expect(message.getHeader('Pragma')).toEqual(['no-cache', 'private']);
        message.setHeader('Pragma', 'no-cache', true);
        expect(message.getHeader('Pragma')).toEqual('no-cache');
    });
    
    it('Message - setHeader #8', function(){
        var message = new Message();
        message.setHeader('Pragma', 'no-cache, private');
        expect(message.getHeader('Pragma')).toEqual('no-cache, private');
    });
    
    it('Message - setHeader #9', function(){
        var message = new Message();
        message.setHeader('Pragma', 'no-cache, private');
        expect(message.getHeader('Pragma')).toEqual('no-cache, private');
        message.setHeader('Pragma', 'public');
        expect(message.getHeader('Pragma')).toEqual(['no-cache, private', 'public']);
    });
    
    it('Message - removeHeader #1', function(){
        var message = new Message();
        message.setHeader('Pragma', 'no-cache');
        expect(message.getHeader('Pragma')).toBe('no-cache');
        message.removeHeader('pragma');
        expect(message.getHeader('Pragma')).toEqual(null);
    });
    
    it('Message - removeHeader #1', function(){
        var message = new Message();
        message.setHeader('Pragma', 'no-cache');
        expect(message.getHeader('Pragma')).toBe('no-cache');
        message.removeHeader('pragma');
        expect(message.getHeader('Pragma')).toEqual(null);
    });
    
    it('Message - removeHeader #2', function(){
        var message = new Message();
        message.setHeader('Pragma', 'no-cache, private');
        expect(message.getHeader('Pragma')).toEqual('no-cache, private');
        message.removeHeader('pragma');
        expect(message.getHeader('Pragma')).toEqual(null);
    });
    
    it('Message - removeHeader #3', function(){
        var message = new Message();
        message.setHeader('Pragma', 'no-cache, private');
        expect(message.getHeader('Pragma')).toEqual('no-cache, private');
        message.setHeader('Pragma', 'public');
        expect(message.getHeader('Pragma')).toEqual(['no-cache, private', 'public']);
        message.removeHeader('pragma');
        expect(message.getHeader('Pragma')).toEqual(null);
    });
    
    it('Message - removeHeaders #1', function(){
        var headers = {
            pragma: 'no-cache'
        }
        var message = new Message();
        message.setHeaders(headers);
        
        expect(message.getHeaders()).toEqual({pragma:['no-cache']});
        expect(message.getHeader('Pragma')).toBe('no-cache');
        message.removeHeaders();
        expect(message.getHeader('Pragma')).toEqual(null);
    });
    
    it('Message - removeHeaders #2', function(){
        var headers = {};
        var message = new Message();
        message.setHeaders(headers);
        
        expect(message.getHeaders()).toEqual({});
        expect(message.getHeader('Pragma')).toBe(null);
        message.removeHeaders();
        expect(message.getHeader('Pragma')).toEqual(null);
    });
    
    xit('Message - setCookie #1', function(){
        var message = new Message();
        message.setCookie('ads', 'noads');
        expect(message.getCookie('ads')).toBe('noads');
    });
    
    xit('Message - setCookie #2', function(){
        var message = new Message();
        message.setCookie('ads', 'noads');
        message.setCookie('ads', 'no-ads');
        expect(message.getCookie('ads')).toBe('no-ads');
    });
    
    xit('Message - removeCookie #1', function(){
        var message = new Message();
        expect(message.getCookie('ads')).toBe(null);
        message.setCookie('ads', 'noads');
        expect(message.getCookie('ads')).toBe('noads');
        message.removeCookie('ads');
        expect(message.getCookie('ads')).toBe(null);
    });
    
    xit('Message - removeCookie #2', function(){
        var message = new Message();
        expect(message.getCookie('ads')).toBe(null);
        message.setCookie('ads', 'noads');
        message.setCookie('ads', 'no-ads');
        expect(message.getCookie('ads')).toBe('no-ads');
        message.removeCookie('ads');
        expect(message.getCookie('ads')).toBe(null);
    });

});
