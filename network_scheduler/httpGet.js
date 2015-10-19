var Promise = require("bluebird");
var http = require("http");

module.exports = function(params) {
    return new Promise(function(resolve,reject){
        var jsonStr = "";
        http.get(params, function (res) {
            res.on("error", function (err) {
                reject(err)
            }).on("data", function (chunk) {
                jsonStr += chunk.toString();
            }).on("end", function () {
                resolve(jsonStr);
            });
        });
    });
};