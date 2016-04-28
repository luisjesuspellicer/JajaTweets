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

        var saveToken = function (token) {
            $window.localStorage['mean-token'] = token;
            tok = token;
        };

        var getToken = function () {
            return tok?tok:$window.localStorage['mean-token'];
        };

        var logout = function() {
            $window.localStorage.removeItem('mean-token');
            tok = undefined;
            $http.get('http://localhost:3000/logout');
        };

        var isLoggedIn = function() {
            var token = getToken();
            var payload;

            if(token){
                payload = token.split('.')[1];
                payload = $window.atob(payload);
                payload = JSON.parse(payload);

                return payload.exp > Date.now() / 1000;
            } else {
                return false;
            }
        };

        var isRoot = function() {
            var token = getToken();
            var payload;

            if(token){
                payload = token.split('.')[1];
                payload = $window.atob(payload);
                payload = JSON.parse(payload);

                return payload.exp > Date.now() / 1000 && payload.email == "test@test";
            } else {
                return false;
            }
        };

        return {
            saveToken : saveToken,
            getToken : getToken,
            logout : logout,
            isLoggedIn: isLoggedIn,
            isRoot: isRoot
        };
    }

})();
