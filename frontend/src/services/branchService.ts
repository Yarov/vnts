import api from './api';
import { Database } from '../types/database.types';

type Branch = Database['public']['Tables']['branches']['Row'];
type BranchInsert = Database['public']['Tables']['branches']['Insert'];
type BranchUpdate = Database['public']['Tables']['branches']['Update'];

export const getAllBranches = async (organizationId: string): Promise<Branch[]> => {
  try {
    const response = await api.get('/branches/', {
      params: { organization_id: organizationId }
    });
    return response.data.results || response.data;
  } catch (error) {
    console.error('Error al obtener sucursales:', error);
    return [];
  }
};

export const getBranchById = async (id: string): Promise<Branch | null> => {
  try {
    const response = await api.get(`/branches/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener sucursal:', error);
    return null;
  }
};

export const createBranch = async (branch: BranchInsert): Promise<Branch | null> => {
  try {
    const response = await api.post('/branches/', branch);
    return response.data;
  } catch (error) {
    console.error('Error al crear sucursal:', error);
    return null;
  }
};

export const updateBranch = async (id: string, branch: BranchUpdate): Promise<Branch | null> => {
  try {
    const response = await api.patch(`/branches/${id}/`, branch);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar sucursal:', error);
    return null;
  }
};

export const deleteBranch = async (id: string): Promise<boolean> => {
  try {
    await api.delete(`/branches/${id}/`);
    return true;
  } catch (error) {
    console.error('Error al eliminar sucursal:', error);
    throw error;
  }
};

export const getBranchSellers = async (branchId: string): Promise<any[]> => {
  try {
    const branch = await getBranchById(branchId);
    return branch?.sellers || [];
  } catch (error) {
    console.error('Error al obtener vendedores de sucursal:', error);
    return [];
  }
};

export const getBranchProducts = async (branchId: string): Promise<any[]> => {
  try {
    const branch = await getBranchById(branchId);
    return branch?.products || [];
  } catch (error) {
    console.error('Error al obtener productos de sucursal:', error);
    return [];
  }
};
