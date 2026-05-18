let multer = require("multer");
let path = require("path");

// Multer image upload configuration
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    let uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

let upload = multer({ storage: storage });

module.exports = upload;
