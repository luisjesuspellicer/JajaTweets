/**
 * Authors: Diego Ceresuela, Raúl Piracés and Luis Jesús Pellicer.
 * Date: 16-05-2016
 * Name file: twitterAccounts.js
 * Description: This file contains functions to make actions on twitter accounts (delete, update, add and use).
 */
'use strict';

angular.module('myApp.twitterAccounts', ['ngRoute', 'angularSpinners'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/twitterAccounts', {
            templateUrl: 'twitterAccounts/twitterAccounts.html',
            controller: 'twAccountsCtrl',
            controllerAs: 'twAcc'
        });
    }])

    .controller('twAccountsCtrl', twAccountsCtrl);

twAccountsCtrl.$inject = ['$window', '$http','authentication', 'spinnerService','errorsService','$location'];

/**
 * Main function of the controller. Generates a table with multiple twitter accounts and their info.
 * Controls certain actions on each twitter account, and lets the user add a new one (using the Twitter auth method).
 * @param $http
 * @param authentication
 * @param $location
 * @param errorsService
 * @param spinnerService
 */
function twAccountsCtrl($window, $http, authentication, spinnerService, errorsService, $location) {

    var vm = this;
    vm.id=0;

    // Checks if user is logged in
    if (!authentication.isLoggedIn()) {
        errorsService.errorCode = 401;
        errorsService.errorMessage = "Unauthorized operation.";
        $location.path('errors');
    }

    // Gets all twitter accounts
    $http.get('/twitter',{
        headers: {
            'Authorization': 'Bearer ' + authentication.getToken()
        }
    }).error(function(data, status, headers, config) {
        console.log("Twitter GET error");
        errorsService.errorCode = status;
        errorsService.errorMessage = data.data.message || "Undefined error";
        $location.path('errors');
    }).then(function(data) {
        vm.users = data.data.data.content;
    });

    // Delete a twitter account by id
    vm.delete = function(id) {
        spinnerService.show('loadingSpinner');
        $http.delete('/twitter/'+id,{
            headers: {
                'Authorization': 'Bearer ' + authentication.getToken()
            }
        }).error(function(data, status, headers, config) {
            console.log("Delete error");
            errorsService.errorCode = status;
            errorsService.errorMessage = data.data.message || "Undefined error";
            $location.path('errors');
        })
        .then(function() {
            $http.get('/twitter',{
                headers: {
                    'Authorization': 'Bearer ' + authentication.getToken()
                }
            }).then(function(data) {
                vm.users = data.data.data.content;
                spinnerService.hide('loadingSpinner');
            });
        });
    };

    // Update info for one twitter account by id
    vm.update = function(id) {
        spinnerService.show('loadingSpinner');
        $http.put('/twitter/'+id+'/update', "", {
            headers: {
                'Authorization': 'Bearer ' + authentication.getToken()
            }
        }).error(function(data, status, headers, config) {
            console.log("Update error");
            errorsService.errorCode = status;
            errorsService.errorMessage = data.data.message || "Undefined error";
            $location.path('errors');
        }).then(function() {
            $http.get('/twitter',{
                headers: {
                    'Authorization': 'Bearer ' + authentication.getToken()
                }
            }).then(function(data) {
                vm.users = data.data.data.content;
                spinnerService.hide('loadingSpinner');
            });
        });
    };

    // Set to use one twitter account by id
    vm.use = function(id) {
        spinnerService.show('loadingSpinner');
        $http.put('/twitter/'+id+'/use', "", {
            headers: {
                'Authorization': 'Bearer ' + authentication.getToken()
            }
        }).error(function(data, status, headers, config) {
            console.log("Use error");
            errorsService.errorCode = status;
            errorsService.errorMessage = data.data.message || "Undefined error";
            $location.path('errors');
        }).then(function() {
            $http.get('/twitter',{
                headers: {
                    'Authorization': 'Bearer ' + authentication.getToken()
                }
            }).then(function(data) {
                vm.users = data.data.data.content;
                spinnerService.hide('loadingSpinner');
            });
        });
    };

    // Calls twitter auth to add a new twitter account
    vm.add = function() {
        $window.location.href = '/auth/twitter';
    };

}