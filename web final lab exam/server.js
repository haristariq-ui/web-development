require("dotenv").config();

let express = require("express");
let mongoose = require("mongoose");
let session = require("express-session");
let MongoStore = require("connect-mongo").MongoStore;
let flash = require("connect-flash");
let User = require("./models/User");

let apiRoutes = require("./routes/api");
let indexRoutes = require("./routes/index");
let authRoutes = require("./routes/auth");
let cartRoutes = require("./routes/cart");
let checkoutRoutes = require("./routes/checkout");
let adminRoutes = require("./routes/admin");
let ordersRoutes = require("./routes/orders");

let app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sessions
app.use(session({
  secret: "cougar-store-secret-key",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: "mongodb://127.0.0.1:27017/cougar_store"
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24
  }
}));

app.use(flash());

// Global middleware - make user and cart data available to all templates
app.use(function (req, res, next) {
  res.locals.currentUser = req.session.user || null;

  if (req.session.cart && req.session.cart.length > 0) {
    res.locals.cartCount = req.session.cart.reduce(function (sum, item) {
      return sum + item.quantity;
    }, 0);
  } else {
    res.locals.cartCount = 0;
  }

  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/cougar_store")
  .then(async function () {
    console.log("Connected to MongoDB");
    let adminExists = await User.findOne({ email: "admin@cougar.com" });
    if (!adminExists) {
      let admin = new User({
        name: "Admin",
        email: "admin@cougar.com",
        password: "admin123",
        role: "admin"
      });
      await admin.save();
      console.log("Default admin created: admin@cougar.com / admin123");
    }
  })
  .catch(function (err) {
    console.log("MongoDB connection error:", err);
  });

// Routes
app.use("/", indexRoutes);
app.use("/", authRoutes);
app.use("/cart", cartRoutes);
app.use("/checkout", checkoutRoutes);
app.use("/admin", adminRoutes);
app.use("/my-orders", ordersRoutes);

// API routes
app.use("/api/v1", apiRoutes);

// Start server
app.listen(3000, () => console.log("Server Started at localhost:3000"));
console.log("Console from server.js file");
