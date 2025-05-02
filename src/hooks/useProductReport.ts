import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';

interface ProductStats {
  id: string;
  name: string;
  total_sales: number;
  total_quantity: number;
  total_revenue: number;
  average_price: number;
  last_sale: string | null;
  category: string | null;
}

interface DateFilter {
  startDate: string;
  endDate: string;
}

export function useProductReport() {
  const [products, setProducts] = useState<ProductStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>({ startDate: '', endDate: '' });

  const fetchProductStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Primero obtenemos todos los productos
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*');

      if (productsError) throw productsError;

      // Luego obtenemos las ventas con filtros de fecha
      let query = supabase
        .from('sale_items')
        .select(`
          id,
          quantity,
          price,
          subtotal,
          sale:sales(created_at),
          product_id
        `);

      // Aplicar filtros de fecha si están presentes
      if (dateFilter.startDate) {
        query = query.gte('sale.created_at', dateFilter.startDate);
      }
      if (dateFilter.endDate) {
        // Ajustar la fecha final al final del día
        const endDate = new Date(dateFilter.endDate);
        endDate.setHours(23, 59, 59, 999);
        query = query.lte('sale.created_at', endDate.toISOString());
      }

      const { data: salesData, error: salesError } = await query;

      if (salesError) throw salesError;

      // Procesar estadísticas por producto
      const productStats = new Map<string, ProductStats>();

      // Inicializar estadísticas para todos los productos
      productsData.forEach((product: any) => {
        productStats.set(product.id, {
          id: product.id,
          name: product.name,
          total_sales: 0,
          total_quantity: 0,
          total_revenue: 0,
          average_price: 0,
          last_sale: null,
          category: product.category
        });
      });

      // Procesar ventas
      salesData?.forEach((item: any) => {
        if (!item.product_id) return;

        const productStat = productStats.get(item.product_id);
        if (!productStat) return;

        // Actualizar estadísticas básicas
        productStat.total_sales++;
        productStat.total_quantity += item.quantity;
        productStat.total_revenue += item.subtotal;

        // Actualizar última venta
        const saleDate = item.sale?.created_at;
        if (saleDate && (!productStat.last_sale || saleDate > productStat.last_sale)) {
          productStat.last_sale = saleDate;
        }
      });

      // Calcular promedios
      productStats.forEach(product => {
        product.average_price = product.total_quantity > 0
          ? product.total_revenue / product.total_quantity
          : 0;
      });

      setProducts(Array.from(productStats.values()));
    } catch (error) {
      console.error('Error al cargar estadísticas de productos:', error);
      setError('Error al cargar los datos. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProductStats();
  }, [dateFilter]);

  const filteredProducts = useMemo(() => {
    const searchLower = searchTerm.toLowerCase().trim();

    return products.filter(product => {
      const nameMatch = product.name.toLowerCase().includes(searchLower);
      const categoryMatch = product.category?.toLowerCase()?.includes(searchLower) || false;
      const totalMatch = product.total_revenue.toString().includes(searchLower);

      return !searchLower || nameMatch || categoryMatch || totalMatch;
    });
  }, [products, searchTerm]);

  const calculateTotals = useMemo(() => {
    return {
      total_products: filteredProducts.length,
      total_revenue: filteredProducts.reduce((sum, p) => sum + p.total_revenue, 0),
      total_quantity: filteredProducts.reduce((sum, p) => sum + p.total_quantity, 0),
      average_price: filteredProducts.length > 0
        ? filteredProducts.reduce((sum, p) => sum + p.total_revenue, 0) /
          filteredProducts.reduce((sum, p) => sum + p.total_quantity, 0)
        : 0,
      active_products: filteredProducts.filter(p => p.last_sale).length,
      inactive_products: filteredProducts.filter(p => !p.last_sale).length,
      categories: filteredProducts.reduce((acc, product) => {
        const category = product.category || 'Sin categoría';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }, [filteredProducts]);

  return {
    products: filteredProducts,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    dateFilter,
    setDateFilter,
    totals: calculateTotals,
    refreshData: fetchProductStats
  };
}

export type { ProductStats, DateFilter };