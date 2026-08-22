import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { API_BASE_URL } from "../utils/api";

function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          `${API_BASE_URL}/api/orders/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch order");
        }

        setOrder(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading order...</p>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <p className="text-red-500">{error || "Order not found"}</p>
      </main>
    );
  }

  return (
    <main className="bg-gray-50 min-h-screen py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border rounded-2xl p-8 text-center">
          <div className="text-5xl mb-4">✅</div>

          <h1 className="text-3xl font-bold text-gray-900">
            Order Placed Successfully!
          </h1>

          <p className="text-gray-500 mt-2">
            Thank you for your purchase. Your order has been confirmed.
          </p>

          <p className="text-sm text-gray-400 mt-2">Order ID: {order._id}</p>

          <div className="text-left mt-8 space-y-4">
            {order.items.map((item) => (
              <div
                key={item._id}
                className="flex items-center gap-4 border rounded-lg p-3"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-lg border"
                />

                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    Qty: {item.quantity} × ${item.price}
                  </p>
                </div>

                <p className="font-semibold">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="text-left mt-6 pt-6 border-t">
            <p className="font-medium text-gray-800 mb-1">Shipping To:</p>
            <p className="text-sm text-gray-600">
              {order.shippingAddress?.fullName},{" "}
              {order.shippingAddress?.addressLine},{" "}
              {order.shippingAddress?.city}, {order.shippingAddress?.state}{" "}
              {order.shippingAddress?.postalCode},{" "}
              {order.shippingAddress?.country}
            </p>
          </div>

          <div className="flex justify-between font-bold text-xl mt-6 pt-6 border-t">
            <span>Total</span>
            <span>${order.totalAmount.toFixed(2)}</span>
          </div>

          <div className="flex gap-4 mt-8">
            <Link
              to="/products"
              className="flex-1 border border-black py-3 rounded-lg hover:bg-gray-100 transition"
            >
              Continue Shopping
            </Link>

            <Link
              to="/my-orders"
              className="flex-1 bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition"
            >
              View My Orders
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default OrderSuccess;
