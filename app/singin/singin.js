'use strict';

angular.module('myApp.singin', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/singin', {
            templateUrl: 'singin/singin.html',
            controller: 'singinCtrl',
            controllerAs: 'singin'
        });
    }])

    .controller('singinCtrl', singinCtrl);

singinCtrl.$inject = ['$http', 'authentication', '$location', 'errorsService'];

function singinCtrl($http, authentication, $location, errorsService) {

    var vm = this;

    vm.err = {};

    vm.credentials = {
        'email': "",
        'password': ""
    };

    ///////

    vm.onSubmit = function () {

        $http.post('http://localhost:3000/login', vm.credentials)
            .then(function (data) {
                authentication.saveToken(data.data.token);
                $location.path('profile');
            }, function (err) {
                vm.err = err;
                errorsService.errorCode = err.status;
                errorsService.errorMessage = err.data.message;
                $location.path('errors');
            });

    }
}