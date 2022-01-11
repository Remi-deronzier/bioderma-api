const mongoose = require("mongoose");

const Cart = mongoose.model("Cart", {
  status: String, // "active"
  quantity: Number,
  total: Number,
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = Cart;
