/**
 * Created by diego on 24/04/16.
 */
(function () {

    angular
        .module('myApp')
        .service('authentication', authentication);

    authentication.$inject = ['$window','$http'];

    function authentication ($window,$http) {

        var tok;
        var payload;

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
        ////////////


        function saveToken(token) {
            $window.localStorage['mean-token'] = token;
            tok = token;
        }



        function logout() {
            $window.localStorage.removeItem('mean-token');
            tok = undefined;
            $http.get('/logout');
        }

        function getId() {
            payload = getPayload();
            if (payload) return payload._id;
            else {
                return null;
            }
        }

        function getEmail() {
            payload = getPayload();
            if (payload) return payload.email;
            else {
                return null;
            }
        }

        function isLoggedIn() {
            payload = getPayload();
            if (payload) return payload.exp > Date.now() / 1000;
            else {
                return null;
            }
        }

        function isRoot() {
            payload = getPayload();
            if (payload) return payload.exp > Date.now() / 1000 && payload.email == "test@test";
            else {
                return null;
            }
        }

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

        function getToken() {
            return tok?tok:$window.localStorage['mean-token'];
        }

    }

})();
