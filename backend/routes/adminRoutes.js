const express = require("express");

const {
  getAllUsers,
  deleteUser,
  getAllProducts,
  deleteProductAdmin,
  getAllOrders,
  getPlatformStats,
} = require("../controllers/adminController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

// All admin routes require login + admin role
router.use(protect, adminOnly);

router.get("/stats", getPlatformStats);

router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);

router.get("/products", getAllProducts);
router.delete("/products/:id", deleteProductAdmin);

router.get("/orders", getAllOrders);

module.exports = router;