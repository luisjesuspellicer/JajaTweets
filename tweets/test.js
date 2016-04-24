/**
 * Created by piraces on 22/04/16.
 */
(function() {

    'use strict';

    var supertest = require("supertest");
    var should = require("should");
    var atob = require('atob');
    var util = require('util');

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

    });

})();