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

    if (!authentication.isLoggedIn()) {
        errorsService.errorCode = 401;
        errorsService.errorMessage = "Unauthorized operation.";
        $location.path('errors');
    }

    $http.get('http://localhost:3000/tweets/pending', {
        headers: {
            'Authorization': 'Bearer ' + authentication.getToken()
        }
    }).then(function (data) {

        self.pendingTweets = data.data.data.content;
        console.log(data.data.data.content);
    });

    $http.get('http://localhost:3000/tweets/own', {
        headers: {
            'Authorization': 'Bearer ' + authentication.getToken()
        }
    }).then(function (data) {

        self.ownTweets = data.data.data.content;

    });
    $http.get('http://localhost:3000/tweets',{
        headers: {
            'Authorization': 'Bearer ' + authentication.getToken()
        }
    }).then(function(data) {
        self.accountTweets = data.data.data.content;
    });
    
}