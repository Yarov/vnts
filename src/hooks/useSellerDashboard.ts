import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { userAtom } from '../store/auth';
import { supabase } from '../lib/supabase';
import { formatDayMonthLong } from '../utils/formatters';

export function useSellerDashboard() {
  const [user, setUser] = useAtom(userAtom);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [salesSummary, setSalesSummary] = useState({
    todaySalesCount: 0,
    todaySalesAmount: 0,
    weekSalesCount: 0,
    weekSalesAmount: 0,
    dailyChange: { value: 0, isPositive: true },
    commission: 0,
    commissionPercentage: 0
  });
  const [paymentMethodsData, setPaymentMethodsData] = useState<any[]>([]);

  // Día actual formateado
  const currentDay = formatDayMonthLong(new Date());

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
    // eslint-disable-next-line
  }, [user]);

  const goToNewSale = () => {
    navigate('/seller/new-sale');
  };

  const handleLogout = () => {
    setUser(null);
    navigate('/seller-login');
  };

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayStr = today.toISOString();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString();
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);
      const lastWeekStr = lastWeek.toISOString();

      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('id, total, created_at')
        .eq('seller_id', user?.id)
        .order('created_at', { ascending: false });
      if (salesError) throw salesError;

      const todaySales = (salesData || []).filter(sale => sale.created_at >= todayStr);
      const yesterdaySales = (salesData || []).filter(sale => sale.created_at >= yesterdayStr && sale.created_at < todayStr);
      const weekSales = (salesData || []).filter(sale => sale.created_at >= lastWeekStr);

      const todaySalesAmount = todaySales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
      const yesterdaySalesAmount = yesterdaySales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
      const weekSalesAmount = weekSales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);

      const dailyChange = yesterdaySalesAmount === 0
        ? { value: 100, isPositive: true }
        : {
            value: Math.round((todaySalesAmount - yesterdaySalesAmount) / yesterdaySalesAmount * 100 * 10) / 10,
            isPositive: todaySalesAmount >= yesterdaySalesAmount
          };

      const { data: sellerData, error: sellerError } = await supabase
        .from('sellers')
        .select('commission_percentage')
        .eq('id', user?.id)
        .single();
      if (sellerError) throw sellerError;

      const commissionPercentage = sellerData?.commission_percentage || 0;
      const todayCommission = todaySalesAmount * (commissionPercentage / 100);

      const { data: paymentMethodsResult, error: paymentMethodsError } = await supabase
        .from('sales')
        .select(`
          id,
          total,
          created_at,
          payment_method:payment_methods!sales_payment_method_id_fkey (
            id,
            name
          )
        `)
        .eq('seller_id', user?.id)
        .gte('created_at', todayStr);
      if (paymentMethodsError) throw paymentMethodsError;

      console.log('Datos de métodos de pago:', paymentMethodsResult);

      const methodsMap = new Map();
      (paymentMethodsResult || []).forEach((sale: any) => {
        const paymentMethod = sale.payment_method;
        if (!paymentMethod) {
          console.log('Venta sin método de pago:', sale);
          return;
        }

        const methodId = paymentMethod.id;
        const methodName = paymentMethod.name;
        const total = parseFloat(sale.total);
        if (methodsMap.has(methodId)) {
          const current = methodsMap.get(methodId);
          methodsMap.set(methodId, {
            ...current,
            total: current.total + total,
            count: current.count + 1
          });
        } else {
          methodsMap.set(methodId, {
            id: methodId,
            name: methodName,
            total: total,
            count: 1
          });
        }
      });

      const methodsArray = Array.from(methodsMap.values());
      console.log('Métodos de pago procesados:', methodsArray);
      setPaymentMethodsData(methodsArray);
      setSalesSummary({
        todaySalesCount: todaySales.length,
        todaySalesAmount,
        weekSalesCount: weekSales.length,
        weekSalesAmount,
        dailyChange,
        commission: todayCommission,
        commissionPercentage
      });
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    salesSummary,
    paymentMethodsData,
    isLoading,
    currentDay,
    goToNewSale,
    handleLogout
  };
}
