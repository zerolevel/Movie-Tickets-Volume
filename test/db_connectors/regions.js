var assert = require('assert');
var RegionsRC = require("../../db_connectors/regions.js");
var redis = require("redis");
var Promise = require("bluebird");
var util = require("util");

describe("db_connectors: Regions", function(){
    var redisClient;

    this.timeout(10000);
    //delete all the keys of regions before testing each
    beforeEach(function(done){
        redisClient = Promise.promisifyAll(redis.createClient());
        redisClient.delAsync("region:codes")
            .then(function(){done();})
            .catch(done);
    });
    it("Error if Redis Client is not specified", function(){
        try{
            var regionsRC = new RegionsRC();
        }catch(e) {
            assert.equal(e.message,"Redis Client Not Specified");
        }

    });
    describe("PopulateRegions()", function() {
        this.slow(1000);
        it("test the number of regions returned", function (done) {
            var regionsRC = new RegionsRC(redisClient);
            regionsRC.populateRegions()
                .then(function (codes) {
                   return redisClient.scardAsync("region:codes")
                    .then(function(returnedNumCities){assert.equal(codes.length, returnedNumCities);})
                    .done(done, done)
                })
        });
        it("test if returned regions exist in redis array", function (done) {
            var regionsRC = new RegionsRC(redisClient);
            regionsRC.populateRegions()
            .then(function (codes) {
                return Promise.map(codes,function(code) {
                    redisClient.existsAsync("region:" + code)
                }).done(function(){done();}, done);
            })
        });
    });
    describe("getAllCodes()", function(){
        this.slow(1000);
        it("test if all the returned codes are a complete set", function (done) {
            var regionsRC = new RegionsRC(redisClient);
            regionsRC.populateRegions().then(function (codes) {
               return regionsRC.getAllRegionCodes().then(function(returnedCodes){
                   assert.equal(JSON.stringify(codes.sort()), JSON.stringify(returnedCodes.sort()));
               }).done(done,done);
            });
        });
    });
    describe("getCityDetails()", function(){
        this.slow(1000);
        it("test if all cities details are correct", function (done) {
            var regionsRC = new RegionsRC(redisClient);
            regionsRC.populateRegions()
            .then(function (codes) {
                return Promise.map(codes,function(code){
                    var apiCall = regionsRC.getCityDetails(code);
                    apiCall.then(function(){
                        return redisClient.getAsync(util.format("region:%s",code));
                    }).then( function(dbCityDetails){
                        assert.deepEqual(JSON.parse(dbCityDetails),apiCall.value())
                    }).catch(done);
                }).then(function(){done();})
                .catch(done);
            })
        });
    });

    describe("checkCityCode",function(){

    });

    afterEach(function(){
        redisClient.end();
    })
});