var rewire = require('rewire');
var modulePath = '../../../lib/client/rabbitmq/RbmqConnection.js';
//set debug mode (workaround for rewire)
process.env['NODE_DEBUG_AMQP'] = true;

// var RbmqConnection = require('../../../lib/client/rabbitmq/RbmqConnection.js').RbmqConnection;
describe('RbmqConnection', function () {
    var RbmqConnection = null;
    var RbmqConnectionMock = null;

    it('require', function () {
        RbmqConnection = require(modulePath).RbmqConnection;

        expect(RbmqConnection).toBeTruthy();
    });

    beforeEach(function () {
        RbmqConnectionMock = rewire(modulePath);
        RbmqConnection = RbmqConnectionMock.RbmqConnection;

        this._mockClient = {
            eventsMock : {},
            createConnection : function() {
                console.log('create connection');
                if (typeof this.eventsMock.connect === 'function') {
                    this.eventsMock.connect();
                }

                return this;
            },
            on : function(event, cb) {
                this.eventsMock[event] = cb;
            }
        };

        RbmqConnectionMock.__set__('amqp', this._mockClient);
    });

    it('connect with weight', function () {

        var hosts = [{
            host: '127.0.0.1',
            port: 12345,
            weight: 1
        }, {
            host: '127.0.0.2',
            port: 12345,
            weight: 2
        }, {
            host: '127.0.0.3',
            port: 12345,
            weight: 3
        }];

        var createConnection = jasmine.createSpy();
        createConnection.andCallFake(function (config) {
            expect(config).toEqual(hosts[2]);
            return this;
        });

        RbmqConnectionMock.__set__('createConnection', createConnection);

        var connection = new RbmqConnection({
            enableHostWeight: true,
            hosts: hosts
        });

        connection.connect();

    });
});