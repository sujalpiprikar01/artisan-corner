import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../utils/api";

function StoreManagement() {
  const [storeName, setStoreName] = useState("");
  const [description, setDescription] = useState("");
  const [logoPreview, setLogoPreview] = useState("");
  const [logoFile, setLogoFile] = useState(null);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          `${API_BASE_URL}/api/users/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch store"
          );
        }

        setStoreName(data.store?.name || "");
        setDescription(data.store?.description || "");
        setLogoPreview(data.store?.logo || "");
      } catch (error) {
        setMessage(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, []);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("name", storeName);
      formData.append("description", description);

      if (logoFile) {
        formData.append("logo", logoFile);
      }

      const response = await fetch(
        `${API_BASE_URL}/api/users/store`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update store"
        );
      }

      // Update user information in localStorage
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      // Update form with saved data
      setStoreName(data.user.store?.name || "");
      setDescription(data.user.store?.description || "");
      setLogoPreview(data.user.store?.logo || "");
      setLogoFile(null);

      setMessage("Store updated successfully!");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">
          Loading store...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Manage Store
            </h1>

            <p className="text-gray-500 mt-2">
              Update your store information.
            </p>
          </div>

          <Link
            to="/dashboard/seller"
            className="border px-4 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            Back
          </Link>
        </div>

        {/* Store Form */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">

          {/* Message */}
          {message && (
            <div className="mb-5 p-3 rounded-lg bg-gray-100 text-center">
              {message}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Store Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Store Name
              </label>

              <input
                type="text"
                value={storeName}
                onChange={(e) =>
                  setStoreName(e.target.value)
                }
                placeholder="Enter store name"
                className="w-full border rounded-lg px-4 py-3 outline-none focus:border-black"
                required
              />
            </div>

            {/* Store Description */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Store Description
              </label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="Tell customers about your store"
                className="w-full min-h-32 border rounded-lg px-4 py-3 outline-none focus:border-black"
              />
            </div>

            {/* Store Logo Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Store Logo
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:border-black file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-black file:text-white hover:file:bg-gray-800"
              />
            </div>

            {/* Logo Preview */}
            {logoPreview && (
              <div>
                <p className="text-sm font-medium mb-2">
                  Logo Preview
                </p>

                <img
                  src={logoPreview}
                  alt="Store logo"
                  className="w-24 h-24 rounded-full object-cover border"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}

            {/* Save */}
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

          </form>
        </div>
      </div>
    </main>
  );
}

export default StoreManagement;
