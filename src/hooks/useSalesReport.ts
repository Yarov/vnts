import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';

interface SaleStats {
  id: string;
  created_at: string;
  total: number;
  client: {
    id: string;
    name: string;
  } | null;
  seller: {
    id: string;
    name: string;
  };
  payment_method: {
    id: string;
    name: string;
  };
  items: Array<{
    id: string;
    product_name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
}

interface DateFilter {
  startDate: string;
  endDate: string;
}

export function useSalesReport() {
  const [sales, setSales] = useState<SaleStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>({ startDate: '', endDate: '' });

  const fetchSalesStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('sales')
        .select(`
          id,
          created_at,
          total,
          client:clients(id, name),
          seller:sellers(id, name),
          payment_method:payment_methods(id, name),
          items:sale_items(
            id,
            product:products(name),
            quantity,
            price,
            subtotal
          )
        `)
        .order('created_at', { ascending: false });

      // Aplicar filtros de fecha si están presentes
      if (dateFilter.startDate) {
        query = query.gte('created_at', dateFilter.startDate);
      }
      if (dateFilter.endDate) {
        // Ajustar la fecha final al final del día
        const endDate = new Date(dateFilter.endDate);
        endDate.setHours(23, 59, 59, 999);
        query = query.lte('created_at', endDate.toISOString());
      }

      const { data: salesData, error: salesError } = await query;

      if (salesError) throw salesError;

      // Transformar los datos para que coincidan con el tipo SaleStats
      const transformedSales = (salesData || []).map((sale: any) => ({
        id: sale.id,
        created_at: sale.created_at,
        total: sale.total,
        client: sale.client,
        seller: sale.seller || { id: 'unknown', name: 'Desconocido' },
        payment_method: sale.payment_method || { id: 'cash', name: 'Efectivo' },
        items: sale.items.map((item: any) => ({
          id: item.id,
          product_name: item.product?.name || 'Producto eliminado',
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal
        }))
      }));

      setSales(transformedSales);
    } catch (error) {
      console.error('Error al cargar ventas:', error);
      setError('Error al cargar los datos. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesStats();
  }, [dateFilter]);

  const filteredSales = useMemo(() => {
    const searchLower = searchTerm.toLowerCase().trim();

    return sales.filter(sale => {
      const clientMatch = sale.client?.name?.toLowerCase().includes(searchLower) || false;
      const sellerMatch = sale.seller?.name?.toLowerCase().includes(searchLower) || false;
      const totalMatch = sale.total.toString().includes(searchLower);
      const methodMatch = sale.payment_method?.name?.toLowerCase().includes(searchLower) || false;
      const productsMatch = sale.items.some(item =>
        item.product_name.toLowerCase().includes(searchLower)
      );

      return !searchLower || clientMatch || sellerMatch || totalMatch || methodMatch || productsMatch;
    });
  }, [sales, searchTerm]);

  const calculateTotals = useMemo(() => {
    return {
      total_sales: filteredSales.length,
      total_revenue: filteredSales.reduce((sum, s) => sum + s.total, 0),
      total_items: filteredSales.reduce((sum, s) => sum + s.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0),
      average_ticket: filteredSales.length > 0
        ? filteredSales.reduce((sum, s) => sum + s.total, 0) / filteredSales.length
        : 0,
      payment_methods: filteredSales.reduce((acc, sale) => {
        const method = sale.payment_method.name;
        acc[method] = (acc[method] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      top_sellers: Object.entries(
        filteredSales.reduce((acc, sale) => {
          const seller = sale.seller.name;
          acc[seller] = (acc[seller] || 0) + sale.total;
          return acc;
        }, {} as Record<string, number>)
      ).sort(([,a], [,b]) => b - a).slice(0, 5)
    };
  }, [filteredSales]);

  return {
    sales: filteredSales,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    dateFilter,
    setDateFilter,
    totals: calculateTotals,
    refreshData: fetchSalesStats
  };
}

export type { SaleStats, DateFilter };