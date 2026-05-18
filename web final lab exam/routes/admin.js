let express = require("express");
let router = express.Router();
let Product = require("../models/Product");
let Order = require("../models/Order");
let { isAdmin } = require("../middleware/auth");
let upload = require("../utils/upload");

// Admin dashboard
router.get("/", isAdmin, async function (req, res) {
  try {
    let products = await Product.find();
    res.render("admin/dashboard", { products: products, success: req.query.success || "" });
  } catch (err) {
    console.log("Error loading admin:", err);
    res.status(500).send("Server Error");
  }
});

// Add product form
router.get("/add", isAdmin, (req, res) => {
  res.render("admin/add-product", { error: "" });
});

// Add product submit
router.post("/add", isAdmin, upload.single("image"), async function (req, res) {
  try {
    let { name, price, category, section, stock, rating } = req.body;
    if (!name || !price || !category || !section || !stock || !rating) {
      return res.render("admin/add-product", { error: "All fields are required." });
    }
    let imagePath = req.file ? "/uploads/" + req.file.filename : "";
    let newProduct = new Product({ name, price, category, section, stock, rating, image: imagePath });
    await newProduct.save();
    res.redirect("/admin?success=Product added successfully!");

  } catch (err) {
    console.log("Error adding product:", err);
    res.render("admin/add-product", { error: "Something went wrong. Please try again." });
  }
});

// Edit product form
router.get("/edit/:id", isAdmin, async function (req, res) {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) return res.redirect("/admin?success=Product not found.");
    res.render("admin/edit-product", { product: product, error: "" });
  } catch (err) {
    console.log("Error loading edit form:", err);
    res.redirect("/admin");
  }
});

// Edit product submit
router.post("/edit/:id", isAdmin, upload.single("image"), async function (req, res) {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) return res.redirect("/admin?success=Product not found.");

    let { name, price, category, section, stock, rating } = req.body;
    if (!name || !price || !category || !section || !stock || !rating) {
      return res.render("admin/edit-product", { product: product, error: "All fields are required." });
    }

    product.name = name;
    product.price = price;
    product.category = category;
    product.section = section;
    product.stock = stock;
    product.rating = rating;
    if (req.file) product.image = "/uploads/" + req.file.filename;
    await product.save();
    res.redirect("/admin?success=Product updated successfully!");

  } catch (err) {
    console.log("Error updating product:", err);
    res.redirect("/admin");
  }
});

// Delete product
router.post("/delete/:id", isAdmin, async function (req, res) {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect("/admin?success=Product deleted successfully!");
  } catch (err) {
    console.log("Error deleting product:", err);
    res.redirect("/admin");
  }
});

// View orders
router.get("/orders", isAdmin, async function (req, res) {
  try {
    let orders = await Order.find().sort({ orderDate: -1 });
    res.render("admin/orders", { orders: orders });
  } catch (err) {
    console.log("Error loading orders:", err);
    res.status(500).send("Server Error");
  }
});

// Edit order status form
router.get("/orders/edit/:id", isAdmin, async function (req, res) {
  try {
    let order = await Order.findById(req.params.id);
    if (!order) {
      req.flash("error", "Order not found.");
      return res.redirect("/admin/orders");
    }
    res.render("admin/edit-order", { order: order });
  } catch (err) {
    console.log("Error loading order:", err);
    res.redirect("/admin/orders");
  }
});

// Update order status
router.post("/orders/edit/:id", isAdmin, async function (req, res) {
  try {
    let order = await Order.findById(req.params.id);
    if (!order) {
      req.flash("error", "Order not found.");
      return res.redirect("/admin/orders");
    }
    order.status = req.body.status;
    await order.save();
    res.redirect("/admin/orders");
  } catch (err) {
    console.log("Error updating order:", err);
    res.redirect("/admin/orders");
  }
});

module.exports = router;
