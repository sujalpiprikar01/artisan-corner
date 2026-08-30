import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { getCart, getCartTotal, clearCart } from "../utils/cart";
import { API_BASE_URL } from "../utils/api";
import { formatPrice } from "../utils/format";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const REQUIRED_SHIPPING_FIELDS = [
  "fullName", "addressLine", "city", "state", "postalCode", "country", "phone",
];

// Inner form — sirf tab render hoga jab clientSecret ready ho
function CheckoutForm({ paymentIntentId }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const cart = getCart();
  const total = getCartTotal();

  const [shipping, setShipping] = useState({
    fullName: "", addressLine: "", city: "", state: "",
    postalCode: "", country: "", phone: "",
  });
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);

  const handleShippingChange = (e) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError("");

    for (const field of REQUIRED_SHIPPING_FIELDS) {
      if (!shipping[field]?.trim()) {
        setError("Please fill in all shipping fields.");
        return;
      }
    }

    if (!stripe || !elements) return;

    setPlacing(true);

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: window.location.origin },
        redirect: "if_required",
      });

      if (stripeError) throw new Error(stripeError.message);
      if (!paymentIntent || paymentIntent.status !== "succeeded") {
        throw new Error("Payment was not successful.");
      }

      const token = localStorage.getItem("token");
      const orderRes = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          shippingAddress: shipping,
          paymentIntentId: paymentIntent.id,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.message || "Failed to place order");

      clearCart();
      navigate(`/order-success/${orderData._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <main className="bg-gray-50 min-h-screen py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white border rounded-2xl p-6">
            {error && (
              <div className="mb-5 p-3 rounded-lg bg-red-100 text-red-700 text-center text-sm">{error}</div>
            )}
            <form onSubmit={handlePlaceOrder} className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-5">Shipping Address</h2>
                <div className="space-y-4">
                  <input type="text" name="fullName" value={shipping.fullName} onChange={handleShippingChange} placeholder="Full Name" className="w-full border rounded-lg px-4 py-3 outline-none focus:border-black" />
                  <input type="text" name="addressLine" value={shipping.addressLine} onChange={handleShippingChange} placeholder="Address Line" className="w-full border rounded-lg px-4 py-3 outline-none focus:border-black" />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" name="city" value={shipping.city} onChange={handleShippingChange} placeholder="City" className="w-full border rounded-lg px-4 py-3 outline-none focus:border-black" />
                    <input type="text" name="state" value={shipping.state} onChange={handleShippingChange} placeholder="State" className="w-full border rounded-lg px-4 py-3 outline-none focus:border-black" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" name="postalCode" value={shipping.postalCode} onChange={handleShippingChange} placeholder="Postal Code" className="w-full border rounded-lg px-4 py-3 outline-none focus:border-black" />
                    <input type="text" name="country" value={shipping.country} onChange={handleShippingChange} placeholder="Country" className="w-full border rounded-lg px-4 py-3 outline-none focus:border-black" />
                  </div>
                  <input type="text" name="phone" value={shipping.phone} onChange={handleShippingChange} placeholder="Phone Number" className="w-full border rounded-lg px-4 py-3 outline-none focus:border-black" />
                </div>
              </div>
              <hr />
              <div>
                <h2 className="text-xl font-semibold mb-5">Payment</h2>
                <PaymentElement />
                <p className="text-xs text-gray-400 mt-3">
                  Test card: <span className="font-mono">4242 4242 4242 4242</span> | Any future date | Any 3-digit CVV
                </p>
              </div>
              <button
                type="submit"
                disabled={placing || !stripe || !elements}
                className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
              >
                {placing ? "Processing..." : `Pay ${formatPrice(total)}`}
              </button>
            </form>
          </div>

          <div className="bg-white border rounded-2xl p-6 h-fit">
            <h2 className="text-xl font-semibold mb-5">Order Summary</h2>
            <div className="space-y-4 mb-5">
              {cart.map((item) => (
                <div key={item.productId} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover border" />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// Outer wrapper — pehle clientSecret fetch karo, phir Elements render karo
function Checkout() {
  const cart = getCart();
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState("");

  useEffect(() => {
    if (cart.length === 0) {
      setLoading(false);
      return;
    }

    const init = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/api/payment/create-payment-intent`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setClientSecret(data.clientSecret);
        setPaymentIntentId(data.paymentIntentId);
      } catch (err) {
        setInitError(err.message);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Your cart is empty</h1>
          <Link to="/products" className="inline-block mt-6 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition">
            Browse Products
          </Link>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
      </main>
    );
  }

  if (initError) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <p className="text-red-600 text-center">{initError}</p>
      </main>
    );
  }

  // clientSecret ready hone ke baad hi Elements render hoga
  if (!clientSecret) return null;

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: { theme: "stripe" },
      }}
    >
      <CheckoutForm paymentIntentId={paymentIntentId} />
    </Elements>
  );
}

export default Checkout;
