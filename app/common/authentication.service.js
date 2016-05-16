/**
 * Authors: Diego Ceresuela, Raúl Piracés and Luis Jesús Pellicer.
 * Date: 16-05-2016
 * Name file: authentication.service.js
 * Description: This file specifies a service which treats with local authorization on the frontend.
 */
(function () {

    angular
        .module('myApp')
        .service('authentication', authentication);

    authentication.$inject = ['$window','$http'];

    /**
     * Authentication function.
     * @param $window
     * @param $http
     * @returns {{saveToken: saveToken, getToken: getToken, logout: logout, isLoggedIn: isLoggedIn, isRoot: isRoot,
     * getId: getId, getEmail: getEmail}}
     */
    function authentication ($window,$http) {

        var tok;
        var payload;

        // Service structure
        var service = {
            saveToken : saveToken,
            getToken : getToken,
            logout : logout,
            isLoggedIn: isLoggedIn,
            isRoot: isRoot,
            getId: getId,
            getEmail: getEmail
        };

        return service;


        // Saves the token for further use
        function saveToken(token) {
            $window.localStorage['mean-token'] = token;
            tok = token;
        }

        // Logout current user
        function logout() {
            $window.localStorage.removeItem('mean-token');
            tok = undefined;
            $http.get('/logout');
        }

        // Get user id
        function getId() {
            payload = getPayload();
            if (payload) return payload._id;
            else {
                return null;
            }
        }

        // Get user email
        function getEmail() {
            payload = getPayload();
            if (payload) return payload.email;
            else {
                return null;
            }
        }

        // Returns true if user is logged in.
        function isLoggedIn() {
            payload = getPayload();
            if (payload) return payload.exp > Date.now() / 1000;
            else {
                return null;
            }
        }

        // Returns true if its root user (admin)
        function isRoot() {
            payload = getPayload();
            if (payload) return payload.exp > Date.now() / 1000 && payload.email == "test@test";
            else {
                return null;
            }
        }

        // Get the payload from user
        function getPayload() {
            var token = getToken();
            var payload;
            if(token){
                payload = token.split('.')[1];
                payload = $window.atob(payload);
                payload = JSON.parse(payload);
                return payload;
            } else {
                return null;
            }
        }

        // Get the main token
        function getToken() {
            return tok?tok:$window.localStorage['mean-token'];
        }

    }

})();
