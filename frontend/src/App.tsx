import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { userAtom } from './store/auth';
import { getCurrentUser } from './services/authService';
import ThemeProvider from './components/ThemeProvider';

// Layout Components
import AdminLayout from './components/layouts/AdminLayout';
import SimplifiedSellerLayout from './components/layouts/SimplifiedSellerLayout';

// Auth Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import OrgLoginPage from './pages/auth/OrgLoginPage';
import OrgSellerLoginPage from './pages/auth/OrgSellerLoginPage';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import ProductsPage from './pages/admin/Products';
import SellersPage from './pages/admin/Sellers';
import ClientsPage from './pages/admin/Clients';
import BranchesPage from './pages/admin/Branches';
import ReportsPage from './pages/admin/Reports';
import PaymentMethodsPage from './pages/admin/PaymentMethods';
import SettingsPage from './pages/admin/Settings';
import Commissions from './pages/admin/Commissions';
import TopProducts from './pages/admin/TopProducts';

// Seller Pages
import SellerDashboard from './pages/seller/Dashboard';
import NewSalePage from './pages/seller/NewSale';
import SalesHistoryPage from './pages/seller/SalesHistory';

function App() {
  const [user, setUser] = useAtom(userAtom);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session with Django backend
    const checkSession = async () => {
      const token = localStorage.getItem('access_token');
      
      if (token && !user) {
        const userData = await getCurrentUser();
        if (userData) {
          setUser(userData);
        }
      }
      
      setLoading(false);
    };

    checkSession();
  }, [user, setUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    );
  }

  // Determinar si el usuario está autenticado y su rol
  const isAuthenticated = !!user;
  const isAdmin = isAuthenticated && user.role === 'admin';
  const isSeller = isAuthenticated && user.role === 'seller';

  return (
    <ThemeProvider>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Global Auth Routes (sin organización) */}
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to={isAdmin ? "/admin" : "/seller"} />} />
        <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to={isAdmin ? "/admin" : "/seller"} />} />

        {/* Organization-specific Auth Routes */}
        <Route path="/:orgSlug/login" element={<OrgLoginPage />} />

        {/* Organization-specific Admin Routes */}
        <Route path="/:orgSlug/admin" element={isAdmin ? <AdminLayout /> : <Navigate to="/login" />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="sellers" element={<SellersPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="branches" element={<BranchesPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="payment-methods" element={<PaymentMethodsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="commissions" element={<Commissions />} />
          <Route path="top-products" element={<TopProducts />} />
        </Route>

        {/* Organization-specific Seller Routes */}
        <Route path="/:orgSlug/seller" element={isSeller ? <SimplifiedSellerLayout /> : <OrgSellerLoginPage />}>
          <Route index element={<SellerDashboard />} />
          <Route path="new-sale" element={<NewSalePage />} />
          <Route path="sales-history" element={<SalesHistoryPage />} />
        </Route>

        {/* Legacy Routes (sin slug) - mantener compatibilidad */}
        <Route path="/admin" element={isAdmin ? <AdminLayout /> : <Navigate to={isSeller ? "/seller" : "/login"} />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="sellers" element={<SellersPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="branches" element={<BranchesPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="payment-methods" element={<PaymentMethodsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="commissions" element={<Commissions />} />
          <Route path="top-products" element={<TopProducts />} />
        </Route>

        <Route path="/seller" element={isSeller ? <SimplifiedSellerLayout /> : <Navigate to="/login" />}>
          <Route index element={<SellerDashboard />} />
          <Route path="new-sale" element={<NewSalePage />} />
          <Route path="sales-history" element={<SalesHistoryPage />} />
        </Route>

        {/* Default Redirect - Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
