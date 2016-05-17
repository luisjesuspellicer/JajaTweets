/**
 * Authors: Diego Ceresuela, Raúl Piracés and Luis Jesús Pellicer.
 * Date: 16-05-2016
 * Name file: shortener.js
 * Description: Controller for the view shortener.
 * It controls the shortener. Let short url's and give the short result.
 */
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

    /*
     * Be sure that the user is logged in.
     */
    if (!authentication.isLoggedIn()) {
        errorsService.errorCode = 401;
        errorsService.errorMessage = "Unauthorized operation.";
        $location.path('errors');
    }

    /*
     * Send url to backend shortenner and show the response in the view.
     */
    self.add = function() {
        spinnerService.show('loadingSpinner');
        $scope.result = null;
        $http.post('/shortened/', $scope.formData, {
            headers: {
                'Authorization': 'Bearer ' + authentication.getToken()
            }
        }).error(function(data, status, headers, config) {
            console.log("Add shortened URL error");
            errorsService.errorCode = status;
            errorsService.errorMessage = data.data.message || "Undefined error";
            $location.path('errors');
        }).then(function(data) {
            $scope.formData = {}; // clear the form so our user is ready to enter another
            $scope.result = data.data.data.direct_url;
            spinnerService.hide('loadingSpinner');
        });
    };

}