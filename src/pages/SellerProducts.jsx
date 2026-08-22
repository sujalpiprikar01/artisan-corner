import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../utils/api";

function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMyProducts = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/api/products/my-products`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch products");
      }

      setProducts(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProducts();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading products...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Products</h1>

            <p className="text-gray-500 mt-2">Manage your products</p>
          </div>

          <Link
            to="/seller/products/add"
            className="bg-black text-white px-5 py-3 rounded-lg hover:bg-gray-800 transition"
          >
            + Add Product
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* No Products */}
        {!error && products.length === 0 && (
          <div className="bg-white border rounded-2xl p-10 text-center">
            <h2 className="text-xl font-semibold">No products yet</h2>

            <p className="text-gray-500 mt-2">
              Start by adding your first product.
            </p>
          </div>
        )}

        {/* Products */}
        {products.length > 0 && (
          <div className="bg-white border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-4">Product</th>

                    <th className="text-left px-6 py-4">Category</th>

                    <th className="text-left px-6 py-4">Price</th>

                    <th className="text-left px-6 py-4">Stock</th>

                    <th className="text-left px-6 py-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => (
                    <tr key={product._id} className="border-b last:border-b-0">
                      {/* Product */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />

                          <div>
                            <p className="font-semibold text-gray-900">
                              {product.name}
                            </p>

                            <p className="text-sm text-gray-500">
                              {product.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4 text-gray-600">
                        {product.category}
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4 font-semibold">
                        ${product.price}
                      </td>

                      {/* Stock */}
                      <td className="px-6 py-4 text-gray-600">
                        {product.stock}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex gap-3">
                          <Link
                            to={`/seller/products/edit/${product._id}`}
                            className="text-blue-600 hover:underline"
                          >
                            Edit
                          </Link>

                          <button className="text-red-600 hover:underline">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default SellerProducts;
