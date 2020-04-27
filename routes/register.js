var express = require("express");
var router = express.Router();
var User = require("../models/user");
var CampGround = require("../models/campGround");
var passport = require("passport");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");

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


//reset password
//forgot password page
router.get('/forgot', function(req, res) {
  res.render('forgot');
});


router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');//this gives users a link conbined with hexi token in the email
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {//find an user by his/her email address
        if (!user) {//if no user return 
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }
		//if there is an user according to the email address
        user.resetPasswordToken = token;//reset password token
        user.resetPasswordExpires = Date.now() + 3600000; // reset password expire time for 1 hour from now on

        user.save(function(err) {//save the user info
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({//nodemailer is the package that allows us to send email to users
		host: 'smtp.gmail.com',
        service: 'Gmail', //the service to send email to users
        auth: {
          user: 'lilyzhou13491087@gmail.com',
          pass: process.env.GMAILPW//set by export GMAILPW=..... then need to set gmail account's less secure app access to on
        }
      });
      var mailOptions = {//there is the email content which will be sent to users
        to: user.email,
        from: 'lilyzhou13491087@gmail.com',
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {//send the mail
		  if(err){
		  req.flash("error",err.message);
		  return res.redirect("/login")
	     } 
        console.log('mail sent');//developers will see
        req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');//alert users
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect("/login");//return back to login page
  });
});

//reset page 
router.get('/reset/:token', function(req, res) {//to handle the token
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, //to check the token is the same with before and the time is not expired
	function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect("/forgot");
    }
	  //if the token is correct and do not expire, show reset page
    res.render('reset', {token: req.params.token});
  });
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([ //make the call by functions' sequence
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, //to check the token is the same with before
				   function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
		  //if token is correct
        if(req.body.password === req.body.confirm) {//to check the first password is the same with confirm password
          user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;//no longer needed
            user.resetPasswordExpires = undefined;//no longer needed

            user.save(function(err) {//save the user's info back to the database
              req.logIn(user, function(err) {//log user in
                done(err, user);
              });
            });
          })
        } else {
            req.flash("error", "Passwords do not match.");//if the first password is not the same with confirm password
            return res.redirect('back');
        }
      });
    },
    function(user, done) {//send a comfirm email to notice users
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'lilyzhou13491087@gmail.com',
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'lilyzhou13491087@gmail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
		 if(err){
		  req.flash("error","email is not sent successfully!");
		  return res.redirect("back")
	  } 
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
	  if(err){
		  req.flash("error","something went wrong!");
		  return res.redirect("back")
	  }
    res.redirect('/campgrounds');
  });
});

module.exports = router;