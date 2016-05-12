'use strict';

angular.module('myApp.statistics', ['ngRoute','chart.js','angularSpinners'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/statistics', {
            templateUrl: 'statistics/statistics.html',
            controller: 'statisticsCtrl',
            controllerAs: 'stats'
        });
    }])

    .controller('statisticsCtrl', statisticsCtrl);

statisticsCtrl.$inject = ['$http', 'authentication', '$location', 'errorsService', 'spinnerService'];

function statisticsCtrl($http, authentication, $location, errorsService, spinnerService) {

    var vm = this;


    vm.labels = ["Subscriptions", "Unsubscriptions"];
    vm.labels1 = ["App","Twitter"];
    vm.data1 = [1,1];


        $http.get('/users/'+authentication.getId(),{
            headers: {
                'Authorization': 'Bearer ' + authentication.getToken()
            }
        }).then(function(data) {
            console.log(JSON.stringify(data.data));
            vm.data1[0] = data.data.tweet_app | 1;
            vm.data1[1] = data.data.tweet_total | 1;
        });



}