var CampGround = require("../models/campGround");
var Comment = require("../models/comment");

var middlewareObj = {};

 middlewareObj.checkCommentOwnership = function(req,res,next){
	//first to check is user logged in ? if not, redirect
	if(req.isAuthenticated()){
		//if is
		Comment.findById(req.params.comment_id,function(err,foundComm){
			if(err || !foundComm){// if foundComm is null, then !foundComm is true
	 			req.flash("error","comment not found!");//give us the capability to access the flash on the next step, and this line must befor redirect line!!
				
				res.redirect("back")//back means the page where user came from
			}else{
					//does the user own the comment?
					//caution: foundComm.author.id is an object, need to be convert to string
					if(foundComm.author.id.equals(req.user._id)){
					//if is, then he/she can edit/update/delete the page
						next();
					}else{
	 					req.flash("error","You don't have permission to do that!");//give us the capability to access the flash on the next step, and this line must befor redirect line!!
						
					//if not, then he/she can not edit/update/delete current campground
						res.redirect("back")
				    }
				
			     }
		 });
	}else{
	 req.flash("error","You need to be logged in to do that!");//give us the capability to access the flash on the next step, and this line must befor redirect line!!
		
		res.redirect("back");
	}
	 
 };

 middlewareObj.checkCampgroundOwnership = function(req,res,next){
	//first to check is user logged in ? if not, redirect
	if(req.isAuthenticated()){
		//if is
		CampGround.findById(req.params.id,function(err,foundCamp){
			if(err || !foundCamp){
	 			req.flash("error","campground not found!");//give us the capability to access the flash on the next step, and this line must befor redirect line!!
				
				res.redirect("back")//back means the page where user came from
			}else{
					//does the user own the campground?
					//caution: foundCamp.author.id is an object, need to be convert to string
					if(foundCamp.author.id.equals(req.user._id)){
					//if is, then he/she can edit/update/delete the page
						next();
					}else{
	 					req.flash("error","You don't have permission to do that!");//give us the capability to access the flash on the next step, and this line must befor redirect line!!
						
					//if not, then he/she can not edit/update/delete current campground
						res.redirect("back")
				    }
				
			     }
		 });
	}else{
	 	req.flash("error","You need to be logged in to do that!");//give us the capability to access the flash on the next step, and this line must befor redirect line!!
		
		res.redirect("back");
	}
	 
 };

 middlewareObj.isLoggedIn = function(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	 req.flash("error","You need to be logged in to do that!");//give us the capability to access the flash on the next step, and this line must befor redirect line!!
	res.redirect("/login")
	 
 };

module.exports = middlewareObj;