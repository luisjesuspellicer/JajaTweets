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

function signupCtrl($http, errorsService, $location, authentication) {

    var vm = this;

    vm.credentials = {
        'name': "",
        'email': "",
        'password': ""
    };

    vm.onSubmit = onSubmit;

    ///////////

    function onSubmit() {
        $http.post('http://localhost:3000/users',vm.credentials,{
            headers: {
                'Authorization': 'Bearer ' + authentication.getToken()
            }
        })
            .then(function(data) {
                $location.path('signin');
            }, function(err){
                errorsService.errorCode = err.status;
                errorsService.errorMessage = err.data.data.message;
                $location.path('errors');
            });
    };
}
