'use strict';

describe('myApp.profile module', function() {

  beforeEach(module('myApp.profile'));

  describe('users controller', function(){

    it('should ....', inject(function($controller) {
      //spec body
      var profileCtrl = $controller('uprofileCtrl');
      expect(profileCtrl).toBeDefined();
    }));

  });
});