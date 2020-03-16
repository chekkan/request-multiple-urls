const requestMultipleUrls = require(".");
const https = require("https");
const http = require("http");
const {EventEmitter} = require("events");

describe("requestMultipleUrls", () => {

    beforeEach(() => {
        const defaultHandler = (uri, callback) => {
            const httpIncomingMessage = new EventEmitter();
            httpIncomingMessage.statusCode = 200;
            httpIncomingMessage.headers = {'content-type': "application/json"};
            callback(httpIncomingMessage);
            httpIncomingMessage.emit("data", "{}");
            httpIncomingMessage.emit("end");
            return new EventEmitter();
        };
        https.get = jest.fn().mockImplementation(defaultHandler);
        http.get = jest.fn().mockImplementation(defaultHandler);
    });

    test('with undefined returns promise with empty array', async () => {
        const result = await requestMultipleUrls();
        expect(result).toEqual([]);
    });

    test.each([["https://foo.bar/baz.json", {foo: "bar"}], ["https://google.com", {baz: "corge"}]])
    ('with url %s returns content', async (url, json) => {
        const urls = [url];
        https.get = jest.fn().mockImplementation((uri, callback) => {
            const httpIncomingMessage = new EventEmitter();
            httpIncomingMessage.headers = {'content-type': "application/json"};
            callback(httpIncomingMessage);
            httpIncomingMessage.emit("data", JSON.stringify(json));
            httpIncomingMessage.emit("end");
            return new EventEmitter();
        });

        const result = await requestMultipleUrls(urls);
        expect(result).toEqual([{contentType: "application/json", json}]);
    });

    test("multiple urls with successful response", async () => {
        const urls = ["https://google.com", "https://ft.com"];
        const responseBodies = [{foo: "bar"}, {baz: "quux"}];
        let i = 0;
        https.get = jest.fn().mockImplementation((uri, callback) => {
            const httpIncomingMessage = new EventEmitter();
            httpIncomingMessage.headers = {'content-type': "application/json"};
            callback(httpIncomingMessage);
            httpIncomingMessage.emit("data", JSON.stringify(responseBodies[i++]));
            httpIncomingMessage.emit("end");
            return new EventEmitter();
        });

        const result = await requestMultipleUrls(urls);
        let expected = responseBodies.map(body => ({contentType: "application/json", json: body}));
        expect(result).toEqual(expected);
    });

    test.each([["foo", 1, "example.com"], ["bar", "baz", "https://ft.com"]])
    ("at least 1 invalid url in %s throws", async (...urls) => {
        const invalids = urls.map((u) => {
            try {
                new URL(u);
            } catch (err) {
                return u
            }
        }).filter(e => e);
        const msg = `Invalid URLs: ${invalids.join(", ")}`;
        expect.assertions(1);
        try {
            await requestMultipleUrls(urls);
        } catch (err) {
            expect(err).toEqual(new TypeError(msg))
        }
    });

    test("handles non json response", async () => {
        const urls = ["https://google.com"];
        const contentType = "text/html; charset=UTF-8";
        https.get = jest.fn().mockImplementation((uri, callback) => {
            const httpIncomingMessage = new EventEmitter();
            httpIncomingMessage.statusCode = 200;
            httpIncomingMessage.headers = {'content-type': contentType};
            callback(httpIncomingMessage);
            httpIncomingMessage.emit("data", "<html lang=\"en\"><body><h1>Hello World!</h1></body></html>");
            httpIncomingMessage.emit("end");
            return new EventEmitter();
        });

        const result = await requestMultipleUrls(urls);
        expect(result[0].contentType).toEqual(contentType);
        expect(result[0].statusCode).toEqual(200);
        expect(result[0].json).toBeUndefined();
    });

    test("handle http urls", async () => {
        const urls = ["http://google.com/foo.json"];
        await requestMultipleUrls(urls);
        expect(http.get).toBeCalledWith(new URL(urls[0]), expect.anything());
    });

    test("param not an array", async () => {
        const urls = "https://localhost:8080";
        expect.assertions(1);
        try {
            await requestMultipleUrls(urls);
        } catch(err) {
            expect(err).toEqual(new TypeError("expected urls to be an Array"))
        }
    })
});