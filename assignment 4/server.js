// ===========================
// IMPORT MODULES
// ===========================
let express = require("express");
let mongoose = require("mongoose");
let Product = require("./models/Product");
let multer = require("multer");    // Multer is used for handling file uploads
let path = require("path");        // Path module helps work with file paths

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
// ADMIN PANEL ROUTES
// ============================================================

// ----- 1. ADMIN DASHBOARD (READ all products) -----
// GET /admin - Shows the dashboard with all products in a table
app.get("/admin", async function (req, res) {
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
app.get("/admin/add", function (req, res) {
  res.render("admin/add-product", {
    error: ""   // No error initially
  });
});

// ----- 3. ADD PRODUCT SUBMIT (CREATE - save to database) -----
// POST /admin/add - Receives form data and saves a new product
// upload.single("image") tells Multer to expect ONE file from the field named "image"
app.post("/admin/add", upload.single("image"), async function (req, res) {
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
app.get("/admin/edit/:id", async function (req, res) {
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
app.post("/admin/edit/:id", upload.single("image"), async function (req, res) {
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
app.post("/admin/delete/:id", async function (req, res) {
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
// START SERVER
// ===========================
app.listen(3000, function () {
  console.log("Server Started at localhost:3000");
});

console.log("Console from server.js file");
