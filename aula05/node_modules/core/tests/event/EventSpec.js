describe('Event', function(){
    
    var Event = null;
    
	it('requirements', function(){
        Event = require('../../lib/event/Event.js').Event;
    	expect(Event).not.toBeNull();
    });
    
    it('Event - creation', function(){
        var e = new Event('test', 'data', this);
        expect(e.type).toEqual('test');
        expect(e.data).toEqual('data');
        expect(e.target).toEqual(this);
    });

});
