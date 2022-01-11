const mongoose = require("mongoose");

const Product = mongoose.model("Product", {
  name: {
    type: String,
    maxLength: 50,
  },
  description: {
    type: String,
    maxLength: 500,
  },
  price: {
    type: Number,
    max: 100000,
  },
  category: String, // "dry skin" or "oily skin"
  images: [String],
  number_of_reviews: Number,
  rating_values: Array, // [5, 4, 3, 5, ... 5] rating out of 5
});

module.exports = Product;
