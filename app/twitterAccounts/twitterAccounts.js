'use strict';

angular.module('myApp.twitterAccounts', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/twitterAccounts', {
            templateUrl: 'twitterAccounts/twitterAccounts.html',
            controller: 'twAccountsCtrl',
            controllerAs: 'acc'
        });
    }])

    .controller('twAccountsCtrl', twAccountsCtrl);

twAccountsCtrl.$inject = ['$http','authentication'];

function twAccountsCtrl($http, authentication) {

    var vm = this;
vm.id=0;
    $http.get('http://localhost:3000/twitter',{
        headers: {
            'Authorization': 'Bearer ' + authentication.getToken()
        }
    }).then(function(data) {
        vm.users = data.data.data.content;
        console.log(vm.users);
    });

    vm.delete = function(id) {
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
            });
        });
    }

}