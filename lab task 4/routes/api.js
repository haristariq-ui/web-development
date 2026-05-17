// ===========================
// API v1 ROUTES
// ===========================
// These routes return JSON data (not EJS pages).
// They are designed for external clients like mobile apps or React front-ends.

let express = require("express");
let router = express.Router();
let jwt = require("jsonwebtoken");
let Product = require("../models/Product");
let User = require("../models/User");
let verifyToken = require("../middleware/verifyToken");

// ============================================================
// PUBLIC ENDPOINTS (No token needed)
// ============================================================

// ----- GET /api/v1/products -----
// Returns a list of all products with pagination and filtering
router.get("/products", async function (req, res) {
  try {
    // Read query parameters for pagination and filtering
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 8;
    let search = req.query.search || "";
    let category = req.query.category || "";
    let section = req.query.section || "";
    let minPrice = req.query.minPrice || "";
    let maxPrice = req.query.maxPrice || "";

    // Build the filter object
    let filter = {};

    // Filter by section (Men, Women, Kids, etc.)
    if (section) {
      filter.section = section;
    }

    // Search by product name (case-insensitive)
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    // Filter by category
    if (category) {
      filter.category = category;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Count total matching products
    let totalProducts = await Product.countDocuments(filter);
    let totalPages = Math.ceil(totalProducts / limit);

    // Make sure page is in valid range
    if (page < 1) page = 1;
    if (page > totalPages && totalPages > 0) page = totalPages;

    // Calculate how many to skip for pagination
    let skip = (page - 1) * limit;

    // Fetch the products
    let products = await Product.find(filter).skip(skip).limit(limit);

    // Send JSON response
    res.json({
      products: products,
      currentPage: page,
      totalPages: totalPages,
      totalProducts: totalProducts
    });

  } catch (err) {
    console.log("API Error:", err);
    res.status(500).json({ message: "Server error." });
  }
});

// ----- GET /api/v1/products/:id -----
// Returns details for a single product by its ID
router.get("/products/:id", async function (req, res) {
  try {
    let product = await Product.findById(req.params.id);

    // If no product found with that ID
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Send the product as JSON
    res.json({ product: product });

  } catch (err) {
    console.log("API Error:", err);
    res.status(500).json({ message: "Server error." });
  }
});

// ============================================================
// AUTH ENDPOINT
// ============================================================

// ----- POST /api/v1/auth/login -----
// Verifies email/password and returns a JWT token
router.post("/auth/login", async function (req, res) {
  try {
    let email = req.body.email;
    let password = req.body.password;

    // Check if email and password were provided
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    // Find the user by email
    let user = await User.findOne({ email: email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Compare the entered password with the hashed password
    let isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Password is correct! Create a JWT token
    // The payload contains user_id and role
    let payload = {
      user_id: user._id,
      role: user.role
    };

    // Sign the token with the secret key, expires in 1 hour
    let token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Send the token back to the client
    res.json({
      message: "Login successful!",
      token: token
    });

  } catch (err) {
    console.log("API Login Error:", err);
    res.status(500).json({ message: "Server error." });
  }
});

// ============================================================
// PROTECTED ENDPOINTS (Requires JWT token)
// ============================================================

// ----- POST /api/v1/orders -----
// Allows a logged-in user to submit an order
// verifyToken middleware runs first to check the JWT
router.post("/orders", verifyToken, async function (req, res) {
  try {
    // req.user was set by the verifyToken middleware
    // It contains { user_id, role } from the JWT payload
    let userId = req.user.user_id;

    // Get order items from the request body
    let items = req.body.items;

    // Simple validation: make sure items were provided
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Order must contain at least one item." });
    }

    // Build a simple order object
    // (In a real app, you'd save this to an Order model in the database)
    let order = {
      user_id: userId,
      items: items,
      status: "confirmed",
      created_at: new Date()
    };

    // Send back the order confirmation
    res.status(201).json({
      message: "Order placed successfully!",
      order: order
    });

  } catch (err) {
    console.log("API Order Error:", err);
    res.status(500).json({ message: "Server error." });
  }
});

// ----- GET /api/v1/user/profile -----
// Returns the authenticated user's profile data
// verifyToken middleware runs first to check the JWT
router.get("/user/profile", verifyToken, async function (req, res) {
  try {
    // req.user.user_id was set by verifyToken middleware
    let user = await User.findById(req.user.user_id).select("-password");
    // .select("-password") excludes the password field from the result

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Send user profile data as JSON
    res.json({ user: user });

  } catch (err) {
    console.log("API Profile Error:", err);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
