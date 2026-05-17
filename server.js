// ===========================
// LOAD ENVIRONMENT VARIABLES
// ===========================
// dotenv loads variables from .env file into process.env
// This must be at the very top, before anything else uses process.env
require("dotenv").config();

// ===========================
// IMPORT MODULES
// ===========================
let express = require("express");
let mongoose = require("mongoose");
let session = require("express-session");       // For managing user sessions (keeps users logged in)
let MongoStore = require("connect-mongo").MongoStore;  // Stores sessions in MongoDB (instead of memory)
let flash = require("connect-flash");            // For showing one-time messages (success/error)
let Product = require("./models/Product");
let User = require("./models/User");             // Our User model with bcrypt hashing
let multer = require("multer");                  // Multer is used for handling file uploads
let path = require("path");                      // Path module helps work with file paths
let apiRoutes = require("./routes/api");          // API v1 routes (JSON endpoints for external clients)

// ===========================
// INITIALIZE EXPRESS APP
// ===========================
let app = express();

// Set EJS as the view engine (so we can use .ejs template files)
app.set("view engine", "ejs");

// Serve static files from the "public" folder (CSS, JS, uploaded images)
app.use(express.static("public"));

// Parse form data from POST requests (needed for add/edit forms)
// express.urlencoded reads form fields and puts them in req.body
app.use(express.urlencoded({ extended: true }));

// Parse JSON data from API requests (needed for POST /api/v1/orders, etc.)
app.use(express.json());

// ===========================
// SESSION SETUP
// ===========================
// Sessions let us remember who is logged in across page loads.
// The session data is stored in MongoDB so it survives server restarts.
app.use(session({
  secret: "cougar-store-secret-key",    // Secret used to sign the session cookie
  resave: false,                        // Don't save session if nothing changed
  saveUninitialized: false,             // Don't create session until something is stored
  store: MongoStore.create({            // Store sessions in MongoDB
    mongoUrl: "mongodb://127.0.0.1:27017/cougar_store"
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24         // Session lasts 1 day (in milliseconds)
  }
}));

// ===========================
// FLASH MESSAGES SETUP
// ===========================
// Flash messages are one-time messages stored in the session.
// They appear once and then disappear (e.g., "Login successful!").
app.use(flash());

// ===========================
// GLOBAL VARIABLES MIDDLEWARE
// ===========================
// This middleware runs on EVERY request.
// It makes the logged-in user and flash messages available to ALL EJS templates.
app.use(function (req, res, next) {
  // currentUser will be available in every EJS template
  // If no one is logged in, it will be null
  res.locals.currentUser = req.session.user || null;

  // Flash messages - available in every template
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");

  next();
});

// ===========================
// AUTHORIZATION MIDDLEWARE
// ===========================

// isLoggedIn - Checks if the user is logged in
// Use this to protect pages that require authentication (e.g., checkout)
function isLoggedIn(req, res, next) {
  if (req.session.user) {
    // User is logged in, continue to the next middleware/route
    return next();
  }
  // User is NOT logged in, redirect to login page
  req.flash("error", "Please login to access this page.");
  res.redirect("/login");
}

// isAdmin - Checks if the logged-in user is an admin
// Use this to protect admin-only pages
function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === "admin") {
    // User is logged in AND is an admin, continue
    return next();
  }
  // User is not an admin (or not logged in at all)
  req.flash("error", "Access Denied. Admins only.");
  res.redirect("/");
}

// ===========================
// MULTER SETUP (Image Upload)
// ===========================

// "storage" tells Multer WHERE to save files and WHAT to name them
let storage = multer.diskStorage({

  // destination: the folder where uploaded images will be saved
  destination: function (req, file, cb) {
    cb(null, "public/uploads");   // Save to public/uploads so images are accessible via URL
  },

  // filename: how to name the saved file
  // We add a timestamp to avoid name conflicts (e.g. two files named "shirt.jpg")
  filename: function (req, file, cb) {
    let uniqueName = Date.now() + path.extname(file.originalname);
    // Example result: "1715678400000.jpg"
    cb(null, uniqueName);
  }
});

// Create the multer upload instance with our storage settings
let upload = multer({ storage: storage });

// ===========================
// CONNECT TO MONGODB
// ===========================
mongoose.connect("mongodb://127.0.0.1:27017/cougar_store")
  .then(function () {
    console.log("Connected to MongoDB");
  })
  .catch(function (err) {
    console.log("MongoDB connection error:", err);
  });

// ===========================
// HOMEPAGE ROUTE
// ===========================
app.get("/", function (req, res) {
  return res.render("homepage");
});

// ============================================================
// AUTHENTICATION ROUTES (Register, Login, Logout)
// ============================================================

// ----- REGISTER PAGE (show form) -----
app.get("/register", function (req, res) {
  res.render("register");
});

