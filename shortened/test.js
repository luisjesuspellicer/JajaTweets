/**
 * Created by piraces on 25/04/16.
 */
(function() {

    'use strict';

    var supertest = require("supertest");
    var should = require("should");
    var atob = require('atob');

    // This agent refers to PORT where program is runninng.
    var server = supertest.agent("http://localhost:3000");
    var admin_token;
    var hash = 2387498318;
    var createdHash;
    var date = new Date();

    // UNIT test begin
    describe("SHORTEN unit test",function(){

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

        // #2 should return shortened URLs of current user
        it("GET /shortened => List of shortened URLs", function(done) {
            server
                .get("/shortened")
                .set("Authorization", "Bearer " + admin_token)
                .expect("Content-type",/json/)
                .expect(200)
                .end(function(err, res){
                    res.status.should.equal(200);
                    JSON.parse(res.text).data.should.have.property("content");
                    JSON.parse(res.text).error.should.be.exactly(false);
                    JSON.parse(res.text).data.message.should.be.exactly("Shortened links obtained successfully");
                    done();
                });
        });

        // #3 should add a new shortened URL to a valid user (with authorization)
        it("POST /shortened => Add a new shortened URL to user", function(done) {
            server
                .post("/shortened")
                .set("Authorization", "Bearer " + admin_token)
                .send({
                    "link": "http://github.com/" + date.toString()
                })
                .expect("Content-type",/json/)
                .expect(200)
                .end(function(err, res){
                    res.status.should.equal(200);
                    JSON.parse(res.text).error.should.be.exactly(false);
                    JSON.parse(res.text).data.should.have.property("content");
                    JSON.parse(res.text).data.message.should.be.exactly("URL successfully shortened");
                    var content = JSON.parse(res.text).data.content;
                    createdHash = content.hash;
                    done();
                });
        });

        // #4 should return ONE shortened URL of current user
        it("GET /shortened/:id => Shortened URL", function(done) {
            server
                .get("/shortened/" + hash)
                .set("Authorization", "Bearer " + admin_token)
                .expect("Content-type",/json/)
                .expect(200)
                .end(function(err, res){
                    res.status.should.equal(200);
                    JSON.parse(res.text).data.should.have.property("content");
                    JSON.parse(res.text).error.should.be.exactly(false);
                    JSON.parse(res.text).data.message.should.be.exactly("URL obtained successfully");
                    done();
                });
        });

        // #5 should redirect user to another URL
        it("GET /s/:id => Redirect to another URL", function(done) {
            server
                .get("/s/" + hash)
                .expect(302)
                .end(function(err, res){
                    res.status.should.equal(302);
                    done();
                });
        });

        // #6 should delete a shortened URL from a valid user (with authorization)
        it("DELETE /shortened/:id => Deletes a shortened URL from user", function(done) {
            server
                .delete("/shortened/" + createdHash)
                .set("Authorization", "Bearer " + admin_token)
                .expect("Content-type",/json/)
                .expect(200)
                .end(function(err, res){
                    res.status.should.equal(200);
                    JSON.parse(res.text).error.should.be.exactly(false);
                    JSON.parse(res.text).data.should.have.property("content");
                    JSON.parse(res.text).data.message.should.be.exactly("Shortened URL deleted successfully");
                    done();
                });
        });


    });

})();