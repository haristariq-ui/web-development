// Import modules
let express = require("express");
let mongoose = require("mongoose");
let Product = require("./models/Product");

// Initialize express app
let app = express();

// Set EJS as the view engine
app.set("view engine", "ejs");

// Serve static files
app.use(express.static("public"));

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/cougar_store")
  .then(function () {
    console.log("Connected to MongoDB");
  })
  .catch(function (err) {
    console.log("MongoDB connection error:", err);
  });

// Homepage route
app.get("/", function (req, res) {
  return res.render("homepage");
});

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

// Start server
app.listen(3000, function () {
  console.log("Server Started at localhost:3000");
});

console.log("Console from server.js file");
