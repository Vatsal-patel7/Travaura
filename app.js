if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/users.js")

const listings = require("./routes/listings.js");
const reviews = require("./routes/reviews.js");
const users = require("./routes/users.js");

const DbURL = process.env.Atlas_URL;

main().then((res) => {
    console.log("connected successfully");
}).catch((e) => {
    console.log("error:", e);
});

async function main(){
    await mongoose.connect(DbURL);
}

app.set("view engine","ejs");
app.set("views", path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);  
app.use(express.static(path.join(__dirname,"/public")));

const store = MongoStore.create({
    mongoUrl: DbURL,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24*3600,
});

store.on("error",() => {
    console.log("Session error in mongo ",err);
})

const sessionOption = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized : true,
    cookie : {
        expires: Date.now() + 7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        https: true
    }
};

app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => {
    res.locals.success = req.flash("success"); 
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

app.get("/", (req, res) => {
    res.render("listings/landing.ejs", {
        currUser: req.user || null,
        search: ""  
    });
});

app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews)
app.use("/",users);

app.all("*", (req,res,next) => {
    next(new ExpressError(404,"Page not found"));
});

app.use((err,req,res,next) => {
    let { statusCode=500,message="Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", {message});
});

app.listen(4000, (req,res) => {
    console.log("Listening at port 4000");
});