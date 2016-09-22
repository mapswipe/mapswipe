## ohauth

[![](http://ci.testling.com/osmlab/ohauth.png)](http://ci.testling.com/osmlab/ohauth)

A most-of-the-way OAuth 1.0 client implementation in Javascript. Meant to be
an improvement over the [default linked one](http://oauth.googlecode.com/svn/code/javascript/)
because this uses idiomatic Javascript.

If you use this on a server [different from the one authenticated against](http://en.wikipedia.org/wiki/Same_origin_policy),
you'll need to [enable](http://enable-cors.org/) and use [CORS](http://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
for cross-origin resources. CORS is not available in IE before version IE10.

### Usage

As a file

    wget https://raw.github.com/osmlab/ohauth/gh-pages/ohauth.js

With browserify

    npm install ohauth
    var ohauth = require('ohauth');

### Compatibility

* [OpenStreetMap](http://www.openstreetmap.org/) full & tested with iD
* GitHub - partial, full flow is not possible because `access_token` API is not CORS-enabled

### API

```js
// generates an oauth-friendly timestamp
ohauth.timestamp();

// generates an oauth-friendly nonce
ohauth.nonce();

// generate a signature for an oauth request
ohauth.signature({
    oauth_consumer_key: '...',
    oauth_signature_method: '...',
    oauth_timestamp: '...',
    oauth_nonce: '...'
});

// make an oauth request.
ohauth.xhr(method, url, auth, data, options, callback);

// options can be a header like
{ header: { 'Content-Type': 'text/xml' } }

ohauth.xhr('POST', url, o, null, {}, function(xhr) {
    // xmlhttprequest object
});

// generate a querystring from an object
ohauth.qsString({ foo: 'bar' });
// foo=bar

// generate an object from a querystring
ohauth.stringQs('foo=bar');
// { foo: 'bar' }
```

#### Just generating the headers

```js
// create a function holding configuration
var auth = ohauth.headerGenerator({
    consumer_key: '...',
    consumer_secret: '...'
});

// pass just the data to produce the OAuth header with optional
// POST data (as long as it'll be form-urlencoded in the request)
var header = auth('GET', 'http://.../?a=1&b=2', { c: 3, d: 4 });
// or pass the POST data as an form-urlencoded
var header = auth('GET', 'http://.../?a=1&b=2', 'c=3&d=4');
```
