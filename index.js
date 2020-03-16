const https = require('https');
const http = require('http');
const request = {
    https,
    http
};

const requestMultipleUrls = (urls = []) => {
    if (!Array.isArray(urls)) {
        throw new TypeError("expected urls to be an Array");
    }
    // handle invalid url inputs
    const invalids = urls.map((u) => {
        try {
            new URL(u);
        } catch (err) {
            return u
        }
    }).filter(e => e);

    if (invalids.length > 0) {
        // throw if any urls are invalid
        const msg = `Invalid URLs: ${invalids.join(", ")}`;
        throw new TypeError(msg);
    }

    const promises = urls.map((uri) => new Promise((resolve, reject) => {
        const url = new URL(uri);
        request[url.protocol.slice(0, -1)].get(url, (res) => {
            let data = '';

            // A chunk of data has been received.
            res.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received..
            res.on('end', () => {

                let contentType = res.headers["content-type"];
                const json = (contentType === "application/json")
                    ? JSON.parse(data)
                    : undefined;
                resolve({
                    contentType,
                    statusCode: res.statusCode,
                    json
                });
            });

        }).on("error", (err) => {
            reject(err);
        });
    })).map(p => p.catch(e => e));

    return Promise.all(promises);
};

module.exports = requestMultipleUrls;