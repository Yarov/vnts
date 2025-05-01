import { supabase } from '../lib/supabase';
import { Database } from '../types/database.types';

type PaymentMethod = Database['public']['Tables']['payment_methods']['Row'];

/**
 * Obtiene todos los métodos de pago
 * @param activeOnly Si es true, filtra solo métodos activos
 * @returns Lista de métodos de pago
 */
export const getAllPaymentMethods = async (activeOnly: boolean = true): Promise<PaymentMethod[]> => {
  try {
    let query = supabase
      .from('payment_methods')
      .select('*')
      .order('name');
      
    if (activeOnly) {
      query = query.eq('active', true);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error al obtener métodos de pago:', error);
    return [];
  }
};

/**
 * Obtiene un método de pago por su ID
 * @param id ID del método de pago
 * @returns Método de pago o null si no existe
 */
export const getPaymentMethodById = async (id: string): Promise<PaymentMethod | null> => {
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error(`Error al obtener método de pago con ID ${id}:`, error);
    return null;
  }
};

/**
 * Crea un nuevo método de pago
 * @param name Nombre del método de pago
 * @returns Método de pago creado o null si hay error
 */
export const createPaymentMethod = async (name: string): Promise<PaymentMethod | null> => {
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .insert([{ name, active: true }])
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error al crear método de pago:', error);
    return null;
  }
};

/**
 * Actualiza un método de pago existente
 * @param id ID del método de pago
 * @param updates Campos a actualizar
 * @returns Método de pago actualizado o null si hay error
 */
export const updatePaymentMethod = async (
  id: string,
  updates: Partial<PaymentMethod>
): Promise<PaymentMethod | null> => {
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error(`Error al actualizar método de pago con ID ${id}:`, error);
    return null;
  }
};

/**
 * Activa o desactiva un método de pago
 * @param id ID del método de pago
 * @param active Estado activo/inactivo
 * @returns Método de pago actualizado o null si hay error
 */
export const togglePaymentMethodActive = async (
  id: string,
  active: boolean
): Promise<PaymentMethod | null> => {
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .update({ active })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error(`Error al cambiar estado del método de pago con ID ${id}:`, error);
    return null;
  }
};
