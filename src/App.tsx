import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { userAtom } from './store/auth';
import { supabase } from './lib/supabase';
import ThemeProvider from './components/ThemeProvider';

// Layout Components
import AdminLayout from './components/layouts/AdminLayout';
import SimplifiedSellerLayout from './components/layouts/SimplifiedSellerLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import SellerLoginPage from './pages/auth/SellerLoginPage';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import ProductsPage from './pages/admin/Products';
import SellersPage from './pages/admin/Sellers';
import ClientsPage from './pages/admin/Clients';
import ReportsPage from './pages/admin/Reports';
import PaymentMethodsPage from './pages/admin/PaymentMethods';
import SettingsPage from './pages/admin/Settings';

// Seller Pages
import SellerDashboard from './pages/seller/Dashboard';
import NewSalePage from './pages/seller/NewSale';
import SalesHistoryPage from './pages/seller/SalesHistory';

function App() {
  const [user, setUser] = useAtom(userAtom);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error checking session:', error);
        setLoading(false);
        return;
      }

      if (data?.session) {
        setUser({
          id: data.session.user.id,
          email: data.session.user.email || '',
          role: 'admin', // Default role for authenticated user
        });
      }

      setLoading(false);
    };

    // If we don't have a user in localStorage, check Supabase session
    if (!user) {
      checkSession();
    } else {
      setLoading(false);
    }

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            role: 'admin',
          });
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [setUser, user]);

  // Function to handle seller login
  const handleSellerLogin = (sellerId: string, sellerName: string) => {
    setUser({
      id: sellerId,
      email: sellerName,
      role: 'seller'
    });
  };

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
        {/* Auth Routes */}
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to={isAdmin ? "/admin" : "/seller"} />} />
        <Route
          path="/seller-login"
          element={!isAuthenticated ? <SellerLoginPage onLogin={handleSellerLogin} /> : <Navigate to="/seller" />}
        />

        {/* Admin Routes */}
        <Route path="/admin" element={isAdmin ? <AdminLayout /> : <Navigate to={isSeller ? "/seller" : "/login"} />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="sellers" element={<SellersPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="payment-methods" element={<PaymentMethodsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Seller Routes */}
        <Route path="/seller" element={isSeller ? <SimplifiedSellerLayout /> : <Navigate to={isAdmin ? "/admin" : "/seller-login"} />}>
          <Route index element={<SellerDashboard />} />
          <Route path="new-sale" element={<NewSalePage />} />
          <Route path="sales-history" element={<SalesHistoryPage />} />
        </Route>

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to={isAuthenticated ? (isAdmin ? "/admin" : "/seller") : "/seller-login"} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
