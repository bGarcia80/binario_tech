var Socket;
describe('Socket', function () {
    it('require', function () {
        Socket = require('../../lib/http/Socket.js').Socket;
        expect(Socket).toBeTruthy();
    })
})