// ----- REGISTER SUBMIT (create new user) -----
app.post("/register", async function (req, res) {
  try {
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;

    // VALIDATION: Check password length (minimum 6 characters)
    if (!password || password.length < 6) {
      req.flash("error", "Password must be at least 6 characters long.");
      return res.redirect("/register");
    }

    // Check if a user with this email already exists
    let existingUser = await User.findOne({ email: email });
    if (existingUser) {
      req.flash("error", "An account with this email already exists.");
      return res.redirect("/register");
    }

    // Create the new user (password is automatically hashed by the pre-save hook)
    let newUser = new User({
      name: name,
      email: email,
      password: password
      // role defaults to "customer"
    });

    await newUser.save();

    // Registration successful - redirect to login page
    req.flash("success", "Account created successfully! Please login.");
    res.redirect("/login");

  } catch (err) {
    console.log("Registration error:", err);
    req.flash("error", "Something went wrong. Please try again.");
    res.redirect("/register");
  }
});

// ----- LOGIN PAGE (show form) -----
app.get("/login", function (req, res) {
  res.render("login");
});

// ----- LOGIN SUBMIT (verify credentials) -----
app.post("/login", async function (req, res) {
  try {
    let email = req.body.email;
    let password = req.body.password;

    // Find the user by email
    let user = await User.findOne({ email: email });

    // If no user found with that email
    if (!user) {
      req.flash("error", "Invalid email or password.");
      return res.redirect("/login");
    }

    // Compare the entered password with the hashed password in the database
    let isMatch = await user.comparePassword(password);

    if (!isMatch) {
      req.flash("error", "Invalid email or password.");
      return res.redirect("/login");
    }

    // Password is correct! Save user info in the session.
    // We store only the data we need (not the full mongoose document)
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    // Welcome message
    req.flash("success", "Welcome back, " + user.name + "!");
    res.redirect("/");

  } catch (err) {
    console.log("Login error:", err);
    req.flash("error", "Something went wrong. Please try again.");
    res.redirect("/login");
  }
});

// ----- LOGOUT -----
app.get("/logout", function (req, res) {
  // Destroy the session to log the user out
  req.session.destroy(function () {
    res.redirect("/login");
  });
});

// ===========================
// PRODUCT PAGES (with pagination, search, filters)
// ===========================

// Reusable function to handle product pages with pagination, search, and filters
async function handleProductPage(req, res, sectionName, pageTitle, pageDescription, currentRoute) {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = 8;
    let search = req.query.search || "";
    let category = req.query.category || "";
    let minPrice = req.query.minPrice || "";
    let maxPrice = req.query.maxPrice || "";

    // Build filter - always filter by section
    let filter = { section: sectionName };

    // Search by name
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

    // Get categories for this section only
    let categories = await Product.distinct("category", { section: sectionName });

    // Count and paginate
    let totalProducts = await Product.countDocuments(filter);
    let totalPages = Math.ceil(totalProducts / limit);

    if (page < 1) page = 1;
    if (page > totalPages && totalPages > 0) page = totalPages;

    let skip = (page - 1) * limit;
    let products = await Product.find(filter).skip(skip).limit(limit);

    res.render("products", {
      products: products,
      currentPage: page,
      totalPages: totalPages,
      totalProducts: totalProducts,
      search: search,
      category: category,
      minPrice: minPrice,
      maxPrice: maxPrice,
      categories: categories,
      pageTitle: pageTitle,
      pageDescription: pageDescription,
      currentRoute: currentRoute
    });
  } catch (err) {
    console.log("Error:", err);
    res.status(500).send("Server Error");
  }
}

// Men's page
app.get("/men", function (req, res) {
  handleProductPage(req, res, "Men",
    "Men's Collection",
    "Discover the latest in men's fashion. From sharp formals to laid-back casuals, find your perfect look at Cougar.",
    "/men"
  );
});

// Women's page
app.get("/women", function (req, res) {
  handleProductPage(req, res, "Women",
    "Women's Collection",
    "Explore our curated selection of women's fashion — elegant dresses, chic tops, and everything in between.",
    "/women"
  );
});

// Kids' page
app.get("/kids", function (req, res) {
  handleProductPage(req, res, "Kids",
    "Kids' Collection",
    "Fun, comfortable, and stylish — our kids' collection has everything your little ones need.",
    "/kids"
  );
});

// New Arrivals page
app.get("/new-arrivals", function (req, res) {
  handleProductPage(req, res, "New Arrivals",
    "New Arrivals",
    "Be the first to wear the latest trends! Check out our freshest drops — new styles added every week.",
    "/new-arrivals"
  );
});

// Sale page
app.get("/sale", function (req, res) {
  handleProductPage(req, res, "Sale",
    "Sale",
    "Grab the hottest deals before they're gone! Enjoy up to 50% off on our entire collection.",
    "/sale"
  );
});

// ============================================================
// ADMIN PANEL ROUTES (Protected by isAdmin middleware)
// ============================================================

