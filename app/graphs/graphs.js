/**
 * Authors: Diego Ceresuela, Raúl Piracés and Luis Jesús Pellicer.
 * Date: 16-05-2016
 * Name file: graphs.js
 * Description: This file contains functions to generate admin graphs (of system users).
 */
'use strict';

angular.module('myApp.graphs', ['ngRoute','chart.js','angularSpinners'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/graphs', {
            templateUrl: 'graphs/graphs.html',
            controller: 'graphsCtrl',
            controllerAs: 'graphs'
        });
    }])

    .controller('graphsCtrl', graphsCtrl);

graphsCtrl.$inject = ['$http', 'authentication', '$location', 'errorsService', 'spinnerService'];

/**
 * Main function of the controller. Generates multiple graphs of current status of system users.
 * @param $http
 * @param authentication
 * @param $location
 * @param errorsService
 * @param spinnerService
 */
function graphsCtrl($http, authentication, $location, errorsService, spinnerService) {

    var vm = this;

    vm.labels = ["Subscriptions", "Unsubscriptions"];
    vm.labels1 = ["App","Twitter"];
    var tw_id=0, la_id=0, el_id=0;

    spinnerService.showAll();

    // Gets available data for graphs
    $http.get('/data', {
        headers: {
            'Authorization': 'Bearer ' + authentication.getToken()
        }
    }).then(function (data) {
        data.data.forEach(function (chart) {
            if (chart.name=='subunsub') {
                vm.data = chart.chart;
            } else if (chart.name=="tweets") {
                vm.data1 = chart.chart;
                tw_id = chart._id;
            } else if (chart.name == "lastAccess") {
                vm.accesses = chart.chart;
                la_id = chart._id;
            } else {
                vm.tweets = chart.chart;
                el_id = chart._id;
            }
            spinnerService.hideAll();
        });
        // Gets tweets data
        $http.get('/data/'+tw_id,{
            headers: {
                'Authorization': 'Bearer ' + authentication.getToken()
            }
        }).then(function(data) {
            vm.data1 = data.data.data.chart.chart;
            vm.data[0]++; vm.data[1]++;
        });

        // Gets last accesses data
        $http.get('/data/'+la_id,{
            headers: {
                'Authorization': 'Bearer ' + authentication.getToken()
            }
        }).then(function(data) {
            vm.accesses = data.data.data.chart;
        });

        // Gets users data
        $http.get('/data/'+el_id,{
            headers: {
                'Authorization': 'Bearer ' + authentication.getToken()
            }
        }).then(function(data) {
            vm.tweets = data.data.data.chart;
        });
    // Error handling
    }, function (err) {
        errorsService.errorCode = err.status;
        errorsService.errorMessage = authentication.getToken();//err.data.data.message;
        $location.path('errors');
    });



}