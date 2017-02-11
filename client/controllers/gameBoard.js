angular.module('Music-Dictators').controller('gameBoardCtrl', function($scope, $modal, socket, $location) {

	var myModal;

	// sends server a new game request
	$scope.newGame = function() {
		socket.emit('new game', $scope.user, function(id) {
			$scope.gameId = id;
			myModal = $modal({
				title : 'New game',
				content : 'esperando',
				scope : $scope,
				template : 'partials/modals/modal.tpl.gameReq.html',
				show : true,
				keyboard : false,
				backdrop : 'static'
			});
		});
	};

	// send server to cancel game request
	$scope.cancelGame = function() {
		socket.emit('cancel game', $scope.gameId);
	};

	// send server to join a created game
	$scope.joinGame = function(id) {
		var data = {
			gameId : id,
			user : $scope.user
		};
		socket.emit('join game', data);
	};

	// refresh games board from server
	socket.on('games', function(data) {
		$scope.games = data;
	});

	// server event for game ready
	socket.on('lets play', function() {
		if (myModal) {
			myModal.hide();
		}
		$location.path('/game')
	});

	// get games
	socket.emit('init gameboard');
});