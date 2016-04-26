'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
    'ngRoute',
    'myApp.signin',
    'myApp.errors',
    'myApp.signup',
    'myApp.version',
    'myApp.graphs'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/signin'});
}]);
