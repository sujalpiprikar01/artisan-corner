const MockPayment = require("../models/MockPayment");
const { priceCartItems } = require("../utils/pricing");

// Step 1: "Create a payment intent" — server calculates the real total
// from the database (never trust client-sent prices) and records a
// pending payment record.
const createPaymentIntent = async (req, res) => {
  try {
    const { items } = req.body;

    const { totalAmount } = await priceCartItems(items, {
      checkStock: true,
    });

    if (totalAmount <= 0) {
      return res.status(400).json({
        message: "Order total must be greater than zero",
      });
    }

    const payment = await MockPayment.create({
      buyer: req.user.id,
      amount: totalAmount,
      status: "pending",
    });

    res.status(200).json({
      paymentIntentId: payment._id,
      amount: totalAmount,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message || "Failed to create payment intent",
    });
  }
};

// Step 2: "Confirm the payment" — simulates sending card details to a
// card network. A handful of well-known fake "test cards" let you
// demo a declined payment too.
const DECLINED_TEST_CARD = "4000000000000002";

const confirmPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { cardNumber } = req.body;

    const payment = await MockPayment.findById(id);

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    if (payment.buyer.toString() !== req.user.id) {
      return res.status(403).json({
        message: "This payment does not belong to you",
      });
    }

    if (payment.status === "succeeded") {
      return res.status(200).json({
        status: "succeeded",
        paymentIntentId: payment._id,
      });
    }

    const cleanCardNumber = (cardNumber || "").replace(/\s/g, "");

    if (cleanCardNumber === DECLINED_TEST_CARD) {
      payment.status = "failed";
      await payment.save();

      return res.status(402).json({
        status: "failed",
        message: "Your card was declined.",
      });
    }

    payment.status = "succeeded";
    payment.cardLast4 = cleanCardNumber.slice(-4) || "0000";
    await payment.save();

    res.status(200).json({
      status: "succeeded",
      paymentIntentId: payment._id,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to confirm payment",
      error: error.message,
    });
  }
};

module.exports = { createPaymentIntent, confirmPayment };