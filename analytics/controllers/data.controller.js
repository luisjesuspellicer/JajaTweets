/**
 * Created by diego on 23/04/16.
 */
(function() {
    'use strict';

    var mongoose = require('mongoose');
    var http = require('http');
    var Resource = require('resourcejs');
    var _ = require('lodash');
    var Data = mongoose.model('data');
    var admin_required = require('../../config/policies.config').admin_required;
    var user_required = require('../../config/policies.config').user_required;
    var jwt = require('jsonwebtoken');

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
            .put(user_required);

        resource.register(app, 'delete', '/'+route+'/:id', resetData, resource.respond.bind(resource), admin_required);
        resource.register(app, 'get', '/'+route+'/:id', getData, resource.respond.bind(resource), admin_required);

        function getData(req, res, next) {
            var _id = req.path.substr(req.path.lastIndexOf('/')+1);
            Data.findById(_id, function (err, data) {
                switch (data.name) {
                    case "subunsub":
                        res.status(200).json({
                            "error": false,
                            "data": {
                                "chart": data,
                                "url": "http://localhost:3000/data"
                            }});
                        break;

                    case "lastAccess":
                        http.request({ method: 'get',  port: 3000,  path:'/users::last',
                            headers: {
                                'Content-type': 'application/json',
                                'Authorization': 'Bearer '+ jwt.sign(req.payload,process.env.MY_SECRET)
                            }
                        }, function (subres) {
                            var result = "";
                            subres.on('data', function (chunk) {
                                result += chunk.toString();
                            });
                            subres.on('end', function() {
                                Data.findById(_id, function(err,data) {
                                    data.chart = JSON.parse(result);
                                    data.save();
                                });
                                return resource.setResponse(res, {
                                    "status": 200,
                                    "item": {
                                        "error": false,
                                        "data": {
                                            "chart": JSON.parse(result),
                                            "url": "http://localhost:3000/data"
                                        }
                                    }

                                }, next);
                            })
                        }).end();
                        break;

                    case "tweets":
                        var tweet_app = 0, tweet_total = 0;
                        http.request({ method: 'get',  port: 3000,  path:'/users',
                            headers: {
                                'Content-type': 'application/json',
                                'Authorization': 'Bearer '+ jwt.sign(req.payload,process.env.MY_SECRET)
                            }
                        }, function (subres) {
                            var result = "";
                            subres.on('data', function (chunk) {
                                result += chunk.toString();
                            });
                            subres.on('end', function() {
                                JSON.parse(result).forEach(function(user) {
                                    tweet_app += user.tweet_app?user.tweet_app:0;
                                    tweet_total += user.tweet_total?user.tweet_total:0;
                                });

                                data.chart[0].value = tweet_app;
                                data.chart[1].value = tweet_total;
                                data.save();

                                return resource.setResponse(res, {
                                    "status": 200,
                                    "item": {
                                        "error": false,
                                        "data": {
                                            "chart": data,
                                            "url": "http://localhost:3000/data"
                                        }
                                    }

                                }, next);
                            })
                        }).end();
                        break;
                }
            })
        }

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
                    switch(my_data.name) {
                        case 'subunsub':
                            my_data.chart[0].value = 0;
                            my_data.chart[1].value = 0;
                            break;
                        case 'lastAccess':
                            my_data.chart = [];
                            break;
                        case 'tweets':
                            my_data.chart[0].value = 0;
                            my_data.chart[1].value = 0;
                            break;
                    }
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