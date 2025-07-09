const express = require("express");
const router = express.Router();
const User = require("../models/users.js");
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync.js");
const { saveRedirectUrl } = require("../middleware.js");
 
const userControllers = require("../controllers/users.js");

//signup
router.route("/signup")
    .get(userControllers.renderSignupForm)
    .post(wrapAsync(userControllers.signup));


//login
router.route("/login")
    .get(userControllers.renderLoginForm)
    .post(saveRedirectUrl, passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }), userControllers.login);

//logout
router.get("/logout", userControllers.logout);

module.exports = router;