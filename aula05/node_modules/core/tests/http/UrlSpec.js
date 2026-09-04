var url
describe('Url', function () {
    it('require', function () {
    	url = require('../../lib/http/Url.js');
    	expect(url).toBeTruthy();        
	});
       
    it('shoud create new instance', function () {
		var Url = url.Url;
        expect(function(){
            new Url();
        }).not.toThrow();
    });
});