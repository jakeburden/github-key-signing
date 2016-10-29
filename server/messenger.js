var kbpgp = require('../public/kbpgp/kbpgp-2.0.8');

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


var importKey = function(data, callback) {
  if (data[0] && data[0].public_key) {

    var binData = Buffer.from(data[0].public_key, 'base64');
//    var binData = pp.unpack(Buffer.from(data[0].public_key, 'base64'));


    kbpgp.KeyManager.import_from_pgp_message(
      { msg : binData }, function(err, key) {
        if(err) { callback(err); return;}
        callback(null, key);
    });
  }
};

var verifyMessage = function(message, callback) {

};


module.exports = function(io) {
  io.sockets.on('connection', function(socket) {
    if (socket.handshake.session.user) {
      socket.emit('messages', messages);
    } else {
      socket.emit('login', false);
    }


 importKey(socket.handshake.session.user.gpg_keys, function(e,k) {
  console.log(arguments);
});


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
    
   });

  });
};
