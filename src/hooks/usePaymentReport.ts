import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';

interface PaymentMethod {
  id: string;
  name: string;
}

interface Payment {
  id: string;
  created_at: string;
  amount: number;
  method: PaymentMethod;
  reference: string | null;
  status: 'completed' | 'pending' | 'failed';
  sale_id: string;
  client_name: string;
  seller_name: string;
  notes: string | null;
}

interface DateFilter {
  startDate: string;
  endDate: string;
}

interface MainMethod {
  name: string;
  total: number;
  percentage: number;
}

interface PaymentTotals {
  total_revenue: number;
  total_transactions: number;
  main_method: MainMethod;
  daily_average: number;
  active_methods: number;
  average_ticket: number;
  average_ticket_change: number;
  success_rate: number;
  successful_transactions: number;
  payment_methods: Record<string, number>;
}

export function usePaymentReport() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>(() => {
    // Establecer fechas iniciales al mes actual
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return {
      startDate: firstDay.toISOString().split('T')[0],
      endDate: lastDay.toISOString().split('T')[0]
    };
  });

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('sales')
        .select(`
          id,
          created_at,
          total,
          payment_method:payment_methods!sales_payment_method_id_fkey(id, name),
          payment_reference,
          payment_status,
          client:clients(name),
          seller:sellers(name)
        `);

      // Aplicar filtros de fecha si están presentes
      if (dateFilter.startDate) {
        query = query.gte('created_at', dateFilter.startDate);
      }
      if (dateFilter.endDate) {
        const endDate = new Date(dateFilter.endDate);
        endDate.setHours(23, 59, 59, 999);
        query = query.lte('created_at', endDate.toISOString());
      }

      const { data: salesData, error: salesError } = await query;

      if (salesError) {
        throw salesError;
      }

      if (!salesData) {
        setPayments([]);
        return;
      }

      // Transformar los datos
      const transformedPayments: Payment[] = salesData.map((sale: any) => ({
        id: sale.id,
        created_at: sale.created_at,
        amount: sale.total,
        method: sale.payment_method || {
          id: 'default',
          name: 'Efectivo'
        },
        reference: sale.payment_reference,
        status: sale.payment_status || 'completed',
        sale_id: sale.id,
        client_name: sale.client?.name || 'Cliente no registrado',
        seller_name: sale.seller?.name || 'Vendedor no registrado',
        notes: null
      }));

      setPayments(transformedPayments);
    } catch (error: any) {
      console.error('Error al cargar pagos:', error);
      setError('Error al cargar los datos. Por favor, intenta de nuevo.');
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [dateFilter.startDate, dateFilter.endDate]);

  const filteredPayments = useMemo(() => {
    const searchLower = searchTerm.toLowerCase().trim();

    return payments.filter(payment => {
      if (!searchLower) return true;

      const methodMatch = payment.method.name.toLowerCase().includes(searchLower);
      const referenceMatch = payment.reference?.toLowerCase()?.includes(searchLower) || false;
      const amountMatch = payment.amount.toString().includes(searchLower);
      const clientMatch = payment.client_name.toLowerCase().includes(searchLower);
      const sellerMatch = payment.seller_name.toLowerCase().includes(searchLower);

      return methodMatch || referenceMatch || amountMatch || clientMatch || sellerMatch;
    });
  }, [payments, searchTerm]);

  const calculateTotals = useMemo((): PaymentTotals => {
    const total_revenue = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
    const total_transactions = filteredPayments.length;

    // Calcular métodos de pago
    const methodCounts: Record<string, number> = {};
    const methodTotals: Record<string, number> = {};
    filteredPayments.forEach(payment => {
      const methodName = payment.method.name;
      methodCounts[methodName] = (methodCounts[methodName] || 0) + 1;
      methodTotals[methodName] = (methodTotals[methodName] || 0) + payment.amount;
    });

    // Encontrar el método principal
    let mainMethod: MainMethod = {
      name: 'Sin datos',
      total: 0,
      percentage: 0
    };

    if (Object.keys(methodTotals).length > 0) {
      const [topMethodName, topMethodTotal] = Object.entries(methodTotals)
        .sort(([,a], [,b]) => b - a)[0];
      mainMethod = {
        name: topMethodName,
        total: topMethodTotal,
        percentage: (topMethodTotal / total_revenue) * 100
      };
    }

    // Calcular promedio diario
    const dates = new Set(filteredPayments.map(p => p.created_at.split('T')[0]));
    const daily_average = total_revenue / (dates.size || 1);

    // Calcular ticket promedio y cambio
    const average_ticket = total_revenue / (total_transactions || 1);
    const prevAverage = 0; // TODO: Implementar cálculo del promedio anterior
    const average_ticket_change = prevAverage ? ((average_ticket - prevAverage) / prevAverage) * 100 : 0;

    // Calcular tasa de éxito
    const successful_transactions = filteredPayments.filter(p => p.status === 'completed').length;
    const success_rate = (successful_transactions / total_transactions) * 100 || 0;

    return {
      total_revenue,
      total_transactions,
      main_method: mainMethod,
      daily_average,
      active_methods: Object.keys(methodCounts).length,
      average_ticket,
      average_ticket_change,
      success_rate,
      successful_transactions,
      payment_methods: methodCounts
    };
  }, [filteredPayments]);

  return {
    payments: filteredPayments,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    dateFilter,
    setDateFilter,
    totals: calculateTotals,
    refreshData: fetchPayments
  };
}

export type { Payment, PaymentTotals, DateFilter };