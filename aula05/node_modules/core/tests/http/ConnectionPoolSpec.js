var ConnectionPool;
describe('ConnectionPool', function () {
	it('require', function () {
		ConnectionPool = require('../../lib/http/ConnectionPool.js').ConnectionPool;
        expect(ConnectionPool).toBeTruthy();
	});
});