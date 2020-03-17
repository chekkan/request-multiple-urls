# request-multiple-urls

No dependency - simple multiple get request nodejs library

Node versions 
- ✅ `10.16.x`

## Getting Started

```javascript
const requestMultipleUrls = require("request-multiple-urls");

const urls = [
  'https://ft-tech-test-example.s3-eu-west-1.amazonaws.com/ftse-fsi.json',
  'https://ft-tech-test-example.s3-eu-west-1.amazonaws.com/gbp-hkd.json',
  'https://ft-tech-test-example.s3-eu-west-1.amazonaws.com/gbp-usd.json'
];

requestMultipleUrls(urls).then((responses) => {
  responses.forEach((res) => {
      console.log(res.statusCode);
      console.log(res.contentType);
      console.log(JSON.stringify(res.json, null, 4));
  })
});
```

## Running Tests

```shell script
npm install
npm run test
```