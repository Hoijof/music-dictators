angular.module('TypeOrDie')
  .factory('Account', function($http) {
    return {
      getProfile: function() {
        return $http.get('/me');
      },
      updateProfile: function(profileData) {
        return $http.put('/me', profileData);
      }
    };
  });