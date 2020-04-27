var express = require("express");
var router = express.Router();
var CampGround = require("../models/campGround");
var middleware = require("../middleware");//if only give the directory name, it will automatically require the file called index
//set up google map 
var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);


//INDEX route--to list all data
router.get("/",function(req,res){
	var noMatch = null;
	if(req.query.search){
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');//escapeRegex is a function at the end of this file
        // Get all campgrounds from DB
        CampGround.find({name: regex}, function(err, allCampgrounds){
           if(err){
               req.flash("error",err.message);
			   res.redirect('back');
           } else {
              if(allCampgrounds.length < 1) {//if there is no campground matches the search words
                  //noMatch = "No campgrounds match that query, please try again.";
				  req.flash("error","No campgrounds match that query, please try again.");
				  return res.redirect("/campgrounds");
              }
              res.render("campgrounds/index",{campgrounds:allCampgrounds, noMatch: noMatch,currentUser:req.user});
           }
        });
	}else{
		//get all campgrounds from db
		CampGround.find({},function(err,allcamps){
			if(err){
				req.flash("error",err.message);
				res.redirect('back');
		}else{
			res.render("campgrounds/index",{campgrounds:allcamps,currentUser:req.user});//,currentUser:req.user
		  }
		});
	}
});

//NEW route--to show form to create a new data
router.get("/new",middleware.isLoggedIn,function(req,res){
	res.render("campgrounds/new");
});

//CREATE route--to create new data and add it to the db
router.post("/",middleware.isLoggedIn,function(req,res){
	//res.send("you reach the post route")
	var name = req.body.name;
	var price = req.body.price;
	var image = req.body.url;
	var description = req.body.description;
	var author ={
		id:req.user._id,
		username: req.user.username
	};
	
	geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
		//get data from form and add it to the campgroundsVar array
	
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    var newCampground = {name: name, image: image,price:price,description: description, author:author, location: location, lat: lat, lng: lng};
	
	// campgroundsVar.push(newCampground);
	
	//create a new data and save it into db
	CampGround.create(newCampground,function(err,newcamp){
		if(err){
			req.flash("error",err.message);
	}else{
		req.flash("success","successfully add a new campground.");
		//redirect back to campgrounds page
		res.redirect("/campgrounds");
	  }
	});	
  });
});



//SHOW route--to show detail information about a specific data object
router.get('/:id',function(req,res){
	//find the campground with provided ID
	CampGround.findById(req.params.id).populate("comments").exec(function(err, foundcamp){
		if(err || !foundcamp){
			req.flash("error","campground not found!");
			res.redirect("back");
		}else{
			// then show template with that campground
			res.render("campgrounds/show",{campground:foundcamp});
		};
	});
});

//EDIT ROUTE
//to show edit form to user and get the info that user entered
router.get("/:id/edit",middleware.checkCampgroundOwnership,function(req,res){
	CampGround.findById(req.params.id,function(err,foundCamp){
		if(err || !foundCamp){
	 		req.flash("error","campground not found!");
		}else{
			res.render("campgrounds/edit",{campground: foundCamp})
		};
	})
});

//UPDATE ROUTE
//to update the specific campground according to the info that user entered in db
router.put("/:id",middleware.checkCampgroundOwnership,function(req,res){
	//set up google map
	geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    req.body.campground.lat = data[0].latitude;
    req.body.campground.lng = data[0].longitude;
    req.body.campground.location = data[0].formattedAddress;
	
	//find the campground and update it, the second param is the form returned to us
	CampGround.findByIdAndUpdate(req.params.id,req.body.campground,function(err,updatedCamp){
		if(err || !updatedCamp){
	 		req.flash("error","campground not found!");
			res.redirect("/campgrounds")
		}else{
			req.flash("success","successfully update a campground");
			res.redirect("/campgrounds/"+ req.params.id);
		}
	});
  });
});

//DELETE ROUTE
//to delete a campground
router.delete("/:id",middleware.checkCampgroundOwnership,function(req,res){
	CampGround.findByIdAndDelete(req.params.id,function(err){
		if(err){
			req.flash("error",err.message);
		}else{
			req.flash("success","successfully delete a campground.");
			res.redirect("/campgrounds")
		}
	});
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;