/**
 * Created by diego on 24/04/16.
 */
(function () {

    angular
        .module('myApp')
        .service('authentication', authentication);

    authentication.$inject = ['$window'];

    function authentication ($window) {

        var tok;

        var saveToken = function (token) {
            $window.localStorage['mean-token'] = token;
            tok = token;
        };

        var getToken = function () {
            return tok?tok:$window.localStorage['mean-token'];
        };

        logout = function() {
            $window.localStorage.removeItem('mean-token');
            tok = undefined;
        };

        return {
            saveToken : saveToken,
            getToken : getToken,
            logout : logout
        };
    }

})();
