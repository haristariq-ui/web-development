let express = require("express");
let router = express.Router();
let Order = require("../models/Order");
let Product = require("../models/Product");
let { isLoggedIn } = require("../middleware/auth");

// Checkout page
router.get("/", isLoggedIn, function (req, res) {
  let cart = req.session.cart || [];
  if (req.query.orderPlaced === "true") {
    return res.render("checkout", { cart: [], grandTotal: 0 });
  }
  if (cart.length === 0) {
    req.flash("error", "Your cart is empty. Add some products first.");
    return res.redirect("/cart");
  }
  let grandTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  res.render("checkout", { cart: cart, grandTotal: grandTotal });
});

// Place order
router.post("/", isLoggedIn, async function (req, res) {
  try {
    let cart = req.session.cart || [];
    if (cart.length === 0) {
      req.flash("error", "Your cart is empty.");
      return res.redirect("/cart");
    }

    let { customerName, phone, address } = req.body;
    if (!customerName || !phone || !address) {
      req.flash("error", "Please fill in all fields.");
      return res.redirect("/checkout");
    }

    let grandTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let newOrder = new Order({
      customerName: customerName,
      phone: phone,
      address: address,
      userId: req.session.user.id,
      items: cart,
      totalAmount: grandTotal
    });

    await newOrder.save();
    for (let item of cart) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
    }
    req.session.cart = [];
    res.redirect("/checkout?orderPlaced=true");

  } catch (err) {
    console.log("Error placing order:", err);
    req.flash("error", "Something went wrong. Please try again.");
    res.redirect("/checkout");
  }
});

module.exports = router;
