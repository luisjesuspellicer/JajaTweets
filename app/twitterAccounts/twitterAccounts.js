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

twAccountsCtrl.$inject = ['$window', '$http','authentication', 'spinnerService'];

function twAccountsCtrl($window, $http, authentication, spinnerService) {

    var vm = this;
    vm.id=0;
    $http.get('http://localhost:3000/twitter',{
        headers: {
            'Authorization': 'Bearer ' + authentication.getToken()
        }
    }).then(function(data) {
        vm.users = data.data.data.content;
    });

    vm.delete = function(id) {
        spinnerService.show('loadingSpinner');
        $http.delete('http://localhost:3000/twitter/'+id,{
            headers: {
                'Authorization': 'Bearer ' + authentication.getToken()
            }
        }).then(function() {
            $http.get('http://localhost:3000/twitter',{
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
        $http.get('http://localhost:3000/twitter/'+id+'/update',{
            headers: {
                'Authorization': 'Bearer ' + authentication.getToken()
            }
        }).then(function() {
            $http.get('http://localhost:3000/twitter',{
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
        $http.get('http://localhost:3000/twitter/'+id+'/use',{
            headers: {
                'Authorization': 'Bearer ' + authentication.getToken()
            }
        }).then(function() {
            $http.get('http://localhost:3000/twitter',{
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