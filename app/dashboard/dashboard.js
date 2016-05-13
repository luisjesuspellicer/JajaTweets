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
    });
    $http.get('/mentions', {
        headers: {
            'Authorization': 'Bearer ' + authentication.getToken()
        }
    }).error(function(data, status, headers, config) {
        console.log("GET mentions error");
        errorsService.errorCode = status;
        errorsService.errorMessage = data.data.message || "Undefined error";
        $location.path('errors');
    }).then(function (data) {
        console.log(data.data.data.content);
        self.mentions = data.data.data.content;
        
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
    self.tweet ="";
    self.num = -1;

    self.newTweet = function(){
        self.dat = {"status": self.tweet,"date": new Date()};
        $http({
            method  : 'POST',
            url     : '/tweets',
            data    : self.dat, //forms user object
            headers : {
                'Authorization': 'Bearer ' + authentication.getToken(),
                'Content-Type': 'application/json'}
        }).error(function(data, status, headers, config) {
            console.log("GET timeline error");
            errorsService.errorCode = status;
            errorsService.errorMessage = data.data.message || "Undefined error";
            $location.path('errors');
        }).then(function(data) {
            self.accountTweets = data.data.data.content;
        });
        self.tweet="";
    }
    self.countt = function(){
        if(self.tweet != undefined){
            
            self.num = self.tweet.length;

        }else{
            if(self.num == 1){
                self.num = 0;
            }
            
           // self.tweet ="";
        }

    }
}