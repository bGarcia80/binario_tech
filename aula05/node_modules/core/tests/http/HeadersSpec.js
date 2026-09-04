var headers, baseHeaders = {}, baseHeadersStr;

var Headers = require(__dirname + '/../../lib/http/Headers.js').Headers;

describe("Core/Net/Headers", function () {
    beforeEach(function () {
        baseHeadersStr = JSON.stringify({
            "content-encoding": [1,2,3]
        });
        baseHeaders = JSON.parse(baseHeadersStr);
        headers = new Headers(baseHeaders);
    });

    it("setHeader", function () {
        expect(headers.setHeader("content-encoding", 4)).toBe(headers);
        expect(headers.setHeader("transfer", "chunked")).toBe(headers);

        expect(headers.getHeader("content-encoding")).toEqual([1 ,2, 3, 4]);
        expect(headers.getHeader("transfer")).toEqual("chunked");

        expect(baseHeaders).toEqual(JSON.parse(baseHeadersStr));
    });

    it("removeHeader", function () {
       expect(headers.removeHeader("content-encoding")).toBeTruthy();
       expect(headers.removeHeader("transfer")).toBeFalsy();

       expect(headers.getHeader("content-encoding")).toBeNull();
       expect(baseHeaders).toEqual(JSON.parse(baseHeadersStr));
    });

    it("getHeader", function () {
        expect(headers.setHeader("a", 1)).toBe(headers);
        expect(headers.setHeader("B", [1])).toBe(headers);
        expect(headers.setHeader("C", [1 ,2])).toBe(headers);

        expect(headers.removeHeader("content-encoding")).toBeTruthy();

        expect(headers.getHeader("a")).toEqual(1);
        expect(headers.getHeader("b")).toEqual(1);
        expect(headers.getHeader("c")).toEqual([1, 2]);
        expect(headers.getHeader("content-encoding")).toBeNull();
        expect(headers.getHeader("d")).toBeNull();

        expect(baseHeaders).toEqual(JSON.parse(baseHeadersStr));
    });

    it("getHeader", function () {
        expect(headers.setHeader("a", 1)).toBe(headers);
        expect(headers.setHeader("B", [1])).toBe(headers);
        expect(headers.setHeader("C", [1 ,2])).toBe(headers);

        expect(headers.removeHeader("content-encoding")).toBeTruthy();

        expect(headers.getRawHeader("a")).toEqual([1]);
        expect(headers.getRawHeader("b")).toEqual([1]);
        expect(headers.getRawHeader("c")).toEqual([1, 2]);
        expect(headers.getRawHeader("content-encoding")).toBeNull();
        expect(headers.getRawHeader("d")).toBeNull();

        expect(baseHeaders).toEqual(JSON.parse(baseHeadersStr));
    });

    it("getHeaders", function () {
        expect(headers.setHeader("A", 1)).toBe(headers);
        expect(headers.setHeader("b", [1])).toBe(headers);
        expect(headers.setHeader("c", [1 ,2])).toBe(headers);

        expect(headers.removeHeader("content-encoding")).toBeTruthy();

        expect(headers.getHeaders()).toEqual({
            "a": [1],
            "b": [1],
            "c": [1, 2]
        });

        expect(baseHeaders).toEqual(JSON.parse(baseHeadersStr));
    });
});
