describe('ErrorEvent', function(){
    var ErrorEvent = null
    it('require ErrorEvent', function(){
    	ErrorEvent = require('../../lib/event/ErrorEvent.js').ErrorEvent;
    	expect(ErrorEvent).not.toBeNull();
	});
    var ee, msg = "error ocured";
    it('ErrorEvent - creation', function(){
        ee = new ErrorEvent('test', 'data', 13, msg);
        expect(ee.type).toEqual('test');
        expect(ee.data).toEqual('data');
        expect(ee.code).toEqual(13);
        expect(ee.message).toEqual(msg);
    });

    it('ErrorEvent - toHtmlString', function(){
        expect(ee.toHtmlString()).toEqual("<pre>\ttype: test\n\tdata: data\n\ttarget: undefined\n\tcode: 13\n\tmessage: error ocured\n</pre>");
    });

});
