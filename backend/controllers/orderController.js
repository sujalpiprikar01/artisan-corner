const Order = require("../models/Order");
const Product = require("../models/Product");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const { priceCartItems } = require("../utils/pricing");

// Create a new order (checkout) — only after a successful mock payment
const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentIntentId } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({
        message: "Shipping address is required",
      });
    }

    const requiredFields = [
      "fullName",
      "addressLine",
      "city",
      "state",
      "postalCode",
      "country",
      "phone",
    ];

    for (const field of requiredFields) {
      if (
        !shippingAddress[field] ||
        !shippingAddress[field].toString().trim()
      ) {
        return res.status(400).json({
          message: `Shipping ${field} is required`,
        });
      }
    }

    if (!paymentIntentId) {
      return res.status(400).json({
        message:
          "Missing paymentIntentId. Payment must be completed before placing the order.",
      });
    }

    // Confirm the payment actually succeeded (never trust the client's
    // word for it)
    const payment = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (!payment || payment.status !== "succeeded") {
      return res.status(402).json({
        message: "Payment has not been completed successfully",
      });
    }


    // Prevent the same successful payment from being used to create
    // more than one order (e.g. accidental double submit / page refresh)
    const existingOrder = await Order.findOne({ paymentIntentId });
    if (existingOrder) {
      return res.status(200).json(existingOrder);
    }

    // Re-validate items/prices against the database and check stock
    const { orderItems, totalAmount } = await priceCartItems(items, {
      checkStock: true,
    });

    // Sanity check: the amount actually "charged" should match what we
    // calculate now
    if (Math.abs(payment.amount / 100 - totalAmount) > 0.01) {
      return res.status(400).json({
        message: "Payment amount does not match cart total",
      });
    }

    // Reduce stock now that payment is confirmed
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    const order = await Order.create({
      buyer: req.user.id,
      items: orderItems,
      shippingAddress,
      totalAmount,
      paymentStatus: "Paid",
      paymentIntentId,
    });

    res.status(201).json(order);
  } catch (error) {
    console.error("createOrder error:", error);
    res.status(error.statusCode || 500).json({
      message: error.statusCode ? error.message : "Failed to place order",
      error: error.statusCode ? undefined : error.message,
    });
  }
};

// Buyer: get logged-in user's own order history
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// Buyer: get a single order by id (must belong to the logged-in user)
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.buyer.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not authorized to view this order",
      });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch order",
      error: error.message,
    });
  }
};

// Get orders that contain at least one item belonging to the logged-in vendor
const getVendorOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      "items.vendor": req.user.id,
    })
      .populate("buyer", "name email")
      .sort({ createdAt: -1 });

    // Only send back the items that belong to this vendor,
    // along with a subtotal for those items
    const vendorOrders = orders.map((order) => {
      const myItems = order.items.filter(
        (item) => item.vendor.toString() === req.user.id,
      );

      const mySubtotal = myItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      return {
        _id: order._id,
        buyer: order.buyer,
        shippingAddress: order.shippingAddress,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        items: myItems,
        mySubtotal,
      };
    });

    res.status(200).json(vendorOrders);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// Update the status of a single item within an order (vendor can only
// update items that belong to them)
const updateOrderItemStatus = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { status } = req.body;

    const validStatuses = ["Processing", "Shipped", "Delivered", "Cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const item = order.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        message: "Order item not found",
      });
    }

    if (item.vendor.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can only update your own order items",
      });
    }

    item.status = status;

    await order.save();

    res.status(200).json({
      message: "Order item status updated",
      item,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update order item status",
      error: error.message,
    });
  }
};

// Vendor: sales analytics (total earnings, daily sales history, top products)
const getVendorAnalytics = async (req, res) => {
  try {
    const vendorId = req.user.id;

    // Only look at items from Paid orders — unpaid/pending orders
    // shouldn't count as real sales yet
    const orders = await Order.find({
      "items.vendor": vendorId,
      paymentStatus: "Paid",
    }).sort({ createdAt: 1 });

    let totalEarnings = 0;
    let totalRevenue = 0;
    let totalOrders = 0;
    let totalUnitsSold = 0;

    const salesByDate = {}; // "YYYY-MM-DD" -> { earnings, units }
    const salesByProduct = {}; // productId -> { name, units, earnings }

    for (const order of orders) {
      const myItems = order.items.filter(
        (item) => item.vendor.toString() === vendorId,
      );

      if (myItems.length === 0) continue;

      totalOrders += 1;

      const dateKey = order.createdAt.toISOString().slice(0, 10);

      if (!salesByDate[dateKey]) {
        salesByDate[dateKey] = { date: dateKey, earnings: 0, units: 0 };
      }

      for (const item of myItems) {
        totalEarnings += item.vendorPayout;
        totalRevenue += item.price * item.quantity;
        totalUnitsSold += item.quantity;

        salesByDate[dateKey].earnings += item.vendorPayout;
        salesByDate[dateKey].units += item.quantity;

        const productId = item.product.toString();

        if (!salesByProduct[productId]) {
          salesByProduct[productId] = {
            productId,
            name: item.name,
            units: 0,
            earnings: 0,
          };
        }

        salesByProduct[productId].units += item.quantity;
        salesByProduct[productId].earnings += item.vendorPayout;
      }
    }

    const salesHistory = Object.values(salesByDate)
      .map((day) => ({
        date: day.date,
        earnings: Number(day.earnings.toFixed(2)),
        units: day.units,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const topProducts = Object.values(salesByProduct)
      .map((p) => ({ ...p, earnings: Number(p.earnings.toFixed(2)) }))
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 5);

    res.status(200).json({
      totalEarnings: Number(totalEarnings.toFixed(2)),
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalOrders,
      totalUnitsSold,
      salesHistory,
      topProducts,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch analytics",
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getVendorOrders,
  updateOrderItemStatus,
  getVendorAnalytics,
};
