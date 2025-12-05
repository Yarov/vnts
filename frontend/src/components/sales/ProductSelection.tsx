import { useRef, useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Database } from '../../types/database.types';

type Product = Database['public']['Tables']['products']['Row'];

interface SaleItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface ProductSelectionProps {
  products: Product[];
  categorizedProducts: {[key: string]: Product[]};
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredProducts: Product[];
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  quantity: number;
  setQuantity: (quantity: number) => void;
  addProductToSale: () => void;
  quickAddProduct: (product: Product) => void;
  quickSearchProducts: Product[];
  isProductModalOpen: boolean;
  setIsProductModalOpen: (isOpen: boolean) => void;
}

const ProductSelection: React.FC<ProductSelectionProps> = ({
  products,
  categorizedProducts,
  selectedCategory,
  searchTerm,
  setSearchTerm,
  filteredProducts,
  selectedProduct,
  setSelectedProduct,
  quantity,
  setQuantity,
  addProductToSale,
  quickAddProduct,
  quickSearchProducts,
  isProductModalOpen,
  setIsProductModalOpen
}) => {
  // Referencias para controlar el enfoque de los elementos
  const searchInputRef = useRef<HTMLInputElement>(null);
  const quantityInputRef = useRef<HTMLInputElement>(null);

  // Enfoque automático
  useEffect(() => {
    if (!selectedProduct && searchInputRef.current) {
      searchInputRef.current.focus();
    } else if (selectedProduct && quantityInputRef.current) {
      quantityInputRef.current.focus();
    }
  }, [selectedProduct]);

  // Seleccionar producto
  const selectProduct = (product: Product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setSearchTerm('');
  };

  // Renderizar productos por categoría
  const renderProductsByCategory = () => {
    if (!selectedCategory) return null;

    const productsInCategory = categorizedProducts[selectedCategory] || [];

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {productsInCategory.map(product => (
          <button
            key={product.id}
            id={`category-product-${product.id}`}
            onClick={() => selectProduct(product)}
            className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 text-left transition-colors flex flex-col h-24"
          >
            <span className="font-medium text-gray-900 text-sm line-clamp-2">{product.name}</span>
            <span className="text-primary-600 font-bold mt-1">${Number(product.price).toFixed(2)}</span>
            <span className="text-xs text-gray-500 mt-auto">{product.category}</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">

      {/* Acceso rápido a productos populares */}
      <Card title="Acceso rápido">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {quickSearchProducts.map(product => (
            <button
              id={`quick-add-${product.id}`}
              key={product.id}
              onClick={() => quickAddProduct(product)}
              className="flex flex-col items-start p-2 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors text-left text-sm"
            >
              <span className="text-gray-900 font-medium truncate w-full">{product.name}</span>
              <span className="text-primary-600 font-bold">${Number(product.price).toFixed(2)}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Modal de todos los productos */}
      {isProductModalOpen && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Backdrop */}
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            {/* Modal */}
            <div className="inline-block align-bottom bg-white rounded-lg p-6 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Todos los productos
                  </h3>

                  <div className="mb-4">
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Buscar productos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto pb-4">
                    {(searchTerm ? filteredProducts : products).map(product => (
                      <div
                        key={product.id}
                        className="border border-gray-200 rounded-md p-3 hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          selectProduct(product);
                          setIsProductModalOpen(false);
                        }}
                      >
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-gray-500">{product.category || 'Sin categoría'}</span>
                          <span className="font-bold text-primary-600">${Number(product.price).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <Button
                  variant="outline"
                  onClick={() => setIsProductModalOpen(false)}
                  className="w-full sm:ml-3 sm:w-auto"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSelection;
