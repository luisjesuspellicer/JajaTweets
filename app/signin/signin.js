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

    vm.wrong = false;
    vm.credentials = {
        'email': "",
        'password': ""
    };

    if (authentication.isLoggedIn()) {
        $location.path('dashboard');
    }

    ///////

    vm.onSubmit = function () {
        vm.wrong = false;
        $http.post('http://localhost:3000/login', vm.credentials)
            .then(function (data) {
                authentication.saveToken(data.data.data.token);
                if (vm.credentials.email == "test@test") {
                    console.log('->graphs');
                    $location.path('graphs');
                } else {
                    console.log('->dashboard');
                    $location.path('dashboard');
                }
            }, function (err) {
                if (err.status==401 && err.data.message=="User not found") {
                    vm.wrong = true;
                    vm.credentials = {
                        'email': "",
                        'password': ""
                    };
                } else {
                    errorsService.errorCode = err.status;
                    errorsService.errorMessage = err.data.message || "Undefined error";
                    $location.path('errors');
                }
            });

    }
}