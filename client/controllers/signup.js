angular.module('Music-Dictators').controller('SignupCtrl', function($scope, $auth, $alert, $state) {
    $scope.ideology = 'capitalist'
	$scope.signup = function() {
		$auth.signup({
			userName: $scope.userName,
			email: $scope.email,
			password: $scope.password,
			ideology: $scope.ideology
		}).then(function() {
            $state.go('main.profile.gameboard')
        }).catch(function(response) {
			$alert({
				title: 'Signup error:',
				content: response.data.message,
				template : 'partials/alerts/alert.tpl.error.html',
				duration: 2,
				container: '#signUpError'
			});
		});
    };
});