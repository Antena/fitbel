(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof exports === 'object') {
    module.exports = factory;
  } else {
    root.fitbel = factory();
  }
})(this, function() {
  'use strict';

  var OAuth2 = require('oauth').OAuth2;
  var request = require('request');
  var Promise = require("bluebird");

  var FITBIT_URL = 'https://www.fitbit.com/';
  var FITBIT_API_URL = 'https://api.fitbit.com/';

  var OAUTH_AUTHORIZE_PATH = 'oauth2/authorize';
  var OAUTH_TOKEN_PATH = 'oauth2/token';

  var fitbel = {};
  fitbel.data = {};

  function connect(clientId, clientSecret) {
    this.oauth2 = new OAuth2(
      clientId,
      clientSecret,
      FITBIT_URL,
      OAUTH_AUTHORIZE_PATH,
      OAUTH_TOKEN_PATH,
      {
        'Authorization' : "Basic " + new Buffer(clientId +':'+ clientSecret).toString('base64')
      }
    );
  }

  function getAuthorizeUrl(redirect_url, scope){
    return this.oauth2.getAuthorizeUrl({
      redirect_uri: redirect_url,
      scope: scope,
      response_type: 'code'
    }).replace(FITBIT_API_URL, FITBIT_URL);
  }

  function getToken(code, redirectUri) {
    var client = this.oauth2;
    client._baseSite = FITBIT_API_URL;
    return new Promise(function (resolve, reject) {
      client.getOAuthAccessToken(
        code,
        {
          'grant_type': 'authorization_code',
          'redirect_uri': redirectUri
        },
        function(e, access_token, refresh_token, results) {
          if (e) {
            reject(e);
          }
          else {
            fitbel.data.user_id = results.user_id;
            fitbel.data.access_token = access_token;
            resolve(e, access_token, refresh_token, results);
          }
        }
      )
    });
  }

  function get (query) {
    var url = FITBIT_API_URL + "1/user/" + fitbel.data.user_id + query;
    return new Promise(function (resolve, reject) {
      request({
        url: url,
        headers: {
          Authorization: 'Bearer ' + fitbel.data.access_token
        }
      }, function (err, res, body) {
        if (!err && res.statusCode === 200) {
          resolve(body);
        } else {
          reject(body);
        }
      })
    });
  }

  fitbel.connect = connect;
  fitbel.getAuthorizeUrl = getAuthorizeUrl;
  fitbel.getToken = getToken;
  fitbel.get = get;

  return fitbel;
}());