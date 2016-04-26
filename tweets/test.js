/**
 * Created by piraces on 22/04/16.
 */
(function() {

    'use strict';

    var supertest = require("supertest");
    var should = require("should");
    var atob = require('atob');

    // This agent refers to PORT where program is runninng.
    var server = supertest.agent("http://localhost:3000");
    var admin_token;
    var status_id = 20;
    var date = new Date();

    // UNIT test begin
    describe("TWEETS unit test",function(){

        // #1 should return valid token
        it("POST /login test@test => Valid admin token", function(done) {
            server
                .post("/login")
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

        // #2 should tweet a valid status (with authorization and current date)
        it("POST /tweets => New status update", function(done) {
            server
                .post("/tweets")
                .set("Authorization", "Bearer " + admin_token)
                .send({
                    "status": "Test@" + date.toString()
                })
                .expect("Content-type",/json/)
                .expect(200)
                .end(function(err, res){
                    res.status.should.equal(200);
                    JSON.parse(res.text).error.should.be.exactly(false);
                    JSON.parse(res.text).data.should.have.property("id_str");
                    JSON.parse(res.text).data.message.should.be.exactly("Tweet post successful");
                    done();
                });
        });

        // #3 should get a valid tweet (with authorization)
        it("GET /tweets/:id => Get tweet from twitter", function(done) {
            server
                .get("/tweets/" + status_id)
                .set("Authorization", "Bearer " + admin_token)
                .expect("Content-type",/json/)
                .expect(200)
                .end(function(err, res){
                    res.status.should.equal(200);
                    JSON.parse(res.text).error.should.be.exactly(false);
                    JSON.parse(res.text).data.should.have.property("content");
                    JSON.parse(res.text).data.message.should.be.exactly("Tweet get successful");
                    done();
                });
        });

        // #4 should retweet a valid tweet (with authorization)
        it("GET /tweets/:id/retweet => Retweet tweet from twitter", function(done) {
            server
                .get("/tweets/" + status_id + "/retweet")
                .set("Authorization", "Bearer " + admin_token)
                .expect("Content-type",/json/)
                .expect(200)
                .end(function(err, res){
                    res.status.should.equal(200);
                    JSON.parse(res.text).error.should.be.exactly(false);
                    JSON.parse(res.text).data.should.have.property("content");
                    JSON.parse(res.text).data.message.should.be.exactly("Retweet successful");
                    done();
                });
        });

        // #5 should unretweet a valid tweet (with authorization)
        it("GET /tweets/:id/unretweet => Unretweet tweet from twitter", function(done) {
            server
                .get("/tweets/" + status_id + "/unretweet")
                .set("Authorization", "Bearer " + admin_token)
                .expect("Content-type",/json/)
                .expect(200)
                .end(function(err, res){
                    res.status.should.equal(200);
                    JSON.parse(res.text).error.should.be.exactly(false);
                    JSON.parse(res.text).data.should.have.property("content");
                    JSON.parse(res.text).data.message.should.be.exactly("Unretweet successful");
                    done();
                });
        });

        // #6 should favorite a valid tweet (with authorization)
        it("GET /tweets/:id/favorite => Favorite tweet from twitter", function(done) {
            server
                .get("/tweets/" + status_id + "/favorite")
                .set("Authorization", "Bearer " + admin_token)
                .expect("Content-type",/json/)
                .expect(200)
                .end(function(err, res){
                    res.status.should.equal(200);
                    JSON.parse(res.text).error.should.be.exactly(false);
                    JSON.parse(res.text).data.should.have.property("content");
                    JSON.parse(res.text).data.message.should.be.exactly("Favorite/Like successful");
                    done();
                });
        });

        // #7 should unfavorite a valid tweet (with authorization)
        it("GET /tweets/:id/unfavorite => Unfavorite tweet from twitter", function(done) {
            server
                .get("/tweets/" + status_id + "/unfavorite")
                .set("Authorization", "Bearer " + admin_token)
                .expect("Content-type",/json/)
                .expect(200)
                .end(function(err, res){
                    res.status.should.equal(200);
                    JSON.parse(res.text).error.should.be.exactly(false);
                    JSON.parse(res.text).data.should.have.property("content");
                    JSON.parse(res.text).data.message.should.be.exactly("Unfavorite successful");
                    done();
                });
        });

        // #8 should get subscriptions from a valid user (with authorization)
        it("GET /subscriptions => Gets twitter hashtags subscriptions from user", function(done) {
            server
                .get("/subscriptions")
                .set("Authorization", "Bearer " + admin_token)
                .expect("Content-type",/json/)
                .expect(200)
                .end(function(err, res){
                    res.status.should.equal(200);
                    JSON.parse(res.text).error.should.be.exactly(false);
                    //JSON.parse(res.text).data.should.have.property("content");
                    JSON.parse(res.text).data.message.should.be.exactly("Obtaining subscribed terms succesful");
                    done();
                });
        });

        // #9 should add a new subscription to a valid user (with authorization)
        it("POST /subscriptions => Add a new twitter hashtag subscription to user", function(done) {
            server
                .post("/subscriptions")
                .set("Authorization", "Bearer " + admin_token)
                .send({
                    "hashtag": "#Test"
                })
                .expect("Content-type",/json/)
                .expect(200)
                .end(function(err, res){
                    res.status.should.equal(200);
                    JSON.parse(res.text).error.should.be.exactly(false);
                    JSON.parse(res.text).data.should.have.property("content");
                    JSON.parse(res.text).data.message.should.be.exactly("User succesfully subscribed to: #Test");
                    done();
                });
        });

        // #10 should add a new subscription to a valid user (with authorization)
        it("DELETE /subscriptions/:id => Delete a twitter hashtag subscription from user", function(done) {
            server
                .delete("/subscriptions/" + "Test")
                .set("Authorization", "Bearer " + admin_token)
                .expect("Content-type",/json/)
                .expect(200)
                .end(function(err, res){
                    res.status.should.equal(200);
                    JSON.parse(res.text).error.should.be.exactly(false);
                    //JSON.parse(res.text).data.should.have.property("content");
                    JSON.parse(res.text).data.message.should.be.exactly("User succesfully unsubscribed from: #Test");
                    done();
                });
        });

        // #11 should get tweets from subscription from a valid user (with authorization)
        it("GET /subscriptions/:id => Gets tweets from hashtag subscription from user", function(done) {
            server
                .get("/subscriptions/" + "GN")
                .set("Authorization", "Bearer " + admin_token)
                .expect("Content-type",/json/)
                .expect(200)
                .end(function(err, res){
                    res.status.should.equal(200);
                    JSON.parse(res.text).error.should.be.exactly(false);
                    JSON.parse(res.text).data.should.have.property("content");
                    JSON.parse(res.text).data.message.should.be.exactly("Search successful");
                    done();
                });
        });

        // #12 should get mention tweets from a valid user (with authorization)
        it("GET /mentions => Gets mention tweets from user", function(done) {
            server
                .get("/mentions")
                .set("Authorization", "Bearer " + admin_token)
                .expect("Content-type",/json/)
                .expect(200)
                .end(function(err, res){
                    res.status.should.equal(200);
                    JSON.parse(res.text).error.should.be.exactly(false);
                    JSON.parse(res.text).data.should.have.property("content");
                    JSON.parse(res.text).data.message.should.be.exactly("Search mentions successful");
                    done();
                });
        });
        //   should get tweets from a account (with authorization)
        it("GET /tweets => Gets tweets from one twitter account", function(done){
            server
                .get("/tweets/")
                .set("Authorization", "Bearer " + admin_token)
                .expect("Content-type",/json/)
                .expect(200)
                .end(function(err,res){
                    res.status.should.equal(200);
                    JSON.parse(res.text).error.should.be.exactly(false);
                    JSON.parse(res.text).data.should.have.property("content");
                    JSON.parse(res.text).data.message.should.be.exactly("Search successful");
                    done();
                })
        });

        //   should get tweets from a user
        it("GET /tweets::own => Gets tweets from one user", function(done){
            server
                .get("/tweets::own")
                .set("Authorization", "Bearer " + admin_token)
                .expect("Content-type",/json/)
                .expect(200)
                .end(function(err,res){
                    res.status.should.equal(200);
                    JSON.parse(res.text).error.should.be.exactly(false);
                    JSON.parse(res.text).data.should.have.property("content");
                    JSON.parse(res.text).data.message.should.be.exactly("Own tweets");
                    done();
                })
        });

        // should add pending tweet (with authorization and current date)
        var date1 = new Date();
        date1.setMilliseconds(180000 + date.getMilliseconds());
        it("POST /tweets => New pending tweet save", function(done) {
            server
                .post("/tweets")
                .set("Authorization", "Bearer " + admin_token)
                .send({
                    "status": "Test@" + date1.toString()
                })
                .expect("Content-type",/json/)
                .expect(200)
                .end(function(err, res){
                    res.status.should.equal(200);
                    JSON.parse(res.text).error.should.be.exactly(false);
                    JSON.parse(res.text).data.message.should.be.exactly("Tweet saved succesfully");
                    done();
                });
        });
        // should get all pending tweets (with authorization)
        it("GET /tweets::pending => GET all pending tweets", function(done) {
            server
                .get("/tweets::pending")
                .set("Authorization", "Bearer " + admin_token)
                .send({
                    "status": "Test@" + date1.toString()
                })
                .expect("Content-type",/json/)
                .expect(200)
                .end(function(err, res){
                    res.status.should.equal(200);
                    JSON.parse(res.text).error.should.be.exactly(false);
                    JSON.parse(res.text).data.message.should.be.exactly("Tweet saved succesfully");
                    done();
                });
        });
        
        
        // should modify a pending tweet (with authorization and year 2020)

        date.setYear(2020);
        it("PUT /tweets => Modify pending tweet", function(done) {
            server
                .put("/tweets")
                .set("Authorization", "Bearer " + admin_token)
                .send({
                    "status": "Test@" + date1.toString()
                })
                .expect("Content-type",/json/)
                .expect(200)
                .end(function(err, res){
                    res.status.should.equal(200);
                    JSON.parse(res.text).error.should.be.exactly(false);
                    JSON.parse(res.text).data.message.should.be.exactly("Tweet successfully changed");
                    done();
                });
        });
    });

})();