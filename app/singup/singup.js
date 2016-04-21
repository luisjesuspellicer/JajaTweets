'use strict';

angular.module('myApp.singup', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/singup', {
    templateUrl: 'singup/singup.html',
    controller: 'singupCtrl',
    controllerAs: 'singup'
  });
}])

.controller('singupCtrl', singupCtrl);

singupCtrl.$inject = ['$http'];

function singupCtrl($http) {

    var vm = this;

    vm.credentials = {
        'username': "",
        'email': "",
        'password': ""
    };

    vm.onSubmit = onSubmit;

    ///////////

    function onSubmit() {
        $http.post('http://localhost:3000/users', vm.credentials)
            .then(function() {
                vm.created = vm.credentials.username;
            });
    };
}
