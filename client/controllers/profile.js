angular.module('TypeOrDie').controller('ProfileCtrl', function($scope, $auth, $alert, $aside, $upload, Account, socket, $location) {
	$scope.messages = [];

	// start socket
	socket.con();

	// Get user's profile information.
	$scope.getProfile = function() {
		Account.getProfile().success(function(data) {
			$scope.user = data;
			socket.emit('init', $scope.user, function(err, messages) {
				$scope.messages = messages;
			});
		}).error(function(error) {

		});
	};

	// Update user's profile information.
	$scope.updateProfile = function() {
		Account.updateProfile({
			userName : $scope.user.userName,
			email : $scope.user.email,
		}).then(function() {

		});
	};

	// show update aside
	$scope.showUpdate = function() {
		var updateAside = $aside({
			scope : $scope,
			title : 'Update profile',
			template : '../partials/asides/aside.tpl.update.html'
		});

		updateAside.$promise.then(function() {
			updateAside.show();
		});
	};

	// upload picture
	$scope.upload = function(files) {
		if (files && files.length) {
			for (var i = 0; i < files.length; i++) {
				var file = files[i];
				var img = document.createElement("img");
				var reader = new FileReader();
				reader.onload = function(e) {
					img.src = e.target.result;
					var canvas = document.createElement("canvas");
					var MAX_WIDTH = 200;
					var MAX_HEIGHT = 200;
					var width = img.width;
					var height = img.height;

					if (width > height) {
						if (width > MAX_WIDTH) {
							height *= MAX_WIDTH / width;
							width = MAX_WIDTH;
						}
					} else {
						if (height > MAX_HEIGHT) {
							width *= MAX_HEIGHT / height;
							height = MAX_HEIGHT;
						}
					}
					canvas.width = width;
					canvas.height = height;
					var ctx = canvas.getContext("2d");
					ctx.drawImage(img, 0, 0, width, height);
					var dataurl = canvas.toDataURL("image/png");
					socket.emit('new img', {
						img : dataurl,
						id : $scope.user._id
					}, function(img) {
						location.reload();
					});
				};
				reader.readAsDataURL(file);
			}
		}
	};

	// return current location
	$scope.getLocation = function() {
		return $location.path();
	}

});