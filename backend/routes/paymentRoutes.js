const express = require("express");

const {
  createPaymentIntent,
  confirmPayment,
} = require("../controllers/paymentController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Create a "payment intent" for the logged-in buyer's cart
router.post("/create-payment-intent", protect, createPaymentIntent);

// Confirm the payment (simulates sending card details to a processor)
router.post("/confirm/:id", protect, confirmPayment);

module.exports = router;