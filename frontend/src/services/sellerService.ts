import api from './api';

export interface Seller {
  id: string;
  name: string;
  numeric_code: string;
  commission_percentage: number;
  active: boolean;
  organization: string;
  assigned_branches?: Array<{id: string, name: string, code: string, active?: boolean}>;
  created_at: string;
  updated_at: string;
}

export const getAllSellers = async (organizationId?: string, activeOnly: boolean = false) => {
  const params: any = {};
  if (organizationId) params.organization_id = organizationId;
  if (activeOnly) params.active = true;
  
  const response = await api.get('/sellers/', { params });
  return response.data.results || response.data;
};

export const getSellerById = async (id: string): Promise<Seller | null> => {
  try {
    const response = await api.get(`/sellers/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener vendedor:', error);
    return null;
  }
};

export const getSellerByCode = async (code: string, organizationId?: string): Promise<Seller | null> => {
  try {
    const params: any = { search: code };
    if (organizationId) params.organization_id = organizationId;
    
    const response = await api.get('/sellers/', { params });
    const sellers = response.data.results || response.data;
    
    return sellers.find((s: Seller) => s.numeric_code === code) || null;
  } catch (error) {
    console.error('Error al obtener vendedor por código:', error);
    return null;
  }
};

export const createSeller = async (seller: Partial<Seller> & { branches?: string[] }): Promise<Seller | null> => {
  try {
    const { organization, ...sellerData } = seller;
    const response = await api.post('/sellers/', sellerData);
    return response.data;
  } catch (error) {
    console.error('Error al crear vendedor:', error);
    return null;
  }
};

export const updateSeller = async (id: string, seller: Partial<Seller> & { branches?: string[] }): Promise<Seller | null> => {
  try {
    const response = await api.patch(`/sellers/${id}/`, seller);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar vendedor:', error);
    return null;
  }
};

export const deleteSeller = async (id: string): Promise<boolean> => {
  try {
    await api.delete(`/sellers/${id}/`);
    return true;
  } catch (error) {
    console.error('Error al eliminar vendedor:', error);
    throw error;
  }
};
