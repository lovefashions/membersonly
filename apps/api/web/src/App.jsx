import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext.jsx';
import { CartProvider } from '@/hooks/useCart.jsx';
import { Toaster } from '@/components/ui/sonner';
import ScrollToTop from '@/components/ScrollToTop.jsx';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';

// Pages
import HomePage from '@/pages/HomePage.jsx';
import LoginPage from '@/pages/LoginPage.jsx';
import SignupPage from '@/pages/SignupPage.jsx';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage.jsx';
import PasswordResetPage from '@/pages/PasswordResetPage.jsx';
import DashboardPage from '@/pages/DashboardPage.jsx';
import AccountPage from '@/pages/AccountPage.jsx';
import UpgradePage from '@/pages/UpgradePage.jsx';
import SupportPage from '@/pages/SupportPage.jsx';
import AdminPage from '@/pages/AdminPage.jsx';
import ProductsList from '@/pages/ProductsList.jsx';
import ProductDetailPage from '@/pages/ProductDetailPage.jsx';
import ShoppingCartPage from '@/pages/ShoppingCart.jsx';
import SuccessPage from '@/pages/SuccessPage.jsx';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<PasswordResetPage />} />
            <Route path="/support" element={<SupportPage />} />

            {/* E-commerce Routes */}
            <Route path="/products" element={<ProductsList />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<ShoppingCartPage />} />
            <Route path="/success" element={<SuccessPage />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <AccountPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upgrade"
              element={
                <ProtectedRoute>
                  <UpgradePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminPage />
                </ProtectedRoute>
              }
            />

            {/* Catch-all 404 */}
            <Route
              path="*"
              element={
                <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center px-6">
                  <h1 className="text-6xl font-light text-foreground mb-4 tracking-tight">404</h1>
                  <p className="text-xl text-foreground/60 font-light mb-8">
                    The page you are looking for cannot be found.
                  </p>
                  <a
                    href="/"
                    className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors shadow-md"
                  >
                    Return Home
                  </a>
                </div>
              }
            />
          </Routes>
          <Toaster position="top-center" />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
