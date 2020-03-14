const requestMultipleUrls = require(".");
const https = require("https");
const {EventEmitter} = require("events");

describe("requestMultipleUrls", () => {

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
    })

});