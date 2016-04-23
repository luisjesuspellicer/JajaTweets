/**
 * Created by diego on 23/04/16.
 */
(function() {
    'use strict';

    var mongoose = require('mongoose');
    var Resource = require('resourcejs');
    var _ = require('lodash');
    var Data = mongoose.model('data');
    var admin_required = require('../../config/policies.config').admin_required;
    var user_required = require('../../config/policies.config').user_required;
    var error = {
        status: 500,
        item: {
            "error": true,
            "data": {
                "message": "Internal error.",
                "url": "http://localhost:3000/data"
            }
        }
    };

    module.exports = function (app, route) {


        var resource = Resource(app, '', route, app.models.data)
            .index(user_required)
            .get(user_required)
            .put(user_required);

        resource.register(app, 'delete', '/data/:id', resetData, resource.respond.bind(resource), admin_required);

        function resetData(req, res, next) {

            var _id = req.path.substr(req.path.lastIndexOf('/')+1);

            Data.findById(_id,function(err, data) {
                if (err) {
                    return resource.setResponse(res, error, next);
                } else {
                    var my_data = _.cloneDeep(data);
                    my_data = my_data.toObject();
                    data.remove();
                    delete my_data._id;
                    my_data.chart.datasets.forEach(function(ds){
                        ds.data = [];
                    });
                    console.log(JSON.stringify(my_data));
                    new Data(my_data).save(function(err) {
                        if (err) return resource.setResponse(res, error, next);
                        else {
                            return resource.setResponse(res, {
                                "status": 200,
                                "item": {
                                    "error": false,
                                    "data": {
                                        "message": "Restarted.",
                                        "url": "http://localhost:3000/data"
                                    }
                                }

                            }, next);
                        }
                    })
                }
            });
        }

        // Return middleware.
        return function (req, res, next) {
            next();
        };
    };

})();