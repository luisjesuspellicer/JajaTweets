/**
 * Created by luis on 27/04/16.
 */

// Own tweets, pending tweets and account tweets.
'use strict';
angular.module('myApp.dashboard', ['ngRoute','chart.js', 'ngSanitize'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/dashboard', {
            templateUrl: 'dashboard/dashboard.html',
            controller: 'dashboardCtrl',
            controllerAs: 'dashboard'
        });
    }]).controller('dashboardCtrl', dashboardCtrl);


dashboardCtrl.$inject = ['$scope', '$http', 'authentication', '$location', '$sce',
    'errorsService', 'spinnerService'];

function dashboardCtrl($scope, $http, authentication, $location, $sce,
                       errorsService, spinnerService) {

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
    $scope.formData = {};
    $scope.result = null;
    self.own = function(id){
        var res = false;

        for (var i = 0; i < self.ownTweets.length; i++) {
            if (self.ownTweets[i].id_str == id) {
                res = true;
            }
        }
        return res;
    }
    self.mentionss = function(id){
        var res = false;

        for (var i = 0; i < self.mentions.length; i++) {
            if (self.mentions[i].id_str == id) {
                res = true;
            }
        }
        return res;

    }
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
        }).error(function(data, status,
                          headers, config) {
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

        });
    }

    self.retweet = function(id){
        if(!self.own(id)) {
            spinnerService.show('ownSpinner');
            spinnerService.show('homeSpinner');
            spinnerService.show('mentionsSpinner');

            $http.get('/tweets/' + id + '/retweet', {
                headers: {
                    'Authorization': 'Bearer ' + authentication.getToken()
                }
            }).error(function (data, status, headers, config) {
                console.log("Retweet error");
                errorsService.errorCode = status;
                errorsService.errorMessage = data.data.message || "Undefined error";
                $location.path('errors');
            }).then(function (data) {
                self.updateOwn();
                self.updateHome();
                if(self.mentionss(id)){
                    self.updateMentions();
                }else{
                    spinnerService.hide('mentionsSpinner')
                }
            });
        }
    };

    self.unretweet = function(id){
        spinnerService.show('ownSpinner');
        spinnerService.show('homeSpinner');
        spinnerService.show('mentionsSpinner');
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
            self.updateOwn();
            // First look is tweet is in mentions.+
            if(self.mentionss(id)){
                self.updateMentions();
            }else{
                spinnerService.hide('mentionsSpinner')
            }
            self.updateHome();

        });
    };

    self.favorite = function(id){
        spinnerService.show('ownSpinner');
        spinnerService.show('homeSpinner');
        spinnerService.show('mentionsSpinner');

        //spinnerService.show('loadingSpinner');
        $http.get('/tweets/' + id + '/favorite', {
            headers: {
                'Authorization': 'Bearer ' + authentication.getToken()
            }
        }).error(function (data, status, headers, config) {
            console.log("Favorite error");
            errorsService.errorCode = status;
            errorsService.errorMessage = data.data.message || "Undefined error";
            $location.path('errors');
        }).then(function (data) {
            self.updateHome();
            if(self.mentionss(id)){
                self.updateMentions();
            }else{
                spinnerService.hide('mentionsSpinner')
            }
            self.updateOwn();

        });

    };

    self.unfavorite = function(id){
        spinnerService.show('ownSpinner');
        spinnerService.show('homeSpinner');
        spinnerService.show('mentionsSpinner');
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
            self.updateOwn()
            self.updateHome();
            if(self.mentionss(id)){
                self.updateMentions();
            }else{
                spinnerService.hide('mentionsSpinner')
            }
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
            var auxx = data.data.data.content;
            for (var i = 0;i<auxx.length; i++){

                auxx[i].text = $sce.trustAsHtml(self.parse2(self.parse3(self.parse(auxx[i].text))));
            }
            spinnerService.hide('ownSpinner');
            self.ownTweets = auxx;
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
            var auxx = data.data.data.content;
            for (var i = 0;i<auxx.length; i++){

                auxx[i].text = $sce.trustAsHtml(self.parse2(self.parse3(self.parse(auxx[i].text))));
            }
            spinnerService.hide('homeSpinner');
            self.accountTweets = auxx;
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
            var auxx = data.data.data.content;
            for (var i = 0;i<auxx.length; i++){

                auxx[i].status = $sce.trustAsHtml(self.parse2(self.parse3(self.parse(auxx[i].text))));
            }
            spinnerService.hide('pendingSpinner');
            self.pendingTweets = auxx;
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
            var auxx = data.data.data.content;
            for (var i = 0;i<auxx.length; i++){

                auxx[i].text = $sce.trustAsHtml(self.parse2(self.parse3(self.parse(auxx[i].text))));
            }
            spinnerService.hide('mentionsSpinner');
            self.mentions = auxx;

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
            //console.log("Con check");

            console.log(self.datePending);
            if(self.datePending == null){
                //console.log("Sin fecha");
                self.sendTweet();
            }else{
               // console.log("Con fecha");
                // Date format

                var aux2 = "" +  self.datePending;
                var aux = aux2.split(", ")
                var d = aux[0].split("/");
                var t = aux[1].split(":");
                if(aux.length ==2 && d.length == 3 && t.length == 2) {
                    var day = d[0];
                    var month = d[1];
                    var year = d[2];

                    var min = t[1];
                    var hours = t[0];

                    self.sendTweet(new Date(parseInt(year),parseInt(month),
                        parseInt(day),parseInt(hours),parseInt(min),0,0));
                }else {
                    errorsService.errorCode = status;
                    errorsService.errorMessage = data.data.message || "Undefined error";
                    $location.path('errors');
                }
            }
        }else {
            self.sendTweet();
        }
    }
    
    self.parse = function(oneTweet) {
        if (oneTweet != null) {
            var regex = /(https?:\/\/[^\s]+)/ig;
            return '<span>' + oneTweet.replace(regex, function (url) {
                    return '</span> ' + '<a href="' + url + '">' + url + ' </a><span>';
                }) + '</span>';
        } else {
            return ""
        }

    }
    
    self.add = function() {
        spinnerService.show('loadingSpinner');

        $scope.result = null;
        $http.post('/shortened/', {'link' : self.link}, {
            headers: {
                'Authorization': 'Bearer ' + authentication.getToken()
            }
        }).error(function(data, status, headers, config) {
            console.log("Add shortened URL error");
            errorsService.errorCode = status;
            errorsService.errorMessage = data.data.message || "Undefined error";
            $location.path('errors');
        }).then(function(data) {
            delete self.link ; // clear the form so our user is ready to enter another
            self.result = data.data.data.direct_url;
            spinnerService.hide('loadingSpinner');
        });
    };
    self.parse2 = function(oneHashtag){
        var regex2 = /(#[a-zA-Záéíúëïüöó0-9_\d]+)/ig;
        var axu = ""+oneHashtag;
        return '<span>' + axu.replace(regex2, function(hash) {
                var aux5 = "" + hash;
                return '</span> ' + '<a href="' + 'https://twitter.com/hashtag/' + aux5.substring(1)
                    + '?src=hash' + '">' + hash +' </a><span>';
            }) + '</span>';
    }
    self.parse3 = function(oneUser){
        var regex3 = /(@[a-zA-Záéíúëïüöó0-9_\d]+)/ig;
        var axu = ""+ oneUser;
        return '<span>' + axu.replace(regex3, function(user) {
                var aux6 = "" + user;
                return '</span> ' + '<a href="' + 'https://twitter.com/' + aux6.substring(1)
                    + '?src=hash' + '">' + user +' </a><span>';
            }) + '</span>';
    }



    self.updateOwn();
    self.updateHome();
    self.updateMentions();
    self.updatePending();

}