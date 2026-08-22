const express = require("express");
const upload = require("../middleware/uploadMiddleware");

const {
  getProducts,
  getMyProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const { protect } = require("../middleware/authMiddleware");
const { vendorOnly } = require("../middleware/vendorMiddleware");

const router = express.Router();

// Public routes
router.get("/", getProducts);

// IMPORTANT: this must come BEFORE /:id
router.get(
  "/my-products",
  protect,
  vendorOnly,
  getMyProducts
);

router.get("/:id", getProductById);

// Vendor routes
router.post(
  "/",
  protect,
  vendorOnly,
  upload.single("image"),
  createProduct
);

router.put("/:id", protect, vendorOnly, updateProduct);

router.delete("/:id", protect, vendorOnly, deleteProduct);

module.exports = router;