(function() {
  var socket = io();

  var app = angular.module('messenger', [])
  .controller('messagesController', function($scope,$anchorScroll, $location, $timeout) {
    $scope.loaded = false;
    $scope.test = 'dsfsdfsdf';
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
        socket.emit('new-message', $scope.newMessage);
        $scope.newMessage = undefined;
      }
    };

  });

})();
