angular.module('Music-Dictators').controller('LogoutCtrl', function($scope, $auth, socket) {
	if (!$auth.isAuthenticated()) {
		return;
	} else {
		socket.destroy();
		$auth.logout();
	}
});