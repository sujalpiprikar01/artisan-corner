import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../utils/api";

function AddProduct() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
  });

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login first");
      }

      if (!image) {
        throw new Error("Please select a product image");
      }

      const data = new FormData();

      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("category", formData.category);
      data.append("stock", formData.stock);
      data.append("image", image);

      const response = await fetch(
        `${API_BASE_URL}/api/products`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: data,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to create product"
        );
      }

      alert("Product added successfully!");

      navigate("/seller/products");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-3xl mx-auto">

        <div className="bg-white border rounded-2xl shadow-sm p-8">

          <h1 className="text-3xl font-bold text-gray-900">
            Add Product
          </h1>

          <p className="text-gray-500 mt-2">
            Add a new handmade product to your store.
          </p>

          {error && (
            <div className="mt-6 bg-red-100 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-6"
          >

            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Product Name
              </label>

              <input
                type="text"
                name="name"
                placeholder="Enter product name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:border-black"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>

              <textarea
                name="description"
                placeholder="Describe your product"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                className="w-full border rounded-lg px-4 py-3 outline-none focus:border-black resize-none"
                required
              />
            </div>

            {/* Price + Stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <div>
                <label className="block text-sm font-medium mb-2">
                  Price
                </label>

                <input
                  type="number"
                  name="price"
                  placeholder="Enter price"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-3 outline-none focus:border-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Stock
                </label>

                <input
                  type="number"
                  name="stock"
                  placeholder="Enter stock"
                  min="0"
                  value={formData.stock}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-3 outline-none focus:border-black"
                  required
                />
              </div>

            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Category
              </label>

              <input
                type="text"
                name="category"
                placeholder="e.g. Home Decor"
                value={formData.category}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:border-black"
                required
              />
            </div>

            {/* Image */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Product Image
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                className="w-full border rounded-lg px-4 py-3"
                required
              />

              <p className="text-sm text-gray-500 mt-2">
                Image will be uploaded securely to Cloudinary.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-2">

              <button
                type="button"
                onClick={() => navigate("/seller/products")}
                className="flex-1 border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
              >
                {loading ? "Adding Product..." : "Add Product"}
              </button>

            </div>

          </form>

        </div>

      </div>
    </main>
  );
}

export default AddProduct;