/**
 * Created by diego on 26/04/16.
 */
(function() {
    'use strict';

    angular
        .module('myApp')
        .controller('navCtrl',navCtrl);

    navCtrl.$inject = ['authentication','$location'];

    function navCtrl(authentication, $location) {

        var vm = this;

        vm.loc = $location;

        vm.isRoot = authentication.isRoot;
        vm.isLoggedIn = authentication.isLoggedIn;
        vm.logOut = function() {
            authentication.logout();
        }
    }

})();
