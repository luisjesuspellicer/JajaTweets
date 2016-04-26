'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
    'ngRoute',
    'myApp.singin',
    'myApp.errors',
    'myApp.singup',
    'myApp.version',
    'myApp.graphs'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/singin'});
}]);
