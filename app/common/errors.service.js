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

        var errorCode = 0;
        var errorMessage = 'Error';

        return {
            errorCode: errorCode,
            errorMessage: errorMessage
        };

        ////////////////

    }

})();