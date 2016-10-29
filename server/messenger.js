
var messages = [
  { user : 'server', date : new Date().toString(), 'message' : 'Hi !', signed : true}
];

var MAX_MESSAGES = 40;

var pushMessage = function(msg) {
  if (messages.length > MAX_MESSAGES) {
    messages.shift();
  }

  messages.push(msg);
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


  });
};
