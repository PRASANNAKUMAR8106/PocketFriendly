import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { SettingsProvider } from './context/SettingsContext';

// Layouts
import { CustomerLayout } from './layouts/CustomerLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Customer Pages
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetail } from './pages/ProductDetail';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { CustomerAccount } from './pages/CustomerAccount';
import { WishlistPage } from './pages/WishlistPage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import {
  AboutPage,
  ContactPage,
  FAQPage,
  ShippingPolicyPage,
  ReturnsPolicyPage,
  PrivacyPolicyPage,
  TermsPage,
  OffersPage
} from './pages/StaticPages';
import { NotFound } from './pages/NotFound';

// Admin Pages
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminCollections } from './pages/admin/AdminCollections';
import { AdminDiscounts } from './pages/admin/AdminDiscounts';
import { AdminInventory } from './pages/admin/AdminInventory';
import { AdminCustomers } from './pages/admin/AdminCustomers';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminAuditLogs } from './pages/admin/AdminAuditLogs';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

// Category helper redirect
const CategoryRedirect: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  return <Navigate to={`/shop?category=${slug}`} replace />;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SettingsProvider>
          <WishlistProvider>
            <CartProvider>
              <BrowserRouter>
                <Routes>
                  {/* Customer Storefront Routes */}
                  <Route element={<CustomerLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/product/:slug" element={<ProductDetail />} />
                    <Route path="/category/:slug" element={<CategoryRedirect />} />
                    <Route path="/collections/latest" element={<Navigate to="/shop?isLatest=true" replace />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmationPage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/account" element={<CustomerAccount />} />
                    <Route path="/account/orders" element={<CustomerAccount />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/faq" element={<FAQPage />} />
                    <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
                    <Route path="/returns-policy" element={<ReturnsPolicyPage />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/offers" element={<OffersPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>

                  {/* Admin Routes */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="categories" element={<AdminCategories />} />
                    <Route path="collections" element={<AdminCollections />} />
                    <Route path="discounts" element={<AdminDiscounts />} />
                    <Route path="inventory" element={<AdminInventory />} />
                    <Route path="customers" element={<AdminCustomers />} />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route path="audit" element={<AdminAuditLogs />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </CartProvider>
          </WishlistProvider>
        </SettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
