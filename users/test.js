/**
 * Created by diego on 22/04/16.
 */
(function() {

    'use strict';

    var supertest = require("supertest");
    var should = require("should");
    var atob = require('atob');

    // This agent refers to PORT where program is runninng.
    var server = supertest.agent("http://localhost:3000");
    var admin_token, user_token, user_id, admin_id;

    // UNIT test begin
    describe("Users unit test",function(){

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

        // #2 should return valid token (due to admin token is used in the request)
        it("POST /users test@test => New user token", function(done) {
            server
                .post("/users")
                .set("Authorization", "Bearer " + admin_token)
                .send({
                    "email":"user@user",
                    "password":"user",
                    "name": "user"
                })
                .expect("Content-type",/json/)
                .expect(200)
                .end(function(err, res){
                    res.status.should.equal(200);
                    JSON.parse(res.text).data.should.have.property("token");
                    JSON.parse(res.text).error.should.be.exactly(false);
                    done();
                });
        });

        // #2.5 should return valid token
        it("POST /login test@test => Valid user token", function(done) {
            server
                .post("/login")
                .send({
                    "email":"user@user",
                    "password":"user"
                })
                .expect("Content-type",/json/)
                .expect(200)
                .end(function(err, res){
                    res.status.should.equal(200);
                    JSON.parse(res.text).data.should.have.property("token");
                    JSON.parse(res.text).error.should.be.exactly(false);
                    user_token = JSON.parse(res.text).data.token;
                    done();
                });
        });

        // #3 should return insufficient privileges (beacause user token is used)
        it("POST /users user@user => 401 insufficient privileges", function(done) {
            server
                .post("/users")
                .set("Authorization", "Bearer " + user_token)
                .send({
                    "email":"user1@user",
                    "password":"user1",
                    "name": "user1"
                })
                .expect("Content-type",/json/)
                .expect(401)
                .end(function(err, res){
                    res.status.should.equal(401);
                    JSON.parse(res.text).data.should.have.property("message");
                    JSON.parse(res.text).error.should.be.exactly(false);
                    done();
                });
        });

        // #4 should return users list
        it("GET /users test@test => Users list", function(done) {
            server
                .get("/users")
                .set("Authorization", "Bearer " + admin_token)
                .expect(200)
                .expect("Content-type",/json/)
                .end(function(err, res){
                    res.status.should.equal(200);
                    user_id = JSON.parse(res.text)[1]._id;
                    admin_id = JSON.parse(res.text)[0]._id;
                    done();
                });
        });

        // #5 should return insufficient privileges
        it("GET /users user@user => 401 insufficient privileges", function(done) {
            server
                .get("/users")
                .set("Authorization", "Bearer " + user_token)
                .expect(401)
                .end(function(err, res){
                    res.status.should.equal(401);
                    JSON.parse(res.text).data.should.have.property("message");
                    JSON.parse(res.text).error.should.be.exactly(false);
                    done();
                });
        });

        // #6 should return user information
        it("GET /users/:iduser test@test => User info", function(done) {
            server
                .get("/users/"+user_id)
                .set("Authorization", "Bearer " + admin_token)
                .expect(200)
                .end(function(err, res){
                    res.status.should.equal(200);
                    done();
                });
        });


        // #6 should return user information
        it("GET /users/:iduser user@user => Self info", function(done) {
            server
                .get("/users/"+user_id)
                .set("Authorization", "Bearer " + user_token)
                .expect(200)
                .end(function(err, res){
                    res.status.should.equal(200);
                    done();
                });
        });

        // #7 should return insufficient privileges
        it("GET /users/:idtest user@user => 401 insufficient privileges", function(done) {
            server
                .get("/users/"+admin_id)
                .set("Authorization", "Bearer " + user_token)
                .expect(401)
                .end(function(err, res){
                    res.status.should.equal(401);
                    done();
                });
        });

        // #8 should modify user information
        it("PUT /users/:iduser test@test => Replace user info", function(done) {
            server
                .put("/users/"+user_id)
                .send({
                    "email":"user@user",
                    "password":"user",
                    "name": "user_replaced"
                })
                .set("Authorization", "Bearer " + admin_token)
                .expect(200)
                .end(function(err, res){
                    res.status.should.equal(200);
                    done();
                });
        });

        // #9 should modify user information
        it("PUT /users/:iduser user@user => Replace self info", function(done) {
            server
                .put("/users/"+user_id)
                .send({
                    "email":"user@user",
                    "password":"user",
                    "name": "user"
                })
                .set("Authorization", "Bearer " + user_token)
                .expect(200)
                .end(function(err, res){
                    res.status.should.equal(200);
                    done();
                });
        });

        // #10 should return insufficient privileges
        it("PUT /users/:idtest user@user => 401 insufficient privileges", function(done) {
            server
                .put("/users/"+admin_id)
                .send({
                    "email":"test@test",
                    "password":"test",
                    "name": "test"
                })
                .set("Authorization", "Bearer " + user_token)
                .expect(401)
                .end(function(err, res){
                    res.status.should.equal(401);
                    done();
                });
        });

        // #11 should return insufficient privileges
        it("DELETE /users/:idtest user@user => 401 insufficient privileges", function(done) {
            server
                .delete("/users/"+admin_id)
                .set("Authorization", "Bearer " + user_token)
                .expect(401)
                .end(function(err, res){
                    res.status.should.equal(401);
                    done();
                });
        });

        // #12 should delete user account
        it("DELETE /users/:iduser test@test => User deleted", function(done) {
            server
                .delete("/users/"+user_id)
                .set("Authorization", "Bearer " + admin_token)
                .expect(200)
                .end(function(err, res){
                    res.status.should.equal(200);
                    done();
                });
        });

    });

})();