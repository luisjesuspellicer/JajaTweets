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

    // Bar chart 1
    vm.labels = [];
    vm.array1 = [];
    vm.array2 = [];
    vm.data = [vm.array1, vm.array2];
    vm.series = ['Tweets in app', 'Total Tweets'];
    // Doughnut chart 1
    vm.labels1 = ["App", "Twitter"];
    vm.data1 = [1, 1];
    // Bar chart 2
    vm.labels2 = [];
    vm.array11 = [];
    vm.array22 = [];
    vm.data2 = [vm.array11, vm.array22];
    vm.series2 = ['Followers', 'Following'];
    // Doughnut chart 2
    vm.labels3 = ["Mentions", "Tweets"];
    vm.data3 = [1, 1];
    vm.tweets = 1;
    vm.mentions = 1;

    if (!authentication.isLoggedIn()) {
        console.log('unauth');
        errorsService.errorCode = 401;
        errorsService.errorMessage = "Unauthorized operation.";
        $location.path('errors');
    }

    $http.get('/users/' + authentication.getId(), {
        headers: {
            'Authorization': 'Bearer ' + authentication.getToken()
        }
    }).error(function (data, status, headers, config) {
        console.log("GET users error");
        errorsService.errorCode = status;
        errorsService.errorMessage = data.data.message || "Undefined error";
        $location.path('errors');
    }).then(function (data) {
        console.log(JSON.stringify(data.data));
        vm.data1[0] = data.data.tweet_app | 1;
        vm.data1[1] = data.data.tweet_total | 1;
    });

    $http.get('/twitter/', {
        headers: {
            'Authorization': 'Bearer ' + authentication.getToken()
        }
    }).error(function (data, status, headers, config) {
        console.log("GET twitter accounts error");
        errorsService.errorCode = status;
        errorsService.errorMessage = data.data.message || "Undefined error";
        $location.path('errors');
    }).then(function (data) {
        console.log(data.data.data.content);
        angular.forEach(data.data.data.content, function (value, key) {
            vm.labels.push('@' + value.screen_name);
            vm.labels2.push('@' + value.screen_name);
            vm.array1.push(value.tweet_app);
            vm.array2.push(value.statuses_count);
            vm.array11.push(value.followers_count);
            vm.array22.push(value.friends_count);
        });
    });
}