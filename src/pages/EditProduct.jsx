import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../utils/api";

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    image: "",
  });

  const [newImage, setNewImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/products/${id}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch product");
        }

        setFormData({
          name: data.name || "",
          description: data.description || "",
          price: data.price || "",
          category: data.category || "",
          stock: data.stock ?? "",
          image: data.image || "",
        });
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Handle inputs
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Update product
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSaving(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login first");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/products/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            price: Number(formData.price),
            category: formData.category,
            stock: Number(formData.stock),
            image: formData.image,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update product");
      }

      alert("Product updated successfully!");

      navigate("/seller/products");
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading product...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-3xl mx-auto">

        <div className="bg-white border rounded-2xl shadow-sm p-8">

          <h1 className="text-3xl font-bold text-gray-900">
            Edit Product
          </h1>

          <p className="text-gray-500 mt-2">
            Update your product information.
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
                value={formData.category}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:border-black"
                required
              />
            </div>

            {/* Current Image */}
            {formData.image && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Current Image
                </label>

                <img
                  src={formData.image}
                  alt={formData.name}
                  className="w-32 h-32 rounded-lg object-cover border"
                />
              </div>
            )}

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Image URL
              </label>

              <input
                type="text"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:border-black"
              />

              <p className="text-sm text-gray-500 mt-2">
                Leave the existing URL if you don't want to change the image.
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
                disabled={saving}
                className="flex-1 bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>

            </div>

          </form>

        </div>

      </div>
    </main>
  );
}

export default EditProduct;