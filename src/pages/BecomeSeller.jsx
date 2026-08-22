import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../utils/api";

function BecomeSeller() {
  const navigate = useNavigate();

  const [storeName, setStoreName] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Please login first");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/become-vendor`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            storeName,
            storeDescription: description,
            storeLogo: logo,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to become a seller");
      }

      // Update user role in localStorage
      const user = JSON.parse(localStorage.getItem("user"));

      const updatedUser = {
        ...user,
        role: "vendor",
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));

      setMessage("Congratulations! You are now a seller.");

      // Redirect after success
      setTimeout(() => {
        navigate("/dashboard/seller");
      }, 1000);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center">Become a Seller</h1>

        <p className="text-gray-500 text-center mt-2">
          Create your store and start selling your handmade products.
        </p>

        {message && (
          <div className="mt-6 p-3 rounded-lg bg-gray-100 text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">Store Name</label>

            <input
              type="text"
              placeholder="Enter your store name"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 outline-none focus:border-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Store Description
            </label>

            <textarea
              placeholder="Tell customers about your store..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 outline-none focus:border-black min-h-32"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Store Logo URL
            </label>

            <input
              type="url"
              placeholder="https://example.com/logo.jpg"
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading ? "Creating Store..." : "Become a Seller"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default BecomeSeller;
