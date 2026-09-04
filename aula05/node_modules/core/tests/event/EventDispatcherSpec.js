describe('EventDispatcher', function(){
    
    var Event = null;
    var EventDispatcher = null;
    
    var eventDispatcher = null;
    var event = null;  
    
    it('requirements', function(){
	    Event = require('../../lib/index.js').event.Event;
	    EventDispatcher = require('../../lib/index.js').event.EventDispatcher;
	    	
	    expect(Event).not.toBeNull();
	    expect(EventDispatcher).not.toBeNull();		
		
		beforeEach(function(){
	        eventDispatcher = new EventDispatcher();
	        event = new Event('test');
    	});
    });
       
    it('addEventListener / add same listener twice"', function(){
        runs(function(){
            this.test = false;
            var that = this;
            this.callbackFunction = function(e){
                that.test = true;
            };
            eventDispatcher.addEventListener('test', this.callbackFunction, this);
            expect(
                eventDispatcher.addEventListener('test', this.callbackFunction, this)
            ).toBeFalsy();
            eventDispatcher.dispatchEvent(new Event('test')); 
        });
        waits(0);//testing in next tick
        runs(function(){
            expect(this.test).toBeTruthy();
        });
    });
    it('single addEventListener / dispatchEvent in "next tick"', function(){
        runs(function(){
            this.test = false;
            var that = this;
            this.callbackFunction = function(e){
                that.test = true;
            };
            eventDispatcher.addEventListener('test', this.callbackFunction);
            eventDispatcher.dispatchEvent(new Event('test')); 
        });
        waits(0);//testing in next tick
        runs(function(){
            expect(this.test).toBeTruthy();
        });
    });
    it('multiple addEventListener / dispatchEvent in "next tick"', function(){
        runs(function(){
            this.test1 = false;
            this.test2 = false;
            this.test3 = false;
            
            var that = this;
            
            this.callbackFunction1 = function(e){
                that.test1 = true;
            };
            this.callbackFunction2 = function(e){
                that.test2 = true;
            };
            this.callbackFunction3 = function(e){
                that.test3 = true;
            };
            
            
            eventDispatcher.addEventListener('test', that.callbackFunction1);
            eventDispatcher.addEventListener('test', that.callbackFunction2);
            eventDispatcher.addEventListener('test', this.callbackFunction3);
            
            eventDispatcher.dispatchEvent(new Event('test')); 
        });
        waits(1);//testing in next tick
        runs(function(){
            expect(this.test1).toBeTruthy();
            expect(this.test2).toBeTruthy();
            expect(this.test3).toBeTruthy();
        });
    });    
    it('hasEventListener', function(){
        this.test1 = false;
        this.test2 = false;
        this.test3 = false;
            
        var that = this;
            
        this.callbackFunction1 = function(e){
            that.test1 = true;
        };
               
        eventDispatcher.addEventListener('test1', this.callbackFunction1);
            
        expect(eventDispatcher.hasEventListener('test1')).toBeTruthy();
        expect(eventDispatcher.hasEventListener('none')).toBeFalsy();
        expect(eventDispatcher.hasEventListener(undefined)).toBeFalsy();
        expect(eventDispatcher.hasEventListener(null)).toBeFalsy();    
    });
    it('removeEventListener', function(){
        runs(function(){
            this.test1 = false;
            this.test2 = false;
            this.test3 = false;
            
            var that = this;
            
            this.callbackFunction1 = function(e){
                that.test1 = true;
            };
            this.callbackFunction2 = function(e){
                that.test2 = true;
            };
            this.callbackFunction3 = function(e){
                that.test3 = true;
            };
            
            
            eventDispatcher.addEventListener('test', this.callbackFunction1);
            eventDispatcher.addEventListener('test', this.callbackFunction2);
            eventDispatcher.addEventListener('test', this.callbackFunction3);
            
            eventDispatcher.removeEventListener('test', this.callbackFunction2);
            
            eventDispatcher.dispatchEvent(new Event('test')); 
        });
        waits(1);//testing in next tick
        runs(function(){
            expect(this.test1).toBeTruthy();
            expect(this.test2).toBeFalsy();
            expect(this.test3).toBeTruthy();
        });
    });

    it('removeEventListener not existing type', function(){
        this.test1 = false;
        this.test2 = false;
        this.test3 = false;
            
        var that = this;
            
        this.callbackFunction1 = function(e){
            that.test1 = true;
        };

        eventDispatcher.addEventListener('test', this.callbackFunction1);
 
        expect(function(){
            eventDispatcher.removeEventListener('test_not_existing', this.callbackFunction1);
        }).toThrow('Listeners of given type: "test_not_existing" do not exists.');            
    });
    
    it('removeEventListener not existing callback', function(){
        this.test1 = false;
        this.test2 = false;
            
        var that = this;
            
        this.callbackFunction1 = function(e){
            that.test1 = true;
        };
        this.callbackFunction2 = function(e){
            that.test2 = true;
        };

        eventDispatcher.addEventListener('test', this.callbackFunction1);
 
        expect(
            eventDispatcher.removeEventListener('test', this.callbackFunction2)
        ).toEqual(false);            
    });
    
    it('removeAllEventListeners with type', function(){
        runs(function(){
            this.test1 = false;
            this.test2 = false;
            this.test3 = false;
            
            var that = this;
            
            this.callbackFunction1 = function(e){
                that.test1 = true;
            };
            this.callbackFunction2 = function(e){
                that.test2 = true;
            };
            this.callbackFunction3 = function(e){
                that.test3 = true;
            };
            
            
            eventDispatcher.addEventListener('test', this.callbackFunction1);
            eventDispatcher.addEventListener('test', this.callbackFunction2);
            eventDispatcher.addEventListener('test2', this.callbackFunction3);
            
            eventDispatcher.removeAllEventListeners('test');
            
            eventDispatcher.dispatchEvent(new Event('test')); 
            eventDispatcher.dispatchEvent(new Event('test2'));
        });
        waits(1);//testing in next tick
        runs(function(){
            expect(this.test1).toBeFalsy();
            expect(this.test2).toBeFalsy();
            expect(this.test3).toBeTruthy();
        });
    });
    
    it('removeAllEventListeners without type', function(){
        runs(function(){
            this.test1 = false;
            this.test2 = false;
            this.test3 = false;
            
            var that = this;
            
            this.callbackFunction1 = function(e){
                that.test1 = true;
            };
            this.callbackFunction2 = function(e){
                that.test2 = true;
            };
            this.callbackFunction3 = function(e){
                that.test3 = true;
            };
            
            
            eventDispatcher.addEventListener('test', this.callbackFunction1);
            eventDispatcher.addEventListener('test', this.callbackFunction2);
            eventDispatcher.addEventListener('test2', this.callbackFunction3);
            
            eventDispatcher.removeAllEventListeners();
            
            eventDispatcher.dispatchEvent(new Event('test')); 
            eventDispatcher.dispatchEvent(new Event('test2'));
        });
        waits(0);//testing in next tick
        runs(function(){
            expect(this.test1).toBeFalsy();
            expect(this.test2).toBeFalsy();
            expect(this.test3).toBeFalsy();
        });
    });
    
    it('removeAllEventListeners with not existing type', function(){
        this.test1 = false;
        this.test2 = false;
        this.test3 = false;
        
        var that = this;
        
        this.callbackFunction1 = function(e){
            that.test1 = true;
        };
        this.callbackFunction2 = function(e){
            that.test2 = true;
        };
        this.callbackFunction3 = function(e){
            that.test3 = true;
        };
        
        
        eventDispatcher.addEventListener('test', this.callbackFunction1);
        eventDispatcher.addEventListener('test', this.callbackFunction2);
        eventDispatcher.addEventListener('test2', this.callbackFunction3);
        
        expect(function(){
            eventDispatcher.removeAllEventListeners('niema');
        }).toThrow('Listeners of given type: "niema" do not exists.');
        
    });
    
    it('dispatching event for same function but different context', function(){
        runs(function(){
            this.test = 0;
            
            var that = this;
            
            var callbackFunction = function(e){
                this.test++;
            };
            
            this.context1 = {
                test : 0,
                callback : callbackFunction 
            };
            
            this.context2 = {
                test : 0,
                callback : callbackFunction  
            };
            
            eventDispatcher.addEventListener('test', this.context1.callback, this.context1);
            eventDispatcher.addEventListener('test', this.context2.callback, this.context2);
            
            eventDispatcher.dispatchEvent(new Event('test')); 
        });
        waits(0);//testing in next tick
        runs(function(){
            expect(this.context1.test).toEqual(1);
            expect(this.context2.test).toEqual(1);
        });
    });
    it('addEventListener / dispatchEvent - with undefined callback function"', function(){
        this.test = false;
        var that = this;
        var e = new Event('test');
        this.callbackFunction = undefined;
        eventDispatcher.addEventListener('test', this.callbackFunction, this);
        expect(function(){
            eventDispatcher.dispatchEvent(e);
        }).toThrow("Callback function for Event type: [ " + e.type + " ] is undefined. Please check your addEventListener statement.");
    });
});