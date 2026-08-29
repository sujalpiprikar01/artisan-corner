import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../utils/api";
import { formatPrice } from "../utils/format";

function SellerAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          `${API_BASE_URL}/api/orders/vendor-analytics`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to load analytics");
        }

        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading analytics...</p>
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

  const maxDailyEarnings = Math.max(
    1,
    ...data.salesHistory.map((d) => d.earnings)
  );

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Sales Analytics
            </h1>
            <p className="text-gray-500 mt-2">
              Your earnings and sales performance.
            </p>
          </div>

          <Link
            to="/dashboard/seller"
            className="border px-4 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            Back
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <p className="text-sm text-gray-500">Total Earnings</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {formatPrice(data.totalEarnings)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              After platform fee, from paid orders
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <p className="text-sm text-gray-500">Total Orders</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {data.totalOrders}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <p className="text-sm text-gray-500">Units Sold</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {data.totalUnitsSold}
            </p>
          </div>
        </div>

        {/* Sales History Chart */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-10">
          <h2 className="text-xl font-semibold mb-6">Sales History</h2>

          {data.salesHistory.length === 0 ? (
            <p className="text-gray-500">No sales yet.</p>
          ) : (
            <div className="flex items-end gap-3 h-56 overflow-x-auto pb-2">
              {data.salesHistory.map((day) => (
                <div
                  key={day.date}
                  className="flex flex-col items-center justify-end h-full min-w-[48px]"
                >
                  <p className="text-xs font-medium text-gray-700 mb-1">
                    {formatPrice(day.earnings)}
                  </p>

                  <div
                    className="w-8 bg-gray-900 rounded-t-md"
                    style={{
                      height: `${
                        (day.earnings / maxDailyEarnings) * 180 + 4
                      }px`,
                    }}
                    title={`${formatPrice(day.earnings)} · ${day.units} unit(s)`}
                  />

                  <p className="text-[10px] text-gray-400 mt-2 whitespace-nowrap">
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

        {/* Top Products */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-6">Top Products</h2>

          {data.topProducts.length === 0 ? (
            <p className="text-gray-500">No sales yet.</p>
          ) : (
            <div className="divide-y">
              {data.topProducts.map((product, index) => (
                <div
                  key={product.productId}
                  className="flex items-center justify-between py-4"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400 font-medium w-5">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {product.units} unit{product.units === 1 ? "" : "s"}{" "}
                        sold
                      </p>
                    </div>
                  </div>

                  <p className="font-semibold text-gray-900">
                    {formatPrice(product.earnings)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default SellerAnalytics;