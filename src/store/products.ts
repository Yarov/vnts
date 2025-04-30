import { atom } from 'jotai';
import { Database } from '../types/database.types';

export type Product = Database['public']['Tables']['products']['Row'];

export const productsAtom = atom<Product[]>([]);
export const loadingProductsAtom = atom<boolean>(false);
export const searchProductsAtom = atom<string>('');
export const productCategoryFilterAtom = atom<string>('');

// Átomo derivado para productos filtrados
export const filteredProductsAtom = atom((get) => {
  const products = get(productsAtom);
  const search = get(searchProductsAtom).toLowerCase();
  const categoryFilter = get(productCategoryFilterAtom);
  
  return products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search) || 
                          (product.description?.toLowerCase().includes(search) || false);
    
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    
    return matchesSearch && matchesCategory && product.active;
  });
});
