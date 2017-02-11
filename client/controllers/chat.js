angular.module('Music-Dictators').controller('chatCtrl', function($scope, $aside, socket) {

		$scope.newMessageAlert = {};

		// initiate on view loaded
		$scope.$on('$viewContentLoaded', function(event) {
			socket.emit('refresh users');
		});

		// show chat aside
		$scope.chat = function(user) {
			$scope.to = user;
			socket.emit('reading', {
				from : user._id,
				to : $scope.user._id
			});
			var chat = $aside({
				scope : $scope,
				title : user.userName,
				template : '../partials/asides/aside.tpl.chat.html'
			});
			chat.$promise.then(function() {
				chat.show();
			});
		};
		
		// get profile on socket get connection
		socket.on('connect', function() {
			$scope.getProfile();
		});

		// refresh users list from server
		socket.on('users', function(data) {
			$scope.users = data;
		});

		// server sends event to check if new messages
		socket.on('new messages', function() {
			socket.emit('refresh chat', $scope.user, function(err, messages) {
				$scope.messages = messages;
			});
		});

		// keep watching on message var
		$scope.$watch('messages', function(newValue, oldValue) {
			$scope.newMessageAlert = {};
			for (var i = 0; i < newValue.length; i++) {
				if (newValue[i].to == $scope.user._id && !newValue[i].readed) {
					$scope.newMessageAlert[newValue[i].from] = true;
				}
			}
		});

});