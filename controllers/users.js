const User = require("../models/users.js");



module.exports.renderSignupForm = (req,res) => {
    res.render("users/signup.ejs", {
        search: ""
    });
};


module.exports.signup = async(req,res) => {
    try{
        let {username,email,password} = req.body;
        const newUser = new User({email,username});
        const registeredUser = await User.register(newUser,password);
        console.log(registeredUser);
        req.login(registeredUser, (err) => {
            if(err){
                next(err);
            }
            req.flash("success", `Welcome to Travaura ${username}!`);
            res.redirect("/listings");
        })} catch(err) {
                req.flash("error",err.message);
                res.redirect("/signup");
            }
};


module.exports.renderLoginForm = (req,res) => {
    res.render("users/login.ejs", {
        search: ""
    });
};


module.exports.login = async(req,res) => {
    let {username,password} = req.body;
    req.flash("success", `Welcome to Travaura ${username}!`);
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);  
};


module.exports.logout = (req,res,next) => {
    req.logout((err) => {
        if(err){
            return next(err);
        }
        req.flash("success", "Logged Out successfully");
        res.redirect("/listings");
    })
};
