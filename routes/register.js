var express = require("express");
var router = express.Router();
var User = require("../models/user");
var CampGround = require("../models/campGround");
var passport = require("passport");

//home route
//put this route here just because it has no common with other routes
router.get("/",function(req,res){
	//res.send("home page will be landed soom....");
	res.render("home");
});

//REGISTER ROUTES
//show register form
router.get("/register",function(req,res){
	res.render("register");
});

//handle sign up logic
router.post("/register",function(req,res){
	var newUser = new User({
		username:req.body.username, 
		avatar:req.body.avatar, 
		email:req.body.email
	});
	User.register(newUser,req.body.password,function(err,returnUser){
		if(err){
			req.flash("error",err.message);
			return res.redirect("register");
		}
		passport.authenticate("local")(req,res,function(){
			req.flash("success","Successfully registered! Welcome to YelpCamp "+ returnUser.username);
			res.redirect("campgrounds");
		})
	});
});

//LOGIN ROUTES
//show login form
router.get("/login",function(req,res){
	res.render("login");
});

//handle login logic
router.post("/login", passport.authenticate("local",{
		successRedirect:"/campgrounds",
		failureRedirect:"/login"
	}), function(req,res){
	
});

//LOGOUT ROUTES
//handle login logic
router.get("/logout", function(req,res){
	req.logout();
	req.flash("success","logged you out!");//it will show on the campgrouds page
	res.redirect("campgrounds");
});


//USER PROFILE
router.get("/users/:id",function(req,res){
	
	User.findById(req.params.id,function(err,foundUser){
		if(err){
			req.flash("error","User not found!");
			res.redirect("back");
		}else{
			CampGround.find().where("author.id").equals(foundUser._id).exec(function(err,foundCamps){
				if(err){
					req.flash("error","campground not found!");
					res.redirect("back");
				}else{
					res.render("users/show",{user:foundUser,campgrounds:foundCamps});
				}
			});
		}
	});
});


module.exports = router;