/**
 * Authors: Diego Ceresuela, Raúl Piracés and Luis Jesús Pellicer.
 * Date: 16-05-2016
 * Name file: signin.js
 * Description: This file contains functions to handle the sign in of system users.
 */
'use strict';

angular.module('myApp.signin', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/signin', {
            templateUrl: 'signin/signin.html',
            controller: 'signinCtrl',
            controllerAs: 'signin'
        });
    }])

    .controller('signinCtrl', signinCtrl);

signinCtrl.$inject = ['$http', 'authentication', '$location', 'errorsService'];

/**
 * Main function of the controller. Lets the user sign in.
 * @param $http
 * @param authentication
 * @param $location
 * @param errorsService
 */
function signinCtrl($http, authentication, $location, errorsService) {

    var vm = this;

    vm.wrong = false;
    vm.credentials = {
        'email': "",
        'password': ""
    };

    // Check if user is already sign in
    if (authentication.isLoggedIn()) {
        $location.path('dashboard');
    }


    // Login function on form submit by user. Sets the credentials and redirects the user (if its successful).
    vm.onSubmit = function () {
        vm.wrong = false;
        $http.post('/login', vm.credentials)
            .then(function (data) {
                authentication.saveToken(data.data.data.token);
                if (vm.credentials.email == "test@test") {
                    console.log('->graphs');
                    $location.path('graphs');
                } else {
                    console.log('->accounts');
                    $location.path('twitterAccounts');
                }
            }, function (err) {
                if (err.status==401 && err.data.message=="User not found") {
                    vm.wrong = true;
                    vm.credentials = {
                        'email': "",
                        'password': ""
                    };
                } else {
                    // Error handling
                    errorsService.errorCode = err.status;
                    errorsService.errorMessage = err.data.message || "Undefined error";
                    $location.path('errors');
                }
            });

    }
}