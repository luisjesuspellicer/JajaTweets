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

shortCtrl.$inject = ['$http','authentication', '$scope', 'spinnerService', 'errorsService', '$location'];

function shortCtrl($http, authentication, $scope, spinnerService, errorsService, $location) {

    var self = this;
    $scope.formData = {};
    $scope.result = null;

    if (!authentication.isLoggedIn()) {
        console.log('unauth');
        errorsService.errorCode = 401;
        errorsService.errorMessage = "Unauthorized operation.";
        $location.path('errors');
    }

    self.add = function() {
        spinnerService.show('loadingSpinner');
        $scope.result = null;
        $http.post('/shortened/', $scope.formData, {
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