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


dashboardCtrl.$inject = ['$http', 'authentication', '$location', 'errorsService', 'spinnerService'];

function dashboardCtrl($http, authentication, $location, errorsService, spinnerService) {

    var self = this;
    console.log("User: Token: "+authentication.getToken());

    if (!authentication.isLoggedIn()) {
        console.log('unauth');
        errorsService.errorCode = 401;
        errorsService.errorMessage = "Unauthorized operation.";
        $location.path('errors');
    }

    self.tweet ="";
    self.num = -1;


    self.countt = function(){
        if(self.tweet != undefined){
            
            self.num = self.tweet.length;

        }else{
            if(self.num == 1){
                self.num = 0;
            }
        }
    }
    self.destroy = function(id){

        $http.delete('/tweets/' + id, {
            headers: {
                'Authorization': 'Bearer ' + authentication.getToken()
            }
        }).error(function(data, status, headers, config) {
            console.log("DELETE own tweet error");
            errorsService.errorCode = status;
            errorsService.errorMessage = data.data.message || "Undefined error";
            $location.path('errors');
        }).then(function (data) {

            self.ownTweets = self.updateOwn();
        });
       // alert(self.ownTweets);
    }
    self.destroyPending = function(id){
        $http.delete('/tweets/pending/'+ id, {
            headers: {
                'Authorization': 'Bearer ' + authentication.getToken()
            }
        }).error(function(data, status, headers, config) {
            console.log("DELETE pending tweet error");
            errorsService.errorCode = status;
            errorsService.errorMessage = data.data.message || "Undefined error";
            $location.path('errors');
        }).then(function (data) {

            self.pendingTweets = self.updatePending();
        });
    }
    self.retweet = function(id, hashtag){
        spinnerService.show('loadingSpinner');
        $http.get('/tweets/' + id + '/retweet',{
            headers: {
                'Authorization': 'Bearer ' + authentication.getToken()
            }
        }).error(function(data, status, headers, config) {
            console.log("Retweet error");
            errorsService.errorCode = status;
            errorsService.errorMessage = data.data.message || "Undefined error";
            $location.path('errors');
        }).then(function(data) {
            self.update(hashtag);
        });
    };

    self.unretweet = function(id, hashtag){
        spinnerService.show('loadingSpinner');
        $http.get('/tweets/' + id + '/unretweet',{
            headers: {
                'Authorization': 'Bearer ' + authentication.getToken()
            }
        }).error(function(data, status, headers, config) {
            console.log("UnRetweet error");
            errorsService.errorCode = status;
            errorsService.errorMessage = data.data.message || "Undefined error";
            $location.path('errors');
        }).then(function(data) {
            self.update(hashtag);
        });
    };

    self.favorite = function(id, hashtag){
        spinnerService.show('loadingSpinner');
        $http.get('/tweets/' + id + '/favorite',{
            headers: {
                'Authorization': 'Bearer ' + authentication.getToken()
            }
        }).error(function(data, status, headers, config) {
            console.log("Favorite error");
            errorsService.errorCode = status;
            errorsService.errorMessage = data.data.message || "Undefined error";
            $location.path('errors');
        }).then(function(data) {
            self.update(hashtag);
        });
    };

    self.unfavorite = function(id, hashtag){
        spinnerService.show('loadingSpinner');
        $http.get('/tweets/' + id + '/unfavorite',{
            headers: {
                'Authorization': 'Bearer ' + authentication.getToken()
            }
        }).error(function(data, status, headers, config) {
            console.log("UnRetweet error");
            errorsService.errorCode = status;
            errorsService.errorMessage = data.data.message || "Undefined error";
            $location.path('errors');
        }).then(function(data) {
            self.update(hashtag);
        });
    };

    self.updateOwn = function(){
        
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
    }

    self.updateHome= function (){
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

    self.updatePending = function(){
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
    }

    self.updateMentions = function(){
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
    }

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
        self.updateOwn();
    }

    self.updateOwn();
    self.updateHome();
    self.updateMentions();
    self.updatePending();



}