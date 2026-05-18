// API v1 routes
let express = require("express");
let router = express.Router();
let jwt = require("jsonwebtoken");
let Product = require("../models/Product");
let User = require("../models/User");
let verifyToken = require("../middleware/verifyToken");

// Get all products with pagination and filtering
router.get("/products", async function (req, res) {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 8;
    let { search, category, section, minPrice, maxPrice } = req.query;
    search = search || "";
    category = category || "";
    section = section || "";
    minPrice = minPrice || "";
    maxPrice = maxPrice || "";

    let filter = {};
    if (section) filter.section = section;
    if (search) filter.name = { $regex: search, $options: "i" };
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    let totalProducts = await Product.countDocuments(filter);
    let totalPages = Math.ceil(totalProducts / limit);
    if (page < 1) page = 1;
    if (page > totalPages && totalPages > 0) page = totalPages;
    let skip = (page - 1) * limit;
    let products = await Product.find(filter).skip(skip).limit(limit);

    res.json({ products, currentPage: page, totalPages, totalProducts });

  } catch (err) {
    console.log("API Error:", err);
    res.status(500).json({ message: "Server error." });
  }
});

// Get product by ID
router.get("/products/:id", async function (req, res) {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }
    res.json({ product });
  } catch (err) {
    console.log("API Error:", err);
    res.status(500).json({ message: "Server error." });
  }
});

// Login - get JWT token
router.post("/auth/login", async function (req, res) {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    let user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    let isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    let payload = { user_id: user._id, role: user.role };
    let token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ message: "Login successful!", token: token });

  } catch (err) {
    console.log("API Login Error:", err);
    res.status(500).json({ message: "Server error." });
  }
});

// Place order (protected)
router.post("/orders", verifyToken, async function (req, res) {
  try {
    let userId = req.user.user_id;
    let items = req.body.items;
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Order must contain at least one item." });
    }
    let order = { user_id: userId, items, status: "confirmed", created_at: new Date() };
    res.status(201).json({ message: "Order placed successfully!", order });

  } catch (err) {
    console.log("API Order Error:", err);
    res.status(500).json({ message: "Server error." });
  }
});

// Get user profile (protected)
router.get("/user/profile", verifyToken, async function (req, res) {
  try {
    let user = await User.findById(req.user.user_id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json({ user });
  } catch (err) {
    console.log("API Profile Error:", err);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
