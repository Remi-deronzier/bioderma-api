const express = require("express");
const router = express.Router();

const Article = require("../models/Article");

// route to get one article

router.get("/article/:id", async (req, res) => {
  console.log("route: /article/:id");
  console.log(req.params);
  if (req.params.id) {
    try {
      const article = await Article.findById(req.params.id).populate("author");
      if (article) {
        res.status(200).json(article);
      } else {
        res.status(400).json({ message: "Article not found" });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  } else {
    res.status(400).json({ message: "Missing ID parameter" });
  }
});

// route to get all articles

router.get("/articles", async (req, res) => {
  console.log("route: /articles");
  try {
    const articles = await Article.find().populate("author");
    if (articles) {
      res.status(200).json(articles);
    } else {
      res.status(400).json({ message: "Articles not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
