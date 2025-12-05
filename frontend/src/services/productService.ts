import api from './api';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  active: boolean;
  organization: string;
  branch_ids?: string[];
  created_at: string;
  updated_at: string;
}

export const getAllProducts = async (organizationId?: string, activeOnly: boolean = false, branchId?: string) => {
  const params: any = {};
  if (organizationId) params.organization_id = organizationId;
  if (activeOnly) params.active = true;
  if (branchId) params.branch_id = branchId;
  
  const response = await api.get('/products/', { params });
  return response.data.results || response.data;
};

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const response = await api.get(`/products/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener producto:', error);
    return null;
  }
};

export const createProduct = async (product: Partial<Product> & { branches?: string[] }): Promise<Product | null> => {
  try {
    // Eliminar organization del payload ya que se asigna automáticamente en el backend
    const { organization, ...productData } = product;
    const response = await api.post('/products/', productData);
    return response.data;
  } catch (error) {
    console.error('Error al crear producto:', error);
    return null;
  }
};

export const updateProduct = async (id: string, product: Partial<Product> & { branches?: string[] }): Promise<Product | null> => {
  try {
    const response = await api.patch(`/products/${id}/`, product);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    return null;
  }
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    await api.delete(`/products/${id}/`);
    return true;
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    return false;
  }
};
