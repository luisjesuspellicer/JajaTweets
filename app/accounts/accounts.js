/**
 * Authors: Diego Ceresuela, Raúl Piracés and Luis Jesús Pellicer.
 * Date: 16-05-2016
 * Name file: accounts.js
 * Description: Controller for the view accounts.
 * It controls the users. Show list of users and let user deletion.
 */
'use strict';

angular.module('myApp.accounts', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/accounts', {
            templateUrl: 'accounts/accounts.html',
            controller: 'accountsCtrl',
            controllerAs: 'acc'
        });
    }])

    .controller('accountsCtrl', accountsCtrl);

accountsCtrl.$inject = ['$http','authentication','errorsService','$location'];

function accountsCtrl($http, authentication, errorsService, $location) {

    var vm = this;
    vm.id=0;

    /*
     * Be sure that the user is logged in.
     */
    if (!authentication.isLoggedIn()) {
        errorsService.errorCode = 401;
        errorsService.errorMessage = "Unauthorized operation.";
        $location.path('errors');
    }

    // Shows all available users.
    $http.get('/users',{
        headers: {
            'Authorization': 'Bearer ' + authentication.getToken()
        }
    }).error(function(data, status, headers, config) {
        console.log("[Accounts] - GET /users failed with "+status);
        errorsService.errorCode = status;
        errorsService.errorMessage = data.data.message || "Undefined error";
        $location.path('errors');
    }).then(function(data) {
        vm.users = data.data;
    });

    /*
     * Remove user with ID equal to 'id'
     */
    vm.delete = function(id) {
        $http.delete('/users/'+id,{
            headers: {
                'Authorization': 'Bearer ' + authentication.getToken()
            }
        }).error(function(data, status, headers, config) {
            console.log("[Accounts] - DELETE /users failed with "+status);
            errorsService.errorCode = status;
            errorsService.errorMessage = data.data.message || "Undefined error";
            $location.path('errors');
        }).then(function() {
            $http.get('/users',{
                headers: {
                    'Authorization': 'Bearer ' + authentication.getToken()
                }
            }).then(function(data) {
                vm.users = data.data;
            });
        });
    }

}