import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getCart, getCartTotal, clearCart } from "../utils/cart";
import { API_BASE_URL } from "../utils/api";
import { formatPrice } from "../utils/format";

const REQUIRED_SHIPPING_FIELDS = [
  "fullName",
  "addressLine",
  "city",
  "state",
  "postalCode",
  "country",
  "phone",
];

function Checkout() {
  const navigate = useNavigate();
  const cart = getCart();
  const total = getCartTotal();

  const [shipping, setShipping] = useState({
    fullName: "",
    addressLine: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phone: "",
  });

  const [card, setCard] = useState({
    number: "",
    expiry: "",
    cvv: "",
  });

  const [error, setError] = useState("");
  const [stage, setStage] = useState("form"); // form | processing
  const [placing, setPlacing] = useState(false);

  const handleShippingChange = (e) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;

    if (name === "number") {
      // format as 4-digit groups, digits only, max 19 chars
      const digits = value.replace(/\D/g, "").slice(0, 16);
      const formatted = digits.replace(/(.{4})/g, "$1 ").trim();
      setCard({ ...card, number: formatted });
      return;
    }

    if (name === "expiry") {
      const digits = value.replace(/\D/g, "").slice(0, 4);
      const formatted =
        digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
      setCard({ ...card, expiry: formatted });
      return;
    }

    if (name === "cvv") {
      const digits = value.replace(/\D/g, "").slice(0, 4);
      setCard({ ...card, cvv: digits });
      return;
    }

    setCard({ ...card, [name]: value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError("");

    for (const field of REQUIRED_SHIPPING_FIELDS) {
      if (!shipping[field] || !shipping[field].trim()) {
        setError("Please fill in all shipping fields.");
        return;
      }
    }

    const cardDigits = card.number.replace(/\s/g, "");

    if (cardDigits.length < 12) {
      setError("Please enter a valid card number.");
      return;
    }

    if (!/^\d{2}\/\d{2}$/.test(card.expiry)) {
      setError("Please enter expiry as MM/YY.");
      return;
    }

    if (card.cvv.length < 3) {
      setError("Please enter a valid CVV.");
      return;
    }

    setPlacing(true);
    setStage("processing");

    try {
      const token = localStorage.getItem("token");

      // 1. Create a "payment intent" — server calculates the real total
      const intentResponse = await fetch(
        `${API_BASE_URL}/api/payment/create-payment-intent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            items: cart.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
          }),
        }
      );

      const intentData = await intentResponse.json();

      if (!intentResponse.ok) {
        throw new Error(intentData.message || "Failed to start payment");
      }

      // Small artificial delay so the "Processing payment..." screen
      // actually shows — mirrors what a real gateway round-trip feels like
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // 2. "Confirm" the payment with the card details
      const confirmResponse = await fetch(
        `${API_BASE_URL}/api/payment/confirm/${intentData.paymentIntentId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            cardNumber: cardDigits,
          }),
        }
      );

      const confirmData = await confirmResponse.json();

      if (!confirmResponse.ok || confirmData.status !== "succeeded") {
        throw new Error(confirmData.message || "Payment was declined.");
      }

      // 3. Payment succeeded — now create the order
      const orderResponse = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          shippingAddress: shipping,
          paymentIntentId: intentData.paymentIntentId,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.message || "Failed to place order");
      }

      clearCart();
      navigate(`/order-success/${orderData._id}`);
    } catch (err) {
      setError(err.message);
      setStage("form");
    } finally {
      setPlacing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Your cart is empty
          </h1>

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

  if (stage === "processing") {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto" />
          <p className="mt-6 text-gray-600">Processing payment...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-gray-50 min-h-screen py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping + Payment Form */}
          <div className="lg:col-span-2 bg-white border rounded-2xl p-6">
            {error && (
              <div className="mb-5 p-3 rounded-lg bg-red-100 text-red-700 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handlePlaceOrder} className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-5">
                  Shipping Address
                </h2>

                <div className="space-y-4">
                  <input
                    type="text"
                    name="fullName"
                    value={shipping.fullName}
                    onChange={handleShippingChange}
                    placeholder="Full Name"
                    className="w-full border rounded-lg px-4 py-3 outline-none focus:border-black"
                  />

                  <input
                    type="text"
                    name="addressLine"
                    value={shipping.addressLine}
                    onChange={handleShippingChange}
                    placeholder="Address Line"
                    className="w-full border rounded-lg px-4 py-3 outline-none focus:border-black"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="city"
                      value={shipping.city}
                      onChange={handleShippingChange}
                      placeholder="City"
                      className="w-full border rounded-lg px-4 py-3 outline-none focus:border-black"
                    />

                    <input
                      type="text"
                      name="state"
                      value={shipping.state}
                      onChange={handleShippingChange}
                      placeholder="State"
                      className="w-full border rounded-lg px-4 py-3 outline-none focus:border-black"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="postalCode"
                      value={shipping.postalCode}
                      onChange={handleShippingChange}
                      placeholder="Postal Code"
                      className="w-full border rounded-lg px-4 py-3 outline-none focus:border-black"
                    />

                    <input
                      type="text"
                      name="country"
                      value={shipping.country}
                      onChange={handleShippingChange}
                      placeholder="Country"
                      className="w-full border rounded-lg px-4 py-3 outline-none focus:border-black"
                    />
                  </div>

                  <input
                    type="text"
                    name="phone"
                    value={shipping.phone}
                    onChange={handleShippingChange}
                    placeholder="Phone Number"
                    className="w-full border rounded-lg px-4 py-3 outline-none focus:border-black"
                  />
                </div>
              </div>

              <hr />

              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-semibold">Payment</h2>
                  <span className="text-xs text-gray-400 border rounded-full px-3 py-1">
                    Simulated payment — no real charge
                  </span>
                </div>

                <div className="space-y-4">
                  <input
                    type="text"
                    name="number"
                    value={card.number}
                    onChange={handleCardChange}
                    placeholder="Card Number"
                    inputMode="numeric"
                    className="w-full border rounded-lg px-4 py-3 outline-none focus:border-black"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="expiry"
                      value={card.expiry}
                      onChange={handleCardChange}
                      placeholder="MM/YY"
                      inputMode="numeric"
                      className="w-full border rounded-lg px-4 py-3 outline-none focus:border-black"
                    />

                    <input
                      type="text"
                      name="cvv"
                      value={card.cvv}
                      onChange={handleCardChange}
                      placeholder="CVV"
                      inputMode="numeric"
                      className="w-full border rounded-lg px-4 py-3 outline-none focus:border-black"
                    />
                  </div>

                  <p className="text-xs text-gray-400">
                    Use any card number to simulate success, or{" "}
                    <span className="font-mono">4000 0000 0000 0002</span> to
                    simulate a declined payment.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={placing}
                className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
              >
                {placing ? "Processing..." : `Pay ${formatPrice(total)}`}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white border rounded-2xl p-6 h-fit">
            <h2 className="text-xl font-semibold mb-5">Order Summary</h2>

            <div className="space-y-4 mb-5">
              {cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex justify-between items-center text-sm"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover border"
                    />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>

                  <p className="font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </p>
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

export default Checkout;