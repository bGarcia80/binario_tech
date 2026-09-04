var rewire = require('rewire');
var modulePath = '../../lib/client/S3Client.js';

describe('S3Client', function () {
    describe('require', function () {
        it('should be truthy', function () {
            var S3Client = require(modulePath).S3Client;
            expect(S3Client).toBeTruthy();
        });
        it('should not throw exception ', function () {
            expect(function () {
                var S3Client = require(modulePath).S3Client;
            }).not.toThrow();
        });
    });

    describe('methods', function () {
        var S3ClientMock;
        var S3Client;

        beforeEach(function () {
            S3ClientMock = rewire(modulePath);
            S3Client = S3ClientMock.S3Client;
        });
    });
});