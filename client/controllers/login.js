angular.module('Music-Dictators').controller('LoginCtrl', function($scope, $auth, $alert, $state) {
	$scope.login = function() {
		$auth.login({ 
			email: $scope.email,
			password: $scope.password 
		}).then(function() {
			$state.go('main.profile.gameboard')
        }).catch(function(response) {
        	$alert({
        		title: 'Login error:',
        		content: response.data.message,
        		template : 'partials/alerts/alert.tpl.error.html',
        		duration: 3,
        		container: '#loginError'
       		});
       	});
  	};
});