var later = require("later");
var scrapEvents = require("../scrappingJobs/scrapEvent");
var scrapShows = require("../scrappingJobs/scrapShows");
var updateShows = require("../scrappingJobs/updateShows");
var MongoClient = require('mongodb').MongoClient;
var Promise = require("bluebird");

later.date.localTime();

//Every day at 6:30 am IST
var dailySchedule = {
    schedules:[{h: [8], m: [30]}]
};

var midDaySchedules = {
    schedules:[
        {h: [0], m: [0]},
        {h: [1], m: [0]},
        {h: [9], m: [0]},
        {h: [12], m: [0]},
        {h: [15], m: [0]},
        {h: [18], m: [0]},
        {h: [21], m: [0]},
        {h: [23], m: [0]}
    ]
};

later.setInterval(function(){
    scrapEvents().then(scrapShows);
},dailySchedule);

later.setInterval(function(){
    var date = new Date();
    if(date.getHours()<8){
        return updateShows(new Date(date-24*60*60*1000))
    } else return updateShows(date);
},midDaySchedules);