// ----- 1. ADMIN DASHBOARD (READ all products) -----
// GET /admin - Shows the dashboard with all products in a table
// isAdmin middleware runs FIRST - only admins can access this
app.get("/admin", isAdmin, async function (req, res) {
  try {
    // Fetch ALL products from the database
    let products = await Product.find();

    // Render the dashboard template and pass products + optional success message
    res.render("admin/dashboard", {
      products: products,
      success: req.query.success || ""   // success message comes from URL query string
    });
  } catch (err) {
    console.log("Error loading admin:", err);
    res.status(500).send("Server Error");
  }
});

// ----- 2. ADD PRODUCT FORM (CREATE - show form) -----
// GET /admin/add - Shows the empty form to add a new product
app.get("/admin/add", isAdmin, function (req, res) {
  res.render("admin/add-product", {
    error: ""   // No error initially
  });
});

// ----- 3. ADD PRODUCT SUBMIT (CREATE - save to database) -----
// POST /admin/add - Receives form data and saves a new product
// upload.single("image") tells Multer to expect ONE file from the field named "image"
app.post("/admin/add", isAdmin, upload.single("image"), async function (req, res) {
  try {
    // Get form data from req.body (text fields)
    let name = req.body.name;
    let price = req.body.price;
    let category = req.body.category;
    let section = req.body.section;
    let stock = req.body.stock;
    let rating = req.body.rating;

    // VALIDATION: Check that no fields are empty
    if (!name || !price || !category || !section || !stock || !rating) {
      return res.render("admin/add-product", {
        error: "All fields are required. Please fill in every field."
      });
    }

    // Determine the image path
    // If a file was uploaded, req.file will contain the file info
    // We save the path as "/uploads/filename.jpg" so it works as a URL
    let imagePath = "";
    if (req.file) {
      imagePath = "/uploads/" + req.file.filename;
    }

    // Create a new product object and save it to MongoDB
    let newProduct = new Product({
      name: name,
      price: price,
      category: category,
      section: section,
      stock: stock,
      rating: rating,
      image: imagePath
    });

    await newProduct.save();

    // Redirect to dashboard with a success message
    res.redirect("/admin?success=Product added successfully!");

  } catch (err) {
    console.log("Error adding product:", err);
    res.render("admin/add-product", {
      error: "Something went wrong. Please try again."
    });
  }
});

// ----- 4. EDIT PRODUCT FORM (UPDATE - show form with existing data) -----
// GET /admin/edit/:id - Loads the product by ID and shows the edit form
app.get("/admin/edit/:id", isAdmin, async function (req, res) {
  try {
    // Find the product using the ID from the URL
    let product = await Product.findById(req.params.id);

    // If product not found, redirect to dashboard
    if (!product) {
      return res.redirect("/admin?success=Product not found.");
    }

    // Render the edit form with the product data pre-filled
    res.render("admin/edit-product", {
      product: product,
      error: ""
    });
  } catch (err) {
    console.log("Error loading edit form:", err);
    res.redirect("/admin");
  }
});

// ----- 5. EDIT PRODUCT SUBMIT (UPDATE - save changes to database) -----
// POST /admin/edit/:id - Receives updated form data and saves changes
app.post("/admin/edit/:id", isAdmin, upload.single("image"), async function (req, res) {
  try {
    // Find the existing product
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.redirect("/admin?success=Product not found.");
    }

    // Get updated values from the form
    let name = req.body.name;
    let price = req.body.price;
    let category = req.body.category;
    let section = req.body.section;
    let stock = req.body.stock;
    let rating = req.body.rating;

    // VALIDATION: Check that no fields are empty
    if (!name || !price || !category || !section || !stock || !rating) {
      return res.render("admin/edit-product", {
        product: product,
        error: "All fields are required."
      });
    }

    // Update the product fields
    product.name = name;
    product.price = price;
    product.category = category;
    product.section = section;
    product.stock = stock;
    product.rating = rating;

    // If a new image was uploaded, update the image path
    // Otherwise, keep the old image (don't overwrite with empty string)
    if (req.file) {
      product.image = "/uploads/" + req.file.filename;
    }

    // Save the updated product to the database
    await product.save();

    // Redirect to dashboard with success message
    res.redirect("/admin?success=Product updated successfully!");

  } catch (err) {
    console.log("Error updating product:", err);
    res.redirect("/admin");
  }
});

// ----- 6. DELETE PRODUCT -----
// POST /admin/delete/:id - Deletes a product by ID
app.post("/admin/delete/:id", isAdmin, async function (req, res) {
  try {
    // Find and delete the product in one step
    await Product.findByIdAndDelete(req.params.id);

    // Redirect back to dashboard with success message
    res.redirect("/admin?success=Product deleted successfully!");

  } catch (err) {
    console.log("Error deleting product:", err);
    res.redirect("/admin");
  }
});

// ===========================
// API v1 ROUTES
// ===========================
// Mount all API routes under /api/v1
// These routes return JSON data for external clients (mobile apps, React, etc.)
app.use("/api/v1", apiRoutes);

// ===========================
// START SERVER
// ===========================
app.listen(3000, function () {
  console.log("Server Started at localhost:3000");
});

console.log("Console from server.js file");
