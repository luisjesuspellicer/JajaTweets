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
    }).then(function (data) {
        self.reload(data);
    });

    self.search = function(id) {
        $http.get('/subscriptions/'+id,{
            headers: {
                'Authorization': 'Bearer ' + authentication.getToken()
            }
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
        $http.get('/subscriptions/' + hashtag,{
            headers: {
                'Authorization': 'Bearer ' + authentication.getToken()
            }
        }).then(function(data) {
            $scope.subs[hashtag] = data.data.data.content.statuses;
            spinnerService.hide('loadingSpinner');
        });
    };

    self.delete = function(id) {
        spinnerService.show('loadingSpinner');
        $http.delete('/subscriptions/' + id,{
            headers: {
                'Authorization': 'Bearer ' + authentication.getToken()
            }
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