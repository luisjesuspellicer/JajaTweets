/**
 * Authors: Diego Ceresuela, Raúl Piracés and Luis Jesús Pellicer.
 * Date: 16-05-2016
 * Name file: signup.js
 * Description: This file contains functions to handle the sign up of system users (only admin).
 */
'use strict';

angular.module('myApp.signup', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/signup', {
    templateUrl: 'signup/signup.html',
    controller: 'signupCtrl',
    controllerAs: 'signup'
  });
}])

.controller('signupCtrl', signupCtrl);

signupCtrl.$inject = ['$http','errorsService','$location','authentication'];

/**
 * Main function of the controller. Lets the admin sign up users.
 * @param $http
 * @param authentication
 * @param $location
 * @param errorsService
 */
function signupCtrl($http, errorsService, $location, authentication) {

    var vm = this;

    vm.credentials = {
        'name': "",
        'email': ""
    };

    vm.password = 'Password';

    vm.onSubmit = onSubmit;

    // Check if user is admin user
    if (!authentication.isRoot()) {
        errorsService.errorCode = 401;
        errorsService.errorMessage = "Unauthorized operation.";
        $location.path('errors');
    }

    // Sign up function on form submit by user. Sets the new random password for user and lets the admin share the info.
    function onSubmit() {
        $http.post('/users',vm.credentials,{
            headers: {
                'Authorization': 'Bearer ' + authentication.getToken()
            }
        })
            .then(function(data) {
                vm.password = data.data.data.password;
            }, function(err){
                errorsService.errorCode = err.status;
                errorsService.errorMessage = err.data.data.message;
                $location.path('errors');
            });
    };
}
