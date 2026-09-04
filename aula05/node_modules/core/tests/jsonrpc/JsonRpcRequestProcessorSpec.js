var JsonRpcMethod = require('../../lib/jsonrpc/JsonRpcMethod.js').JsonRpcMethod;
var JsonRpcRequest = require('../../lib/jsonrpc/JsonRpcRequest.js').JsonRpcRequest;
var RequestProcessor = require('../../lib/http/RequestProcessor.js').RequestProcessor;
var Response = require('../../lib/http/Response.js').Response;
var Request = require('../../lib/http/Request.js').Request;
var Event = require('../../lib/event/Event.js').Event;
describe('JsonRpcRequestProcessor', function () {
    var JsonRpcRequestProcessor;
    var Testmethod,
        request,
        response,
        server,
        processor;
    it('require', function () {
        var test;
        expect(function () {
            test = require('../../lib/jsonrpc/JsonRpcRequestProcessor.js').JsonRpcRequestProcessor;
        }).not.toThrow();
        expect(test).toBeTruthy();
    });
    beforeEach(function () {
            JsonRpcRequestProcessor = require('../../lib/jsonrpc/JsonRpcRequestProcessor.js').JsonRpcRequestProcessor;
            var requestProcessor = spyOn(RequestProcessor.prototype, 'process').andCallFake( function (req, resp) {
                }
            );
            Testmethod = function (request, response, server) {
                JsonRpcMethod.call(this, request, response, server);
            };

            Testmethod.prototype = Object.create(JsonRpcMethod.prototype);
            Testmethod.prototype.execute = function (params) {
                var result = {
                    test: 'OK',
                    time: new Date(),
                    rand: Math.random(),
                    params: params
                };

                var retEvent = new Event(JsonRpcMethod.Event.OK, result);
                this.dispatchEvent(retEvent);
            };

            server = {
                getMethod: jasmine.createSpy()
            };
            server.getMethod.andCallFake(function (methodname) {
                return Testmethod;
            });
            request = new Request();
            spyOn(request, 'getMethod').andCallFake(function() { return'POST';});
            spyOn(request, 'getPath').andCallFake(function () {return '/';});
            spyOn(request, 'getHttpVersion').andCallFake(function () {
                    return '1.0';
                });
            spyOn(request, 'getClientAddress').andCallFake(function () { return '';});
            spyOn(request, 'getClientPort').andCallFake(function () { return "0";});
            response = new Response();
            spyOn(response, 'addEventListener').andCallFake(function() {});
            spyOn(response, 'setStatusCode').andCallFake(function() {});
            spyOn(response, 'setHeaders').andCallFake(function() {});
            spyOn(response, 'setBody').andCallFake(function() {});
            spyOn(response, 'send').andCallFake(function() {});

            spyOn(process, 'nextTick').andCallFake(function (cb) {cb();});
            
            processor = new JsonRpcRequestProcessor(server);
            spyOn(processor, '_handleError').andCallThrough();
            spyOn(processor, '_success').andCallThrough();
            spyOn(processor, '_throwError').andCallThrough();
    
    });
    describe('one Request', function () {
        beforeEach(function () {
            spyOn(request, 'getBody').andCallFake(function () {
                var request_body = {
                    toBuffer: function () {
                            var string = { toString:function () {
                            var stringjson = (new JsonRpcRequest({'id': '1', 'method': 'get', 'params': 'test_ok'})).toString();
                                return stringjson;
                                //     '\"params\": {}}';
                            }
                                };
                            return string;
                            }
                            };
                return request_body;
            });
        });
        it(' succes', function () {
            processor.process(request, response);
            expect(response.setStatusCode).toHaveBeenCalled();
            expect(response.setStatusCode.calls[0].args[0]).toEqual(200);
            expect(response.setBody.calls[0].args[0]).toBeDefined();
            expect(response.send).toHaveBeenCalled();
            expect(process.nextTick).toHaveBeenCalled();
            expect(processor._success).toHaveBeenCalled();
            expect(processor._handleError).not.toHaveBeenCalled();
            expect(processor._throwError).not.toHaveBeenCalled();
        });

        it(' error', function () {

            Testmethod.prototype.execute = function (params) {
                var result = {
                    test: 'OK',
                    time: new Date(),
                    rand: Math.random(),
                    params: params
                };

                var retEvent = new Event(JsonRpcMethod.Event.ERROR, result);
                this.dispatchEvent(retEvent);
            };

            processor.process(request, response);
            expect(response.setStatusCode).toHaveBeenCalled();
            expect(response.setBody.calls[0].args[0]).toBeDefined();
            expect(response.send).toHaveBeenCalled();
            expect(process.nextTick).toHaveBeenCalled();
            expect(processor._success).not.toHaveBeenCalled();
            expect(processor._handleError).toHaveBeenCalled();
            expect(processor._throwError).toHaveBeenCalled();
        });
        it('error method not found', function () {
            server.getMethod.andCallFake(function (methodname) {
                return null;
            });
            processor.process(request, response);
            expect(response.setStatusCode).toHaveBeenCalled();
            expect(response.setBody.calls[0].args[0]).toBeDefined();
            expect(response.send).toHaveBeenCalled();
            expect(process.nextTick).toHaveBeenCalled();
            expect(processor._throwError.calls[0].args[0]).toEqual(JsonRpcRequestProcessor.Errors.METHOD_NOT_FOUND);
        
        });
    });
    describe('batch Request', function () {
        beforeEach(function () {
            spyOn(request, 'getBody').andCallFake(function () {
                var request_body = {
                    toBuffer: function () {
                            var string = { toString:function () {
                                // return '{\"jsonrpc\": \"2.0\",'+
                                //     '\"id\": \"example\",'+
                                //     '\"method\": \"get\",'+
                                var stringjson = (new JsonRpcRequest({'id': '1', 'method': 'get', 'params': 'test_ok'})).toString();
                                return '[' + stringjson +','+ stringjson+ ']';
                                //     '\"params\": {}}';
                            }
                                };
                            return string;
                            }
                            };
                return request_body;
            });
        });
        it('succes', function () {
            processor.process(request, response);
            expect(response.setStatusCode).toHaveBeenCalled();
            expect(response.setBody.calls[0].args[0]).toBeDefined();
            expect(response.send).toHaveBeenCalled();
            expect(process.nextTick).toHaveBeenCalled();
            expect(processor._success).toHaveBeenCalled();
            expect(processor._success.calls.length).toEqual(2);
            expect(processor._handleError).not.toHaveBeenCalled();
            expect(processor._throwError).not.toHaveBeenCalled();
        });

        it('error', function () {

            Testmethod.prototype.execute = function (params) {
                var result = {
                    test: 'OK',
                    time: new Date(),
                    rand: Math.random(),
                    params: params
                };

                var retEvent = new Event(JsonRpcMethod.Event.ERROR, result);
                this.dispatchEvent(retEvent);
            };

            processor.process(request, response);
            expect(response.setStatusCode).toHaveBeenCalled();
            expect(response.setBody.calls[0].args[0]).toBeDefined();
            expect(response.send).toHaveBeenCalled();
            expect(process.nextTick).toHaveBeenCalled();
            expect(processor._success).not.toHaveBeenCalled();
            expect(processor._handleError.calls.length).toEqual(2);
            expect(processor._throwError).toHaveBeenCalled();
        });
    });

        it('invalid request', function () {
            spyOn(request, 'getBody').andCallFake(function () {
                var request_body = {
                    toBuffer: function () {
                            var string = { toString:function () {
                                var stringjson = '{\"id\":\"1\",\"methaod\":\"get\",\"params\":\"test_ok\"}';

                                var stringjson2 = (new JsonRpcRequest({'id': '1', 'method': 'get', 'params': 'test_ok'})).toString();
                                return '[' + stringjson +','+ stringjson2+ ']';
                                
                                //     '\"params\": {}}';
                            }
                                };
                            return string;
                            }
                            };
                return request_body;
            });
            Testmethod.prototype.execute = function (params) {
                var result = {
                    test: 'OK',
                    time: new Date(),
                    rand: Math.random(),
                    params: params
                };

                var retEvent = new Event(JsonRpcMethod.Event.OK, result);
                this.dispatchEvent(retEvent);
            };

            processor.process(request, response);
            expect(response.setStatusCode).toHaveBeenCalled();
            expect(response.setBody.calls[0].args[0]).toBeDefined();
            expect(response.send).toHaveBeenCalled();
            expect(process.nextTick).toHaveBeenCalled();
            expect(processor._success.calls.length).toEqual(1);
            expect(processor._throwError).toHaveBeenCalled();
            expect(processor._throwError.calls[0].args[0]).toEqual(JsonRpcRequestProcessor.Errors.INVALID_REQUEST);
        });
        it('parse error', function () {
            spyOn(request, 'getBody').andCallFake(function () {
                var request_body = {
                    toBuffer: function () {
                            var string = { toString:function () {
                                var stringjson = '{\"id\":\"1\",\"methaod\":\"get\",\"params\":\"test_ok\"}';

                                var stringjson2 = (new JsonRpcRequest({'id': '1', 'method': 'get', 'params': 'test_ok'})).toString();
                                return '[' + stringjson +  stringjson2+ ']';
                                
                                //     '\"params\": {}}';
                            }
                                };
                            return string;
                            }
                            };
                return request_body;
            });
            Testmethod.prototype.execute = function (params) {
                var result = {
                    test: 'OK',
                    time: new Date(),
                    rand: Math.random(),
                    params: params
                };

                var retEvent = new Event(JsonRpcMethod.Event.OK, result);
                this.dispatchEvent(retEvent);
            };

            processor.process(request, response);
            expect(response.setStatusCode).toHaveBeenCalled();
            expect(response.send).toHaveBeenCalled();
            expect(process.nextTick).toHaveBeenCalled();
            expect(processor._success.calls.length).toEqual(0);
            expect(processor._throwError).toHaveBeenCalled();
            expect(processor._throwError.calls[0].args[0]).toEqual(JsonRpcRequestProcessor.Errors.PARSE_ERROR);
        });
});
