/**
 * Created by Hoijof on 11/02/2017.
 */

angular.module('Music-Dictators').controller('pickSelectionCtrl', function($scope, $auth, $alert, $aside, $upload, Account, socket, $location) {
  $scope.messages = [];

  // start socket
  socket.con();

});