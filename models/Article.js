const mongoose = require("mongoose");

const Article = mongoose.model("Article", {
  title: {
    type: String,
    maxLength: 50,
  },
  date: String,
  description: {
    type: String,
    maxLength: 500,
  },
  content: Array, // [{"subtitle": "...", "paragraph": ["...", "..."], "image": "http://"}, ... {}]
  categories: Array, // ["eczéma", "redness"]
  thumbnail: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = Article;
