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
    self.checked = "NO";
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

    self.destroy = function(id, index){
        // Refresh ownTweets and accountTweets
        var aux1 = self.ownTweets[index];
        self.ownTweets.splice(index,1);
        for(var  i = 0; i< self.accountTweets.length; i++){
            if(self.accountTweets[i].id_str == aux1.id_str){
                self.accountTweets.splice(i,1);
                i = self.accountTweets.length;
            }
        }
        for(var  i = 0; i< self.mentions.length; i++){
            if(self.mentions[i].id_str == aux1.id_str){
                self.mentions.splice(i,1);
                i = self.mentions.length;
            }
        }
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


        });
    }

    self.destroyPending = function(id, index){
        self.pendingTweets.splice(index,1);
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

    self.sendTweet = function(validDate){
        if(validDate != null){
            self.dat = {"status": self.tweet, "date": validDate};
        }else{
            self.dat = {"status": self.tweet, "date": new Date()};
        }

        $http({
            method: 'POST',
            url: '/tweets',
            data: self.dat, //forms user object
            headers: {
                'Authorization': 'Bearer ' + authentication.getToken(),
                'Content-Type': 'application/json'
            }
        }).error(function (data, status, headers, config) {
            console.log("GET timeline error");
            errorsService.errorCode = status;
            errorsService.errorMessage = data.data.message || "Undefined error";
            $location.path('errors');
        }).then(function (data) {
            self.tweet = "";
            self.ownTweets = self.updateOwn()

        });
    }

    self.newTweet = function(){
        if(self.checked == 'YES'){
            console.log("Con check");

            console.log(self.datePending);
            if(self.datePending == null){
                console.log("Sin fecha");
                self.sendTweet();
            }else{
                console.log("Con fecha");
                // Date format
                var aux2 = "" +  self.datePending;
                var aux = aux2.split(" ")
                aux2 = aux[1] +" " +  aux[2] + ", " + aux[3] + " " + aux[4];
                console.log(aux2);
                self.sendTweet(aux2);
            }
        }else {
            self.sendTweet();
        }
    }
    self.updateOwn();
    self.updateHome();
    self.updateMentions();
    self.updatePending();



}