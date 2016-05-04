'use strict';

angular.module('myApp.graphs', ['ngRoute','chart.js'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/graphs', {
            templateUrl: 'graphs/graphs.html',
            controller: 'graphsCtrl',
            controllerAs: 'graphs'
        });
    }])

    .controller('graphsCtrl', graphsCtrl);

graphsCtrl.$inject = ['$http', 'authentication', '$location', 'errorsService'];

function graphsCtrl($http, authentication, $location, errorsService) {

    var vm = this;

    vm.labels = ["Subscriptions", "Unsubscriptions"];
    vm.labels1 = ["App","Twitter"];
    var tw_id=0, la_id=0, el_id=0;

    $http.get('http://localhost:3000/data', {
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
        });

        $http.get('http://localhost:3000/data/'+tw_id,{
            headers: {
                'Authorization': 'Bearer ' + authentication.getToken()
            }
        }).then(function(data) {
            vm.data1 = data.data.data.chart.chart;
            vm.data[0]++; vm.data[1]++;
        });

        $http.get('http://localhost:3000/data/'+la_id,{
            headers: {
                'Authorization': 'Bearer ' + authentication.getToken()
            }
        }).then(function(data) {
            vm.accesses = data.data.data.chart;
        });

        $http.get('http://localhost:3000/data/'+el_id,{
            headers: {
                'Authorization': 'Bearer ' + authentication.getToken()
            }
        }).then(function(data) {
            vm.tweets = data.data.data.chart;
        });


    }, function (err) {
        errorsService.errorCode = err.status;
        errorsService.errorMessage = authentication.getToken();//err.data.data.message;
        $location.path('errors');
    });



}