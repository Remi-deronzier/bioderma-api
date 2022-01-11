const mongoose = require("mongoose");

const Inventory = mongoose.model("Inventory", {
  quantity: Number,
  pharmacy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pharmacy",
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
});

module.exports = Inventory;
