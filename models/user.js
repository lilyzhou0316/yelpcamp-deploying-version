var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
	username:String,
	password:String,
	avatar: String,
	email:String
});

UserSchema.plugin(passportLocalMongoose);//add passport local methods to user schema
module.exports = mongoose.model("User",UserSchema);