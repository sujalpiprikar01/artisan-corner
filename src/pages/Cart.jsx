import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getCart,
  updateCartQuantity,
  removeFromCart,
  getCartTotal,
} from "../utils/cart";

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);

  const refreshCart = () => {
    setCart(getCart());
  };

  useEffect(() => {
    refreshCart();

    // Keep in sync if cart changes elsewhere (e.g. Add to Cart on another page)
    window.addEventListener("cart-updated", refreshCart);
    return () => window.removeEventListener("cart-updated", refreshCart);
  }, []);

  const handleQuantityChange = (productId, newQuantity, stock) => {
    const safeQuantity = Math.max(1, Math.min(newQuantity, stock || newQuantity));
    const updated = updateCartQuantity(productId, safeQuantity);
    setCart(updated);
  };

  const handleRemove = (productId) => {
    const updated = removeFromCart(productId);
    setCart(updated);
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  const total = getCartTotal();

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Your cart is empty
          </h1>

          <p className="text-gray-500 mt-3">
            Looks like you haven't added anything yet.
          </p>

          <Link
            to="/products"
            className="inline-block mt-6 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
          >
            Browse Products
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-gray-50 min-h-screen py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Shopping Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.productId}
                className="bg-white border rounded-2xl p-4 flex items-center gap-4"
              >
                <Link to={`/products/${item.productId}`}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-lg border"
                  />
                </Link>

                <div className="flex-1">
                  <Link
                    to={`/products/${item.productId}`}
                    className="font-semibold text-gray-900 hover:underline"
                  >
                    {item.name}
                  </Link>

                  {item.storeName && (
                    <p className="text-sm text-gray-500 mt-1">
                      Sold by {item.storeName}
                    </p>
                  )}

                  <p className="text-gray-900 font-medium mt-2">
                    ${item.price}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() =>
                      handleQuantityChange(
                        item.productId,
                        item.quantity - 1,
                        item.stock
                      )
                    }
                    className="px-3 py-2 hover:bg-gray-100 transition"
                  >
                    -
                  </button>

                  <span className="px-4 py-2 border-x">{item.quantity}</span>

                  <button
                    onClick={() =>
                      handleQuantityChange(
                        item.productId,
                        item.quantity + 1,
                        item.stock
                      )
                    }
                    className="px-3 py-2 hover:bg-gray-100 transition"
                  >
                    +
                  </button>
                </div>

                {/* Line Total */}
                <p className="w-20 text-right font-semibold">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>

                {/* Remove */}
                <button
                  onClick={() => handleRemove(item.productId)}
                  className="text-red-500 hover:text-red-700 transition text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-white border rounded-2xl p-6 h-fit">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

            <div className="flex justify-between text-gray-600 mb-2">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-gray-600 mb-4">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>

            <div className="flex justify-between font-bold text-lg border-t pt-4 mb-6">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition"
            >
              Proceed to Checkout
            </button>

            <Link
              to="/products"
              className="block text-center mt-4 text-sm text-gray-500 hover:text-black transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Cart;
