/*
 *  lets wire everything together
 */

var path = require('path');
var Session = require('express-session');
var session = Session({
  secret: process.env.SESSION_SECRET,
  saveUninitialized: true,
  resave : true,
  cookie: {
    secure: false,
    maxAge: 144000000
  }
});

var express = require('express');
var http = require('http');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

/**
 * Small session sharing middleware (hack)
 *
 * @name ios
 * @function
 * @access public
 * @param {} session
 */
var ios = function(session) {
  return function(socket, next) {
    session(socket.handshake, {}, next);
  }
};

app.use(express.static('public'));
app.use(session);

require('./github-auth')(app);

io.use(ios(session));

require('./messenger')(io);

app.get('/', function(req, res, next) {

  if (!req.session.user) {
    res.sendFile(path.resolve(__dirname +'/../public/login.html'));
  } else {
    res.sendFile(path.resolve(__dirname + '/../public/messenger.html'));
  }
});

server.listen(process.env.PORT, function() { 
  process.stdout.write('\033[37;45m=====> *:' + process.env.PORT +'\033[0m\n');
});

