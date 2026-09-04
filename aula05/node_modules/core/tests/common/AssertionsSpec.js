describe('Assertions', function () {
    var Assertions = require('../../lib/common/Assertions.js').Assertions;
    it('require', function () {
        expect(Assertions).toBeTruthy();
    })
    
    it('isArray', function () {
        expect(function () {
            Assertions.isArray(new Array());
        }).not.toThrow();
        
        expect(function () {
            Assertions.isArray(true);
        }).toThrow();
        
        expect(function () {
            Assertions.isArray(new Date());
        }).toThrow();
        
        expect(function () {
            Assertions.isArray(function () {});
        }).toThrow();
        
        expect(function () {
            Assertions.isArray(1);
        }).toThrow();
        
        expect(function () {
            Assertions.isArray(new Object());
        }).toThrow(); 

        expect(function () {
            Assertions.isArray(new RegExp('a'));
        }).toThrow();

        expect(function () {
            Assertions.isArray('a');
        }).toThrow();
    })
    
    it('isBoolean', function () {
        expect(function () {
            Assertions.isBoolean(new Array());
        }).toThrow();
        
        expect(function () {
            Assertions.isBoolean(true);
        }).not.toThrow();
        
        expect(function () {
            Assertions.isBoolean(new Date());
        }).toThrow();
        
        expect(function () {
            Assertions.isBoolean(function () {});
        }).toThrow();
        
        expect(function () {
            Assertions.isBoolean(1);
        }).toThrow();
        
        expect(function () {
            Assertions.isBoolean(new Object());
        }).toThrow(); 

        expect(function () {
            Assertions.isBoolean(new RegExp('a'));
        }).toThrow();

        expect(function () {
            Assertions.isBoolean('a');
        }).toThrow();
    });
    
    it('isDate', function () {
        expect(function () {
            Assertions.isDate(new Array());
        }).toThrow();
        
        expect(function () {
            Assertions.isDate(true);
        }).toThrow();
        
        expect(function () {
            Assertions.isDate(new Date());
        }).not.toThrow();
        
        expect(function () {
            Assertions.isDate(function () {});
        }).toThrow();
        
        expect(function () {
            Assertions.isDate(1);
        }).toThrow();
        
        expect(function () {
            Assertions.isDate(new Object());
        }).toThrow(); 

        expect(function () {
            Assertions.isDate(new RegExp('a'));
        }).toThrow();

        expect(function () {
            Assertions.isDate('a');
        }).toThrow();
    });
    
    it('isFunction', function () {
        expect(function () {
            Assertions.isFunction(new Array());
        }).toThrow();
        
        expect(function () {
            Assertions.isFunction(true);
        }).toThrow();
        
        expect(function () {
            Assertions.isFunction(new Date());
        }).toThrow();
        
        expect(function () {
            Assertions.isFunction(function () {});
        }).not.toThrow();
        
        expect(function () {
            Assertions.isFunction(1);
        }).toThrow();
        
        expect(function () {
            Assertions.isFunction(new Object());
        }).toThrow(); 

        expect(function () {
            Assertions.isFunction(new RegExp('a'));
        }).toThrow();

        expect(function () {
            Assertions.isFunction('a');
        }).toThrow();
    });
    
    it('isObject', function () {
        expect(function () {
            Assertions.isObject(new Array());
        }).toThrow();
        
        expect(function () {
            Assertions.isObject(true);
        }).toThrow();
        
        expect(function () {
            Assertions.isObject(new Date());
        }).toThrow();
        
        expect(function () {
            Assertions.isObject(function () {});
        }).toThrow();
        
        expect(function () {
            Assertions.isObject(1);
        }).toThrow();
        
        expect(function () {
            Assertions.isObject(new Object());
        }).not.toThrow(); 

        expect(function () {
            Assertions.isObject(new RegExp('a'));
        }).toThrow();

        expect(function () {
            Assertions.isObject('a');
        }).toThrow();
    });
    
    it('isRegExp', function () {
        expect(function () {
            Assertions.isRegExp(new Array());
        }).toThrow();
        
        expect(function () {
            Assertions.isRegExp(true);
        }).toThrow();
        
        expect(function () {
            Assertions.isRegExp(new Date());
        }).toThrow();
        
        expect(function () {
            Assertions.isRegExp(function () {});
        }).toThrow();
        
        expect(function () {
            Assertions.isRegExp(1);
        }).toThrow();
        
        expect(function () {
            Assertions.isRegExp(new Object());
        }).toThrow(); 

        expect(function () {
            Assertions.isRegExp(new RegExp('a'));
        }).not.toThrow();

        expect(function () {
            Assertions.isRegExp('a');
        }).toThrow();
    });    
    
    it('isNumber', function () {
        expect(function () {
            Assertions.isNumber(new Array());
        }).toThrow();
        
        expect(function () {
            Assertions.isNumber(true);
        }).toThrow();
        
        expect(function () {
            Assertions.isNumber(new Date());
        }).toThrow();
        
        expect(function () {
            Assertions.isNumber(function () {});
        }).toThrow();
        
        expect(function () {
            Assertions.isNumber(1);
        }).not.toThrow();
        
        expect(function () {
            Assertions.isNumber(new Object());
        }).toThrow(); 

        expect(function () { 
            Assertions.isNumber(new RegExp('a'));
        }).toThrow();

        expect(function () { 
            Assertions.isNumber('a');
        }).toThrow();
    });    
    
    it('isString', function () {
        expect(function () { 
            Assertions.isString(new Array());
        }).toThrow();
        
        expect(function () { 
            Assertions.isString(true);
        }).toThrow();
        
        expect(function () { 
            Assertions.isString(new Date());
        }).toThrow();
        
        expect(function () { 
            Assertions.isString(function () {});
        }).toThrow();
        
        expect(function () { 
            Assertions.isString(1);
        }).toThrow();
        
        expect(function () { 
            Assertions.isString(new Object());
        }).toThrow(); 

        expect(function () { 
            Assertions.isString(new RegExp('a'));
        }).toThrow();

        expect(function () { 
            Assertions.isString('a');
        }).not.toThrow();
    });    
})