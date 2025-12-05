import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { userAtom } from '../store/auth';
import { getAllSales } from '../services/salesService';
import { getAllPaymentMethods } from '../services/paymentMethodService';
import { getAllClients } from '../services/clientService';
import { Database } from '../types/database.types';
import { formatDayMonthLong, formatDate } from '../utils/formatters';

type Sale = Database['public']['Tables']['sales']['Row'];
type PaymentMethod = Database['public']['Tables']['payment_methods']['Row'];
type Client = Database['public']['Tables']['clients']['Row'];
export type SaleItem = Database['public']['Tables']['sale_items']['Row'] & {
  product_name?: string;
};

export interface SaleWithDetails extends Sale {
  client_name?: string;
  payment_method_name?: string;
  formatted_date?: string;
  items?: SaleItem[];
}

export function useSellerSalesHistory() {
  const [user] = useAtom(userAtom);
  const [sales, setSales] = useState<SaleWithDetails[]>([]);
  const [filteredSales, setFilteredSales] = useState<SaleWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentSale, setCurrentSale] = useState<SaleWithDetails | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  const currentDay = formatDayMonthLong(new Date());

  useEffect(() => {
    if (user?.id) {
      fetchSalesHistory();
      fetchPaymentMethods();
      fetchClients();
    }
    // eslint-disable-next-line
  }, [user]);

  const fetchSalesHistory = async () => {
    if (!user?.id || !user?.organizationId) return;
    setIsLoading(true);
    try {
      const salesData = await getAllSales(user.organizationId, user.id);
      
      const formattedSales: SaleWithDetails[] = (salesData || []).map((sale: any) => ({
        ...sale,
        seller_id: sale.seller,
        client_name: sale.client_name || 'Sin cliente',
        payment_method_name: sale.payment_method_name || 'Desconocido',
        formatted_date: formatDate(sale.created_at, 'dd/MM/yyyy HH:mm'),
      }));
      setSales(formattedSales);
      setFilteredSales(formattedSales);
    } catch (error) {
      console.error('Error al cargar historial de ventas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPaymentMethods = async () => {
    if (!user?.organizationId) return;
    try {
      const data = await getAllPaymentMethods(user.organizationId);
      setPaymentMethods(data || []);
    } catch (error) {
      console.error('Error al cargar métodos de pago:', error);
    }
  };

  const fetchClients = async () => {
    if (!user?.organizationId) return;
    try {
      const data = await getAllClients(user.organizationId);
      setClients(data || []);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    }
  };

  const viewSaleDetails = async (sale: SaleWithDetails) => {
    setCurrentSale(sale);
    try {
      // Los items ya vienen en la venta desde Django
      const formattedItems: SaleItem[] = (sale.items || []).map((item: any) => ({
        ...item,
        sale_id: sale.id,
        product_name: item.product_name || 'Producto desconocido',
      }));
      setCurrentSale({
        ...sale,
        items: formattedItems,
      });
    } catch (error) {
      console.error('Error al cargar detalles de venta:', error);
    } finally {
      setIsDetailModalOpen(true);
    }
  };

  return {
    sales,
    filteredSales,
    setFilteredSales,
    isLoading,
    isDetailModalOpen,
    setIsDetailModalOpen,
    currentSale,
    setCurrentSale,
    paymentMethods,
    clients,
    currentDay,
    viewSaleDetails
  };
}
