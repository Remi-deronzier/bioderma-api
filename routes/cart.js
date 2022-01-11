const express = require("express");
const router = express.Router();

const Cart = require("../models/Cart");
const isAuthenticated = require("../middlewares/isAuthenticated");

// route to create a cart

router.post("/cart/create", isAuthenticated, async (req, res) => {
  console.log("route : /cart/create");
  console.log(req.fields);
  try {
    const { quantity, total, products } = req.fields;
    if (!quantity || !total || !products) {
      res.status(400).json({
        message: "Missing quantity, total and products",
      });
    } else {
      const newCart = new Cart({
        quantity: quantity,
        total: total,
        products: products,
        client: req.user,
      });
      await newCart.save();
      res.status(200).json(newCart);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// route to get cart of one user

router.get("/cart/user/:user_id", isAuthenticated, async (req, res) => {
  console.log("route: /cart/user/:user_id");
  console.log(req.params);
  if (req.params.user_id) {
    if (String(req.user._id) === String(req.params.user_id)) {
      try {
        const cartAgregation = await Cart.find()
          .populate("client")
          .populate("products");
        console.log(cartAgregation);
        const cart = cartAgregation.filter(
          (cart) => String(cart.client._id) === String(req.params.user_id) // Important not to forget the String to compare strings between strings
        );
        res.status(200).json(cart);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  } else {
    res.status(400).json({ message: "Missing ID paramters" });
  }
});

// route to update a cart

router.put("/cart/update/:id?", isAuthenticated, async (req, res) => {
  console.log("route: /cart/update");
  console.log(req.fields);
  console.log(req.params);
  if (req.params.id) {
    try {
      const cart = await Cart.findById(req.params.id).populate("products");
      if (!cart) {
        res.status(400).json({ message: "this cart doesn't exist" });
      } else {
        if (String(req.user._id) === String(cart.client._id)) {
          // check that the token match with the owner of the ad
          const { quantity, total, products } = req.fields;
          if (
            !quantity &&
            !total &&
            !products // check that at least one modification of the ad has been specified by the user
          ) {
            res.status(400).json({ message: "Missing parameters" });
          } else {
            const reqKeys = Object.keys(req.fields);
            let cartUpdated = reqKeys.reduce((obj, element) => {
              switch (element) {
                case "quantity":
                  obj.quantity = quantity;
                  break;
                case "total":
                  obj.total = total;
                  break;
                case "products":
                  obj.products = products;
                  break;
              }
              return obj;
            }, cart);
            cartUpdated.markModified("products");
            await cartUpdated.save();
            res.status(200).json({ message: "Cart successfully updated" });
          }
        } else {
          res.status(401).json({ message: "Unauthorized" });
        }
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  } else {
    res.status(400).json({ message: "Missing ID parameter" });
  }
});

// route to delete a cart

router.delete("/cart/delete/:id?", isAuthenticated, async (req, res) => {
  console.log("route: /cart/delete/:id?");
  console.log(req.params);
  if (req.params.id) {
    try {
      const cart = await Cart.findById(req.params.id);
      if (cart) {
        if (String(req.user._id) === String(cart.client._id)) {
          await Cart.findByIdAndDelete(req.params.id);
          res.status(200).json({ message: "Cart successfully deleted" });
        } else {
          res.status(401).json({ message: "Unauthorized" });
        }
      } else {
        res.status(400).json({ message: "Cart not found" });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  } else {
    res.status(400).json({ message: "Missing ID parameter" });
  }
});

// route to get a cart

router.get("/cart/:id", isAuthenticated, async (req, res) => {
  console.log("route: /cart/:id");
  console.log(req.params);
  if (req.params.id) {
    try {
      const cart = await Cart.findById(req.params.id)
        .populate("client")
        .populate("products");
      if (cart) {
        res.status(200).json(cart);
      } else {
        res.status(400).json({ message: "Cart not found" });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  } else {
    res.status(400).json({ message: "Missing ID parameter" });
  }
});

module.exports = router;
