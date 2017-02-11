var app = angular.module('TypeOrDie', [ 'ui.router', 'mgcrea.ngStrap', 'satellizer', 'angularFileUpload', 'perfect_scrollbar', 'chart.js' ])
app.config(function($stateProvider, $urlRouterProvider, $authProvider) {
	$stateProvider.state('home', {
		url : '/',
		templateUrl : 'partials/home.html',
		resolve : {
			authenticated : function($q, $location, $auth) {

				if ($auth.isAuthenticated()) {
					$location.path('/profile');
				}

			}
		}
	}).state('logout', {
		url : '/logout',
		template : null,
		controller : 'LogoutCtrl'
	}).state('main', {
		templateUrl : 'partials/main.html',
		controller : 'ProfileCtrl'
	}).state('main.profile', {
		views : {
			'' : {
				templateUrl : 'partials/profile.html',
			},
			'user@main.profile' : {
				templateUrl : 'partials/user.html'
			},
			'users@main.profile' : {
				templateUrl : 'partials/users.html',
				controller : 'chatCtrl'
			}
		}
	}).state('main.profile.gameboard', {
		url : '/profile',
		views : {
			'' : {
				templateUrl : 'partials/gameBoard.html',
				controller : 'gameBoardCtrl'
			}
		},
		resolve : {
			authenticated : function($q, $location, $auth) {
				var deferred = $q.defer();

				if (!$auth.isAuthenticated()) {
					$location.path('/');
				} else {
					deferred.resolve();
				}

				return deferred.promise;
			}
		}
	}).state('main.profile.statistics', {
		url : '/statistics',
		views : {
			'' : {
				templateUrl : 'partials/statistics.html',
				controller : 'statisticsCtrl'
			}
		},
		resolve : {
			authenticated : function($q, $location, $auth) {
				var deferred = $q.defer();

				if (!$auth.isAuthenticated()) {
					$location.path('/');
				} else {
					deferred.resolve();
				}

				return deferred.promise;
			}
		}
	}).state('main.game', {
		url : '/game',
		templateUrl : 'partials/game.html',
		controller : 'gameCtrl',
		resolve : {
			authenticated : function($q, $location, $auth) {
				var deferred = $q.defer();

				if (!$auth.isAuthenticated()) {
					$location.path('/');
				} else {
					deferred.resolve();
				}

				return deferred.promise;
			}
		}
	}).state('main.gameTutorial', {
		url : '/gameTutorial',
		templateUrl : 'partials/gameTutorial.html',
		controller : 'gameTutorialCtrl',
		resolve : {
			authenticated : function($q, $location, $auth) {
				var deferred = $q.defer();

				if (!$auth.isAuthenticated()) {
					$location.path('/');
				} else {
					deferred.resolve();
				}

				return deferred.promise;
			}
		}
	});

	$urlRouterProvider.otherwise('/');
});