/**
 * Created by diego on 24/04/16.
 */
(function() {
    'use strict';

    angular
        .module('myApp')
        .service('errorsService', errorsService);

    errorsService.$inject = [];

    function errorsService() {

        var errorCode = 500;
        var errorMessage = 'Internal Error.';

        return {
            errorCode: errorCode,
            errorMessage: errorMessage
        };

        ////////////////

    }

})();