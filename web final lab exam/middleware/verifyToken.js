// JWT verification middleware
let jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  let authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  let token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Access denied. Token is missing." });
  }

  try {
    let decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token." });
  }
}

module.exports = verifyToken;
