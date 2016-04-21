'use strict';

angular.module('myApp.singin', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/singin', {
    templateUrl: 'singin/singin.html',
    controller: 'singinCtrl',
    controllerAs: 'singin'
  });
}])

.controller('singinCtrl', singinCtrl);

singinCtrl.$inject = ['$http'];

function singinCtrl($http) {

  var vm = this;

  vm.logged = false;

  vm.credentials = {
    'username': "",
    'password': ""
  };

  ///////

  vm.onSubmit = function(){
     $http.get('http://localhost:3000/users?username='+vm.credentials.username+'&password='+vm.credentials.password)
         .then(function(data){
           vm.logged = data.data.length>0;
         });
  }
}