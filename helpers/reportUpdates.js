var mailgun = require("mailgun");
var config = require("../config");

module.exports = function(){
    var subject = Array.prototype.join.call(arguments,"\n\n\n");
    console.log(subject,new Date());
    return email(subject);

};

function email(subject){
    var mg = new mailgun.Mailgun(config.mailgunApi);
    return mg.sendText(config.senderEmail,config.updateEmails,"Cine Bizs Updates: " + subject, "");
}