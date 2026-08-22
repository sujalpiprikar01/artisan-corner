const express = require("express");

const {
  getProductReviews,
  createReview,
  deleteReview,
} = require("../controllers/reviewController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Public: get all reviews for a product
router.get("/product/:productId", getProductReviews);

// Protected: leave a review on a product
router.post("/product/:productId", protect, createReview);

// Protected: delete your own review
router.delete("/:id", protect, deleteReview);

module.exports = router;