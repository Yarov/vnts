import { supabase } from '../lib/supabase';
import { Database } from '../types/database.types';

type Client = Database['public']['Tables']['clients']['Row'];

/**
 * Busca un cliente por referencia
 * @param reference Referencia del cliente
 * @returns Cliente encontrado o null
 */
export const findClientByReference = async (reference: string): Promise<Client | null> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('reference', reference.trim())
      .maybeSingle();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error al buscar cliente por referencia:', error);
    return null;
  }
};

/**
 * Crea un nuevo cliente
 * @param name Nombre del cliente
 * @param reference Referencia del cliente
 * @returns Cliente creado o null
 */
export const createClient = async (
  name: string,
  reference: string
): Promise<Client | null> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .insert([{ name: name.trim(), reference: reference.trim() }])
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error al crear cliente:', error);
    return null;
  }
};

/**
 * Obtiene un cliente por ID
 * @param id ID del cliente
 * @returns Cliente o null
 */
export const getClientById = async (id: string): Promise<Client | null> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error(`Error al obtener cliente con ID ${id}:`, error);
    return null;
  }
};

/**
 * Obtiene o crea un cliente
 * @param reference Referencia del cliente
 * @returns Cliente (existente o nuevo)
 */
export const getOrCreateClient = async (reference: string): Promise<Client | null> => {
  try {
    // Buscar cliente existente
    const existingClient = await findClientByReference(reference);
    
    if (existingClient) {
      return existingClient;
    }
    
    // Crear nuevo cliente
    return await createClient(reference, reference);
  } catch (error) {
    console.error('Error al obtener o crear cliente:', error);
    return null;
  }
};

/**
 * Obtiene los clientes más frecuentes
 * @param limit Límite de clientes a obtener
 * @returns Lista de clientes frecuentes
 */
export const getTopClients = async (limit: number = 10): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .rpc('get_top_clients', { limit_count: limit });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error al obtener clientes frecuentes:', error);
    return [];
  }
};

/**
 * Obtiene todos los clientes
 * @returns Lista de clientes
 */
export const getAllClients = async (): Promise<Client[]> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error al obtener todos los clientes:', error);
    return [];
  }
};

/**
 * Actualiza un cliente
 * @param id ID del cliente
 * @param updates Datos a actualizar
 * @returns Cliente actualizado o null
 */
export const updateClient = async (
  id: string,
  updates: Partial<Omit<Client, 'id' | 'created_at'>>
): Promise<Client | null> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error(`Error al actualizar cliente con ID ${id}:`, error);
    return null;
  }
};
