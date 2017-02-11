angular.module('Music-Dictators').controller('statisticsCtrl', function($scope, socket) {

	$scope.$on('$viewContentLoaded', function(event) {
		getData();
	});

	// keep watching user var
	$scope.$watch('user', function(newValue, oldValue) {
		getData();
	});

	// get games data and draw
	var getData = function() {
		if ($scope.user) {
			socket.emit('get statistics', $scope.user._id, function(err, games) {
				$scope.dates = [];
				$scope.duration = [];
				$scope.correctWords = [];
				$scope.incorrectWords = [];
				$scope.score = [];
				$scope.specials = [];
				$scope.unitsCreated = [];
				$scope.unitsKilled = [];
				$scope.win = 0;
				$scope.loose = 0;
				$scope.wordsTyped = [];
				$scope.labels = [];
				for (var i = 0; i < games.length; i++) {
					$scope.labels.push('');
					$scope.dates.push(games[i].date);
					$scope.duration.push(games[i].duration);
					if (games[i].player1.id === $scope.user._id) {
						$scope.correctWords.push(games[i].player1.correctWords);
						$scope.incorrectWords.push(games[i].player1.incorrectWords);
						$scope.score.push(games[i].player1.score);
						$scope.specials.push(games[i].player1.specials);
						$scope.unitsCreated.push(games[i].player1.unitsCreated);
						$scope.unitsKilled.push(games[i].player1.unitsKilled);
						$scope.wordsTyped.push(games[i].player1.wordsTyped);
						if (games[i].player1.win) {
							$scope.win++;
						} else {
							$scope.loose++;
						}
					} else if (games[i].player2.id === $scope.user._id) {
						$scope.correctWords.push(games[i].player2.correctWords);
						$scope.incorrectWords.push(games[i].player2.incorrectWords);
						$scope.score.push(games[i].player2.score);
						$scope.specials.push(games[i].player2.specials);
						$scope.unitsCreated.push(games[i].player2.unitsCreated);
						$scope.unitsKilled.push(games[i].player2.unitsKilled);
						$scope.wordsTyped.push(games[i].player2.wordsTyped);
						if (games[i].player2.win) {
							$scope.win++;
						} else {
							$scope.loose++;
						}
					}
				}

				$scope.winLabel = [ 'win', 'loose' ];
				$scope.winData = [ $scope.win, $scope.loose ];
				$scope.series = [ 'words typed', 'correct words', 'incorrect words', 'created units', 'kills', 'duration' ];
				$scope.gamesData = [ $scope.wordsTyped, $scope.correctWords, $scope.incorrectWords, $scope.unitsCreated, $scope.unitsKilled, $scope.duration ];
				$scope.gamesOptions = {
					scaleGridLineColor : "rgba(0,255,0,.1)",
					scaleShowVerticalLines : false,
					pointDot : false
				};
			});
		}
	}

});