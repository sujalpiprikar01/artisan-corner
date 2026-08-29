import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart, Menu, X, User, LayoutDashboard } from "lucide-react";
import { getCartCount } from "../utils/cart";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/products" },
  { label: "Become a Seller", to: "/become-seller" },
];

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const updateCount = () => setCartCount(getCartCount());

    updateCount();

    window.addEventListener("cart-updated", updateCount);
    window.addEventListener("storage", updateCount);

    return () => {
      window.removeEventListener("cart-updated", updateCount);
      window.removeEventListener("storage", updateCount);
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (to) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex flex-col leading-none shrink-0">
            <span className="text-lg font-bold tracking-widest text-gray-900">
              ARTISAN'S
            </span>
            <span className="text-xs font-medium tracking-[0.3em] text-gray-500">
              CORNER
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium pb-1 border-b-2 transition ${
                  isActive(link.to)
                    ? "text-gray-900 border-gray-900"
                    : "text-gray-500 border-transparent hover:text-gray-900"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-5">
            <Link
              to="/cart"
              className="relative text-gray-600 hover:text-gray-900 transition"
              aria-label="Cart"
            >
              <ShoppingCart size={22} strokeWidth={1.75} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-[10px] font-semibold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {token ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/my-orders"
                  className="text-sm text-gray-600 hover:text-gray-900 transition"
                >
                  My Orders
                </Link>

                {(user?.role === "vendor" || user?.role === "admin") && (
                  <Link
                    to={
                      user?.role === "admin"
                        ? "/dashboard/admin"
                        : "/dashboard/seller"
                    }
                    className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition"
                  >
                    <LayoutDashboard size={16} strokeWidth={1.75} />
                    Dashboard
                  </Link>
                )}

                <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
                  <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-semibold">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>

                  <button
                    onClick={handleLogout}
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 transition"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
              >
                <User size={16} strokeWidth={1.75} />
                Login
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="flex items-center gap-4 md:hidden">
            <Link to="/cart" className="relative text-gray-700">
              <ShoppingCart size={22} strokeWidth={1.75} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-[10px] font-semibold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="text-gray-700"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X size={24} strokeWidth={1.75} />
              ) : (
                <Menu size={24} strokeWidth={1.75} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-6 py-4 space-y-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`block text-sm font-medium ${
                isActive(link.to) ? "text-gray-900" : "text-gray-500"
              }`}
            >
              {link.label}
            </Link>
          ))}

          <hr className="border-gray-200" />

          {token ? (
            <>
              <Link to="/my-orders" className="block text-sm text-gray-600">
                My Orders
              </Link>

              {(user?.role === "vendor" || user?.role === "admin") && (
                <Link
                  to={
                    user?.role === "admin"
                      ? "/dashboard/admin"
                      : "/dashboard/seller"
                  }
                  className="block text-sm text-gray-600"
                >
                  Dashboard
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="block text-sm font-medium text-gray-900"
              >
                Logout ({user?.name})
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="inline-block bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;