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

singupCtrl.$inject = ['$http','errorsService','$location'];

function singupCtrl($http, errorsService, $location) {

    var vm = this;

    vm.credentials = {
        'name': "",
        'email': "",
        'password': ""
    };

    vm.onSubmit = onSubmit;

    ///////////

    function onSubmit() {
        $http.post('http://localhost:3000/users', vm.credentials)
            .then(function() {
                $location.path('profile');
            }, function(err){
                errorsService.errorCode = err.status;
                errorsService.errorMessage = err.data.data.message;
                $location.path('errors');
            });
    };
}
