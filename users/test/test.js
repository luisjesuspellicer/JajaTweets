/**
 * Created by diego on 22/04/16.
 */
(function() {

    'use strict';

    var supertest = require("supertest");
    var should = require("should");

    // This agent refers to PORT where program is runninng.
    var server = supertest.agent("http://localhost:3000");
    var token;

    // UNIT test begin
    describe("Users unit test",function(){

        // #1 should return token
        it("Register should return valid token", function(done) {
            server
                .post("/login")
                .send({
                    "email":"test@test",
                    "password":"test",
                    "name": "test"
                })
                .expect("Content-type",/json/)
                .expect(200)
                .end(function(err, res){
                    res.status.should.equal(200);
                    JSON.parse(res.text).should.have.property("token");
                    token = JSON.parse(res.text).token;
                    done();
                });
        });

        // #2 should return same token as #1
        it("Login should return same token as register", function(done) {
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
                    JSON.parse(res.text).should.have.property("token",token);
                    done();
                });
        });

        // #3 should return users list
        it("Should return users list", function(done) {
            server
                .get("/users")
                .set("Authorization", "Bearer "+token)
                .expect(200)
                .expect("Content-type",/json/)
                .end(function(err, res){
                    res.status.should.equal(200);
                    JSON.parse(res.text).should.exists;
                    done();
                })
        })

    });

})();