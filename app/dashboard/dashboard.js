/**
 * Created by luis on 27/04/16.
 */

// Own tweets, pending tweets and account tweets.
'use strict';
angular.module('myApp.dashboard', ['ngRoute','chart.js'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/dashboard', {
            templateUrl: 'dashboard/dashboard.html',
            controller: 'dashboardCtrl',
            controllerAs: 'dashboard'
        });
    }])

    .controller('dashboardCtrl', dashboardCtrl);


dashboardCtrl.$inject = ['$http', 'authentication', '$location', 'errorsService'];

function dashboardCtrl($http, authentication, $location, errorsService) {

    var self = this;
    console.log("User: Token: "+authentication.getToken());

    if (!authentication.isLoggedIn()) {
        console.log('unauth');
        errorsService.errorCode = 401;
        errorsService.errorMessage = "Unauthorized operation.";
        $location.path('errors');
    }

    $http.get('/tweets/pending', {
        headers: {
            'Authorization': 'Bearer ' + authentication.getToken()
        }
    }).error(function(data, status, headers, config) {
        console.log("GET pending tweets error");
        errorsService.errorCode = status;
        errorsService.errorMessage = data.data.message || "Undefined error";
        $location.path('errors');
    }).then(function (data) {

        self.pendingTweets = data.data.data.content;
        console.log(data.data.data.content);
    });

    $http.get('/tweets/own', {
        headers: {
            'Authorization': 'Bearer ' + authentication.getToken()
        }
    }).error(function(data, status, headers, config) {
        console.log("GET own tweets error");
        errorsService.errorCode = status;
        errorsService.errorMessage = data.data.message || "Undefined error";
        $location.path('errors');
    }).then(function (data) {

        self.ownTweets = data.data.data.content;

    });
    $http.get('/tweets',{
        headers: {
            'Authorization': 'Bearer ' + authentication.getToken()
        }
    }).error(function(data, status, headers, config) {
        console.log("GET timeline error");
        errorsService.errorCode = status;
        errorsService.errorMessage = data.data.message || "Undefined error";
        $location.path('errors');
    }).then(function(data) {
        self.accountTweets = data.data.data.content;
    });
    
}