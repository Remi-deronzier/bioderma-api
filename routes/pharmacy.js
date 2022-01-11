const express = require("express");
const router = express.Router();

const Pharmacy = require("../models/Pharmacy");
const Inventory = require("../models/Inventory");

// route to get a pharmacy

router.get("/pharmacy/:id?", async (req, res) => {
  console.log("route: /pharmacy/:id?");
  console.log(req.params);
  if (req.params.id) {
    try {
      const pharmacy = await Pharmacy.findById(req.params.id);
      if (pharmacy) {
        res.status(200).json(pharmacy);
      } else {
        res.status(400).json({ message: "Pharmacy not found" });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  } else {
    res.status(400).json({ message: "Missing ID parameter" });
  }
});

// route to get all pharmacies of a product

router.get("/pharmacies/product/:product_id?", async (req, res) => {
  console.log("route: /pharmacies/product/:product_id?");
  console.log(req.params);
  if (req.params.product_id) {
    try {
      const pharmacies = await Inventory.find({
        product: req.params.product_id,
      }).populate("pharmacy");
      if (pharmacies) {
        const count = await Inventory.count({ product: req.params.product_id });
        res.status(200).json({ pharmacies, count });
      } else {
        res.status(400).json({ message: "Pharmacies not found" });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  } else {
    res.status(400).json({ message: "Missing ID parameter" });
  }
});

// route to get all pharmacies

router.get("/pharmacies", async (req, res) => {
  console.log("route: /pharmacies");
  console.log(req.query);
  try {
    const pharmacies = await Pharmacy.find();
    const count = await Pharmacy.countDocuments();
    res.status(200).json({
      count: count,
      rooms: pharmacies,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
