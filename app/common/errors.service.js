/**
 * Authors: Diego Ceresuela, Raúl Piracés and Luis Jesús Pellicer.
 * Date: 16-05-2016
 * Name file: authentication.service.js
 * Description: This file specifies a service which treats with errors.
 */
(function() {
    'use strict';

    angular
        .module('myApp')
        .service('errorsService', errorsService);

    errorsService.$inject = [];

    /**
     * Main function of service (set default error).
     * @returns {{errorCode: number, errorMessage: string}}
     */
    function errorsService() {

        var errorCode = 500;
        var errorMessage = 'Internal Error.';

        return {
            errorCode: errorCode,
            errorMessage: errorMessage
        };
    }

})();