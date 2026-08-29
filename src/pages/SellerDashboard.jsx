import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  ShoppingBag,
  IndianRupee,
  Wallet,
  Store,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { API_BASE_URL } from "../utils/api";
import { formatPrice } from "../utils/format";

const statusColors = {
  Processing: "bg-yellow-100 text-yellow-800",
  Shipped: "bg-blue-100 text-blue-800",
  Delivered: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
};

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function StatCard({ icon: Icon, label, value, tint }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{label}</p>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ backgroundColor: tint }}
        >
          <Icon size={17} strokeWidth={1.75} className="text-gray-700" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 mt-3">{value}</p>
    </div>
  );
}

function SellerDashboard() {
  const [user, setUser] = useState(null);
  const [productCount, setProductCount] = useState(0);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const authHeaders = { Authorization: `Bearer ${token}` };

        const [profileRes, productsRes, ordersRes, analyticsRes] =
          await Promise.all([
            fetch(`${API_BASE_URL}/api/users/me`, { headers: authHeaders }),
            fetch(`${API_BASE_URL}/api/products/my-products`, {
              headers: authHeaders,
            }),
            fetch(`${API_BASE_URL}/api/orders/vendor-orders`, {
              headers: authHeaders,
            }),
            fetch(`${API_BASE_URL}/api/orders/vendor-analytics`, {
              headers: authHeaders,
            }),
          ]);

        const [profileData, productsData, ordersData, analyticsData] =
          await Promise.all([
            profileRes.json(),
            productsRes.json(),
            ordersRes.json(),
            analyticsRes.json(),
          ]);

        if (!profileRes.ok)
          throw new Error(profileData.message || "Failed to fetch profile");

        setUser(profileData);
        localStorage.setItem("user", JSON.stringify(profileData));

        if (productsRes.ok) setProductCount(productsData.length || 0);
        if (ordersRes.ok) setOrders(ordersData || []);
        if (analyticsRes.ok) setAnalytics(analyticsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
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

  const recentOrders = orders.slice(0, 5);
  const maxDailyEarnings = Math.max(
    1,
    ...(analytics?.salesHistory || []).map((d) => d.earnings)
  );
  const recentHistory = (analytics?.salesHistory || []).slice(-10);

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Seller Dashboard
          </h1>
          <p className="text-gray-500 mt-2">
            {greeting()}, {user?.name}
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Package}
            label="Products"
            value={productCount}
            tint="#E4EBF2"
          />
          <StatCard
            icon={ShoppingBag}
            label="Orders"
            value={analytics?.totalOrders ?? orders.length}
            tint="#F3E8DC"
          />
          <StatCard
            icon={IndianRupee}
            label="Revenue"
            value={formatPrice(analytics?.totalRevenue || 0)}
            tint="#E6EDE3"
          />
          <StatCard
            icon={Wallet}
            label="Earnings"
            value={formatPrice(analytics?.totalEarnings || 0)}
            tint="#F3E4EE"
          />
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-10">
          <Link
            to="/seller/products"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
          >
            <Package size={16} strokeWidth={1.75} />
            Manage Products
          </Link>
          <Link
            to="/seller/orders"
            className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-white transition"
          >
            <ShoppingBag size={16} strokeWidth={1.75} />
            View Orders
          </Link>
          <Link
            to="/seller/store"
            className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-white transition"
          >
            <Store size={16} strokeWidth={1.75} />
            Manage Store
          </Link>
          <Link
            to="/seller/analytics"
            className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-white transition"
          >
            <BarChart3 size={16} strokeWidth={1.75} />
            View Analytics
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Orders
              </h2>
              <Link
                to="/seller/orders"
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition"
              >
                View all
                <ArrowRight size={14} strokeWidth={2} />
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <p className="text-gray-500 text-sm py-6 text-center">
                No orders yet.
              </p>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <div
                    key={order._id}
                    className="flex items-center justify-between py-3.5"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {order.buyer?.name || "Customer"}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString()} ·{" "}
                        {order.items?.length || 0} item
                        {order.items?.length === 1 ? "" : "s"}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          statusColors[order.paymentStatus] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                      <span className="text-sm font-semibold text-gray-900 w-20 text-right">
                        {formatPrice(order.mySubtotal)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sales Overview */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Sales Overview
              </h2>
              <Link
                to="/seller/analytics"
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition"
              >
                Details
                <ArrowRight size={14} strokeWidth={2} />
              </Link>
            </div>

            {recentHistory.length === 0 ? (
              <p className="text-gray-500 text-sm py-6 text-center">
                No sales yet.
              </p>
            ) : (
              <div className="flex items-end gap-2 h-40">
                {recentHistory.map((day) => (
                  <div
                    key={day.date}
                    className="flex-1 flex flex-col items-center justify-end h-full"
                    title={`${formatPrice(day.earnings)} · ${day.units} unit(s)`}
                  >
                    <div
                      className="w-full bg-gray-900 rounded-t-md"
                      style={{
                        height: `${
                          (day.earnings / maxDailyEarnings) * 120 + 4
                        }px`,
                      }}
                    />
                    <p className="text-[9px] text-gray-400 mt-2 whitespace-nowrap">
                      {new Date(day.date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default SellerDashboard;
