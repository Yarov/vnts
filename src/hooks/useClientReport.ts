import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';

interface ClientStats {
  id: string;
  name: string;
  reference: string | null;
  total_purchases: number;
  total_spent: number;
  average_ticket: number;
  last_purchase: string | null;
  first_purchase: string | null;
  favorite_products: Array<{
    product_name: string;
    quantity: number;
    total: number;
  }>;
  payment_methods: Record<string, number>;
}

interface DateFilter {
  startDate: string;
  endDate: string;
}

export function useClientReport() {
  const [clients, setClients] = useState<ClientStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>({ startDate: '', endDate: '' });

  const fetchClientStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('sales')
        .select(`
          id,
          created_at,
          total,
          client_id,
          payment_method:payment_methods(name),
          items:sale_items(
            quantity,
            subtotal,
            product:products(name)
          )
        `);

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

      // Obtener clientes
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*');

      if (clientsError) throw clientsError;

      // Procesar estadísticas por cliente
      const clientStats = new Map<string, ClientStats>();

      // Inicializar estadísticas para todos los clientes
      clientsData.forEach((client: any) => {
        clientStats.set(client.id, {
          id: client.id,
          name: client.name,
          reference: client.reference,
          total_purchases: 0,
          total_spent: 0,
          average_ticket: 0,
          last_purchase: null,
          first_purchase: null,
          favorite_products: [],
          payment_methods: {}
        });
      });

      // Procesar ventas
      const productStats = new Map<string, Map<string, { quantity: number; total: number }>>();

      salesData?.forEach((sale: any) => {
        if (!sale.client_id) return;

        const clientStat = clientStats.get(sale.client_id);
        if (!clientStat) return;

        // Actualizar estadísticas básicas
        clientStat.total_purchases++;
        clientStat.total_spent += sale.total;

        // Actualizar fechas
        const saleDate = sale.created_at;
        if (!clientStat.first_purchase || saleDate < clientStat.first_purchase) {
          clientStat.first_purchase = saleDate;
        }
        if (!clientStat.last_purchase || saleDate > clientStat.last_purchase) {
          clientStat.last_purchase = saleDate;
        }

        // Actualizar métodos de pago
        const paymentMethod = sale.payment_method?.name || 'Efectivo';
        clientStat.payment_methods[paymentMethod] = (clientStat.payment_methods[paymentMethod] || 0) + 1;

        // Actualizar productos favoritos
        if (!productStats.has(sale.client_id)) {
          productStats.set(sale.client_id, new Map());
        }
        const clientProducts = productStats.get(sale.client_id)!;

        sale.items?.forEach((item: any) => {
          const productName = item.product?.name || 'Producto eliminado';
          const current = clientProducts.get(productName) || { quantity: 0, total: 0 };
          clientProducts.set(productName, {
            quantity: current.quantity + item.quantity,
            total: current.total + item.subtotal
          });
        });
      });

      // Calcular promedios y productos favoritos
      clientStats.forEach(client => {
        client.average_ticket = client.total_purchases > 0
          ? client.total_spent / client.total_purchases
          : 0;

        const clientProducts = productStats.get(client.id);
        if (clientProducts) {
          client.favorite_products = Array.from(clientProducts.entries())
            .map(([name, stats]) => ({
              product_name: name,
              quantity: stats.quantity,
              total: stats.total
            }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);
        }
      });

      setClients(Array.from(clientStats.values()));
    } catch (error) {
      console.error('Error al cargar estadísticas de clientes:', error);
      setError('Error al cargar los datos. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClientStats();
  }, [dateFilter]);

  const filteredClients = useMemo(() => {
    const searchLower = searchTerm.toLowerCase().trim();

    return clients.filter(client => {
      const nameMatch = client.name.toLowerCase().includes(searchLower);
      const referenceMatch = client.reference?.toLowerCase()?.includes(searchLower) || false;
      const totalMatch = client.total_spent.toString().includes(searchLower);
      const productsMatch = client.favorite_products.some(p =>
        p.product_name.toLowerCase().includes(searchLower)
      );

      return !searchLower || nameMatch || referenceMatch || totalMatch || productsMatch;
    });
  }, [clients, searchTerm]);

  const calculateTotals = useMemo(() => {
    return {
      total_clients: filteredClients.length,
      total_revenue: filteredClients.reduce((sum, c) => sum + c.total_spent, 0),
      total_purchases: filteredClients.reduce((sum, c) => sum + c.total_purchases, 0),
      average_ticket: filteredClients.length > 0
        ? filteredClients.reduce((sum, c) => sum + c.total_spent, 0) /
          filteredClients.reduce((sum, c) => sum + c.total_purchases, 0)
        : 0,
      payment_methods: filteredClients.reduce((acc, client) => {
        Object.entries(client.payment_methods).forEach(([method, count]) => {
          acc[method] = (acc[method] || 0) + count;
        });
        return acc;
      }, {} as Record<string, number>),
      active_clients: filteredClients.filter(c => c.last_purchase).length,
      inactive_clients: filteredClients.filter(c => !c.last_purchase).length
    };
  }, [filteredClients]);

  return {
    clients: filteredClients,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    dateFilter,
    setDateFilter,
    totals: calculateTotals,
    refreshData: fetchClientStats
  };
}

export type { ClientStats, DateFilter };