// Initialization
const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();
const cors = require("cors");

const app = express();
app.use(formidable());
app.use(cors());

// Connection with the DB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

// Connection with cloudinary

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Importation of routes
const userRoutes = require("./routes/user");
app.use(userRoutes);
const articleRoutes = require("./routes/article");
app.use(articleRoutes);
const pharmcyRoutes = require("./routes/pharmacy");
app.use(pharmcyRoutes);
const productRoutes = require("./routes/product");
app.use(productRoutes);
const diagnosticRoutes = require("./routes/diagnostic");
app.use(diagnosticRoutes);
const cartRoutes = require("./routes/cart");
app.use(cartRoutes);

// Launching of the server
app.all("*", (req, res) => {
  res.status(404).json({ message: "Page not found" });
});

app.listen(process.env.PORT, () => {
  console.log("Server has started");
});
