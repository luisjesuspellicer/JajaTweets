'use strict';

angular.module('myApp.signin', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/signin', {
            templateUrl: 'signin/signin.html',
            controller: 'signinCtrl',
            controllerAs: 'signin'
        });
    }])

    .controller('signinCtrl', signinCtrl);

signinCtrl.$inject = ['$http', 'authentication', '$location', 'errorsService'];

function signinCtrl($http, authentication, $location, errorsService) {

    var vm = this;

    vm.credentials = {
        'email': "",
        'password': ""
    };

    ///////

    vm.onSubmit = function () {

        $http.post('http://localhost:3000/login', vm.credentials)
            .then(function (data) {
                authentication.saveToken(data.data.data.token);
                if (vm.credentials.email == "test@test") {
                    $location.path('graphs');
                }
            }, function (err) {
                errorsService.errorCode = err.status;
                errorsService.errorMessage = err.data.message;
                $location.path('errors');
            });

    }
}