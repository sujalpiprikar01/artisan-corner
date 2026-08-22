const Review = require("../models/Review");
const Order = require("../models/Order");
const Product = require("../models/Product");

// Recalculate and save a product's average rating + review count
const recalculateProductRating = async (productId) => {
  const reviews = await Review.find({ product: productId });

  const numReviews = reviews.length;
  const rating =
    numReviews === 0
      ? 0
      : Number(
          (
            reviews.reduce((sum, r) => sum + r.rating, 0) / numReviews
          ).toFixed(1)
        );

  await Product.findByIdAndUpdate(productId, { rating, numReviews });
};

// Get all reviews for a product (public)
const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      product: req.params.productId,
    })
      .populate("buyer", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch reviews",
      error: error.message,
    });
  }
};

// Create a review — only a buyer who has a Paid order containing this
// product may leave one, and only one review per product per buyer.
const createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Find a Paid order by this buyer that contains this product
    const qualifyingOrder = await Order.findOne({
      buyer: req.user.id,
      paymentStatus: "Paid",
      "items.product": productId,
    });

    if (!qualifyingOrder) {
      return res.status(403).json({
        message:
          "You can only review products you have purchased and paid for",
      });
    }

    const existingReview = await Review.findOne({
      product: productId,
      buyer: req.user.id,
    });

    if (existingReview) {
      return res.status(400).json({
        message: "You have already reviewed this product",
      });
    }

    const review = await Review.create({
      product: productId,
      buyer: req.user.id,
      order: qualifyingOrder._id,
      rating,
      comment: comment || "",
    });

    await recalculateProductRating(productId);

    const populatedReview = await review.populate("buyer", "name");

    res.status(201).json(populatedReview);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "You have already reviewed this product",
      });
    }

    res.status(500).json({
      message: "Failed to create review",
      error: error.message,
    });
  }
};

// Delete a review — only the review's author can delete it
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    if (review.buyer.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can only delete your own review",
      });
    }

    const productId = review.product;

    await review.deleteOne();
    await recalculateProductRating(productId);

    res.status(200).json({
      message: "Review deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete review",
      error: error.message,
    });
  }
};

module.exports = {
  getProductReviews,
  createReview,
  deleteReview,
};