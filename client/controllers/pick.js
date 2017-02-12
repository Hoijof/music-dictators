/**
 * Created by Hoijof on 11/02/2017.
 */

angular.module('Music-Dictators').controller('pickSelectionCtrl', function($scope, $auth, $alert, $aside, $upload, Account, socket, $location) {
  $scope.messages = [];

  $scope.details = {
    show: false
  };

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
    picks:
      {

      }
  };
  // start socket
  socket.con();


  socket.on('loadPicks', function(picks) {
    $scope.picks = [
      {
        "name": "Rajoy",
        "url": "img/poli/rajoy.jpg",
        "pickId": 7,enabled: true,
        "powerName": "Skip song",
        "powerDescription": "Plays the next song"
      },
      {
        "name": "Merkel",
        "url": "img/poli/merkel.jpg",
        "pickId": 8,enabled: true,
        "powerName": "Loan",
        "powerDescription": "Moves the ball to you by a certain distance and after 5 seconds it moves it double the distant into opponents direction"
      },
      {
        "name": "Trump",
        "url": "img/poli/trump.jpg",
        "pickId": 9,enabled: true,
        "powerName": "Wall",
        "powerDescription": "Ball changes direction with -2 to it's speed"
      },
      {
        "name": "Hitler",
        "url": "img/poli/hitler.jpeg",
        "pickId": 10,enabled: true,
        "powerName": "Torture",
        "powerDescription": "Responses are now visible to everyone"
      },
      {
        "name": "Sarkozy",
        "url": "img/poli/sarkozy.jpg",
        "pickId": 11,enabled: true,
        "powerName": "Mute song",
        "powerDescription": "Stops the audio of the current song for 5 seconds"
      },
      {
        "name": "Bush",
        "url": "img/poli/bush.jpg",
        "pickId": 12,enabled: true,
        "powerName": "Libreation",
        "powerDescription": "Copies a random ultimate from and opponent"
      }
    ]
  });

  $scope.pick = function(pick) {
    if (!pick.enabled) return false;

    socket.emit('pickDone', pick.id);

  };

  /*
    {
      team: 'string',
      playerId: 'string',
      url: 'string',
      pickId: 'string'
    }
   */
  /*socket.on('pickDone ack', function(data) {
    $scope.portraits[data.team][data.playerId].url = data.url;
    $scope.portraits[data.team][data.playerId].pickId = data.pickId;
  });*/

  $scope.showDetails = function(item) {
    $scope.details = {
      show: true,
      name: item.name,
      content: item.powerName + ': ' + item.powerDescription
    };
  };

  $scope.hideDetails = function() {
    $scope.details = {
      show: false
    }
  };
});