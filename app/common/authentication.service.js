/**
 * Created by diego on 24/04/16.
 */
(function () {

    angular
        .module('myApp')
        .service('authentication', authentication);

    authentication.$inject = ['$http', '$window'];

    function authentication ($http, $window) {

        var saveToken = function (token) {
            $window.localStorage['mean-token'] = token;
        };

        var getToken = function () {
            return $window.localStorage['mean-token'];
        };

        logout = function() {
            $window.localStorage.removeItem('mean-token');
        };

        return {
            saveToken : saveToken,
            getToken : getToken,
            logout : logout
        };
    }

})();
