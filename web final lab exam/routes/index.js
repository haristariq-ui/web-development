let express = require("express");
let router = express.Router();
let Product = require("../models/Product");

// Homepage
router.get("/", function (req, res) {
  return res.render("homepage");
});

// Product detail page
router.get("/product/:id", async function (req, res) {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      req.flash("error", "Product not found.");
      return res.redirect("/");
    }

    res.render("product-detail", {
      product: product
    });
  } catch (err) {
    console.log("Error loading product:", err);
    req.flash("error", "Something went wrong.");
    res.redirect("/");
  }
});

// PRODUCT PAGES - reusable handler for product sections
async function handleProductPage(req, res, sectionName, pageTitle, pageDescription, currentRoute) {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = 8;
    let { search, category, minPrice, maxPrice } = req.query;
    search = search || "";
    category = category || "";
    minPrice = minPrice || "";
    maxPrice = maxPrice || "";

    let filter = { section: sectionName };
    if (search) filter.name = { $regex: search, $options: "i" };
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    let categories = await Product.distinct("category", { section: sectionName });
    let totalProducts = await Product.countDocuments(filter);
    let totalPages = Math.ceil(totalProducts / limit);
    if (page < 1) page = 1;
    if (page > totalPages && totalPages > 0) page = totalPages;
    let skip = (page - 1) * limit;
    let products = await Product.find(filter).skip(skip).limit(limit);

    res.render("products", {
      products, currentPage: page, totalPages, totalProducts, search, category, minPrice, maxPrice, categories, pageTitle, pageDescription, currentRoute
    });
  } catch (err) {
    console.log("Error:", err);
    res.status(500).send("Server Error");
  }
}

router.get("/men", (req, res) => handleProductPage(req, res, "Men", "Men's Collection", "Discover the latest in men's fashion. From sharp formals to laid-back casuals, find your perfect look at Cougar.", "/men"));
router.get("/women", (req, res) => handleProductPage(req, res, "Women", "Women's Collection", "Explore our curated selection of women's fashion — elegant dresses, chic tops, and everything in between.", "/women"));
router.get("/kids", (req, res) => handleProductPage(req, res, "Kids", "Kids' Collection", "Fun, comfortable, and stylish — our kids' collection has everything your little ones need.", "/kids"));
router.get("/new-arrivals", (req, res) => handleProductPage(req, res, "New Arrivals", "New Arrivals", "Be the first to wear the latest trends! Check out our freshest drops — new styles added every week.", "/new-arrivals"));
router.get("/sale", (req, res) => handleProductPage(req, res, "Sale", "Sale", "Grab the hottest deals before they're gone! Enjoy up to 50% off on our entire collection.", "/sale"));

// On-sale products page
router.get("/onsale-products", async function (req, res) {
  try {
    let products = await Product.find({ isOnSale: true });
    res.render("onsale", {
      products: products,
      pageTitle: "On-Sale Products",
      pageDescription: "Shop the latest on-sale picks across the store. Updated deals, all in one place.",
      currentRoute: "/onsale-products"
    });
  } catch (err) {
    console.log("Error loading on-sale products:", err);
    req.flash("error", "Something went wrong.");
    res.redirect("/");
  }
});

module.exports = router;
