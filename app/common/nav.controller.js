/**
 * Created by diego on 26/04/16.
 */
(function() {
    'use strict';

    angular
        .module('myApp')
        .controller('navCtrl',navCtrl);

    navCtrl.$inject = ['authentication'];

    function navCtrl(authentication) {

        var vm = this;

        vm.isRoot = authentication.isRoot;
        vm.isLoggedIn = authentication.isLoggedIn;
    }

})();
