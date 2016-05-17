/**
 * Authors: Diego Ceresuela, Raúl Piracés and Luis Jesús Pellicer.
 * Date: 16-05-2016
 * Name file: profile.js
 * Description: This file contains functions to work on user profiles (showing & changes).
 */
'use strict';

angular.module('myApp.profile', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/profile/:id', {
            templateUrl: 'profile/profile.html',
            controller: 'profileCtrl',
            controllerAs: 'prof'
        });
    }])

    .controller('profileCtrl', profileCtrl);

profileCtrl.$inject = ['$http','authentication','errorsService','$location','$routeParams'];

/**
 * Main function of the controller. Acquire user profile data, and allows to modify its profile.
 * @param $http
 * @param authentication
 * @param errorsService
 * @param $location
 * @param $routeParams
 */
function profileCtrl($http, authentication, errorsService, $location, $routeParams) {

    var vm = this;

    vm.onSubmit = onSubmit;
    vm.credentials = { name: '', oldEmail: '', email: '', password: ''};
    vm.changed = false;

    if (!authentication.isLoggedIn()) {
        errorsService.errorCode = 401;
        errorsService.errorMessage = "Unauthorized operation.";
        $location.path('errors');
    }

    // Get information from user profile
    $http.get('/users/'+$routeParams.id,{
        headers: {
            'Authorization': 'Bearer ' + authentication.getToken()
        }
    }).then(function(data) {
        vm.newUser = data.data.data;
        vm.credentials.name = data.data.data.name;
        vm.credentials.email = data.data.data.email;
        vm.credentials.oldEmail = data.data.data.email;
    }, function(error) {
        errorsService.errorCode = error.code;
        errorsService.errorMessage = error.data.data.message || "Undefined error";
        $location.path('errors');
    });

    // Submits new changes on the user profile
    function onSubmit() {
        if(vm.credentials.password=="" || !vm.credentials.password){
            console.log("Form validation error");
        } else {
            $http.put('/users/'+$routeParams.id, vm.credentials, {
                headers : {
                    'Authorization': 'Bearer ' + authentication.getToken()
                }
            }).then(function() {
                vm.credentials.password = '';
                vm.changed = true;
            }, function(error) {
                errorsService.errorCode = error.code;
                errorsService.errorMessage = error.data.data.message || "Undefined error";
                $location.path('errors');
            })
        }
    }



}