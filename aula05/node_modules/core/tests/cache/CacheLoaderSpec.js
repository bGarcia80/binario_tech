var CacheLoder;
describe('CacheLoader', function () {
	it('require', function () {
		CacheLoader = require('../../lib/cache/CacheLoader.js').CacheLoader;
        expect(CacheLoader).toBeTruthy();
	});
});