import { useEffect, useState } from "react";
import { API_BASE_URL } from "../utils/api";

const TABS = ["Overview", "Users", "Products", "Orders"];

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Overview");

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const token = localStorage.getItem("token");
  const authHeaders = { Authorization: `Bearer ${token}` };

  const fetchAll = async () => {
    setLoading(true);
    setError("");

    try {
      const [statsRes, usersRes, productsRes, ordersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/stats`, {
          headers: authHeaders,
        }),
        fetch(`${API_BASE_URL}/api/admin/users`, {
          headers: authHeaders,
        }),
        fetch(`${API_BASE_URL}/api/admin/products`, {
          headers: authHeaders,
        }),
        fetch(`${API_BASE_URL}/api/admin/orders`, {
          headers: authHeaders,
        }),
      ]);

      const [statsData, usersData, productsData, ordersData] =
        await Promise.all([
          statsRes.json(),
          usersRes.json(),
          productsRes.json(),
          ordersRes.json(),
        ]);

      if (!statsRes.ok) throw new Error(statsData.message);
      if (!usersRes.ok) throw new Error(usersData.message);
      if (!productsRes.ok) throw new Error(productsData.message);
      if (!ordersRes.ok) throw new Error(ordersData.message);

      setStats(statsData);
      setUsers(usersData);
      setProducts(productsData);
      setOrders(ordersData);
    } catch (err) {
      setError(err.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeleteUser = async (id) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      setUsers((prev) => prev.filter((u) => u._id !== id));
      setActionMessage("User deleted.");
    } catch (err) {
      setActionMessage(err.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/products/${id}`,
        {
          method: "DELETE",
          headers: authHeaders,
        }
      );

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      setProducts((prev) => prev.filter((p) => p._id !== id));
      setActionMessage("Product deleted.");
    } catch (err) {
      setActionMessage(err.message);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading admin dashboard...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <p className="text-red-600">{error}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-500 mb-8">
          Platform-wide overview and management.
        </p>

        {actionMessage && (
          <div className="mb-6 p-3 rounded-lg bg-gray-100 text-center">
            {actionMessage}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                activeTab === tab
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-black"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "Overview" && stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard label="Total Users" value={stats.totalUsers} />
            <StatCard label="Vendors" value={stats.totalVendors} />
            <StatCard label="Buyers" value={stats.totalBuyers} />
            <StatCard label="Products" value={stats.totalProducts} />
            <StatCard label="Paid Orders" value={stats.totalOrders} />
            <StatCard
              label="Total Revenue"
              value={`$${stats.totalRevenue.toFixed(2)}`}
            />
            <StatCard
              label="Platform Fees Earned"
              value={`$${stats.totalPlatformFees.toFixed(2)}`}
            />
          </div>
        )}

        {/* Users */}
        {activeTab === "Users" && (
          <div className="bg-white rounded-2xl shadow-sm border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b bg-gray-50">
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b last:border-0">
                    <td className="p-4">{u.name}</td>
                    <td className="p-4">{u.email}</td>
                    <td className="p-4 capitalize">{u.role}</td>
                    <td className="p-4">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      {u.role !== "admin" && (
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Products */}
        {activeTab === "Products" && (
          <div className="bg-white rounded-2xl shadow-sm border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b bg-gray-50">
                  <th className="p-4">Product</th>
                  <th className="p-4">Vendor</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className="border-b last:border-0">
                    <td className="p-4">{p.name}</td>
                    <td className="p-4">
                      {p.vendor?.store?.name || p.vendor?.name}
                    </td>
                    <td className="p-4">${p.price}</td>
                    <td className="p-4">{p.stock}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleDeleteProduct(p._id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Orders */}
        {activeTab === "Orders" && (
          <div className="bg-white rounded-2xl shadow-sm border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b bg-gray-50">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Buyer</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Placed</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id} className="border-b last:border-0">
                    <td className="p-4 font-mono text-xs">{o._id}</td>
                    <td className="p-4">{o.buyer?.name}</td>
                    <td className="p-4">${o.totalAmount.toFixed(2)}</td>
                    <td className="p-4">{o.paymentStatus}</td>
                    <td className="p-4">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
    </div>
  );
}

export default AdminDashboard;