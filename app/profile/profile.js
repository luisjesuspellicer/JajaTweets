'use strict';

angular.module('myApp.profile', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/profile/:id', {
            templateUrl: 'profile/profile.html',
            controller: 'profileCtrl',
            controllerAs: 'prof'
        });
    }])

    .controller('profileCtrl', profileCtrl);

profileCtrl.$inject = ['$http','authentication','errorsService','$location','$routeParams'];

function profileCtrl($http, authentication, errorsService, $location, $routeParams) {

    var vm = this;

    vm.onSubmit = onSubmit;
    vm.credentials = { name: '', email: '', password: ''};
    vm.changed = false;

    if (!authentication.isLoggedIn()) {
        errorsService.errorCode = 401;
        errorsService.errorMessage = "Unauthorized operation.";
        $location.path('errors');
    }

    console.log($routeParams.id);

    $http.get('http://localhost:3000/users/'+$routeParams.id,{
        headers: {
            'Authorization': 'Bearer ' + authentication.getToken()
        }
    }).then(function(data) {
        vm.newUser = data.data;
        vm.credentials.name = data.data.name;
        vm.credentials.email = data.data.email;
    });

    function onSubmit() {
        $http.put('http://localhost:3000/users/'+$routeParams.id, vm.newUser, {
                headers : {
                    'Authorization': 'Bearer ' + authentication.getToken()
                }
            })
            .then(function() {
                vm.credentials.password = '';
                vm.changed = true;
            }, function(error) {
                errorsService.errorCode = error.code;
                errorsService.errorMessage = error.data.data.message || "Undefined error";
                $location.path('errors');
            })
    }



}