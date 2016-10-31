(function() {
  var socket = io();

  var setupKey = function(private_key, passphrase, callback) {
    kbpgp.KeyManager.import_from_armored_pgp({
      armored: private_key
    }, function(err, key_manager) {
      if (!err) {
        if (key_manager.is_pgp_locked()) {
          key_manager.unlock_pgp({
            passphrase: passphrase
          }, function(err) {
            if (err) { 
              callback(err); return;
            }
            callback(null, key_manager);
          });
        } else {
          callback(null, key_manager);
        }
      } else {
        callback(err);
      }
    });
  }

  var signMessage = function(key_manager, message, callback) {
    var params = {
      sign_with:   key_manager,
      msg:         message
    };

    kbpgp.box(params, function(err, result_string, result_buffer) {
      if (err) {
        callback(err); return;
      }
      callback(null, result_string, result_buffer);
    });
  }

  var sendMessage = function(private_key, passphrase, message) {
    if (!private_key) {
      socket.emit('new-message', message);
      return;
    }

    setupKey(private_key, passphrase, function(err, key_manager) {
      if (err) { alert(err); return; }

      signMessage(key_manager, message, function(err, rs, rb) {
        if (err) { alert(err); return; }

        socket.emit('signed-message', rs);
      });
    });
  }

  var app = angular.module('messenger', [])
  .controller('messagesController', function($scope,$anchorScroll, $location, $timeout) {
    $scope.displayKeyDialog = false;
    $scope.private_key = undefined;
    $scope.passphrase = undefined;
    $scope.messsages = [];

    socket.on('messages', function(data) {
      $scope.$apply(function() {
        $scope.loaded = true;
        $scope.messages = data;
      });

       $timeout(function() {
        $location.hash('end');
        $anchorScroll();
       });
    });

    socket.on('message', function(msg) {
      $scope.$apply(function() {
        $scope.messages.push(msg);
      });

       $timeout(function() {
        $location.hash('end');
        $anchorScroll();
       });
    });

    $scope.sendMessage = function(ev) {
      if (!ev || ev.keyCode === 13 && $scope.newMessage ) {
        sendMessage($scope.private_key, $scope.passphrase, $scope.newMessage);
        $scope.newMessage = undefined;
      }
    };

  });

})();
