// ===========================
// USER MODEL
// ===========================
// This model stores user accounts (customers and admins).
// Passwords are hashed using bcryptjs before saving.

let mongoose = require("mongoose");
let bcrypt = require("bcryptjs");

// Define the User schema
let userSchema = new mongoose.Schema({
  // User's full name
  name: {
    type: String,
    required: true
  },

  // User's email (must be unique - no duplicate accounts)
  email: {
    type: String,
    required: true,
    unique: true
  },

  // Hashed password (never stored as plain text)
  password: {
    type: String,
    required: true
  },

  // Role: either "customer" or "admin"
  // Defaults to "customer" when a new user registers
  role: {
    type: String,
    default: "customer"
  }
});

// ===========================
// PASSWORD HASHING (pre-save hook)
// ===========================
// This runs BEFORE saving a user to the database.
// It hashes the password so we never store the plain-text version.
userSchema.pre("save", async function () {

  // Only hash if the password field was changed (or is new)
  // This prevents re-hashing an already hashed password on updates
  if (!this.isModified("password")) {
    return;
  }

  // Generate a salt (random data added to password before hashing)
  // The number 10 is the "salt rounds" - higher = more secure but slower
  let salt = await bcrypt.genSalt(10);

  // Hash the password with the salt
  this.password = await bcrypt.hash(this.password, salt);
});

// ===========================
// PASSWORD COMPARISON METHOD
// ===========================
// This method compares a plain-text password with the stored hash.
// Used during login to verify the user's password.
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Export the model so we can use it in server.js
module.exports = mongoose.model("User", userSchema);
