let express = require("express");
let router = express.Router();
let User = require("../models/User");

// Register page
router.get("/register", function (req, res) {
  res.render("register");
});

// Register submit
router.post("/register", async function (req, res) {
  try {
    let { name, email, password } = req.body;
    if (!password || password.length < 6) {
      req.flash("error", "Password must be at least 6 characters long.");
      return res.redirect("/register");
    }
    let existingUser = await User.findOne({ email: email });
    if (existingUser) {
      req.flash("error", "An account with this email already exists.");
      return res.redirect("/register");
    }
    let newUser = new User({ name: name, email: email, password: password });
    await newUser.save();
    req.flash("success", "Account created successfully! Please login.");
    res.redirect("/login");

  } catch (err) {
    console.log("Registration error:", err);
    req.flash("error", "Something went wrong. Please try again.");
    res.redirect("/register");
  }
});

// Login page
router.get("/login", function (req, res) {
  res.render("login");
});

// Login submit
router.post("/login", async function (req, res) {
  try {
    let { email, password } = req.body;
    let user = await User.findOne({ email: email });
    if (!user) {
      req.flash("error", "Invalid email or password.");
      return res.redirect("/login");
    }
    let isMatch = await user.comparePassword(password);
    if (!isMatch) {
      req.flash("error", "Invalid email or password.");
      return res.redirect("/login");
    }
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    req.flash("success", "Welcome back, " + user.name + "!");
    res.redirect("/");
  } catch (err) {
    console.log("Login error:", err);
    req.flash("error", "Something went wrong. Please try again.");
    res.redirect("/login");
  }
});

// Logout
router.get("/logout", function (req, res) {
  req.session.destroy(function () {
    res.redirect("/login");
  });
});

module.exports = router;
