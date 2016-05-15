/**
 * Created by diego on 22/04/16.


(function () {

    'use strict';

    var supertest = require("supertest");
    var should = require("should");
    var atob = require('atob');

    // This agent refers to PORT where program is runninng.
    var server = supertest.agent(process.env.CURRENT_DOMAIN);
    var admin_token, user_token, user_id, admin_id;
    var sub, unsub, subunsub_id;
    var last_id, tweets_id, tweetsx_id;

    server
        .post("/login")
        .send({
            "email": "test@test",
            "password": "test"
        })
        .end(function (err, res) {
            admin_token = JSON.parse(res.text).data.token;
            server
                .get("/users")
                .set("Authorization", "Bearer " + admin_token)
                .end(function (err, res) {
                    user_id = JSON.parse(res.text)[1]._id;
                    admin_id = JSON.parse(res.text)[0]._id;
                });
        });

    server
        .post("/login")
        .send({
            "email": "user@user",
            "password": "user"
        })
        .end(function (err, res) {
            user_token = JSON.parse(res.text).data.token;
        });


    // UNIT test begin
    describe("ANALYTICS api test", function () {

        // #1 Should return all the analytics
        it("GET /data user@user => All the analytics available", function (done) {
            server
                .get("/data")
                .set("Authorization", "Bearer " + user_token)
                .expect("Content-type", /json/)
                .expect(200)
                .end(function (err, res) {
                    res.status.should.equal(200);
                    JSON.parse(res.text).should.have.lengthOf(4);
                    JSON.parse(res.text).forEach(function (data) {
                        if (data.name == "subunsub") {
                            sub = data.chart[0];
                            unsub = data.chart[1];
                            subunsub_id = data._id;
                        } else if (data.name == "lastAccess") {
                            last_id = data._id;
                        } else if (data.name == "tweets") {
                            tweets_id = data._id;
                        } else if (data.name == "tweetsxuser") {
                            tweetsx_id = data._id;
                        }
                    });
                    done();
                });
        });

        // #2 Should return 'subunsub' analytic modified
        it("Register a new user should modify 'subunsub' analytic", function (done) {
            server
                .post("/users")
                .set("Authorization", "Bearer " + admin_token)
                .send({
                    "email": "user@user",
                    "password": "user",
                    "name": "user"
                })
                .end(function () {
                    server
                        .get("/data/" + subunsub_id)
                        .set("Authorization", "Bearer " + admin_token)
                        .expect("Content-type", /json/)
                        .expect(200)
                        .end(function (err, res) {
                            res.status.should.equal(200);
                            JSON.parse(res.text).error.should.be.exactly(false);
                            JSON.parse(res.text).data.chart.should.have.property("chart").with.lengthOf(2);
                            JSON.parse(res.text).data.chart.chart[0].should.equal(sub);
                            done();
                        });
                });
        });


        // #3 Should return 'subunsub' analytic modified
        it("Delete an user should modify 'subunsub' analytic", function (done) {
            server
                .delete("/users/" + user_id)
                .set("Authorization", "Bearer " + admin_token)
                .end(function () {
                    server
                        .get("/data/" + subunsub_id)
                        .set("Authorization", "Bearer " + admin_token)
                        .expect("Content-type", /json/)
                        .expect(200)
                        .end(function (err, res) {
                            res.status.should.equal(200);
                            JSON.parse(res.text).error.should.be.exactly(false);
                            JSON.parse(res.text).data.chart.should.have.property("chart").with.lengthOf(2);
                            JSON.parse(res.text).data.chart.chart[1].should.equal(unsub);
                            done();
                        });
                });
        });

        // #4 should reset the analytic
        it("Should reset the 'subunsub' analytic", function (done) {
            server
                .delete("/data/" + subunsub_id)
                .set("Authorization", "Bearer " + admin_token)
                .end(function () {
                    server
                        .get("/data")
                        .set("Authorization", "Bearer " + user_token)
                        .end(function (err, res) {
                            JSON.parse(res.text).forEach(function (data) {
                                if (data.name == "subunsub") {
                                    subunsub_id = data._id;
                                }
                            });

                            server
                                .get("/data/" + subunsub_id)
                                .set("Authorization", "Bearer " + admin_token)
                                .expect("Content-type", /json/)
                                .expect(200)
                                .end(function (err, res) {
                                    res.status.should.equal(200);
                                    JSON.parse(res.text).data.chart.chart[1].should.equal(0);
                                    JSON.parse(res.text).data.chart.chart[0].should.equal(0);
                                    done();
                                });
                        });

                });
        });

        // #5 should return last accounts accessed
        it("GET /data/:accesses should return last accounts accessed", function (done) {

            server
                .get("/data/" + last_id)
                .set("Authorization", "Bearer " + admin_token)
                .expect("Content-type", /json/)
                .expect(200)
                .end(function (err, res) {
                    res.status.should.equal(200);
                    done();
                });
        });

        // #5 should return tweets analytic
        it("GET /data/:tweets should return tweets analytics", function (done) {

            server
                .get("/data/" + tweets_id)
                .set("Authorization", "Bearer " + admin_token)
                .expect("Content-type", /json/)
                .expect(200)
                .end(function (err, res) {
                    res.status.should.equal(200);
                    JSON.parse(res.text).error.should.be.exactly(false);
                    JSON.parse(res.text).data.chart.should.have.property("chart").with.lengthOf(2);
                    done();
                });
        });

        // #6 should return users with more tweets
        it("GET /data/:tweetsperuser should return users with more tweets", function (done) {

            server
                .get("/data/" + tweetsx_id)
                .set("Authorization", "Bearer " + admin_token)
                .expect("Content-type", /json/)
                .expect(200)
                .end(function (err, res) {
                    res.status.should.equal(200);
                    JSON.parse(res.text).error.should.be.exactly(false);
                    JSON.parse(res.text).data.should.have.property("chart");
                    done();
                });
        });

    });

})(); */