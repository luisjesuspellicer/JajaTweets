/**
 * Created by diego on 23/04/16.
 */
(function() {
    'use strict';

    var mongoose = require('mongoose');

    var dataSchema = new mongoose.Schema({
        chart: {},
        name: String
    });

    module.exports = mongoose.model('data',dataSchema,'data');

})();