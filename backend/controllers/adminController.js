const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

// Delete a user (cannot delete another admin, or yourself)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        message: "You cannot delete your own account",
      });
    }

    if (user.role === "admin") {
      return res.status(400).json({
        message: "Cannot delete another admin",
      });
    }

    await user.deleteOne();

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete user",
      error: error.message,
    });
  }
};

// Get all products across all vendors
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("vendor", "name email store")
      .sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

// Remove any product (e.g. policy violation)
const deleteProductAdmin = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    await product.deleteOne();

    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

// Get all orders on the platform
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("buyer", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// Platform-wide stats (users, vendors, products, revenue)
const getPlatformStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalVendors = await User.countDocuments({ role: "vendor" });
    const totalBuyers = await User.countDocuments({ role: "buyer" });
    const totalProducts = await Product.countDocuments();

    // NOTE: since Stripe/payment isn't wired up yet, revenue is
    // calculated from ALL orders, not just "Paid" ones. Once Step 8
    // is done, you may want to filter this to paymentStatus: "Paid".
    const orders = await Order.find();

    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    const totalPlatformFees = orders.reduce((sum, order) => {
      const orderFees = order.items.reduce(
        (itemSum, item) => itemSum + (item.platformFee || 0),
        0
      );
      return sum + orderFees;
    }, 0);

    res.status(200).json({
      totalUsers,
      totalVendors,
      totalBuyers,
      totalProducts,
      totalOrders: orders.length,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalPlatformFees: Number(totalPlatformFees.toFixed(2)),
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch platform stats",
      error: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  deleteUser,
  getAllProducts,
  deleteProductAdmin,
  getAllOrders,
  getPlatformStats,
};