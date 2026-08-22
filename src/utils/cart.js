// Simple localStorage-backed cart helper.
// Cart shape: array of { productId, name, image, price, quantity, vendor, storeName, stock }

const CART_KEY = "cart";

export function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  // Let other components (e.g. Navbar cart count) know the cart changed
  window.dispatchEvent(new Event("cart-updated"));
}

export function addToCart(product, quantity = 1) {
  const cart = getCart();

  const existingIndex = cart.findIndex(
    (item) => item.productId === product._id
  );

  if (existingIndex !== -1) {
    const newQuantity = cart[existingIndex].quantity + quantity;
    const maxQuantity = product.stock ?? newQuantity;

    cart[existingIndex].quantity = Math.min(newQuantity, maxQuantity);
  } else {
    cart.push({
      productId: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity: Math.min(quantity, product.stock ?? quantity),
      vendor: product.vendor?._id || product.vendor,
      storeName: product.vendor?.store?.name || "",
      stock: product.stock,
    });
  }

  saveCart(cart);
  return cart;
}

export function updateCartQuantity(productId, quantity) {
  const cart = getCart();

  const updated = cart
    .map((item) =>
      item.productId === productId ? { ...item, quantity } : item
    )
    .filter((item) => item.quantity > 0);

  saveCart(updated);
  return updated;
}

export function removeFromCart(productId) {
  const cart = getCart().filter((item) => item.productId !== productId);
  saveCart(cart);
  return cart;
}

export function clearCart() {
  saveCart([]);
}

export function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartTotal() {
  return getCart().reduce((sum, item) => sum + item.price * item.quantity, 0);
}
