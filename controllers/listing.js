const Listing = require("../models/listing.js");
const axios = require("axios");

module.exports.index = async (req,res) => {
    let allListings = await Listing.find();
    res.render("listings/index.ejs", {allListings});
};

module.exports.renderNewForm = (req,res) => {
    res.render("listings/new.ejs");
};

module.exports.createListing = async (req,res,next) => {
    try {
        let url = req.file.path;
        let filename = req.file.filename;
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = { url, filename };

        // Get coordinates for the location
        const location = req.body.listing.location;
        let coords = { lat: 0, lng: 0 }; // Default fallback

        if (location) {
            try {
                const geoResponse = await axios.get('https://nominatim.openstreetmap.org/search', {
                    params: {
                        q: location,
                        format: 'json',
                        limit: 1
                    },
                    headers: {
                        'User-Agent': 'TravauraApp/1.0'
                    }
                });

                if (geoResponse.data && geoResponse.data.length > 0) {
                    coords = {
                        lat: parseFloat(geoResponse.data[0].lat),
                        lng: parseFloat(geoResponse.data[0].lon)
                    };
                }
            } catch (geoError) {
                console.error('Geocoding error:', geoError);
                // Continue with default coordinates
            }
        }

        newListing.coordinates = coords;
        await newListing.save();
        
        req.flash("success", "New listing created successfully");
        res.redirect("/listings");
    } catch (error) {
        console.error('Error creating listing:', error);
        req.flash("error", "Error creating listing");
        res.redirect("/listings/new");
    }
};

module.exports.showListing = async (req,res) => {
    try {
        let {id} = req.params;
        const List = await Listing.findById(id)
            .populate({
                path: "reviews", 
                populate: {
                    path: "author",
                }
            })
            .populate("owner");
            
        if(!List){
            req.flash("error","Listing does not exist!!");
            return res.redirect("/listings");
        }
        
        res.render("listings/show.ejs", {List});
    } catch (error) {
        console.error('Error showing listing:', error);
        req.flash("error", "Error loading listing");
        res.redirect("/listings");
    }
};

module.exports.renderEditForm = async (req,res) => {
    try {
        let {id} = req.params;
        const list = await Listing.findById(id);
        
        if(!list){
            req.flash("error","Listing does not exist!!");
            return res.redirect("/listings");
        }

        let originalUrl = list.image.url;
        originalUrl = originalUrl.replace("/upload", "/upload/w_250");
        res.render("listings/edit.ejs", { list, originalUrl });
    } catch (error) {
        console.error('Error loading edit form:', error);
        req.flash("error", "Error loading listing");
        res.redirect("/listings");
    }
};

module.exports.updateListing = async (req,res) => {
    try {
        let {id} = req.params;
        let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});
        
        if(typeof req.file !== "undefined"){
            let url = req.file.path;
            let filename = req.file.filename;
            listing.image = { url, filename };
        }

        // Update coordinates if location changed
        const location = req.body.listing.location;
        if (location) {
            try {
                const geoResponse = await axios.get('https://nominatim.openstreetmap.org/search', {
                    params: {
                        q: location,
                        format: 'json',
                        limit: 1
                    },
                    headers: {
                        'User-Agent': 'TravauraApp/1.0'
                    }
                });

                if (geoResponse.data && geoResponse.data.length > 0) {
                    listing.coordinates = {
                        lat: parseFloat(geoResponse.data[0].lat),
                        lng: parseFloat(geoResponse.data[0].lon)
                    };
                }
            } catch (geoError) {
                console.error('Geocoding error during update:', geoError);
            }
        }

        await listing.save();
        req.flash("success", "Listing Updated!!");
        res.redirect(`/listings/${id}`);
    } catch (error) {
        console.error('Error updating listing:', error);
        req.flash("error", "Error updating listing");
        res.redirect(`/listings/${id}/edit`);
    }
};

module.exports.deleteListing = async (req,res) => {
    try {
        let {id} = req.params;
        let deletedListing = await Listing.findByIdAndDelete(id);
        console.log(deletedListing);
        req.flash("success", "Listing Deleted!!");
        res.redirect("/listings");
    } catch (error) {
        console.error('Error deleting listing:', error);
        req.flash("error", "Error deleting listing");
        res.redirect("/listings");
    }
};