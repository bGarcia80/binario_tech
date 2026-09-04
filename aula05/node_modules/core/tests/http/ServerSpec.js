var Server;
describe('Server', function () {
    it('require', function () {
        Server = require('../../lib/http/Server.js').Server;
        expect(Server).toBeTruthy();
    })
});