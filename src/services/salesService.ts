import { supabase } from '../lib/supabase';
import { Sale, SaleWithItems, NewSale, NewSaleItem } from '../store/sales';

/**
 * Obtiene todas las ventas con detalles
 * @param startDate Fecha de inicio opcional
 * @param endDate Fecha de fin opcional
 * @param sellerId ID del vendedor opcional
 * @returns Lista de ventas con detalles
 */
export const getSalesWithDetails = async (
  startDate?: string,
  endDate?: string,
  sellerId?: string
): Promise<SaleWithItems[]> => {
  try {
    let query = supabase
      .from('sales')
      .select(`
        *,
        sellers:seller_id(name),
        clients:client_id(name),
        payment_methods:payment_method_id(name)
      `)
      .order('created_at', { ascending: false });
    
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    
    if (endDate) {
      query = query.lte('created_at', endDate);
    }
    
    if (sellerId) {
      query = query.eq('seller_id', sellerId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Obtener los items de venta para cada venta
    const sales = await Promise.all((data || []).map(async (sale) => {
      const { data: itemsData, error: itemsError } = await supabase
        .from('sale_items')
        .select(`
          *,
          products:product_id(name)
        `)
        .eq('sale_id', sale.id);
      
      if (itemsError) throw itemsError;
      
      // Procesar items para un formato más conveniente
      const items = (itemsData || []).map(item => ({
        id: item.id,
        product_id: item.product_id,
        product_name: item.products?.name || 'Producto desconocido',
        quantity: item.quantity,
        price: parseFloat(item.price),
        subtotal: parseFloat(item.subtotal)
      }));
      
      return {
        ...sale,
        items,
        seller_name: sale.sellers?.name,
        client_name: sale.clients?.name,
        payment_method_name: sale.payment_methods?.name
      };
    }));
    
    return sales;
  } catch (error) {
    console.error('Error al obtener ventas con detalles:', error);
    return [];
  }
};

/**
 * Obtiene una venta específica con todos sus detalles
 * @param id ID de la venta
 * @returns Venta con detalles o null si no existe
 */
export const getSaleById = async (id: string): Promise<SaleWithItems | null> => {
  try {
    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        sellers:seller_id(name),
        clients:client_id(name),
        payment_methods:payment_method_id(name)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    // Obtener los items de venta
    const { data: itemsData, error: itemsError } = await supabase
      .from('sale_items')
      .select(`
        *,
        products:product_id(name)
      `)
      .eq('sale_id', id);
    
    if (itemsError) throw itemsError;
    
    // Procesar items para un formato más conveniente
    const items = (itemsData || []).map(item => ({
      id: item.id,
      product_id: item.product_id,
      product_name: item.products?.name || 'Producto desconocido',
      quantity: item.quantity,
      price: parseFloat(item.price),
      subtotal: parseFloat(item.subtotal)
    }));
    
    return {
      ...data,
      items,
      seller_name: data.sellers?.name,
      client_name: data.clients?.name,
      payment_method_name: data.payment_methods?.name
    };
  } catch (error) {
    console.error(`Error al obtener venta con ID ${id}:`, error);
    return null;
  }
};

/**
 * Procesa una nueva venta con sus ítems
 * @param saleData Datos de la venta a crear
 * @returns Venta creada o null si hay error
 */
export const processSale = async (saleData: NewSale): Promise<Sale | null> => {
  try {
    // Crear la venta
    const { data: saleRecord, error: saleError } = await supabase
      .from('sales')
      .insert([{
        seller_id: saleData.seller_id,
        client_id: saleData.client_id,
        payment_method_id: saleData.payment_method_id,
        total: saleData.total,
        notes: saleData.notes
      }])
      .select()
      .single();
    
    if (saleError) throw saleError;
    
    if (!saleRecord) throw new Error('No se pudo crear la venta');
    
    // Crear los ítems de venta
    const saleItems = saleData.items.map(item => ({
      sale_id: saleRecord.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.subtotal
    }));
    
    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(saleItems);
    
    if (itemsError) throw itemsError;
    
    return saleRecord;
  } catch (error) {
    console.error('Error al procesar venta:', error);
    return null;
  }
};

/**
 * Obtiene resumen de ventas para un período
 * @param startDate Fecha de inicio
 * @param endDate Fecha de fin
 * @returns Resumen de ventas con totales y cambios
 */
export const getSalesSummary = async (
  startDate?: string,
  endDate?: string
): Promise<any> => {
  try {
    // Obtener todas las ventas
    const { data, error } = await supabase
      .from('sales')
      .select('id, total, created_at');
    
    if (error) throw error;
    
    const salesData = data || [];
    
    // Filtrar ventas por fecha si se proporcionan rangos
    const filteredSales = salesData.filter(sale => {
      const saleDate = new Date(sale.created_at);
      
      if (startDate && new Date(startDate) > saleDate) return false;
      if (endDate && new Date(endDate) < saleDate) return false;
      
      return true;
    });
    
    // Calcular total
    const totalSales = filteredSales.reduce(
      (sum, sale) => sum + parseFloat(sale.total.toString()), 
      0
    );
    
    return {
      count: filteredSales.length,
      total: totalSales,
      sales: filteredSales
    };
  } catch (error) {
    console.error('Error al obtener resumen de ventas:', error);
    return {
      count: 0,
      total: 0,
      sales: []
    };
  }
};

/**
 * Obtiene ventas agrupadas por vendedor
 * @param startDate Fecha de inicio
 * @param endDate Fecha de fin
 * @returns Array de ventas por vendedor
 */
export const getSalesBySeller = async (
  startDate?: string,
  endDate?: string
): Promise<any[]> => {
  try {
    // Construir la consulta base
    let query = supabase
      .from('sales')
      .select(`
        seller_id,
        sellers!inner(name),
        total
      `);
    
    // Aplicar filtros de fecha si existen
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    
    if (endDate) {
      query = query.lte('created_at', endDate);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Agrupar ventas por vendedor
    const sellerSalesMap = (data || []).reduce((acc: { [key: string]: any }, sale) => {
      const sellerName = sale.sellers.name;
      
      if (!acc[sellerName]) {
        acc[sellerName] = {
          seller_id: sale.seller_id,
          name: sellerName,
          total: 0,
          count: 0
        };
      }
      
      acc[sellerName].total += parseFloat(sale.total.toString());
      acc[sellerName].count += 1;
      
      return acc;
    }, {});
    
    // Convertir a array y ordenar por total
    return Object.values(sellerSalesMap).sort((a: any, b: any) => b.total - a.total);
  } catch (error) {
    console.error('Error al obtener ventas por vendedor:', error);
    return [];
  }
};

/**
 * Obtiene datos de ventas diarias para gráfico
 * @param days Número de días a obtener
 * @returns Array con datos de ventas por día
 */
export const getDailySalesData = async (days: number = 14): Promise<any[]> => {
  try {
    // Obtener ventas
    const { data, error } = await supabase
      .from('sales')
      .select('total, created_at')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    const salesData = data || [];
    
    // Preparar array de los últimos días
    const now = new Date();
    const past14Days = Array.from({ length: days }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (days - 1 - i));
      return {
        date,
        dateStr: date.toISOString().split('T')[0],
        formattedDate: date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }),
        sales: 0
      };
    });
    
    // Agrupar ventas por día
    salesData.forEach(sale => {
      const saleDate = new Date(sale.created_at).toISOString().split('T')[0];
      const dayData = past14Days.find(d => d.dateStr === saleDate);
      
      if (dayData) {
        dayData.sales += parseFloat(sale.total.toString());
      }
    });
    
    return past14Days;
  } catch (error) {
    console.error('Error al obtener datos de ventas diarias:', error);
    return [];
  }
};
