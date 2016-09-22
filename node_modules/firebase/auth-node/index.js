'use strict';

var Auth = require('./auth.js');
var firebase = require('../app-node');

/**
 * Factory function that creates a new auth service.
 * @param {Object} app The app for this service
 * @param {function(Object)} extendApp An extend function to extend the app
 *                                     namespace
 * @return {Auth} The auth service for the specified app.
 */
var serviceFactory = function(app, extendApp) {
  var auth = new Auth(app);
  extendApp({
    'INTERNAL': {
      'getToken': auth.INTERNAL.getToken.bind(auth),
      'addAuthTokenListener': auth.INTERNAL.addAuthTokenListener.bind(auth),
      'removeAuthTokenListener': auth.INTERNAL.removeAuthTokenListener.bind(auth)
    }
  });
  return auth;
};

module.exports = firebase.INTERNAL.registerService('auth', serviceFactory, {'Auth': Auth});

// Create a hook to initialize auth so auth listeners and getToken
// functions are available to other services immediately
firebase.INTERNAL.registerAppHook(function(event, app) {
  if (event === 'create') {
    app.auth();
  }
});
