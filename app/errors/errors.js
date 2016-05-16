/**
 * Authors: Diego Ceresuela, Raúl Piracés and Luis Jesús Pellicer.
 * Date: 16-05-2016
 * Name file: errors.js
 * Description: This file contains functions to show custom errors and go back in page.
 */
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


/**
 * Main function of the controller. Handle custom errors and navigation.
 * @param errorsService
 * @param $window
 */
function errorsCtrl(errorsService, $window) {

    var vm = this;

    vm.errorCode = errorsService.errorCode;
    vm.errorMessage = errorsService.errorMessage;

    vm.goBack = function(){
        $window.history.back();
    };

}