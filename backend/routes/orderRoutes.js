const express = require("express");

const {
  createOrder,
  getMyOrders,
  getOrderById,
  getVendorOrders,
  updateOrderItemStatus,
  getVendorAnalytics,
} = require("../controllers/orderController");

const { protect } = require("../middleware/authMiddleware");
const { vendorOnly } = require("../middleware/vendorMiddleware");

const router = express.Router();

// Create a new order (checkout)
router.post("/", protect, createOrder);

// Buyer: get my order history
router.get("/my-orders", protect, getMyOrders);

// Vendor: get orders containing their products
router.get("/vendor-orders", protect, vendorOnly, getVendorOrders);

// Vendor: sales analytics (must come before the /:id catch-all)
router.get("/vendor-analytics", protect, vendorOnly, getVendorAnalytics);

// Vendor: update status of a specific item in an order
router.put(
  "/:orderId/items/:itemId/status",
  protect,
  vendorOnly,
  updateOrderItemStatus
);

// Buyer: get a single order by id (keep this LAST - catch-all :id)
router.get("/:id", protect, getOrderById);

module.exports = router;