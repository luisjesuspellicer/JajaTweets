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

        // #1 should return a token
        it("Login should return token", function(done) {
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
                    JSON.parse(res.text).should.have.property("token");
                    token = JSON.parse(res.text).token;
                    done();
                });
        });

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