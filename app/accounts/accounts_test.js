'use strict';

describe('myApp.accounts module', function() {

  beforeEach(module('myApp.users'));

  describe('users controller', function(){

    it('should ....', inject(function($controller) {
      //spec body
      var usersCtrl = $controller('usersCtrl');
      expect(users).toBeDefined();
    }));

  });
});