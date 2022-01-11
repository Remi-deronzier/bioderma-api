const mongoose = require("mongoose");

const Pharmacy = mongoose.model("Pharmacy", {
  name: {
    type: String,
    maxLength: 50,
  },
  description: {
    type: String,
    maxLength: 500,
  },
  city: String,
  gps_location: {
    type: Object, // {longitude: 78, latitude: 6}
    index: "2d",
  },
  opening_hours: Object, // {opening: 8, closure: 19}
  number_of_employees: Number,
  images: [String],
  number_of_reviews: Number,
  rating_values: Array, // [5, 4, 3, 5, ... 5] rating out of 5
});

module.exports = Pharmacy;
