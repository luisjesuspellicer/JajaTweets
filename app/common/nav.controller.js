/**
 * Authors: Diego Ceresuela, Raúl Piracés and Luis Jesús Pellicer.
 * Date: 16-05-2016
 * Name file: authentication.service.js
 * Description: This file specifies a controller which control the navigation on the frontend.
 */
(function() {
    'use strict';

    angular
        .module('myApp')
        .controller('navCtrl',navCtrl);

    navCtrl.$inject = ['authentication','$location'];

    /**
     * Main function of the navigation controller.
     * @param authentication
     * @param $location
     */
    function navCtrl(authentication, $location) {
        var vm = this;

        vm.loc = $location;
        vm.email = authentication.getEmail;
        vm.id = authentication.getId;

        vm.isRoot = authentication.isRoot;
        vm.isLoggedIn = authentication.isLoggedIn;
        vm.logOut = function() {
            authentication.logout();
        }
    }

})();
