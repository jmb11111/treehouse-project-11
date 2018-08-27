const expect = require('chai').expect;
var request = require('request');
const site = "http://localhost:5000";
// Test Suite

describe("Mocha", function(){
        //Test Spec (unit test)
    it("should run our tests using npm", function (){
        expect(true).to.be.ok;


    })

})

describe("Routes",function(){

    it('Main page content', function(done) {
        request(site , function(error, response, body) {
            expect(body).to.equal(`{"message":"Welcome to the Course Review API"}`);
            done();
        });
    });

    it("get the user page if validated",function(done){
        request(site+"/api/users", function(error,response,body){
            expect(response.statusCode).to.equal(401);
        done();
        });
        
    });



})
