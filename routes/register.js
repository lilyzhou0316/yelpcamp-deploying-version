var express = require("express");
var router = express.Router();
var User = require("../models/user");
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
	var newUser = new User({username:req.body.username});
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


module.exports = router;