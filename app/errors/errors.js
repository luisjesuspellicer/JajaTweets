'use strict';

angular.module('myApp.errors', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/errors', {
            templateUrl: 'errors/errors.html',
            controller: 'errorsCtrl',
            controllerAs: 'errors'
        });
    }])
    .controller('errorsCtrl', errorsCtrl);

errorsCtrl.$inject = ['errorsService', '$window'];

function errorsCtrl(errorsService, $window) {

    var vm = this;

    vm.errorCode = errorsService.errorCode;
    vm.errorMessage = errorsService.errorMessage;

    vm.goBack = function(){
        $window.history.back();
    };

}