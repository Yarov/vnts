import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAtom } from 'jotai';
import { userAtom } from '../store/auth';
import { getAllSales } from '../services/salesService';
import { getSellerById } from '../services/sellerService';
import { formatDayMonthLong } from '../utils/formatters';
import { getTodayForAPI } from '../utils/dateUtils';
import api from '../services/api';

export function useSellerDashboard() {
  const [user, setUser] = useAtom(userAtom);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [salesSummary, setSalesSummary] = useState({
    todaySalesCount: 0,
    todaySalesAmount: 0,
    weekSalesCount: 0,
    weekSalesAmount: 0,
    dailyChange: { value: 0, isPositive: true },
    commission: 0,
    commissionPercentage: 0,
    totalPaymentMethodCommission: 0,
    netAmount: 0
  });
  const [paymentMethodsData, setPaymentMethodsData] = useState<any[]>([]);
  const [name, setName] = useState(user?.name || '');

  // Día actual formateado
  const currentDay = formatDayMonthLong(new Date());

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
    // eslint-disable-next-line
  }, [user?.id, user?.activeBranchId]);

  // Refresca el nombre del vendedor desde la DB
  useEffect(() => {
    const fetchSellerName = async () => {
      if (user?.id) {
        const seller = await getSellerById(user.id);
        if (seller?.name && seller.name !== user.name) {
          setName(seller.name);
          setUser({ ...user, name: seller.name });
        } else if (seller?.name) {
          setName(seller.name);
        }
      }
    };
    fetchSellerName();
    // eslint-disable-next-line
  }, [user?.id]);

  // Extraer orgSlug de la URL actual
  const getOrgSlug = () => {
    const pathParts = location.pathname.split('/');
    // Si la URL es /:orgSlug/seller/..., el slug está en pathParts[1]
    if (pathParts.length > 1 && pathParts[1] && pathParts[1] !== 'seller') {
      return pathParts[1];
    }
    return null;
  };

  const goToNewSale = () => {
    const orgSlug = getOrgSlug();
    if (orgSlug) {
      navigate(`/${orgSlug}/seller/new-sale`);
    } else {
      navigate('/seller/new-sale');
    }
  };

  const handleLogout = () => {
    setUser(null);
    const orgSlug = getOrgSlug();
    if (orgSlug) {
      navigate(`/${orgSlug}/seller`);
    } else {
      navigate('/seller');
    }
  };

  const fetchDashboardData = async () => {
    if (!user?.id || !user?.organizationId) return;
    setIsLoading(true);
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);

      // Obtener ventas del vendedor (pasando seller_id al backend)
      const salesData = await getAllSales(user.organizationId, user.id, true);

      // Si hay sucursal activa, filtrar las ventas por esa sucursal
      // (El backend ya debería filtrar por seller_id)
      const filteredSales = user.activeBranchId 
        ? (salesData || []).filter((sale: any) => 
            sale.branch_id === user.activeBranchId || sale.branch === user.activeBranchId
          )
        : (salesData || []);

      const todaySales = filteredSales.filter((sale: any) => new Date(sale.created_at) >= today);
      const yesterdaySales = filteredSales.filter((sale: any) => new Date(sale.created_at) >= yesterday && new Date(sale.created_at) < today);
      const weekSales = filteredSales.filter((sale: any) => new Date(sale.created_at) >= lastWeek);

      const todaySalesAmount = todaySales.reduce((sum: number, sale: any) => sum + parseFloat(sale.total), 0);
      const yesterdaySalesAmount = yesterdaySales.reduce((sum: number, sale: any) => sum + parseFloat(sale.total), 0);
      const weekSalesAmount = weekSales.reduce((sum: number, sale: any) => sum + parseFloat(sale.total), 0);

      const dailyChange = yesterdaySalesAmount === 0
        ? { value: 100, isPositive: true }
        : {
            value: Math.round((todaySalesAmount - yesterdaySalesAmount) / yesterdaySalesAmount * 100 * 10) / 10,
            isPositive: todaySalesAmount >= yesterdaySalesAmount
          };

      // Obtener comisiones del vendedor (calculado en backend)
      let commissionData: any = null;
      try {
        const commissionsParams: any = { 
          organization_id: user.organizationId,
          seller_id: user.id,
          date: getTodayForAPI()
        };
        
        // Agregar filtro de sucursal si existe
        if (user.activeBranchId) {
          commissionsParams.branch_id = user.activeBranchId;
        }
        
        const commissionsResponse = await api.get('/sales/seller_commissions/', {
          params: commissionsParams
        });
        const commissions = commissionsResponse.data || [];
        commissionData = commissions.find((c: any) => c.seller_id === user.id);
      } catch (error) {
        console.error('Error al obtener comisiones:', error);
      }

      const commissionPercentage = commissionData?.commission_percentage || 0;
      const todayCommission = commissionData?.commission_amount || 0;
      const totalPaymentMethodCommission = commissionData?.payment_method_commission || 0;
      const netAmount = commissionData?.net_amount || todaySalesAmount;

      // Obtener ventas por método de pago (calculado en backend)
      let paymentMethodSales: any[] = [];
      try {
        const paymentParams: any = { 
          organization_id: user.organizationId,
          seller_id: user.id
        };
        
        // Agregar filtro de sucursal si existe
        if (user.activeBranchId) {
          paymentParams.branch_id = user.activeBranchId;
        }
        
        const paymentResponse = await api.get('/sales/by_payment_method/', {
          params: paymentParams
        });
        paymentMethodSales = paymentResponse.data || [];
      } catch (error) {
        console.error('Error al obtener ventas por método de pago:', error);
      }

      // Formatear datos para el componente
      const methodsArray = paymentMethodSales.map((method: any) => ({
        id: method.payment_method__id,
        name: method.payment_method__name,
        total: method.total,
        commission: method.commission,
        commissionPercentage: method.commissionPercentage,
        netAmount: method.netAmount,
        count: method.count
      }));
      
      setPaymentMethodsData(methodsArray);
      setSalesSummary({
        todaySalesCount: todaySales.length,
        todaySalesAmount,
        weekSalesCount: weekSales.length,
        weekSalesAmount,
        dailyChange,
        commission: todayCommission,
        commissionPercentage,
        totalPaymentMethodCommission,
        netAmount
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
    handleLogout,
    name: name || 'Vendedor',
  };
}
