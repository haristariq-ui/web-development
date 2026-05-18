let express = require("express");
let router = express.Router();
let Order = require("../models/Order");
let { isLoggedIn } = require("../middleware/auth");

// My orders page
router.get("/", isLoggedIn, async function (req, res) {
  try {
    let orders = await Order.find({ userId: req.session.user.id }).sort({ orderDate: -1 });
    res.render("my-orders", { orders: orders });
  } catch (err) {
    console.log("Error loading my orders:", err);
    req.flash("error", "Could not load your orders.");
    res.redirect("/");
  }
});

module.exports = router;
