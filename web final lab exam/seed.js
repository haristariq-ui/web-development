const mongoose = require("mongoose");
const Product = require("./models/Product");

mongoose.connect("mongodb://127.0.0.1:27017/cougar_store");

const products = [
  { name: "Slim Fit Formal Shirt", price: 3500, category: "Shirts", rating: 4.5, stock: 120, section: "Men", image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=500&fit=crop&q=80" },
  { name: "Casual Polo T-Shirt", price: 2800, category: "Shirts", rating: 4.3, stock: 95, section: "Men", image: "https://images.unsplash.com/photo-1625910513413-5fc42e9e4238?w=400&h=500&fit=crop&q=80" },
  { name: "Classic White Shirt", price: 2500, category: "Shirts", rating: 4.1, stock: 200, section: "Men", image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=500&fit=crop&q=80" },
  { name: "Printed Casual Shirt", price: 2200, category: "Shirts", rating: 3.9, stock: 80, section: "Men", image: "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=400&h=500&fit=crop&q=80" },
  { name: "Slim Fit Denim Jeans", price: 4500, category: "Jeans", rating: 4.6, stock: 150, section: "Men", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop&q=80" },
  { name: "Straight Fit Chinos", price: 3800, category: "Jeans", rating: 4.2, stock: 110, section: "Men", image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=500&fit=crop&q=80" },
  { name: "Black Ripped Jeans", price: 4200, category: "Jeans", rating: 4.4, stock: 65, section: "Men", image: "https://images.unsplash.com/photo-1555689502-c4b22d76571b?w=400&h=500&fit=crop&q=80" },
  { name: "Premium Denim Jacket", price: 5200, category: "Jackets", rating: 4.7, stock: 40, section: "Men", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop&q=80" },
  { name: "Leather Biker Jacket", price: 8500, category: "Jackets", rating: 4.8, stock: 25, section: "Men", image: "https://images.unsplash.com/photo-1520975954732-35dd22299614?w=400&h=500&fit=crop&q=80" },
  { name: "Bomber Jacket", price: 6000, category: "Jackets", rating: 4.5, stock: 55, section: "Men", image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=500&fit=crop&q=80" },
  { name: "Running Sneakers", price: 5500, category: "Shoes", rating: 4.4, stock: 90, section: "Men", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop&q=80" },
  { name: "Formal Oxford Shoes", price: 7000, category: "Shoes", rating: 4.6, stock: 35, section: "Men", image: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=400&h=500&fit=crop&q=80" },
  { name: "Casual Loafers", price: 4800, category: "Shoes", rating: 4.2, stock: 70, section: "Men", image: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=400&h=500&fit=crop&q=80" },
  { name: "Hooded Sweatshirt", price: 3200, category: "Shirts", rating: 4.3, stock: 100, section: "Men", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=500&fit=crop&q=80" },
  { name: "Cotton Crew Neck Tee", price: 1500, category: "Shirts", rating: 4.0, stock: 300, section: "Men", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop&q=80" },
  { name: "Aviator Sunglasses", price: 2000, category: "Accessories", rating: 4.1, stock: 180, section: "Men", image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=500&fit=crop&q=80" },

  { name: "Elegant Summer Dress", price: 3500, category: "Dresses", rating: 4.6, stock: 80, section: "Women", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop&q=80" },
  { name: "Floral Maxi Dress", price: 4200, category: "Dresses", rating: 4.5, stock: 60, section: "Women", image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=500&fit=crop&q=80" },
  { name: "Cocktail Party Dress", price: 6500, category: "Dresses", rating: 4.8, stock: 30, section: "Women", image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=500&fit=crop&q=80" },
  { name: "Casual Blouse Top", price: 2200, category: "Tops", rating: 4.2, stock: 150, section: "Women", image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400&h=500&fit=crop&q=80" },
  { name: "Silk Camisole Top", price: 2800, category: "Tops", rating: 4.4, stock: 90, section: "Women", image: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=400&h=500&fit=crop&q=80" },
  { name: "Off-Shoulder Blouse", price: 2500, category: "Tops", rating: 4.1, stock: 110, section: "Women", image: "https://images.unsplash.com/photo-1518622358385-8ea7d0794bf6?w=400&h=500&fit=crop&q=80" },
  { name: "High Waist Skinny Jeans", price: 4000, category: "Jeans", rating: 4.5, stock: 130, section: "Women", image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=500&fit=crop&q=80" },
  { name: "Wide Leg Palazzo Pants", price: 3500, category: "Jeans", rating: 4.3, stock: 75, section: "Women", image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop&q=80" },
  { name: "Tailored Blazer Jacket", price: 6000, category: "Jackets", rating: 4.7, stock: 45, section: "Women", image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&h=500&fit=crop&q=80" },
  { name: "Cropped Denim Jacket", price: 4500, category: "Jackets", rating: 4.4, stock: 55, section: "Women", image: "https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=400&h=500&fit=crop&q=80" },
  { name: "Stiletto Heels", price: 5500, category: "Shoes", rating: 4.3, stock: 40, section: "Women", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=500&fit=crop&q=80" },
  { name: "White Sneakers", price: 3800, category: "Shoes", rating: 4.5, stock: 100, section: "Women", image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=500&fit=crop&q=80" },
  { name: "Leather Handbag", price: 7500, category: "Accessories", rating: 4.6, stock: 35, section: "Women", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=500&fit=crop&q=80" },
  { name: "Statement Necklace", price: 1800, category: "Accessories", rating: 4.0, stock: 200, section: "Women", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=500&fit=crop&q=80" },
  { name: "Pleated Midi Skirt", price: 3000, category: "Dresses", rating: 4.3, stock: 85, section: "Women", image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400&h=500&fit=crop&q=80" },
  { name: "Knit Cardigan Sweater", price: 3200, category: "Tops", rating: 4.2, stock: 70, section: "Women", image: "https://images.unsplash.com/photo-1434389677669-e08b4cda3a24?w=400&h=500&fit=crop&q=80" },

  { name: "Colorful T-Shirt Set", price: 1500, category: "T-Shirts", rating: 4.3, stock: 200, section: "Kids", image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400&h=500&fit=crop&q=80" },
  { name: "Cartoon Print Tee", price: 1200, category: "T-Shirts", rating: 4.1, stock: 250, section: "Kids", image: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=400&h=500&fit=crop&q=80" },
  { name: "Striped Polo Shirt", price: 1800, category: "T-Shirts", rating: 4.2, stock: 150, section: "Kids", image: "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=400&h=500&fit=crop&q=80" },
  { name: "Kids Denim Jeans", price: 2500, category: "Jeans", rating: 4.4, stock: 130, section: "Kids", image: "https://images.unsplash.com/photo-1543854589-fdd4d3a0d181?w=400&h=500&fit=crop&q=80" },
  { name: "Cargo Shorts", price: 1800, category: "Shorts", rating: 4.0, stock: 180, section: "Kids", image: "https://images.unsplash.com/photo-1560506840-ec148e82a604?w=400&h=500&fit=crop&q=80" },
  { name: "Cotton Jogger Pants", price: 2000, category: "Jeans", rating: 4.3, stock: 160, section: "Kids", image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=400&h=500&fit=crop&q=80" },
  { name: "Denim Dungaree Set", price: 2200, category: "Dresses", rating: 4.5, stock: 90, section: "Kids", image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400&h=500&fit=crop&q=80" },
  { name: "Kids Party Outfit", price: 2800, category: "Dresses", rating: 4.6, stock: 50, section: "Kids", image: "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?w=400&h=500&fit=crop&q=80" },
  { name: "Rain Jacket", price: 2500, category: "Jackets", rating: 4.2, stock: 70, section: "Kids", image: "https://images.unsplash.com/photo-1445796886651-d31a2c15f3c9?w=400&h=500&fit=crop&q=80" },
  { name: "Puffer Winter Jacket", price: 3500, category: "Jackets", rating: 4.7, stock: 45, section: "Kids", image: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=400&h=500&fit=crop&q=80" },
  { name: "Velcro Sneakers", price: 2200, category: "Shoes", rating: 4.4, stock: 120, section: "Kids", image: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=400&h=500&fit=crop&q=80" },
  { name: "Canvas School Shoes", price: 1800, category: "Shoes", rating: 4.1, stock: 140, section: "Kids", image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&h=500&fit=crop&q=80" },
  { name: "Printed Pajama Set", price: 1500, category: "T-Shirts", rating: 4.3, stock: 170, section: "Kids", image: "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=400&h=500&fit=crop&q=80" },
  { name: "Hooded Sweatshirt Kids", price: 2000, category: "T-Shirts", rating: 4.2, stock: 110, section: "Kids", image: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=400&h=500&fit=crop&q=80" },
  { name: "Kids Backpack", price: 1600, category: "Accessories", rating: 4.0, stock: 95, section: "Kids", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop&q=80" },
  { name: "Sunglasses for Kids", price: 800, category: "Accessories", rating: 3.8, stock: 200, section: "Kids", image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&h=500&fit=crop&q=80" },

  { name: "Oversized Graphic Tee", price: 2000, category: "Shirts", rating: 4.4, stock: 100, section: "New Arrivals", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop&q=80" },
  { name: "Premium Linen Shirt", price: 4200, category: "Shirts", rating: 4.6, stock: 60, section: "New Arrivals", image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=500&fit=crop&q=80" },
  { name: "Streetwear Bomber Jacket", price: 7500, category: "Jackets", rating: 4.7, stock: 30, section: "New Arrivals", image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=500&fit=crop&q=80" },
  { name: "Distressed Boyfriend Jeans", price: 4800, category: "Jeans", rating: 4.5, stock: 75, section: "New Arrivals", image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=500&fit=crop&q=80" },
  { name: "Tie-Dye Hoodie", price: 3500, category: "Shirts", rating: 4.3, stock: 85, section: "New Arrivals", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=500&fit=crop&q=80" },
  { name: "Platform Chunky Sneakers", price: 6500, category: "Shoes", rating: 4.5, stock: 50, section: "New Arrivals", image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=500&fit=crop&q=80" },
  { name: "Satin Wrap Dress", price: 5500, category: "Dresses", rating: 4.7, stock: 40, section: "New Arrivals", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop&q=80" },
  { name: "Corduroy Wide-Leg Pants", price: 3800, category: "Jeans", rating: 4.2, stock: 90, section: "New Arrivals", image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop&q=80" },
  { name: "Mesh Panel Sports Jacket", price: 4500, category: "Jackets", rating: 4.4, stock: 65, section: "New Arrivals", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop&q=80" },
  { name: "Ribbed Crop Top", price: 1800, category: "Tops", rating: 4.1, stock: 130, section: "New Arrivals", image: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=400&h=500&fit=crop&q=80" },
  { name: "Mini Crossbody Bag", price: 3200, category: "Accessories", rating: 4.3, stock: 80, section: "New Arrivals", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=500&fit=crop&q=80" },
  { name: "Retro Round Sunglasses", price: 1500, category: "Accessories", rating: 4.0, stock: 150, section: "New Arrivals", image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=500&fit=crop&q=80" },
  { name: "Flared Midi Skirt", price: 2800, category: "Dresses", rating: 4.4, stock: 70, section: "New Arrivals", image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400&h=500&fit=crop&q=80" },
  { name: "Knit Turtleneck Sweater", price: 3500, category: "Shirts", rating: 4.5, stock: 55, section: "New Arrivals", image: "https://images.unsplash.com/photo-1434389677669-e08b4cda3a24?w=400&h=500&fit=crop&q=80" },
  { name: "Canvas High-Top Sneakers", price: 4000, category: "Shoes", rating: 4.3, stock: 95, section: "New Arrivals", image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&h=500&fit=crop&q=80" },
  { name: "Printed Silk Scarf", price: 1200, category: "Accessories", rating: 4.1, stock: 120, section: "New Arrivals", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=500&fit=crop&q=80" },

  { name: "Classic Cotton T-Shirt", price: 1250, category: "Shirts", rating: 4.2, stock: 300, section: "Sale", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop&q=80" },
  { name: "Summer Floral Dress", price: 2100, category: "Dresses", rating: 4.5, stock: 70, section: "Sale", image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=500&fit=crop&q=80" },
  { name: "Kids Casual Set", price: 999, category: "T-Shirts", rating: 4.0, stock: 150, section: "Sale", image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=400&h=500&fit=crop&q=80" },
  { name: "Faded Wash Jeans", price: 2500, category: "Jeans", rating: 4.3, stock: 120, section: "Sale", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop&q=80" },
  { name: "Zip-Up Hoodie", price: 1800, category: "Shirts", rating: 4.1, stock: 200, section: "Sale", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=500&fit=crop&q=80" },
  { name: "Leather Belt", price: 900, category: "Accessories", rating: 4.0, stock: 250, section: "Sale", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop&q=80" },
  { name: "Sports Running Shoes", price: 3200, category: "Shoes", rating: 4.4, stock: 80, section: "Sale", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop&q=80" },
  { name: "Printed Wrap Skirt", price: 1800, category: "Dresses", rating: 4.2, stock: 90, section: "Sale", image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400&h=500&fit=crop&q=80" },
  { name: "Wool Beanie Cap", price: 600, category: "Accessories", rating: 3.9, stock: 300, section: "Sale", image: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=400&h=500&fit=crop&q=80" },
  { name: "Windbreaker Jacket", price: 2800, category: "Jackets", rating: 4.3, stock: 60, section: "Sale", image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=500&fit=crop&q=80" },
  { name: "Casual Canvas Shoes", price: 2000, category: "Shoes", rating: 4.1, stock: 140, section: "Sale", image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&h=500&fit=crop&q=80" },
  { name: "Ribbed Tank Top", price: 800, category: "Tops", rating: 4.0, stock: 220, section: "Sale", image: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=400&h=500&fit=crop&q=80" },
  { name: "Chino Shorts", price: 1500, category: "Shorts", rating: 4.2, stock: 160, section: "Sale", image: "https://images.unsplash.com/photo-1560506840-ec148e82a604?w=400&h=500&fit=crop&q=80" },
  { name: "Fitted Blazer", price: 3500, category: "Jackets", rating: 4.5, stock: 40, section: "Sale", image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&h=500&fit=crop&q=80" },
  { name: "Striped Maxi Dress", price: 2200, category: "Dresses", rating: 4.4, stock: 65, section: "Sale", image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=500&fit=crop&q=80" },
  { name: "Tote Bag", price: 1200, category: "Accessories", rating: 4.1, stock: 180, section: "Sale", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=500&fit=crop&q=80" }
];

const seededProducts = products.map(function (product) {
  return {
    ...product,
    isOnSale: product.section === "Sale"
  };
});

async function seedDB() {
  try {
    await Product.deleteMany({});
    console.log("Cleared existing products.");

    await Product.insertMany(seededProducts);
    console.log("Successfully seeded " + seededProducts.length + " products!");
    console.log("Men: 16, Women: 16, Kids: 16, New Arrivals: 16, Sale: 16");

    mongoose.connection.close();
  } catch (err) {
    console.log("Error seeding database:", err);
    mongoose.connection.close();
  }
}

seedDB();
