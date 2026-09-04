describe("CredentialsProvider", function () {
    
    it("conceptual example usage", function () {
        var CredentialsProvider = require('../../lib/credentials/CredentialsProvider.js').CredentialsProvider; 
        expect(CredentialsProvider).not.toBeNull();
        
        
        var done = false;
        
        var ExampleCredentialClient = function (credentialsProvider) {
            this.credentialsProvider = credentialsProvider;
            //this.credentialsProvider.addEventListener(CredentialsProvider.Event.LOAD, this._onCredentialsLoad, this);
            
            this._credentials = null;
        }
        ExampleCredentialClient.prototype._onCredentialsLoad = function (e) {
            this._credentials = e.data;
            //creating pool itd
            
        };
        ExampleCredentialClient.prototype.get = function (key, callback) {
            //getting from pool itd
            this.credentialsProvider.get(function (err, credentials) {
                if (credentials) {
                    callback(credentials);   
                } else {
                //have to wait   
                }
            });
        };
        
        //test
        var credentials = {host: "test.onet", port: 9090};
        var provider = new CredentialsProvider(credentials);
        var exampleClient = new ExampleCredentialClient(provider);
        exampleClient.get("test", function (credentials2) {
            expect(credentials2).toBe(credentials);
            done = true;
        });
        
        waitsFor(function () {
            return done == true;
        });

    });
});