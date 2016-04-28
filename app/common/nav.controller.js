/**
 * Created by diego on 26/04/16.
 */
(function() {
    'use strict';

    angular
        .module('myApp')
        .controller('navCtrl',navCtrl);

    navCtrl.$inject = ['authentication','$location','$http'];

    function navCtrl(authentication, $location, $http) {

        var vm = this;

        vm.loc = $location;

        vm.isRoot = authentication.isRoot;
        vm.isLoggedIn = authentication.isLoggedIn;
        vm.logOut = function() {
            console.log('Called!');
            $http.get('http://loaclhost:3000/logout');
            authentication.logout();
        }
    }

})();
