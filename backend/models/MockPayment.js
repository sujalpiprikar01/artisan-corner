const mongoose = require("mongoose");

// Simulates what a real payment gateway's "PaymentIntent" object looks
// like. This lets the rest of the app (order creation, verification)
// work exactly like it would with a real gateway — later, this whole
// file + mockPaymentController.js can be swapped for real Stripe/Razorpay
// code without touching orderController.js's core logic.
const mockPaymentSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "succeeded", "failed"],
      default: "pending",
    },

    cardLast4: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("MockPayment", mockPaymentSchema);