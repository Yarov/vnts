import api from './api';

export interface Sale {
  id: string;
  seller: string;
  seller_name: string;
  client: string;
  client_name: string;
  payment_method: string;
  payment_method_name: string;
  total: number;
  notes: string;
  items: SaleItem[];
  organization: string;
  created_at: string;
  updated_at: string;
}

export interface SaleItem {
  id: string;
  product: string;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
  organization: string;
}

export interface NewSale {
  seller_id: string;
  client_id: string;
  payment_method_id: string;
  total: number;
  notes?: string;
  organization_id: string;
  items: {
    product_id: string;
    quantity: number;
    price: number;
    subtotal: number;
  }[];
}

export const processSale = async (saleData: NewSale): Promise<Sale | null> => {
  try {
    const response = await api.post('/sales/', saleData);
    return response.data;
  } catch (error) {
    console.error('Error al procesar venta:', error);
    return null;
  }
};

export const getAllSales = async (organizationId?: string, sellerIdOrBranchId?: string, isSeller: boolean = false) => {
  const params: any = {};
  if (organizationId) params.organization_id = organizationId;
  if (sellerIdOrBranchId) {
    if (isSeller) {
      params.seller_id = sellerIdOrBranchId;
    } else {
      params.branch_id = sellerIdOrBranchId;
    }
  }
  
  const response = await api.get('/sales/', { params });
  return response.data.results || response.data;
};

export const getSaleById = async (id: string): Promise<Sale | null> => {
  try {
    const response = await api.get(`/sales/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener venta:', error);
    return null;
  }
};

export const getSalesSummary = async (organizationId?: string, branchId?: string) => {
  const params: any = {};
  if (organizationId) params.organization_id = organizationId;
  if (branchId) params.branch_id = branchId;
  
  try {
    const response = await api.get('/sales/summary/', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener resumen de ventas:', error);
    return {
      total_sales: 0,
      total_amount: 0
    };
  }
};

export const getSalesBySeller = async (organizationId?: string) => {
  const params: any = {};
  if (organizationId) params.organization_id = organizationId;
  
  try {
    const response = await api.get('/sales/by_seller/', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener ventas por vendedor:', error);
    return [];
  }
};
