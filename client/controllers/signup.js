angular.module('Music-Dictators').controller('SignupCtrl', function($scope, $auth, $alert) {
	$scope.signup = function() {
		$auth.signup({
			userName: $scope.userName,
			email: $scope.email,
			password: $scope.password
		})
		.catch(function(response) {
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