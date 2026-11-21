import { BrowserRouter, Routes, Route } from "react-router-dom";

import CustomerLayout from "./components/layout/CustomerLayout";

import Home from "./pages/customer/Home";
import Products from "./pages/customer/Products";
import ProductDetails from "./pages/customer/ProductDetails";
import Cart from "./pages/customer/Cart";
import Wishlist from "./pages/customer/Wishlist";
import Profile from "./pages/customer/Profile";
import Checkout from "./pages/customer/Checkout";
import Orders from "./pages/customer/Orders";
import NotFound from "./pages/customer/NotFound";
import Support from "./pages/customer/Support";
import ResetPassword from "./pages/auth/ResetPassword";

import Login from "./pages/auth/Login";

import SellerApplication from "./pages/seller/SellerApplication";
import SellerCentre from "./pages/seller/SellerCentre";

import AdminDashboard from "./pages/admin/AdminDashboard";
import SellerApplications from "./pages/admin/SellerApplications";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";

import SellerDashboard from "./pages/seller/SellerDashboard";
import SellerRoute from "./routes/SellerRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Customer website */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />

          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route path="/support" element={<Support />} />
          <Route
            path="/reset-password/:token"
            element={<ResetPassword />}
          />

          <Route
            path="/seller-application"
            element={
              <ProtectedRoute>
                <SellerApplication />
              </ProtectedRoute>
            }
          />

          <Route
            path="/seller-centre"
            element={
              <ProtectedRoute>
                <SellerCentre />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Admin website - separate layout */}

        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* Seller Applications */}
        <Route
          path="/admin/seller-applications"
          element={
            <AdminRoute>
              <SellerApplications />
            </AdminRoute>
          }
        />
        <Route
          path="/seller-dashboard"
          element={
            <SellerRoute>
              <SellerDashboard />
            </SellerRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
