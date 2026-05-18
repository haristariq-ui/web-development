const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  rating: { type: Number, required: true, min: 0, max: 5 },
  stock: { type: Number, required: true, default: 0 },
  image: { type: String, default: "" },
  section: { type: String, required: true },
  isOnSale: { type: Boolean, default: false }
});

module.exports = mongoose.model("Product", productSchema);
