var express = require("express"),
    app = express(),
    bodyparser = require("body-parser"),
	passport = require("passport"),
	LocalStrategy = require("passport-local"),
    mongoose = require("mongoose"),
	methodOverride = require("method-override"),
	flash = require("connect-flash");
var CampGround = require("./models/campGround");
var Comment = require("./models/comment");
var User = require("./models/user");
var seedDB = require("./seeds");
app.locals.moment = require('moment');
//requiring routes
var campgroundRouters = require("./routes/campgrounds");
var commentRouters = require("./routes/comments");
var registerRouters = require("./routes/register");


//seedDB();//seed the mongodb
mongoose.set('useNewUrlParser', true);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useFindAndModify', false);
//connect to mongodb
//mongoose.connect(process.env.DATABASEURL); //for test
mongoose.connect("mongodb+srv://lilyzhou0316:zhou13491087@yelpcamp0316-v2fq6.mongodb.net/test?retryWrites=true&w=majority"); //for deployment

//backup url
//var url = process.env.DATABASEURL || "mongodb://localhost:27017/yelp_camp_13"
//mongoose.connect(url); 

app.set("view engine","ejs");
app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static(__dirname+"/public"));
app.use(methodOverride("_method"));
app.use(flash());
//passport configuration
app.use(require("express-session")({
	secret:"cats are cute",
	resave:false,
	saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
	//pass the req.user(include loggedin user's info) to all routes and templates
	//that's why in show.ejs we can use campground.author.id.equals(currentUser._id)
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");//pass the error to all routes
	res.locals.success = req.flash("success");
	next();
});

//use all routes
//first way:
// app.use(campgroundRouters);
// app.use(commentRouters);
// //app.use(registerRouters);

//second way:
app.use("/campgrounds",campgroundRouters);//it means get all routes from campgroundRouters and append "/campgrounds" in front of them
app.use("/campgrounds/:id/comments",commentRouters);
app.use("/",registerRouters);

app.listen(process.env.PORT, process.env.IP,function(){
   console.log("The YelpCamp Server Has Started!");
});