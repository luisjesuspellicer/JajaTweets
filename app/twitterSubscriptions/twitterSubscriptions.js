/**
 * Authors: Diego Ceresuela, Raúl Piracés and Luis Jesús Pellicer.
 * Date: 16-05-2016
 * Name file: twitterSubscriptions.js
 * Description: This file contains functions to make actions on twitter subscriptions (delete, update and add).
 */
'use strict';

angular.module('myApp.twitterSubscriptions', ['ngRoute', 'angularSpinners'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/twitterSubscriptions', {
            templateUrl: 'twitterSubscriptions/twitterSubscriptions.html',
            controller: 'subsCtrl',
            controllerAs: 'subsAcc'
        });
    }])

    .controller('subsCtrl', subsCtrl);

subsCtrl.$inject = ['$http','authentication', '$scope', 'spinnerService', 'errorsService', '$location'];

/**
 * Main function of the controller. Generates rows with multiple twitter subscriptions and their associate tweets.
 * Controls certain actions on each twitter subscriptions, and lets the user add a new ones.
 * @param $http
 * @param authentication
 * @param $location
 * @param errorsService
 * @param spinnerService
 */
function subsCtrl($http, authentication, $scope, spinnerService, errorsService, $location) {

    var self = this;
    $scope.subs = {};
    $scope.formData = {};

    // Checks if user is logged in
    if (!authentication.isLoggedIn()) {
        console.log('unauth');
        errorsService.errorCode = 401;
        errorsService.errorMessage = "Unauthorized operation.";
        $location.path('errors');
    }

    // Gets all the subscriptions for current twitter account
    $http.get('/subscriptions', {
        headers: {
            'Authorization': 'Bearer ' + authentication.getToken()
        }
    }).error(function(data, status, headers, config) {
        if(status!=404) {
            console.log("Subscriptions GET error");
            errorsService.errorCode = status;
            errorsService.errorMessage = data.data.message || "Undefined error";
            $location.path('errors');
        }
    }).then(function (data) {
        self.reload(data);
    });

    // Search tweets from subscription by id
    self.search = function(id) {
        // Encode the id for the URI
        var id_enc = encodeURIComponent(id).replace(/\(/g, "%28").replace(/\)/g, "%29");
        $http.get('/subscriptions/'+id_enc,{
            headers: {
                'Authorization': 'Bearer ' + authentication.getToken()
            }
        }).error(function(data, status, headers, config) {
            console.log("Search subscriptions error");
            errorsService.errorCode = status;
            errorsService.errorMessage = data.data.message || "Undefined error";
            $location.path('errors');
        }).then(function(data) {
            $scope.subs[id] = data.data.data.content.statuses;
        });
    };

    // Adds a new subscription to current twitter account
    self.add = function() {
        spinnerService.show('loadingSpinner');
        $http.post('/subscriptions/', $scope.formData, {
            headers: {
                'Authorization': 'Bearer ' + authentication.getToken()
            }
        }).error(function(data, status, headers, config) {
            console.log("Add subscription error");
            errorsService.errorCode = status;
            errorsService.errorMessage = data.data.message || "Undefined error";
            $location.path('errors');
        }).then(function() {
            $scope.formData = {}; // clear the form so our user is ready to enter another
            $http.get('/subscriptions', {
                headers: {
                    'Authorization': 'Bearer ' + authentication.getToken()
                }
            }).then(function (data) {
                self.reload(data);
            });
        });
    };

    // Refreshes all tweets from all subscriptions and show them
    self.reload = function(data) {
        self.subscriptions = data.data.data.content;
        angular.forEach(self.subscriptions, function(value, key){
            self.search(value.hashtag);
        });
        spinnerService.hide('loadingSpinner');
    };

    // Refresh all tweets from subscription by id and show them
    self.update = function(hashtag) {
        spinnerService.show('loadingSpinner');
        // Encode the hashtag for the URI
        var hashtag_enc = encodeURIComponent(hashtag).replace(/\(/g, "%28").replace(/\)/g, "%29");
        $http.get('/subscriptions/' + hashtag_enc,{
            headers: {
                'Authorization': 'Bearer ' + authentication.getToken()
            }
        }).error(function(data, status, headers, config) {
            console.log("Update subscription by hashtag error");
            errorsService.errorCode = status;
            errorsService.errorMessage = data.data.message || "Undefined error";
            $location.path('errors');
        }).then(function(data) {
            $scope.subs[hashtag] = data.data.data.content.statuses;
            spinnerService.hide('loadingSpinner');
        });
    };

    // Deletes a subscription by id
    self.delete = function(id) {
        spinnerService.show('loadingSpinner');
        // Encode the id for the URI
        var id_enc = encodeURIComponent(id).replace(/\(/g, "%28").replace(/\)/g, "%29");
        $http.delete('/subscriptions/' + id_enc,{
            headers: {
                'Authorization': 'Bearer ' + authentication.getToken()
            }
        }).error(function(data, status, headers, config) {
            console.log("Delete subscription error");
            errorsService.errorCode = status;
            errorsService.errorMessage = data.data.message || "Undefined error";
            $location.path('errors');
        }).then(function(data) {
            $http.get('/subscriptions', {
                headers: {
                    'Authorization': 'Bearer ' + authentication.getToken()
                }
            }).then(function (data) {
                self.reload(data);
            });
        });
    };

}