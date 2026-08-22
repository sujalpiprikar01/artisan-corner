const express = require("express");
const upload = require("../middleware/uploadMiddleware");

const {
  becomeVendor,
  getMyProfile,
  updateStore,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Get logged-in user's profile
router.get("/me", protect, getMyProfile);

// Become a vendor
router.put("/become-vendor", protect, becomeVendor);

// Update store (with optional logo file upload)
router.put("/store", protect, upload.single("logo"), updateStore);

module.exports = router;