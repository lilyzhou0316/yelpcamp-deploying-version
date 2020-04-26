var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
	username: {type: String, unique: true, required: true},//to make username unique and mandatory
	password:String,
	avatar: String,
	email: {type: String, unique: true, required: true},//to make email unique and mandatory
	resetPasswordToken: String,
    resetPasswordExpires: Date
});

UserSchema.plugin(passportLocalMongoose);//add passport local methods to user schema
module.exports = mongoose.model("User",UserSchema);