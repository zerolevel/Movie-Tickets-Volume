var mailgun = require("mailgun");
var config = require("../config");

module.exports = function(){
    var data = Array.prototype.join.call(arguments,"\n\n\n");
    email(data);
};

function email(data){
    var mg = new mailgun.Mailgun(config.mailgunApi);
    mg.sendText(config.senderEmail,config.errorEmails,"Cine Bizs Updates", data);
}