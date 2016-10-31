var githubOAuth = require('github-oauth')({
  githubClient: process.env.GITHUB_CLIENT_ID,
  githubSecret: process.env.GITHUB_CLIENT_SECRET,
  baseURL: process.env.NOW_URL,
  loginURI: '/api/auth/login',
  callbackURI: '/api/auth/callback',
  scope: 'read:gpg_key'
});

var request = require('request');

module.exports = function(app, db) {

  function attachKey(token, req, res) {
    request.get({
      url : 'https://api.github.com/user/gpg_keys',
      json: true,
      headers : {
        'User-Agent': 'GitHub key signing example app',
        'Accept' : 'application/vnd.github.cryptographer-preview',
        'Authorization': 'token ' + token
      }
    }, function(err, resp, body) {
      req.session.user.gpg_keys = body;
      res.redirect('/');
    });
  }

  function authorizeAndSave(token, req, res) {
    request.get({
      url : 'https://api.github.com/user',
      json: true,
      headers : {
        'User-Agent': 'GitHub key signing example app',
        'Authorization': 'token ' + token
      }
    }, function(err, resp, body) {
      req.session.user = body;
      attachKey(token, req, res);
    });
  }

  app.get('/api/auth/login', function(req,res) {
    githubOAuth.login(req, res);
  });

  app.get('/api/auth/logout', function(req,res) {
    req.session.user = null;
    res.redirect('/');
  });

  app.get('/api/auth/callback', function(req,res) {
    githubOAuth.callback(req, res);
  });

  githubOAuth.on('error', function(err) {
  });

  githubOAuth.on('token', function(token, res, rt, req) {
    if (typeof token.access_token !== 'undefined') {
      authorizeAndSave(token.access_token, req, res);
    } else {
      res.status(403).end();
    }
  });
}
