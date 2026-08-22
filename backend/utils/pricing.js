const Product = require("../models/Product");

const PLATFORM_FEE_PERCENT = 5;

/**
 * Re-validates cart items against the database (never trust client-sent
 * prices) and builds the priced order items + total.
 *
 * @param {Array<{productId: string, quantity: number}>} items
 * @param {{ checkStock?: boolean }} options - pass checkStock: true only
 *   when you are about to actually place the order (not when just
 *   creating a payment intent), so a slow checkout doesn't get blocked
 *   by a race that will be re-checked at order time anyway.
 * @returns {Promise<{ orderItems: Array, totalAmount: number }>}
 */
async function priceCartItems(items, { checkStock = false } = {}) {
  if (!items || items.length === 0) {
    const error = new Error("Cart is empty");
    error.statusCode = 400;
    throw error;
  }

  const orderItems = [];
  let totalAmount = 0;

  for (const cartItem of items) {
    const product = await Product.findById(cartItem.productId);

    if (!product) {
      const error = new Error(`Product not found: ${cartItem.productId}`);
      error.statusCode = 404;
      throw error;
    }

    if (checkStock && product.stock < cartItem.quantity) {
      const error = new Error(
        `Not enough stock for ${product.name}. Only ${product.stock} left.`
      );
      error.statusCode = 400;
      throw error;
    }

    const itemTotal = product.price * cartItem.quantity;
    const platformFee = Number(
      ((itemTotal * PLATFORM_FEE_PERCENT) / 100).toFixed(2)
    );
    const vendorPayout = Number((itemTotal - platformFee).toFixed(2));

    orderItems.push({
      product: product._id,
      vendor: product.vendor,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity: cartItem.quantity,
      platformFee,
      vendorPayout,
    });

    totalAmount += itemTotal;
  }

  totalAmount = Number(totalAmount.toFixed(2));

  return { orderItems, totalAmount };
}

module.exports = { priceCartItems, PLATFORM_FEE_PERCENT };