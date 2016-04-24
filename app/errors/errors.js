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

errorsCtrl.$inject = ['errorsService'];

function errorsCtrl(errorsService) {

    var vm = this;

    vm.errorCode = errorsService.errorCode;
    vm.errorMessage = errorsService.errorMessage;

}