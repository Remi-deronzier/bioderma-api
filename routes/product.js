const express = require("express");
const router = express.Router();

const Product = require("../models/Product");
const Inventory = require("../models/Inventory");

// route to get a product

router.get("/product/:id", async (req, res) => {
  console.log("route: /product/:id");
  console.log(req.params);
  if (req.params.id) {
    try {
      const product = await Product.findById(req.params.id);
      if (product) {
        const productAgregation = await Inventory.find().populate("product");
        const quantity = productAgregation.reduce((total, productDetails) => {
          if (productDetails.product) {
            if (String(productDetails.product._id) === String(product._id)) {
              total += productDetails.quantity;
            }
          }
          return total;
        }, 0);
        const result = {
          data: product,
          quantity,
        };
        res.status(200).json(result);
      } else {
        res.status(400).json({ message: "Product not found" });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  } else {
    res.status(400).json({ message: "Missing ID parameter" });
  }
});

// route to get all products of a pharmacy

router.get("/products/pharmacy/:pharmacy_id", async (req, res) => {
  console.log("route: /products/pharmacy/:pharmacy_id");
  console.log(req.params);
  if (req.params.pharmacy_id) {
    try {
      const products = await Product.find();
      if (products) {
        const productAgregation = await Inventory.find()
          .populate("pharmacy")
          .populate("product");
        console.log(productAgregation);
        const productIdsAndQuantity = productAgregation
          .filter(
            (product) =>
              String(product.pharmacy._id) === String(req.params.pharmacy_id)
          )
          .reduce((arr, productDetail) => {
            if (productDetail.product) {
              arr.push({
                id: productDetail.product._id,
                quantity: productDetail.quantity,
              });
            }
            return arr;
          }, []);
        console.log(productIdsAndQuantity);
        const filterdProductsPromises = productIdsAndQuantity.map(
          async (productIdAndQuantity) => {
            const data = await Product.findById(productIdAndQuantity.id);
            return { data, quantity: productIdAndQuantity.quantity };
          }
        );
        const pix = await Promise.all(filterdProductsPromises);
        res.status(200).json(pix);
      } else {
        res.status(400).json({ message: "Products not found" });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  } else {
    res.status(400).json({ message: "Missing ID parameter" });
  }
});

// route to filter products

router.get("/products", async (req, res) => {
  console.log("route: /products");
  console.log(req.query);
  try {
    const { name, category, priceMin, priceMax, sort } = req.query;
    const filter = {};
    if (name) {
      filter.name = new RegExp(name, "i");
    }
    if (category) {
      filter.category = new RegExp(category, "i");
    }
    if (priceMax) {
      filter.price = { $lte: Number(priceMax) };
      if (priceMin) {
        filter.price.$gte = Number(priceMin);
      }
    }
    if (priceMin && !filter.price) {
      filter.price = { $gte: Number(priceMin) };
    }
    const sortFilter = {};
    if (sort === "price-desc") {
      sortFilter.price = "desc";
    }
    if (sort === "price-asc") {
      sortFilter.price = "asc";
    }
    if (
      Object.keys(filter).length !== 0 ||
      Object.keys(sortFilter).length !== 0
    ) {
      const search = await Product.find(filter).sort(sortFilter);
      const count = await Product.countDocuments(filter);
      res.status(200).json({
        count: count,
        products: search,
      });
    } else {
      const products = await Product.find();
      const count = await Product.countDocuments();
      res.status(200).json({
        count: count,
        products: products,
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
