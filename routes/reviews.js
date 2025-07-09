const express = require("express");
const router = express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { validateReview, isLoggedIn, isreviewAuthor } = require("../middleware.js");

const reviewControllers = require("../controllers/review.js")

//review route
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewControllers.createReview));
 
router.delete("/:reviewId",isLoggedIn, isreviewAuthor, wrapAsync(reviewControllers.deleteReview));

module.exports = router;
