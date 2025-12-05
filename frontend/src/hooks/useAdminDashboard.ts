import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { userAtom } from '../store/auth';
import { getDashboardData } from '../services/dashboardService';
import { getAllBranches } from '../services/branchService';
import { formatCurrency, formatDate, formatDayMonthLong } from '../utils/formatters';
import { Database } from '../types/database.types';

type Branch = Database['public']['Tables']['branches']['Row'];

export function useAdminDashboard() {
  const [user] = useAtom(userAtom);
  const [isLoading, setIsLoading] = useState(true);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [salesSummary, setSalesSummary] = useState({
    totalSales: 0,
    dailySales: 0,
    weeklySales: 0,
    productCount: 0,
    dailyChange: { value: 0, isPositive: true },
    weeklyChange: { value: 0, isPositive: true }
  });
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [sellerCommissions, setSellerCommissions] = useState<any[]>([]);
  const [topClients, setTopClients] = useState<any[]>([]);
  const [paymentMethodSales, setPaymentMethodSales] = useState<any[]>([]);

  // Obtener el día actual formateado
  const currentDay = formatDayMonthLong(new Date());

  // Cargar sucursales
  useEffect(() => {
    const fetchBranches = async () => {
      if (!user?.organizationId) return;
      try {
        const data = await getAllBranches(user.organizationId);
        // Filtrar sucursales activas y excluir la default (PRINCIPAL)
        const activeBranches = data.filter(b => b.active && b.code !== 'PRINCIPAL');
        setBranches(activeBranches);
      } catch (error) {
        console.error('Error al cargar sucursales:', error);
      }
    };
    fetchBranches();
  }, [user?.organizationId]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.organizationId) return;
      
      setIsLoading(true);
      try {
        const branchFilter = selectedBranchId !== 'all' ? selectedBranchId : undefined;
        const dashboardData = await getDashboardData(user.organizationId, branchFilter);
        setSalesSummary(dashboardData.salesSummary);
        setTopProducts(dashboardData.topProducts || []);
        setSellerCommissions(dashboardData.sellerCommissions || []);
        setTopClients(dashboardData.topClients || []);
        setPaymentMethodSales(dashboardData.paymentMethodSales || []);
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [user?.organizationId, selectedBranchId]);

  return {
    isLoading,
    salesSummary,
    topProducts,
    sellerCommissions,
    topClients,
    paymentMethodSales,
    branches,
    selectedBranchId,
    setSelectedBranchId,
    currentDay,
    formatCurrency,
    formatDate
  };
}