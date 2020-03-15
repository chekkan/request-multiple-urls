const https = require('https');

const requestMultipleUrls = (urls = []) => {

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
        var msg = `Invalid URLs: ${invalids.join(", ")}`;
        throw new TypeError(msg);
    }

    var promises = urls.map((uri) => new Promise((res, rej) => {
        const url = new URL(uri);
        https.get(url, (resp) => {
            let data = '';

            // A chunk of data has been received.
            resp.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received..
            resp.on('end', () => {

                let response = JSON.parse(data);
                res({response: response});
            });

        }).on("error", (err) => {
            rej(err);
        });
    })).map(p => p.catch(e => e));

    return Promise.all(promises);
};

module.exports = requestMultipleUrls;