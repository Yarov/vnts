import { supabase } from '../lib/supabase';
import { User } from '../store/auth';

/**
 * Verifica si un usuario es administrador
 * @param userId ID del usuario a verificar
 * @returns true si es administrador, false en caso contrario
 */
export const isUserAdmin = async (userId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error al verificar estado de administrador:', error);
    return false;
  }

  return !!data;
};

/**
 * Valida un código de vendedor
 * @param code Código numérico del vendedor
 * @returns Datos del vendedor o null si no es válido
 */
export const validateSellerCode = async (code: string): Promise<{ id: string; name: string } | null> => {
  const { data, error } = await supabase
    .from('sellers')
    .select('id, name')
    .eq('numeric_code', code)
    .eq('active', true)
    .single();

  if (error || !data) {
    console.error('Error al validar código de vendedor:', error);
    return null;
  }

  return {
    id: data.id,
    name: data.name
  };
};

/**
 * Inicia sesión como administrador
 * @param email Correo electrónico
 * @param password Contraseña
 * @returns Usuario o null si hay error
 */
export const loginAsAdmin = async (email: string, password: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    if (data.user) {
      // Verificar si es admin
      const isAdmin = await isUserAdmin(data.user.id);

      if (isAdmin) {
        return {
          id: data.user.id,
          email: data.user.email || '',
          role: 'admin'
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Error de inicio de sesión:', error);
    return null;
  }
};

/**
 * Inicia sesión como vendedor
 * @param code Código numérico del vendedor
 * @returns Usuario o null si hay error
 */
export const loginAsSeller = async (code: string): Promise<User | null> => {
  try {
    const seller = await validateSellerCode(code);

    if (seller) {
      return {
        id: seller.id,
        email: '', // Los vendedores no tienen email
        role: 'seller'
      };
    }

    return null;
  } catch (error) {
    console.error('Error de inicio de sesión como vendedor:', error);
    return null;
  }
};

/**
 * Obtiene las comisiones de un vendedor por periodo
 * @param sellerId ID del vendedor
 * @param startDate Fecha de inicio (opcional)
 * @param endDate Fecha de fin (opcional)
 * @returns Datos de comisión o null
 */
export const getSellerCommissions = async (
  sellerId: string,
  startDate?: string,
  endDate?: string
) => {
  const { data, error } = await supabase.rpc('get_seller_commissions', {
    seller_id: sellerId,
    start_date: startDate,
    end_date: endDate
  });

  if (error) {
    console.error('Error obteniendo comisiones del vendedor:', error);
    return null;
  }

  return data && data.length > 0 ? data[0] : null;
};

/**
 * Obtiene las comisiones de todos los vendedores por periodo
 * @param startDate Fecha de inicio (opcional)
 * @param endDate Fecha de fin (opcional)
 * @returns Array de datos de comisiones
 */
export const getAllSellerCommissions = async (startDate?: string, endDate?: string) => {
  const { data, error } = await supabase.rpc('get_all_seller_commissions', {
    start_date: startDate,
    end_date: endDate
  });

  if (error) {
    console.error('Error obteniendo comisiones de vendedores:', error);
    return [];
  }

  return data || [];
};

/**
 * Cierra la sesión actual
 * @returns true si se cerró correctamente
 */
export const logout = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    return false;
  }
};
