import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { 
  productsAtom, 
  loadingProductsAtom, 
  searchProductsAtom, 
  productCategoryFilterAtom, 
  filteredProductsAtom 
} from '../store/products';
import { getAllProducts, getProductCategories } from '../services/productService';

/**
 * Hook para gestionar productos con búsqueda, filtros y paginación
 * @returns Objeto con estados y funciones para manejar productos
 */
export function useProducts() {
  // Estados de Jotai
  const [products, setProducts] = useAtom(productsAtom);
  const [loading, setLoading] = useAtom(loadingProductsAtom);
  const [searchQuery, setSearchQuery] = useAtom(searchProductsAtom);
  const [categoryFilter, setCategoryFilter] = useAtom(productCategoryFilterAtom);
  const [filteredProducts] = useAtom(filteredProductsAtom);

  // Estados locales
  const [categories, setCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Cargar productos al montar
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  // Función para cargar productos
  const loadProducts = async (activeOnly: boolean = true) => {
    setLoading(true);

    try {
      const data = await getAllProducts(activeOnly);
      setProducts(data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar categorías
  const loadCategories = async () => {
    try {
      const data = await getProductCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  // Función para buscar productos
  const searchProducts = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Función para filtrar por categoría
  const filterByCategory = (category: string) => {
    setCategoryFilter(category);
    setCurrentPage(1);
  };

  // Calcular paginación
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Cambiar página
  const changePage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Cambiar items por página
  const changeItemsPerPage = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  return {
    products: paginatedProducts,
    allProducts: filteredProducts,
    loading,
    categories,
    searchQuery,
    categoryFilter,
    pagination: {
      currentPage,
      totalPages,
      itemsPerPage,
      changePage,
      changeItemsPerPage
    },
    searchProducts,
    filterByCategory,
    refreshProducts: loadProducts,
    clearFilters: () => {
      setSearchQuery('');
      setCategoryFilter('');
      setCurrentPage(1);
    }
  };
}
