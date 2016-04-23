/**
 * Created by diego on 23/04/16.
 */

(function() {
    'use strict';
    var webservices = require('../webservices');

    webservices.forEach(function(ws){
        require('../'+ws+'/test');
    })

})();
