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

function twAccountsCtrl($window, $http, authentication, spinnerService, errorsService, $location) {

    var vm = this;
    vm.id=0;

    if (!authentication.isLoggedIn()) {
        console.log('unauth');
        errorsService.errorCode = 401;
        errorsService.errorMessage = "Unauthorized operation.";
        $location.path('errors');
    }

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

    vm.update = function(id) {
        spinnerService.show('loadingSpinner');
        $http.get('/twitter/'+id+'/update',{
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

    vm.use = function(id) {
        spinnerService.show('loadingSpinner');
        $http.get('/twitter/'+id+'/use',{
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


    vm.add = function() {
        $window.location.href = '/auth/twitter';
    };

}