describe('Random', function () {
    var Random;
    it('require', function () {
        expect(function () {
            Random = require('../../lib/common/Random.js').Random;
        }).not.toThrow();
        expect(Random).toBeTruthy();
    })
    
    it('random string', function () {
        var s1 = Random.randomString();
        expect(s1).toBeTruthy();
        var s2 = Random.randomString(10);
        expect(s2.length).toEqual(10);
        var s3 = Random.randomString(20);
        expect(s3.length).toEqual(20);
        var s4 = Random.randomString(5, Random.digits);
        expect(s4.length).toEqual(5);
        expect(parseInt(s4)).not.toEqual(NaN);
        var s5 = Random.randomString();
        expect(parseInt(s5, 36)).not.toEqual(NaN);
    });
    
    it('random integer', function () {
        var i1 = Random.randomInt();
        expect(i1).toBeLessThan(100000);
        expect(i1).toBeGreaterThan(-1);
        var i2 = Random.randomInt(100);
        expect(i2).toBeLessThan(101);
        expect(i2).toBeGreaterThan(-1);
        var i3 = Random.randomInt(10, 5);
        expect(i3).toBeLessThan(11);
        expect(i3).toBeGreaterThan(4);
    });
})