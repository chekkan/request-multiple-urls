const requestMultipleUrls = require(".");
const https = require("https");
const {EventEmitter} = require("events");

describe("requestMultipleUrls", () => {

    beforeEach(() => {
        https.get = jest.fn().mockImplementation((uri, callback) => {
            const httpIncomingMessage = new EventEmitter();
            callback(httpIncomingMessage);
            httpIncomingMessage.emit("data", "{}");
            httpIncomingMessage.emit("end");
            return new EventEmitter();
        })
    });

    test('with undefined returns promise with empty array', async () => {
        const result = await requestMultipleUrls();
        expect(result).toEqual([]);
    });

    test.each([["https://foo.bar/baz.json", {foo: "bar"}], ["https://google.com", {baz: "corge"}]])('with url %s returns content', async (url, response) => {
        const urls = [url];
        https.get = jest.fn().mockImplementation((uri, callback) => {
            const httpIncomingMessage = new EventEmitter();
            callback(httpIncomingMessage);
            httpIncomingMessage.emit("data", JSON.stringify(response));
            httpIncomingMessage.emit("end");
            return new EventEmitter();
        });

        const result = await requestMultipleUrls(urls);
        expect(result).toEqual([{response}]);
    });

    test("multiple urls with successful response", async () => {
        const urls = ["https://google.com", "https://ft.com"];
        const responseBodies = [{foo: "bar"}, {baz: "quux"}];
        let i = 0;
        https.get = jest.fn().mockImplementation((uri, callback) => {
            const httpIncomingMessage = new EventEmitter();
            callback(httpIncomingMessage);
            httpIncomingMessage.emit("data", JSON.stringify(responseBodies[i++]));
            httpIncomingMessage.emit("end");
            return new EventEmitter();
        });

        const result = await requestMultipleUrls(urls);
        expect(result).toEqual(responseBodies.map(body => ({response: body})));
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
        var msg = `Invalid URLs: ${invalids.join(", ")}`;
        expect.assertions(1);
        try {
            await requestMultipleUrls(urls);
        } catch (err) {
            expect(err).toEqual(new TypeError(msg))
        }
    })

});