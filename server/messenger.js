var pgp = require('openpgp');

var MAX_MESSAGES = 40;
var messages = [
  { user : 'server', date : new Date().toString(), 'message' : 'Hi !', signed : true}
];

var pushMessage = function(msg) {
  if (messages.length > MAX_MESSAGES) {
    messages.shift();
  }

  messages.push(msg);
};

var messageKey = function(message) {
  return pgp.util.hexstrdump(
      pgp.message.readArmored(message)
      .packets[0].packets[0].signingKeyId.bytes
    ).toUpperCase();
};

var messageText = function(message) {
  return Buffer.from(
    pgp.message.readArmored(message).
    packets[0].packets[1].data
  ).toString();
}

var verifyKeys= function(key, keys) {
  return keys.filter(function(k) { return k === key; }).length > 0;
};


module.exports = function(io) {
  io.sockets.on('connection', function(socket) {
    if (socket.handshake.session.user) {
      socket.emit('messages', messages);
    } else {
      socket.emit('login', false);
    }

    socket.on('new-message', function(data) {
      var message = {
        user : socket.handshake.session.user.login,
        date : new Date().toString(),
        signed : false,
        message: data
      };

      pushMessage(message);
      io.sockets.emit('message', message);

    });

    socket.on('signed-message', function(data) {
      var keys = socket.handshake.session.user.gpg_keys.map(function(item) {
        return item.key_id;
      });

      var message = {
        user : socket.handshake.session.user.login,
        date : new Date().toString(),
        signed : false,
        message : null
      };


      var key = messageKey(data);
      var text = messageText(data);

      if (verifyKeys(key, keys)) {
        message.signed = true;
        message.key = key;
        message.message = text;

        pushMessage(message);
        io.sockets.emit('message', message);

      }
   });

  });
};
