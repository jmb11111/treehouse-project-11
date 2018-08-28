let mongoose = require("mongoose");
let Course = require('../src/models').Course;

//Require the dev-dependencies
let chai = require('chai');
let app = require('../src/index');
var request = require('supertest');
var expect = chai.expect;
let should = chai.should();

//Our parent block

/*
  * Test the /GET route
  */
  describe('/GET user', () => {
      it(' should get user info of currently authenticated user', (done) => {
        request.agent(app)
            .get('/api/users')
            .auth('josh@blasbalg.com', 'matthew')
            .end((err, res) => {
                console.log(res.body[0].emailAddress)
                  expect(res.statusCode).to.equal(200);
                  expect(res.body).to.be.a('array');
                  expect(res.body[0]).to.have.property("emailAddress").eql("josh@blasbalg.com");
              done();
            });
      });

  });


  describe('/GET course info', () => {
    it(' should return a 401 status code and incorrect user info message', (done) => {
      request.agent(app)
          .get('/api/courses/57029ed4795118be119cc43d')
          .auth('bad', 'credentials')
          .end((err, res) => {
                expect(res.statusCode).to.equal(401);
                expect(res.body).to.be.a('object');
            done();
          });
    });

});
