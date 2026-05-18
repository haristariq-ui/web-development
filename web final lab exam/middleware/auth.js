// Check if user is logged in
function isLoggedIn(req, res, next) {
  if (req.session.user) return next();
  req.flash("error", "Please login to access this page.");
  res.redirect("/login");
}

// Check if user is admin
function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === "admin") return next();
  req.flash("error", "Access Denied. Admins only.");
  res.redirect("/");
}

module.exports = {
  isLoggedIn,
  isAdmin
};
