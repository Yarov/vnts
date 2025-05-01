import { supabase } from '../lib/supabase';
import { Database } from '../types/database.types';

type Seller = Database['public']['Tables']['sellers']['Row'];

/**
 * Obtiene todos los vendedores
 * @param activeOnly Si es true, filtra solo vendedores activos
 * @returns Lista de vendedores
 */
export const getAllSellers = async (activeOnly: boolean = true): Promise<Seller[]> => {
  try {
    let query = supabase
      .from('sellers')
      .select('*')
      .order('name');
      
    if (activeOnly) {
      query = query.eq('active', true);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error al obtener vendedores:', error);
    return [];
  }
};

/**
 * Obtiene un vendedor por su ID
 * @param id ID del vendedor
 * @returns Vendedor o null si no existe
 */
export const getSellerById = async (id: string): Promise<Seller | null> => {
  try {
    const { data, error } = await supabase
      .from('sellers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error(`Error al obtener vendedor con ID ${id}:`, error);
    return null;
  }
};

/**
 * Obtiene un vendedor por su código numérico
 * @param code Código numérico del vendedor
 * @returns Vendedor o null si no existe
 */
export const getSellerByCode = async (code: string): Promise<Seller | null> => {
  try {
    const { data, error } = await supabase
      .from('sellers')
      .select('*')
      .eq('numeric_code', code)
      .eq('active', true)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error(`Error al obtener vendedor con código ${code}:`, error);
    return null;
  }
};

/**
 * Crea un nuevo vendedor
 * @param name Nombre del vendedor
 * @param numericCode Código numérico único
 * @param commissionPercentage Porcentaje de comisión (opcional)
 * @returns Vendedor creado o null si hay error
 */
export const createSeller = async (
  name: string,
  numericCode: string,
  commissionPercentage?: number
): Promise<Seller | null> => {
  try {
    const newSeller: any = {
      name,
      numeric_code: numericCode,
      active: true
    };
    
    if (commissionPercentage !== undefined) {
      newSeller.commission_percentage = commissionPercentage;
    }
    
    const { data, error } = await supabase
      .from('sellers')
      .insert([newSeller])
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error al crear vendedor:', error);
    return null;
  }
};

/**
 * Actualiza un vendedor existente
 * @param id ID del vendedor
 * @param updates Campos a actualizar
 * @returns Vendedor actualizado o null si hay error
 */
export const updateSeller = async (
  id: string,
  updates: Partial<Omit<Seller, 'id' | 'created_at'>>
): Promise<Seller | null> => {
  try {
    const { data, error } = await supabase
      .from('sellers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error(`Error al actualizar vendedor con ID ${id}:`, error);
    return null;
  }
};

/**
 * Activa o desactiva un vendedor
 * @param id ID del vendedor
 * @param active Estado activo/inactivo
 * @returns Vendedor actualizado o null si hay error
 */
export const toggleSellerActive = async (
  id: string,
  active: boolean
): Promise<Seller | null> => {
  try {
    const { data, error } = await supabase
      .from('sellers')
      .update({ active })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error(`Error al cambiar estado del vendedor con ID ${id}:`, error);
    return null;
  }
};

/**
 * Actualiza el porcentaje de comisión de un vendedor
 * @param id ID del vendedor
 * @param percentage Nuevo porcentaje de comisión
 * @returns Vendedor actualizado o null si hay error
 */
export const updateSellerCommission = async (
  id: string,
  percentage: number
): Promise<Seller | null> => {
  try {
    const { data, error } = await supabase
      .from('sellers')
      .update({ commission_percentage: percentage })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error(`Error al actualizar comisión del vendedor con ID ${id}:`, error);
    return null;
  }
};

/**
 * Verifica si un código numérico ya está en uso
 * @param code Código numérico a verificar
 * @param excludeId ID de vendedor a excluir en la verificación (para updates)
 * @returns true si el código ya está en uso
 */
export const isNumericCodeInUse = async (
  code: string,
  excludeId?: string
): Promise<boolean> => {
  try {
    let query = supabase
      .from('sellers')
      .select('id')
      .eq('numeric_code', code);
    
    if (excludeId) {
      query = query.neq('id', excludeId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return (data || []).length > 0;
  } catch (error) {
    console.error(`Error al verificar uso del código ${code}:`, error);
    return false;
  }
};
