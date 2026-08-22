import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../utils/api";

function SellerDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(`${API_BASE_URL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch profile");
        }

        setUser(data);

        // Keep localStorage user data updated
        localStorage.setItem("user", JSON.stringify(data));
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading dashboard...</p>
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>

          <p className="text-gray-500 mt-2">Welcome back, {user?.name} 👋</p>
        </div>

        {/* Store Info */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Store</h2>

          <p className="text-lg font-medium">
            {user?.store?.name || "Your Store"}
          </p>

          <p className="text-gray-500 mt-2">
            {user?.store?.description ||
              "Start building your store and add your products."}
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Products */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold">Products</h2>

            <p className="text-gray-500 mt-2">Manage your products.</p>

            <Link
              to="/seller/products"
              className="inline-block mt-5 bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition"
            >
              Manage Products
            </Link>
          </div>

          {/* Orders */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold">Orders</h2>

            <p className="text-gray-500 mt-2">View your customer orders.</p>

            <Link
              to="/seller/orders"
              className="inline-block mt-5 bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition"
            >
              View Orders
            </Link>
          </div>

          {/* Store */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold">Store</h2>

            <p className="text-gray-500 mt-2">Manage your store information.</p>

            <Link
              to="/seller/store"
              className="inline-block mt-5 bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition"
            >
              Manage Store
            </Link>
          </div>

          {/* Analytics */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold">Analytics</h2>

            <p className="text-gray-500 mt-2">View sales and earnings.</p>

            <Link
              to="/seller/analytics"
              className="inline-block mt-5 bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition"
            >
              View Analytics
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default SellerDashboard;