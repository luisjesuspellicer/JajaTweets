/**
 * Authors: Diego Ceresuela, Raúl Piracés and Luis Jesús Pellicer.
 * Date: 16-05-2016
 * Name file: dashboard.js
 * Description: Controller for the view dashboard.
 * It controls the dashboard, show own tweets, tweets from an account, mention tweets
 * and pending tweets. This controller let:
 * - Remove own tweets.
 * - Make and unmake favourite in own, account and mention tweets.
 * - Make and unmake retweet in account and mention tweets.
 * - Create new tweet in the moment.
 * - Create pending tweet (must select the date and hour).
 * - Short urls with own shortener.
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

    /*
     * Be sure that the user is logged in.
     */
    if (!authentication.isLoggedIn()) {
        errorsService.errorCode = 401;
        errorsService.errorMessage = "Unauthorized operation.";
        $location.path('errors');
    }

    self.tweet =""; // Initial text of the new tweet's text.
    self.num = -1; // Num of characters in the new tweet's text.

    $scope.formData = {};
    $scope.result = null;

    /*
     * Return true if exists one tweet in ownTweets that have id as identifier.
     * Return false in other case.
     */
    self.own = function(id){
        var res = false;

        for (var i = 0; i < self.ownTweets.length; i++) {
            if (self.ownTweets[i].id_str == id) {
                res = true;
            }
        }
        return res;
    }

    /*
     * Return true if exists one tweet in mentionTweets that have id as identifier.
     * Return false in other case.
     */
    self.mentionss = function(id){
        var res = false;

        for (var i = 0; i < self.mentions.length; i++) {
            if (self.mentions[i].id_str == id) {
                res = true;
            }
        }
        return res;

    }

    /*
     * Return the length of the text that the user typed
     */
    self.countt = function(){
        if(self.tweet != undefined){
            self.num = self.tweet.length;

        }else{
            if(self.num == 1){
                self.num = 0;
            }
        }
    }

    /*
     * Destroy own tweet with ID equal to 'id' in the view and make request to
     * backend, for destroy tweet with Twitter's API.
     */
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
        // Request to back-end.
        $http.delete('/tweets/' + id, {
            headers: {
                'Authorization': 'Bearer ' + authentication.getToken()
            }
        }).error(function(data, status,
                          headers, config) {
            console.log("DELETE own tweet error");
            errorsService.errorCode = status;
            errorsService.errorMessage = (data.data?data.data.message:null) || "Undefined error";
            $location.path('errors');
        }).then(function (data) {


        });
    }

    /*
     * Destroy pending tweet with ID equal to 'id' in the view and make request to
     * backend, for destroy tweet with Twitter's API.
     */
    self.destroyPending = function(id, index){
        self.pendingTweets.splice(index,1);
        $http.delete('/tweets/pending/'+ id, {
            headers: {
                'Authorization': 'Bearer ' + authentication.getToken()
            }
        }).error(function(data, status, headers, config) {
            console.log("DELETE pending tweet error");
            errorsService.errorCode = status;
            errorsService.errorMessage = (data.data?data.data.message:null) || "Undefined error";
            $location.path('errors');
        }).then(function (data) {

        });
    }

    /*
     * If tweet with ID equal to 'id' is part of ownTweets do nothing. Else,
     * make retweet request to back-end and refresh with increasing retweet count.
     */
    self.retweet = function(id, index, where){

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
                errorsService.errorMessage = (data.data?data.data.message:null) || "Undefined error";
                $location.path('errors');
            }).then(function (data) {
                self.updateRtById(id,true);
                self.updateOwn();
                spinnerService.hide('mentionsSpinner')
                spinnerService.hide('ownSpinner');
                spinnerService.hide('homeSpinner');
            });
        }
    };

    /*
     * If tweet with ID equal to 'id' is part of ownTweets and isn't a
     * retweeted tweet, do nothing. Else unretweet the tweet in the view
     * and make unretweet request for the back-end.
     */
    self.unretweet = function(id, index, where){
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
            errorsService.errorMessage = (data.data?data.data.message:null) || "Undefined error";
            $location.path('errors');
        }).then(function(data) {
            self.updateRtById(id,false);
            self.updateHome();
            self.updateMentions();
            self.updateOwn();
            spinnerService.hide('mentionsSpinner')
            spinnerService.hide('ownSpinner');
            spinnerService.hide('homeSpinner');

        });
    };

    /*
     * If tweet with id as identifier is part of ownTweets and is a retweet
     * tweet do nothing, else refresh the view and make request to back-end.
     */
    self.favorite = function(id, where){
        spinnerService.show('ownSpinner');
        spinnerService.show('homeSpinner');
        spinnerService.show('mentionsSpinner');

        if(where == 'own') {

            for (var i = 0; i < self.ownTweets.length; i++) {
                if (self.ownTweets[i].id_str == id && !self.ownTweets[i].retweeted) {
                    //spinnerService.show('loadingSpinner');
                    $http.get('/tweets/' + id + '/favorite', {
                        headers: {
                            'Authorization': 'Bearer ' + authentication.getToken()
                        }
                    }).error(function (data, status, headers, config) {
                        console.log("Favorite error");
                        errorsService.errorCode = status;
                        errorsService.errorMessage = (data.data?data.data.message:null) || "Undefined error";
                        $location.path('errors');
                    }).then(function (data) {

                        self.updateLikeById(id, true);
                        spinnerService.hide('mentionsSpinner');
                        spinnerService.hide('ownSpinner');
                        spinnerService.hide('homeSpinner');
                        i = self.ownTweets.length;
                    });
                }
            }
            spinnerService.hide('mentionsSpinner')
            spinnerService.hide('ownSpinner');
            spinnerService.hide('homeSpinner');
        }else{
            $http.get('/tweets/' + id + '/favorite', {
                headers: {
                    'Authorization': 'Bearer ' + authentication.getToken()
                }
            }).error(function (data, status, headers, config) {
                console.log("Favorite error");
                errorsService.errorCode = status;
                errorsService.errorMessage = (data.data?data.data.message:null) || "Undefined error";
                $location.path('errors');
            }).then(function (data) {
                self.updateOwn();
                self.updateLikeById(id,true);
                spinnerService.hide('mentionsSpinner')
                spinnerService.hide('ownSpinner');
                spinnerService.hide('homeSpinner');

            });
        }
    };

    /*
     * If tweet with ID equal to 'id' is part of ownTweets and is a retweet tweet,
     * make requests to back-end to refresh the view. Else refresh view in local.
     * For finish, make request of unfavourite to the back-end in two cases.
     */
    self.unfavorite = function(id, where){
        spinnerService.show('ownSpinner');
        spinnerService.show('homeSpinner');
        spinnerService.show('mentionsSpinner');

        if(where == 'own') {

            for (var i = 0; i < self.ownTweets.length; i++) {
                if (self.ownTweets[i].id_str == id && !self.ownTweets[i].retweeted) {

                    console.log("enserio??");
                    spinnerService.show('ownSpinner');
                    spinnerService.show('homeSpinner');
                    spinnerService.show('mentionsSpinner');

                    $http.get('/tweets/' + id + '/unfavorite', {
                        headers: {
                            'Authorization': 'Bearer ' + authentication.getToken()
                        }
                    }).error(function (data, status, headers, config) {
                        console.log("UnRetweet error");
                        errorsService.errorCode = status;
                        errorsService.errorMessage = (data.data?data.data.message:null) || "Undefined error";
                        $location.path('errors');
                    }).then(function (data) {
                        self.updateLikeById(id,false);
                    });
                    i = self.ownTweets.length;
                }
            }
            spinnerService.hide('mentionsSpinner')
            spinnerService.hide('ownSpinner');
            spinnerService.hide('homeSpinner');
        }else{
            $http.get('/tweets/' + id + '/unfavorite', {
                headers: {
                    'Authorization': 'Bearer ' + authentication.getToken()
                }
            }).error(function (data, status, headers, config) {
                console.log("UnRetweet error");
                errorsService.errorCode = status;
                errorsService.errorMessage = (data.data?data.data.message:null) || "Undefined error";
                $location.path('errors');
            }).then(function (data) {
                self.updateOwn();
                self.updateLikeById(id, false);
                spinnerService.hide('mentionsSpinner')
                spinnerService.hide('ownSpinner');
                spinnerService.hide('homeSpinner');
            });
        }
    };

    /*
     * Make request to the back-end to refresh the view with new own tweets.
     */
    self.updateOwn = function(){


        $http.get('/tweets/own', {
            headers: {
                'Authorization': 'Bearer ' + authentication.getToken()
            }
        }).error(function(data, status, headers, config) {
            console.log("GET own tweets error");
            errorsService.errorCode = status;
            errorsService.errorMessage = (data.data?data.data.message:null) || "Undefined error";
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

    /*
     * Make request to the back-end to refresh the view with new home tweets.
     */
    self.updateHome= function (){
        $http.get('/tweets',{
            headers: {
                'Authorization': 'Bearer ' + authentication.getToken()
            }
        }).error(function(data, status, headers, config) {
            console.log("GET timeline error");
            errorsService.errorCode = status;
            errorsService.errorMessage = (data.data?data.data.message:null) || "Undefined error";
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

    /*
     * Make request to the back-end to refresh the view with new pending weets.
     */
    self.updatePending = function(){
        $http.get('/tweets/pending', {
            headers: {
                'Authorization': 'Bearer ' + authentication.getToken()
            }
        }).error(function(data, status, headers, config) {
            console.log("GET pending tweets error");
            errorsService.errorCode = status;
            errorsService.errorMessage = (data.data?data.data.message:null) || "Undefined error";
            $location.path('errors');
        }).then(function (data) {
            var auxx = data.data.data.content;
            for (var i = 0;i<auxx.length; i++){
                console.log(auxx[i].status);
                auxx[i].status = $sce.trustAsHtml(self.parse2(self.parse3(self.parse(auxx[i].status))));
                console.log(auxx[i].status);
            }
            spinnerService.hide('pendingSpinner');
            self.pendingTweets = auxx;
        });
    }

    /*
     * Make request to the back-end to refresh the view with new mention tweets.
     */
    self.updateMentions = function(){
        $http.get('/mentions', {
            headers: {
                'Authorization': 'Bearer ' + authentication.getToken()
            }
        }).error(function(data, status, headers, config) {
            console.log("GET mentions error");
            errorsService.errorCode = status;
            errorsService.errorMessage = (data.data?data.data.message:null) || "Undefined error";
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

    /*
     * Make request to back-end to send one tweet. If validDate is
     * less than actual date, refresh ownTweets, else refresh pending tweets.
     */
    self.sendTweet = function(validDate){

        // If date is null, it create the tweet with actual date.
        if(validDate != null){

            self.dat = {"status": self.tweet, "date": validDate};

        }else{
            validDate = new Date();
            self.dat = {"status": self.tweet, "date": validDate};
        }
        if(validDate > new Date()){
            spinnerService.show('pendingSpinner');

            self.updatePending();
        }else{
            spinnerService.show('ownSpinner');
            spinnerService.show('homeSpinner');

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
            errorsService.errorMessage = (data.data?data.data.message:null) || "Undefined error";
            $location.path('errors');
        }).then(function (data) {
            if(validDate > new Date()){

                self.updatePending();
            }else{
                spinerService.show('ownSpinner');
                spinnerService.show('homeSpinner');
                self.tweet = "";
                self.ownTweets = self.updateHome();
                self.ownTweets = self.updateOwn();
            }
        });
    }

    /*
     * If the user click in checkbox, parse de date and call method sendTweet.
     * In other cases, call sendTweet with null date.
     */
    self.newTweet = function(){
        spinnerService.show('pendingSpinner');
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
                    var d = new Date(new Date(parseInt(year),parseInt(month),
                        parseInt(day),parseInt(hours),parseInt(min),0,0))
                    self.sendTweet(d);
                }else {
                    errorsService.errorCode = status;
                    errorsService.errorMessage = (data.data?data.data.message:null) || "Undefined error";
                    $location.path('errors');
                }
            }
        }else {
            spinnerService.show('ownSpinner');
            spinnerService.show('homeSpinner');
            self.sendTweet();
        }
    }

    /*
     * Parse urls to show it in interface.
     */
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

    /*
     * Update in memory tweets when user click like.
     */
    self.updateLikeById= function(id,type ){
        self.likeOwn(id, type);
        self.likeHome(id, type);
        self.likeMentions(id, type);

    }
    self.likeOwn = function(id, type){

        for (var i = 0; i < self.ownTweets.length; i++) {
            if (self.ownTweets[i].id_str == id) {
                self.ownTweets[i].favorited = type;
                if(type){
                    ++self.ownTweets[i].favorite_count;
                }else{
                    --self.ownTweets[i].favorite_count;
                }
                i = self.ownTweets.length;
            }

        }

    }
    self.likeHome = function(id, type){

        for (var i = 0; i < self.accountTweets.length; i++) {
            if (self.accountTweets[i].id_str == id) {
                self.accountTweets[i].favorited = type;
                if(type){
                    ++self.accountTweets[i].favorite_count;
                }else{
                    --self.accountTweets[i].favorite_count;
                }
                i = self.accountTweets.length;
            }
        }
        spinnerService.hide('homeSpinner');
    }
    self.likeMentions = function(id, type){
        for (var i = 0; i < self.mentions.length; i++) {
            if (self.mentions[i].id_str == id) {
                self.mentions[i].favorited = type;
                if(type){
                    ++self.mentions[i].favorite_count;
                }else{
                    --self.mentions[i].favorite_count;
                }
                i = self.mentions.length;
            }
        }
        spinnerService.hide('mentionsSpinner');
    }

    /*
     * Send url to backend shortenner and show the response in the view.
     */
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
            errorsService.errorMessage = (data.data?data.data.message:null) || "Undefined error";
            $location.path('errors');
        }).then(function(data) {
            delete self.link ; // clear the form so our user is ready to enter another
            self.result = data.data.data.direct_url;
            spinnerService.hide('loadingSpinner');
        });
    };

    /*
     * Parse hashtag to show it in interface.
     */
    self.parse2 = function(oneHashtag){
        var regex2 = /(#[a-zA-Záéíúëïüöó0-9_\d]+)/ig;
        var axu = ""+oneHashtag;
        return '<span>' + axu.replace(regex2, function(hash) {
                var aux5 = "" + hash;
                return '</span> ' + '<a href="' + 'https://twitter.com/hashtag/' + aux5.substring(1)
                    + '?src=hash' + '">' + hash +' </a><span>';
            }) + '</span>';
    }

    /*
     * Parse user mention to show it in interface.
     */
    self.parse3 = function(oneUser){
        var regex3 = /(@[a-zA-Záéíúëïüöó0-9_\d]+)/ig;
        var axu = ""+ oneUser;
        return '<span>' + axu.replace(regex3, function(user) {
                var aux6 = "" + user;
                return '</span> ' + '<a href="' + 'https://twitter.com/' + aux6.substring(1)
                    + '?src=hash' + '">' + user +' </a><span>';
            }) + '</span>';
    }

    /*
     * Update in memory if it's possible, in other case
     * make request to the backend to refresh the view.
     */
    self.updateRtById= function(id,type ){
        
        self.updateRtHome(id, type);
        self.updateRtMentions(id, type);

    }
    self.updateRtHome = function(id, type){

        for (var i = 0; i < self.accountTweets.length; i++) {
            if (self.accountTweets[i].id_str == id) {
                self.accountTweets[i].retweeted = type;

                if(type){
                    ++self.accountTweets[i].retweet_count;
                }else{

                    --self.accountTweets[i].retweet_count;
                }
                i = self.accountTweets.length;
            }
        }
    }
    self.updateRtMentions = function(id, type){
        for (var i = 0; i < self.mentions.length; i++) {
            if (self.mentions[i].id_str == id) {
                self.mentions[i].retweeted = type;
                if (type) {
                    ++self.mentions[i].retweet_count;

                } else {
                    --self.mentions[i].retweet_count;
                }
                i = self.mentions.length;
            }
        }
    }

   // Refresh all section at start.
   self.updateOwn();
   self.updateHome();
   self.updateMentions();
   self.updatePending();

}