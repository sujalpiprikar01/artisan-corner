import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCartCount } from "../utils/cart";

function Navbar() {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);

  // Get login information from localStorage
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const updateCount = () => setCartCount(getCartCount());

    updateCount();

    // Update when cart changes in this tab or another tab
    window.addEventListener("cart-updated", updateCount);
    window.addEventListener("storage", updateCount);

    return () => {
      window.removeEventListener("cart-updated", updateCount);
      window.removeEventListener("storage", updateCount);
    };
  }, []);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-gray-900">
          Artisan's Corner
        </Link>

        {/* Navigation */}
        <div className="hidden md:flex items-center gap-8 text-gray-600">
          <Link to="/" className="hover:text-black transition">
            Home
          </Link>

          <Link to="/products" className="hover:text-black transition">
            Products
          </Link>

          <Link to="/products" className="hover:text-black transition">
            Categories
          </Link>

          <Link to="/become-seller" className="hover:text-black transition">
            Become a Seller
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Cart */}
          <Link
            to="/cart"
            className="relative text-gray-600 hover:text-black transition"
          >
            🛒 Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Login / User / Logout */}
          {token ? (
            <>
              <Link
                to="/my-orders"
                className="text-gray-600 hover:text-black transition text-sm"
              >
                My Orders
              </Link>

              {user?.role === "vendor" && (
                <Link
                  to="/dashboard/seller"
                  className="text-gray-600 hover:text-black transition text-sm"
                >
                  Seller Dashboard
                </Link>
              )}

              {user?.role === "admin" && (
                <Link
                  to="/dashboard/admin"
                  className="text-gray-600 hover:text-black transition text-sm"
                >
                  Admin Panel
                </Link>
              )}

              <span className="text-gray-700 font-medium">{user?.name}</span>

              <button
                onClick={handleLogout}
                className="bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;