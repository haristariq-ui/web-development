// ===========================
// JWT VERIFICATION MIDDLEWARE
// ===========================
// This middleware checks if the request has a valid JWT token.
// It extracts the token from the Authorization header,
// verifies it, and attaches the decoded user data to req.user.

let jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  // Step 1: Get the Authorization header from the request
  let authHeader = req.headers["authorization"];

  // Step 2: Check if the header exists
  if (!authHeader) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  // Step 3: Extract the token from "Bearer <token>"
  // The header looks like: "Bearer eyJhbGciOiJ..."
  // We split by space and take the second part (the actual token)
  let token = authHeader.split(" ")[1];

  // If there's no token after "Bearer"
  if (!token) {
    return res.status(401).json({ message: "Access denied. Token is missing." });
  }

  // Step 4: Verify the token using the secret key
  try {
    let decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Step 5: Attach decoded user data (user_id, role) to the request object
    // Now any route handler after this middleware can access req.user
    req.user = decoded;

    // Continue to the next middleware or route handler
    next();

  } catch (err) {
    // Token is invalid or expired
    return res.status(403).json({ message: "Invalid or expired token." });
  }
}

module.exports = verifyToken;
