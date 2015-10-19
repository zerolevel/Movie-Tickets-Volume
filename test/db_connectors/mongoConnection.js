var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var Promise = require("bluebird");

describe("Mongodb", function(done){
    it("Test Connection Opening and Closing", function(done) {
        var url = 'mongodb://localhost:27017/test';
        MongoClient.connect(url,{promiseLibrary:Promise}).then(function(db){
            db.close();
            done();
        });
    });

    it("Creating and droping Collection", function(done) {
        var url = 'mongodb://localhost:27017/test';
        MongoClient.connect(url).then(function(db) {
            return db.collection("test");
        }).then(function(col){
            col.drop();
        }).then(function(){
            done();
        }).catch(function(e){
            done(e);
        });
    });

});