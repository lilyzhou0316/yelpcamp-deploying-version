var mongoose = require("mongoose");

//create campgrounds schema
var campgroundsSchema = new mongoose.Schema({
	name:String,
	price:String,
	image:String,
	description:String,
	location: String,
    lat: Number,
    lng: Number,
   createdAt: { type: Date, default: Date.now },
  
	author:{
		id:{
			type: mongoose.Schema.Types.ObjectId,
         	ref:"User"
		},
		username:String	
	},
	comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ]
	
});
//save it to a model
module.exports = mongoose.model("CampGround",campgroundsSchema);