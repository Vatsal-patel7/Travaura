const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const review = require("./review.js");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    url : String,
    filename: String,
  },
  price: Number,
  location: String,
  coordinates: {
    lat : Number,
    lng: Number
  },
  country: String,
  reviews: [{
    type: Schema.Types.ObjectID,
    ref: "Review"
    }],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",  
  },
  category: {
    type: String,
    enum : ["Trending", "Rooms", "Iconic cities", "Mountains", "Castles", "Amazing pools", "Camping", "Farms", "Artic", "Boat"]
  }
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if(listing){
    await review.deleteMany({ _id: { $in: listing.reviews }});
}
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;