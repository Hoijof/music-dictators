angular.module('Music-Dictators').controller('messageCtrl', function($scope, socket) {
	
	// send chat message
	$scope.sendMessage = function(){
		if($scope.messageToSend !== undefined && $scope.messageToSend !== ''){
			var message = {
					from : $scope.user._id,
					to : $scope.to._id,
					message : $scope.messageToSend
			};
			socket.emit('new message',message);
			$scope.messageToSend = '';
		}
	};	
});