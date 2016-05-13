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

function subsCtrl($http, authentication, $scope, spinnerService, errorsService, $location) {

    var self = this;
    $scope.subs = {};
    $scope.formData = {};

    if (!authentication.isLoggedIn()) {
        console.log('unauth');
        errorsService.errorCode = 401;
        errorsService.errorMessage = "Unauthorized operation.";
        $location.path('errors');
    }

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

    self.search = function(id) {
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

    self.reload = function(data) {
        self.subscriptions = data.data.data.content;
        angular.forEach(self.subscriptions, function(value, key){
            self.search(value.hashtag);
        });
        spinnerService.hide('loadingSpinner');
    };

    self.update = function(hashtag) {
        spinnerService.show('loadingSpinner');
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

    self.delete = function(id) {
        spinnerService.show('loadingSpinner');
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

}