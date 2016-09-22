## osm-auth

Easy authentication with [OpenStreetMap](http://www.openstreetmap.org/)
over [OAuth](http://oauth.net/) with
[CORS](http://en.wikipedia.org/wiki/Cross-origin_resource_sharing).

## Installation

Basic:

Copy `osmauth.js`, use the `osmAuth` object. This uses
[UMD](https://github.com/umdjs/umd), so it's compatible
with [RequireJS](http://requirejs.org/) etc too, if you're into that kind
of thing.

With browserify:

    npm install osm-auth

```js
var osmAuth = require('osm-auth');
```

**Requires land.html to be accessible, or a page that does the same thing -
calls an auth complete function - to be available.**

## Getting Keys

Register a new OAuth application on openstreetmap.org:

1. Go to your user page
2. Click 'my settings'
3. Click 'oauth settings'
4. At the bottom, 'Register your application'
5. Fill in the form & submit
6. Copy & Paste the secret & consumer key into the osmAuth config object as below

## Example

```js
var auth = osmAuth({
    oauth_consumer_key: 'WLwXbm6XFMG7WrVnE8enIF6GzyefYIN6oUJSxG65',
    oauth_secret: '9WfJnwQxDvvYagx1Ut0tZBsOZ0ZCzAvOje3u1TV0',
    auto: true // show a login form if the user is not authenticated and
               // you try to do a call
});

document.getElementById('authenticate').onclick = function() {
    // Signed method call - since `auto` is true above, this will
    // automatically start an authentication process if the user isn't
    // authenticated yet.
    auth.xhr({
        method: 'GET',
        path: '/api/0.6/user/details'
    }, function(err, details) {
        // details is an XML DOM of user details
    });
};
```

## Support

[CORS-supporting browsers](http://caniuse.com/#feat=cors)

## API

`.osmAuth(options)`

At a minimum, options must contain an OAuth consumer key and secret:

```
{
    oauth_secret: ...
    oauth_consumer_key: ...
}
```

Additional options are:

* `url` for a base url (default: "http://www.openstreetmap.org")
* `landing` for a landing page name (default: "land.html")
* `loading`: a function called when auth-related xhr calls start
* `done`: a function called when auth-related xhr calls end
* `singlepage`: use full-page redirection instead of a popup for mobile

`.logout()`

`.authenticated()`: am I authenticated?

`.authenticate(callback)`

Tries to authenticate. Calls callback if successful.

`.xhr(options, callback)`

Signed [XMLHttpRequest](http://en.wikipedia.org/wiki/XMLHttpRequest).
Main options are `url` and `method`.

`.options(options)`

Set new options.

## Based on

Uses [ohauth](https://github.com/osmlab/ohauth) and
[store.js](https://github.com/marcuswestin/store.js) behind the scenes.

Based on the implementation in the [iD editor](http://ideditor.com/).

## See Also

* [OAuth in Javascript](http://mapbox.com/osmdev/2013/01/15/oauth-in-javascript/)
