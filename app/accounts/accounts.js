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

accountsCtrl.$inject = ['$http','authentication'];

function accountsCtrl($http, authentication) {

    var vm = this;
vm.id=0;
    $http.get('http://localhost:3000/users',{
        headers: {
            'Authorization': 'Bearer ' + authentication.getToken()
        }
    }).then(function(data) {
        vm.users = data.data;
    });

    vm.delete = function(id) {
        $http.delete('http://localhost:3000/users/'+id,{
            headers: {
                'Authorization': 'Bearer ' + authentication.getToken()
            }
        }).then(function() {
            $http.get('http://localhost:3000/users',{
                headers: {
                    'Authorization': 'Bearer ' + authentication.getToken()
                }
            }).then(function(data) {
                vm.users = data.data;
            });
        });
    }

}