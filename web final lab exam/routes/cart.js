let express = require("express");
let router = express.Router();
let Product = require("../models/Product");
let { isLoggedIn } = require("../middleware/auth");

// Add to cart
router.post("/add", isLoggedIn, async function (req, res) {
  try {
    let productId = req.body.productId;
    let quantity = parseInt(req.body.quantity) || 1;

    let product = await Product.findById(productId);
    if (!product) {
      req.flash("error", "Product not found.");
      return res.redirect("/");
    }

    if (quantity > product.stock) quantity = product.stock;

    if (!req.session.cart) req.session.cart = [];

    let existingItem = req.session.cart.find(item => item.productId === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
      if (existingItem.quantity > product.stock) existingItem.quantity = product.stock;
    } else {
      req.session.cart.push({
        productId: productId,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: quantity
      });
    }

    req.flash("success", product.name + " added to cart!");
    res.redirect("/cart");
  } catch (err) {
    console.log("Error adding to cart:", err);
    req.flash("error", "Could not add to cart. Please try again.");
    res.redirect("/");
  }
});

// View cart
router.get("/", isLoggedIn, function (req, res) {
  let cart = req.session.cart || [];
  let grandTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  res.render("cart", { cart: cart, grandTotal: grandTotal });
});

// Remove from cart
router.post("/remove/:id", isLoggedIn, function (req, res) {
  if (req.session.cart) {
    req.session.cart = req.session.cart.filter(item => item.productId !== req.params.id);
  }
  req.flash("success", "Item removed from cart.");
  res.redirect("/cart");
});

// Update cart quantity
router.post("/update", isLoggedIn, function (req, res) {
  let productId = req.body.productId;
  let quantity = parseInt(req.body.quantity) || 1;
  if (req.session.cart) {
    let item = req.session.cart.find(i => i.productId === productId);
    if (item) item.quantity = quantity;
  }
  req.flash("success", "Cart updated.");
  res.redirect("/cart");
});

module.exports = router;
