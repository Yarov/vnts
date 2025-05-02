import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

// Utilizamos las variables de entorno definidas en .env
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificar que las variables de entorno estén definidas
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    'Error: Las variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY deben estar definidas'
  );
}

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// Función auxiliar para verificar si un usuario es administrador
export async function isUserAdmin(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error checking admin status:', error);
    return false;
  }

  return !!data;
}

// Función para verificar si un código de vendedor es válido
export async function validateSellerCode(code: string) {
  const { data, error } = await supabase
    .from('sellers')
    .select('id, name')
    .eq('numeric_code', code)
    .eq('active', true)
    .single();

  if (error || !data) {
    console.error('Error validating seller code:', error);
    return null;
  }

  return {
    id: data.id,
    name: data.name
  };
}

// Función para obtener las comisiones de un vendedor por periodo
export async function getSellerCommissions(sellerId: string, startDate?: string, endDate?: string) {
  try {
    const { data, error } = await supabase
      .rpc('get_seller_commissions', {
        seller_id: sellerId,
        start_date: startDate,
        end_date: endDate
      });

    if (error) throw error;

    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error obteniendo comisiones del vendedor:', error);
    return null;
  }
}

// Función para obtener las comisiones de todos los vendedores por periodo
export async function getAllSellerCommissions(startDate?: string, endDate?: string) {
  try {
    const { data, error } = await supabase
      .rpc('get_all_seller_commissions', {
        start_date: startDate,
        end_date: endDate
      });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error obteniendo comisiones de vendedores:', error);
    return [];
  }
}
