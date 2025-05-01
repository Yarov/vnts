import { supabase } from '../lib/supabase';
import { Product } from '../store/products';
import { Database } from '../types/database.types';

/**
 * Obtiene todos los productos
 * @param activeOnly Si es true, filtra solo productos activos
 * @returns Lista de productos
 */
export const getAllProducts = async (activeOnly: boolean = true): Promise<Product[]> => {
  try {
    let query = supabase
      .from('products')
      .select('*')
      .order('name');
    if (activeOnly) {
      query = query.eq('active', true);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return [];
  }
};

/**
 * Obtiene un producto por su ID
 * @param id ID del producto
 * @returns Producto o null si no existe
 */
export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error(`Error al obtener producto con ID ${id}:`, error);
    return null;
  }
};

/**
 * Crea un nuevo producto
 * @param product Datos del producto a crear
 * @returns Producto creado o null si hay error
 */
export const createProduct = async (
  product: Omit<Product, 'id' | 'created_at'>
): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error al crear producto:', error);
    return null;
  }
};

/**
 * Actualiza un producto existente
 * @param id ID del producto
 * @param updates Campos a actualizar
 * @returns Producto actualizado o null si hay error
 */
export const updateProduct = async (
  id: string,
  updates: Partial<Omit<Product, 'id' | 'created_at'>>
): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error(`Error al actualizar producto con ID ${id}:`, error);
    return null;
  }
};

/**
 * Elimina un producto completamente
 * @param id ID del producto a eliminar
 * @returns true si se eliminó correctamente
 */
export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error(`Error al eliminar producto con ID ${id}:`, error);
    return false;
  }
};

/**
 * Desactiva un producto (soft delete)
 * @param id ID del producto
 * @returns true si se desactivó correctamente
 */
export const deactivateProduct = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('products')
      .update({ active: false })
      .eq('id', id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error(`Error al desactivar producto con ID ${id}:`, error);
    return false;
  }
};

/**
 * Obtiene las categorías únicas de productos
 * @returns Array de categorías
 */
export const getProductCategories = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .eq('active', true)
      .not('category', 'is', null);

    if (error) throw error;

    // Extraer categorías únicas
    const categories = [...new Set(data.map(p => p.category || ''))];
    return categories.filter(c => c !== ''); // Filtrar categorías vacías
  } catch (error) {
    console.error('Error al obtener categorías de productos:', error);
    return [];
  }
};

/**
 * Obtiene los productos más vendidos
 * @param limit Número máximo de productos a obtener
 * @returns Lista de productos top con cantidad y total vendido
 */
export const getTopProducts = async (limit: number = 5): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .rpc('get_top_products', { limit_count: limit });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error al obtener productos top:', error);
    return [];
  }
};
