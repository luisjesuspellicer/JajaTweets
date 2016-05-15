/**
 * Created by diego on 22/04/16.
*/
(function() {

    'use strict';

    var supertest = require("supertest");
    var should = require("should");
    var atob = require('atob');

    // This agent refers to PORT where program is runninng.
    var server = supertest.agent(process.env.CURRENT_DOMAIN);
    var admin_token, user_token, user_id, admin_id, user_password;

    // UNIT test begin
    describe("USERS api test",function(){

        // #1 Should return the admin token
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

        // #2 Should return the new user's token (due to admin token is used in the request)
        it("POST /users test@test => New user token", function(done) {
            server
                .post("/users")
                .set("Authorization", "Bearer " + admin_token)
                .send({
                    "email":"mocha@mocha",
                    "name": "user"
                })
                .expect("Content-type",/json/)
                .expect(200)
                .end(function(err, res){
                    res.status.should.equal(200);
                    JSON.parse(res.text).data.should.have.property("password");
                    JSON.parse(res.text).error.should.be.exactly(false);
                    user_password = JSON.parse(res.text).data.password;
                    done();
                });
        });

        // #3 Should return the new user's token
        it("POST /login user@user => Valid user token", function(done) {
            server
                .post("/login")
                .send({
                    "email":"mocha@mocha",
                    "password": user_password
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

        // #4 should return insufficient privileges (beacause user token is used)
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

        // #5 Should return users list (because admin token is used)
        it("GET /users test@test => Users list", function(done) {
            server
                .get("/users")
                .set("Authorization", "Bearer " + admin_token)
                .expect(200)
                .expect("Content-type",/json/)
                .end(function(err, res){
                    res.status.should.equal(200);
                    user_id = JSON.parse(res.text)[3]._id;
                    admin_id = JSON.parse(res.text)[0]._id;
                    done();
                });
        });

        // #6 Should return insufficient privileges
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

        // #7 Should return user information
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


        // #8 Should return user information
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

        // #9 Should return insufficient privileges
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

        // #10 Should modify user information
        it("PUT /users/:iduser test@test => Replace user info", function(done) {
            server
                .put("/users/"+user_id)
                .send({
                    "email":"mocha@mocha",
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

        // #11 Should modify user information
        it("PUT /users/:iduser user@user => Replace self info", function(done) {
            server
                .put("/users/"+user_id)
                .send({
                    "email":"mocha@mocha",
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

        // #12 Should return insufficient privileges
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

        // #13 Should return insufficient privileges
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

        // #14 should delete user account
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