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
        'email': ""
    };

    vm.password = 'Password';

    vm.onSubmit = onSubmit;

    if (!authentication.isRoot()) {
        console.log('unauth');
        errorsService.errorCode = 401;
        errorsService.errorMessage = "Unauthorized operation.";
        $location.path('errors');
    }

    ///////////

    function onSubmit() {
        $http.post('/users',vm.credentials,{
            headers: {
                'Authorization': 'Bearer ' + authentication.getToken()
            }
        })
            .then(function(data) {
                vm.password = data.data.data.password;
            }, function(err){
                errorsService.errorCode = err.status;
                errorsService.errorMessage = err.data.data.message;
                $location.path('errors');
            });
    };
}
