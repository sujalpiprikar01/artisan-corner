import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import BecomeSeller from "./pages/BecomeSeller";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import MyOrders from "./pages/MyOrders";

import SellerDashboard from "./pages/SellerDashboard";
import SellerProducts from "./pages/SellerProducts";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import StoreManagement from "./pages/StoreManagement";
import SellerOrders from "./pages/SellerOrders";
import SellerAnalytics from "./pages/SellerAnalytics";
import AdminDashboard from "./pages/AdminDashboard";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />

        <Route path="/products" element={<Products />} />

        <Route
          path="/products/:id"
          element={<ProductDetails />}
        />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/cart" element={<Cart />} />

        <Route
          path="/become-seller"
          element={<BecomeSeller />}
        />

        {/* Seller Dashboard */}
        <Route
          path="/dashboard/seller"
          element={
            <ProtectedRoute vendorOnly={true}>
              <SellerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Seller Products */}
        <Route
          path="/seller/products"
          element={
            <ProtectedRoute vendorOnly={true}>
              <SellerProducts />
            </ProtectedRoute>
          }
        />

        {/* Add Product */}
        <Route
          path="/seller/products/add"
          element={
            <ProtectedRoute vendorOnly={true}>
              <AddProduct />
            </ProtectedRoute>
          }
        />

        {/* Edit Product */}
        <Route
          path="/seller/products/edit/:id"
          element={
            <ProtectedRoute vendorOnly={true}>
              <EditProduct />
            </ProtectedRoute>
          }
        />

        {/* Store Management */}
        <Route
          path="/seller/store"
          element={
            <ProtectedRoute vendorOnly={true}>
              <StoreManagement />
            </ProtectedRoute>
          }
        />

        {/* Seller Orders */}
        <Route
          path="/seller/orders"
          element={
            <ProtectedRoute vendorOnly={true}>
              <SellerOrders />
            </ProtectedRoute>
          }
        />

        {/* Seller Analytics */}
        <Route
          path="/seller/analytics"
          element={
            <ProtectedRoute vendorOnly={true}>
              <SellerAnalytics />
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard */}
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Checkout */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />

        {/* Order Success */}
        <Route
          path="/order-success/:id"
          element={
            <ProtectedRoute>
              <OrderSuccess />
            </ProtectedRoute>
          }
        />

        {/* My Orders (buyer order history) */}
        <Route
          path="/my-orders"
          element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;