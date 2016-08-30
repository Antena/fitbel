var fitbel = require('../src/fitbel');

var express = require('express');
var app = express();

// Set credentials
fitbel.connect(
  '<YOUR_CLIENT_ID>', // Client Id
  '<YOUR_CLIENT_SECRET>' //Client Secret
);

app.get('/authorize', function(req, res) {
  var authorizeUrl = fitbel.getAuthorizeUrl(
    'http://localhost:3000/callback',
    [ 'activity heartrate location nutrition profile settings sleep social weight']
  );
  res.redirect(authorizeUrl);
});

app.get('/callback', function(req, res, next) {
  fitbel.getToken(req.query.code, 'http://localhost:3000/callback')
    .then(function(data) {
      return res.status(200).redirect('/stats');
    })
    .catch(function(err) {
      return res.status(400).send(err);
    })
});

app.get('/stats', function(req, res) {
  res.send('<a href="/profile">Profile</a></br><a href="/heart">Heart</a>');
});

app.get('/profile', function(req, res) {
  fitbel.get('/profile.json')
    .then(function(data) {
      return res.status(200).send(data);
    })
    .catch(function(err) {
      return res.status(400).send(err);
    });
});

app.get('/heart', function(req, res) {
  fitbel.get('/activities/heart/date/today/1d.json')
    .then(function(data) {
      return res.status(200).send(data);
    })
    .catch(function(err) {
      return res.status(400).send(err);
    });
});

app.listen('3000', function (req, res) {
  console.log('Running Fitbel ==> http://localhost:3000');
});
