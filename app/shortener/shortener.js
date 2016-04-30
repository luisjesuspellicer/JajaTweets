'use strict';

angular.module('myApp.shortener', ['ngRoute', 'angularSpinners'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/shortener', {
            templateUrl: 'shortener/shortener.html',
            controller: 'shortCtrl',
            controllerAs: 'shAcc'
        });
    }])

    .controller('shortCtrl', shortCtrl);

shortCtrl.$inject = ['$http','authentication', '$scope', 'spinnerService'];

function shortCtrl($http, authentication, $scope, spinnerService) {

    var self = this;
    $scope.formData = {};
    $scope.result = null;

    self.add = function() {
        spinnerService.show('loadingSpinner');
        $scope.result = null;
        $http.post('http://localhost:3000/shortened/', $scope.formData, {
            headers: {
                'Authorization': 'Bearer ' + authentication.getToken()
            }
        }).then(function(data) {
            $scope.formData = {}; // clear the form so our user is ready to enter another
            $scope.result = data.data.data.direct_url;
            spinnerService.hide('loadingSpinner');
        });
    };

}