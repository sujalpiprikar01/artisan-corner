import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../utils/api";

const STATUS_OPTIONS = ["Processing", "Shipped", "Delivered", "Cancelled"];

const statusColors = {
  Processing: "bg-yellow-100 text-yellow-800",
  Shipped: "bg-blue-100 text-blue-800",
  Delivered: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
};

function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingItemId, setUpdatingItemId] = useState(null);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/api/orders/vendor-orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch orders");
      }

      setOrders(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, itemId, newStatus) => {
    setUpdatingItemId(itemId);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/api/orders/${orderId}/items/${itemId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update status");
      }

      // Update local state without refetching everything
      setOrders((prev) =>
        prev.map((order) => {
          if (order._id !== orderId) return order;

          return {
            ...order,
            items: order.items.map((item) =>
              item._id === itemId ? { ...item, status: newStatus } : item
            ),
          };
        })
      );
    } catch (error) {
      alert(error.message);
    } finally {
      setUpdatingItemId(null);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading orders...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
            <p className="text-gray-500 mt-2">
              Orders containing your products.
            </p>
          </div>

          <Link
            to="/dashboard/seller"
            className="border px-4 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            Back
          </Link>
        </div>

        {/* Empty State */}
        {orders.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border p-10 text-center">
            <p className="text-gray-500">No orders yet.</p>
          </div>
        )}

        {/* Orders List */}
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-2xl shadow-sm border p-6"
            >
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b">
                <div>
                  <p className="text-sm text-gray-500">
                    Order ID: {order._id}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Placed by {order.buyer?.name} ({order.buyer?.email})
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    order.paymentStatus === "Paid"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  Payment: {order.paymentStatus}
                </span>
              </div>

              {/* Shipping Address */}
              <div className="mb-4 text-sm text-gray-600">
                <p className="font-medium text-gray-800 mb-1">
                  Shipping To:
                </p>
                <p>
                  {order.shippingAddress?.fullName},{" "}
                  {order.shippingAddress?.addressLine},{" "}
                  {order.shippingAddress?.city},{" "}
                  {order.shippingAddress?.state}{" "}
                  {order.shippingAddress?.postalCode},{" "}
                  {order.shippingAddress?.country}
                </p>
                <p>Phone: {order.shippingAddress?.phone}</p>
              </div>

              {/* Items (only this vendor's items) */}
              <div className="space-y-4">
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

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          statusColors[item.status] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {item.status}
                      </span>

                      <select
                        value={item.status}
                        disabled={updatingItemId === item._id}
                        onChange={(e) =>
                          handleStatusChange(
                            order._id,
                            item._id,
                            e.target.value
                          )
                        }
                        className="border rounded-lg px-3 py-2 text-sm outline-none focus:border-black disabled:opacity-50"
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              {/* Subtotal */}
              <div className="mt-4 pt-4 border-t text-right">
                <p className="font-semibold">
                  Your Subtotal: ${order.mySubtotal?.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default SellerOrders;
