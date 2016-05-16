/**
 * Authors: Diego Ceresuela, Luis Jesús Pellicer, Raúl Piracés.
 * Date: 16-05-2016
 * Name file: test.js
 * Description: File for testing all "twitter" resource endpoints with "mocha".
 */
(function() {

    'use strict';

    var supertest = require("supertest");
    var should = require("should");
    var atob = require('atob');

    // This agent refers to PORT where program is runninng.
    var server = supertest.agent(process.env.CURRENT_DOMAIN);
    var admin_token;

    // UNIT test begin
    describe("TWITTER unit test",function(){

        // #1 should return valid token
        it("POST /login test@test => Valid admin token", function(done) {
            server
                .post("/login")
                .set("Authorization", "Bearer " + admin_token)
                .send({
                    "email":"test@test",
                    "password":"test"
                })
                .expect("Content-type",/json/)
                .expect(200)
                .end(function(err, res){
                    res.status.should.equal(200);
                    JSON.parse(res.text).data.should.have.property("token");
                    JSON.parse(res.text).error.should.be.exactly(false);
                    admin_token = JSON.parse(res.text).data.token;
                    done();
                });
        });

        // #2 should return all user twitter accounts
        it("GET /twitter test@test => Get all user twitter accounts", function(done) {
            server
                .get("/twitter")
                .set("Authorization", "Bearer " + admin_token)
                .expect("Content-type",/json/)
                .expect(200)
                .end(function(err, res){
                    res.status.should.equal(200);
                    JSON.parse(res.text).data.should.have.property("content");
                    JSON.parse(res.text).error.should.be.exactly(false);
                    JSON.parse(res.text).data.message.should.be.exactly("Twitter accounts retrieved successfully");
                    done();
                });
        });

        // #3 should post new user twitter account
        it("POST /twitter test@test => New user twitter account", function(done) {
            server
                .post("/twitter")
                .set("Authorization", "Bearer " + admin_token)
                .send({
                    "user": "test@mocha",
                    "in_use": false,
                    "token": "test",
                    "secret": "test",
                    "description": "",
                    "screen_name": "datapitest",
                    "name": "Testing API",
                    "id_str": "1",
                    "location": "",
                    "url": null,
                    "followers_count": 9,
                    "friends_count": 61,
                    "favourites_count": 0,
                    "statuses_count": 72,
                    "tweet_app": 1,
                    "profile_image_url": "http://abs.twimg.com/sticky/default_profile_images/" +
                        "default_profile_0_normal.png",
                    "__v": 0
                })
                .expect("Content-type",/json/)
                .expect(200)
                .end(function(err, res){
                    res.status.should.equal(200);
                    JSON.parse(res.text).data.should.have.property("content");
                    JSON.parse(res.text).error.should.be.exactly(false);
                    JSON.parse(res.text).data.message.should.be.exactly("Twitter account saved successfully");
                    done();
                });
        });

        // #4 should return one user twitter account
        it("GET /twitter/:id test@test => Gets one user twitter account", function(done) {
            server
                .get("/twitter/" + "723944231954427904")
                .set("Authorization", "Bearer " + admin_token)
                .expect("Content-type",/json/)
                .expect(200)
                .end(function(err, res){
                    res.status.should.equal(200);
                    JSON.parse(res.text).data.should.have.property("content");
                    JSON.parse(res.text).error.should.be.exactly(false);
                    JSON.parse(res.text).data.message.should.be.exactly("Twitter account retrieved successfully");
                    done();
                });
        });

        // #5 should return one user twitter account
        it("GET /twitter/:id/notUse test@test => Set NOT to use one user twitter account", function(done) {
            server
                .get("/twitter/" + "723944231954427904" + "/notUse")
                .set("Authorization", "Bearer " + admin_token)
                .expect("Content-type",/json/)
                .expect(200)
                .end(function(err, res){
                    res.status.should.equal(200);
                    JSON.parse(res.text).data.should.have.property("content");
                    JSON.parse(res.text).error.should.be.exactly(false);
                    JSON.parse(res.text).data.message.should.be.exactly("Now not using twitter account: " +
                        "datapitest");
                    done();
                });
        });


        // #6 should set to use one user twitter account
        it("GET /twitter/:id/use test@test => Set to use one user twitter account", function(done) {
            server
                .get("/twitter/" + "723944231954427904" + "/use")
                .set("Authorization", "Bearer " + admin_token)
                .expect(200)
                .end(function(err, res){
                    res.status.should.equal(200);
                    JSON.parse(res.text).data.should.have.property("content");
                    JSON.parse(res.text).error.should.be.exactly(false);
                    JSON.parse(res.text).data.message.should.be.exactly("Now using twitter account: datapitest");
                    done();
                });
        });

        // #7 should set to use one user twitter account
        it("GET /twitter/notUse test@test => Set NOT to use any user twitter account", function(done) {
            server
                .get("/twitter/notUse")
                .set("Authorization", "Bearer " + admin_token)
                .expect("Content-type",/json/)
                .expect(200)
                .end(function(err, res){
                    res.status.should.equal(200);
                    JSON.parse(res.text).error.should.be.exactly(false);
                    JSON.parse(res.text).data.message.should.be.exactly("Now not using any twitter account of user");
                    done();
                });
        });

        // #8 should set to use one user twitter account
        it("GET /twitter/:id/use test@test => Set to use one user twitter account", function(done) {
            server
                .get("/twitter/" + "723944231954427904" + "/use")
                .set("Authorization", "Bearer " + admin_token)
                .expect(200)
                .end(function(err, res){
                    res.status.should.equal(200);
                    JSON.parse(res.text).data.should.have.property("content");
                    JSON.parse(res.text).error.should.be.exactly(false);
                    JSON.parse(res.text).data.message.should.be.exactly("Now using twitter account: datapitest");
                    done();
                });
        });

        // #9 should delete one user twitter account
        it("DELETE /twitter/:id test@test => Deletes one user twitter account", function(done) {
            server
                .delete("/twitter/" + "1")
                .set("Authorization", "Bearer " + admin_token)
                .expect("Content-type",/json/)
                .expect(200)
                .end(function(err, res){
                    res.status.should.equal(200);
                    JSON.parse(res.text).error.should.be.exactly(false);
                    JSON.parse(res.text).data.message.should.be.exactly("Twitter account deleted successfully");
                    done();
                });
        });

        // #10 should update statistics of one user twitter account
        it("GET /twitter/:id/update test@test => Update statistics of one user twitter account", function(done) {
            server
                .get("/twitter/" + "723944231954427904" + "/update")
                .set("Authorization", "Bearer " + admin_token)
                .expect("Content-type",/json/)
                .expect(200)
                .end(function(err, res){
                    res.status.should.equal(200);
                    JSON.parse(res.text).data.should.have.property("content");
                    JSON.parse(res.text).error.should.be.exactly(false);
                    JSON.parse(res.text).data.message.should.be.exactly("Updated statistics from twitter account: " +
                        "datapitest");
                    done();
                });
        });

        // #11 should retrieve average statistics by day
        it("GET /twitter/:id/statsDay test@test => Statistics by day of one user twitter account", function(done) {
            server
                .get("/twitter/" + "723944231954427904" + "/statsDay")
                .set("Authorization", "Bearer " + admin_token)
                .expect("Content-type",/json/)
                .expect(200)
                .end(function(err, res){
                    res.status.should.equal(200);
                    JSON.parse(res.text).data.should.have.property("content");
                    JSON.parse(res.text).error.should.be.exactly(false);
                    JSON.parse(res.text).data.message.should.be.exactly("Twitter day stats retrieved succesfully");
                    done();
                });
        });

        // #12 should retrieve average statistics mentions by day
        it("GET /twitter/:id/statsMentions test@test => Statistics of mentions by day of one user twitter account",
            function(done) {
            server
                .get("/twitter/" + "723944231954427904" + "/statsMentions")
                .set("Authorization", "Bearer " + admin_token)
                .expect("Content-type",/json/)
                .expect(200)
                .end(function(err, res){
                    res.status.should.equal(200);
                    JSON.parse(res.text).data.should.have.property("content");
                    JSON.parse(res.text).error.should.be.exactly(false);
                    JSON.parse(res.text).data.message.should.be.exactly("Twitter mention stats retrieved succesfully");
                    done();
                });
        });

        // #13 should retrieve followers of current user
        it("GET /twitter/:id/followers test@test => Followers of one user twitter account", function(done) {
            server
                .get("/twitter/" + "723944231954427904" + "/followers")
                .set("Authorization", "Bearer " + admin_token)
                .expect("Content-type",/json/)
                .expect(200)
                .end(function(err, res){
                    res.status.should.equal(200);
                    JSON.parse(res.text).data.should.have.property("content");
                    JSON.parse(res.text).error.should.be.exactly(false);
                    JSON.parse(res.text).data.message.should.be.exactly("Twitter followers retrieved succesfully");
                    done();
                });
        });

    });

})();