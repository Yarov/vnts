import { lazy } from 'react';
import { Route } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';

const Dashboard = lazy(() => import('../pages/admin/Dashboard'));
const Products = lazy(() => import('../pages/admin/Products'));
const Sales = lazy(() => import('../pages/admin/Sales'));
const Sellers = lazy(() => import('../pages/admin/Sellers'));
const Clients = lazy(() => import('../pages/admin/Clients'));
const Reports = lazy(() => import('../pages/admin/Reports'));
const Settings = lazy(() => import('../pages/admin/Settings'));

export const adminRoutes = (
  <Route path="/admin" element={<AdminLayout />}>
    <Route index element={<Dashboard />} />
    <Route path="products" element={<Products />} />
    <Route path="sales" element={<Sales />} />
    <Route path="sellers" element={<Sellers />} />
    <Route path="clients" element={<Clients />} />
    <Route path="reports" element={<Reports />} />
    <Route path="settings" element={<Settings />} />
  </Route>
);