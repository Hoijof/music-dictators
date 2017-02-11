/**
 * Created by Hoijof on 11/02/2017.
 */

angular.module('Music-Dictators').controller('pickSelectionCtrl', function($scope, $auth, $alert, $aside, $upload, Account, socket, $location) {
  $scope.messages = [];

  $scope.portraits = {
    team: [
      {
        url: 'img/poli/hitler.jpeg',
        pickId: 0
      },
      {
        url: 'img/poli/marx.jpeg',
        pickId: 1
      }
    ],
    enemy: [
      {
        url: 'img/poli/hitler.jpeg',
        pickId: 0
      },
      {
        url: 'img/poli/marx.jpeg',
        pickId: 1
      }
    ],
    picks: [
      {
        url: 'img/poli/hitler.jpeg',
        enabled: true,
        pickId: 0
      },
      {
        url: 'img/poli/marx.jpeg',
        enabled: false,
        pickId: 1
      }
    ]
  };
  // start socket
  socket.con();

  $scope.pick = function(pick) {
    if (!pick.enabled) return false;

    socket.emit('pickDone');

  };

  /*
    {
      team: 'string',
      playerId: 'string',
      url: 'string',
      pickId: 'string'
    }
   */
  socket.on('pickDone ack', function(data) {
    $scope.portraits[data.team][data.playerId].url = data.url;
    $scope.portraits[data.team][data.playerId].pickId = data.pickId;
  });

});