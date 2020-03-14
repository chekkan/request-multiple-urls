const https = require('https');

const requestMultipleUrls = (urls = []) => {

    var promises = urls.map((uri) => {
        return new Promise((res, rej) => {
            https.get(uri, (resp) => {
                let data = '';

                // A chunk of data has been received.
                resp.on('data', (chunk) => {
                    data += chunk;
                });

                // The whole response has been received..
                resp.on('end', () => {
                    res({response: JSON.parse(data)});
                });

            }).on("error", (err) => {
                rej(err);
            });
        });
    });
    return Promise.all(promises);
};

module.exports = requestMultipleUrls;