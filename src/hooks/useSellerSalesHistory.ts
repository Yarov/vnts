import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { userAtom } from '../store/auth';
import { supabase } from '../lib/supabase';
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
    setIsLoading(true);
    try {
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('id, total, created_at, payment_method_id, client_id, notes')
        .eq('seller_id', user?.id)
        .order('created_at', { ascending: false });
      if (salesError) throw salesError;
      const clientIds = [...new Set((salesData || []).map(s => s.client_id).filter(Boolean))];
      const paymentMethodIds = [...new Set((salesData || []).map(s => s.payment_method_id))];
      const [clientsResponse, paymentMethodsResponse] = await Promise.all([
        supabase.from('clients').select('id, name').in('id', clientIds),
        supabase.from('payment_methods').select('id, name').in('id', paymentMethodIds)
      ]);
      const clientsMap: Record<string, string> = (clientsResponse.data || []).reduce((acc: Record<string, string>, client: any) => {
        acc[client.id] = client.name;
        return acc;
      }, {});
      const paymentMethodsMap: Record<string, string> = (paymentMethodsResponse.data || []).reduce((acc: Record<string, string>, pm: any) => {
        acc[pm.id] = pm.name;
        return acc;
      }, {});
      const formattedSales: SaleWithDetails[] = (salesData || []).map((sale: any) => ({
        ...sale,
        seller_id: sale.seller_id,
        client_name: sale.client_id ? clientsMap[sale.client_id] : 'Sin cliente',
        payment_method_name: paymentMethodsMap[sale.payment_method_id] || 'Desconocido',
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
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .order('name');
      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (error) {
      console.error('Error al cargar métodos de pago:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');
      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    }
  };

  const viewSaleDetails = async (sale: SaleWithDetails) => {
    setCurrentSale(sale);
    try {
      const { data: itemsData, error: itemsError } = await supabase
        .from('sale_items')
        .select(`
          id, quantity, price, subtotal, product_id,
          products(name)
        `)
        .eq('sale_id', sale.id);
      if (itemsError) throw itemsError;
      const formattedItems: SaleItem[] = (itemsData || []).map((item: any) => ({
        ...item,
        sale_id: item.sale_id,
        product_name: item.products?.name || 'Producto desconocido',
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
