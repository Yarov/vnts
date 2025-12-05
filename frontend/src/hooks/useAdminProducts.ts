import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { userAtom } from '../store/auth';
import { createProduct, updateProduct, deleteProduct } from '../services/productService';
import { getAllBranches } from '../services/branchService';
import { Database } from '../types/database.types';
import { useProducts } from './useProducts';

type Product = Database['public']['Tables']['products']['Row'];
type Branch = Database['public']['Tables']['branches']['Row'];

export function useAdminProducts() {
  const [user] = useAtom(userAtom);
  
  // Usar el hook global para obtener productos y loading
  const {
    products: filteredProducts,
    loading,
    searchQuery,
    searchProducts,
    refreshProducts
  } = useProducts();

  // Estado para modal y formularios
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product> | null>(null);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);
  
  // Estado para sucursales
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);

  // Cargar sucursales
  useEffect(() => {
    if (user?.organizationId) {
      fetchBranches();
    }
  }, [user?.organizationId]);

  const fetchBranches = async () => {
    if (!user?.organizationId) return;
    try {
      const data = await getAllBranches(user.organizationId);
      // Filtrar sucursales activas y excluir la default (PRINCIPAL)
      setBranches(data.filter(b => b.active && b.code !== 'PRINCIPAL') || []);
    } catch (error) {
      console.error('Error al cargar sucursales:', error);
    }
  };

  // Abrir modal para crear/editar producto
  const openProductModal = (product?: Product) => {
    setFormErrors({});
    setSelectedBranches([]); // Resetear selección
    if (product) {
      setCurrentProduct({...product});
      // TODO: Cargar sucursales del producto cuando tengamos el endpoint
    } else {
      setCurrentProduct({
        name: '',
        price: 0,
        category: 'General',
        description: '',
        active: true
      });
    }
    setIsModalOpen(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentProduct(null);
    setSelectedBranches([]);
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (currentProduct) {
      if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setCurrentProduct({
          ...currentProduct,
          [name]: checked
        });
      } else if (type === 'number') {
        setCurrentProduct({
          ...currentProduct,
          [name]: parseFloat(value)
        });
      } else {
        setCurrentProduct({
          ...currentProduct,
          [name]: value
        });
      }
    }
  };

  // Validar formulario
  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    if (!currentProduct?.name) {
      errors.name = 'El nombre es obligatorio';
    }
    if (currentProduct?.price === undefined || currentProduct.price <= 0) {
      errors.price = 'El precio debe ser mayor que 0';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Guardar producto
  const handleSaveProduct = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm() || !currentProduct) return;
    setIsSubmitting(true);
    try {
      if (currentProduct.id) {
        await updateProduct(currentProduct.id, {
          name: currentProduct.name || '',
          price: currentProduct.price || 0,
          category: currentProduct.category ?? '',
          description: currentProduct.description ?? '',
          active: currentProduct.active ?? true
        });
      } else {
        // Crear nuevo producto
        if (!user?.organizationId) {
          throw new Error('No se pudo obtener el organization_id del usuario');
        }
        
        // Lógica de sucursales:
        // - Si no hay sucursales visibles (solo PRINCIPAL): no enviar branches, backend asigna a PRINCIPAL
        // - Si hay 1 sucursal visible: asignar automáticamente
        // - Si hay múltiples y no se selecciona ninguna: asignar a todas
        // - Si se seleccionan específicas: asignar solo a esas
        let branchesToAssign: string[] | undefined = undefined;
        
        if (branches.length === 0) {
          // Solo existe PRINCIPAL, dejar que backend maneje
          branchesToAssign = undefined;
        } else if (branches.length === 1) {
          branchesToAssign = [branches[0].id];
        } else if (branches.length > 1) {
          branchesToAssign = selectedBranches.length > 0 ? selectedBranches : branches.map(b => b.id);
        }
        
        const productData: any = {
          name: currentProduct.name || '',
          price: currentProduct.price || 0,
          category: currentProduct.category ?? '',
          description: currentProduct.description ?? '',
          active: currentProduct.active ?? true,
          organization: user.organizationId
        };
        
        if (branchesToAssign !== undefined) {
          productData.branches = branchesToAssign;
        }
        
        await createProduct(productData);
      }
      await refreshProducts();
      closeModal();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      alert('Error al guardar producto. Por favor, intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cambiar estado de un producto (activar/desactivar)
  const toggleProductStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateProduct(id, { active: !currentStatus });
      refreshProducts();
    } catch (error) {
      console.error('Error al cambiar estado del producto:', error);
      alert('Error al cambiar estado del producto. Por favor, intenta de nuevo.');
    }
  };

  // Eliminar un producto
  const confirmDeleteProduct = (id: string) => {
    setProductToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setIsDeleteConfirmOpen(false);
    setProductToDelete(null);
  };

  // Manejar eliminación del producto
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    setIsDeletingProduct(true);
    try {
      await deleteProduct(productToDelete);
      refreshProducts();
      setIsDeleteConfirmOpen(false);
      setProductToDelete(null);
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      alert('Error al eliminar producto. Por favor, intenta de nuevo.');
    } finally {
      setIsDeletingProduct(false);
    }
  };

  return {
    filteredProducts,
    loading,
    searchQuery,
    searchProducts,
    isModalOpen,
    openProductModal,
    closeModal,
    currentProduct,
    setCurrentProduct,
    formErrors,
    setFormErrors,
    isSubmitting,
    handleInputChange,
    handleSaveProduct,
    toggleProductStatus,
    branches,
    selectedBranches,
    setSelectedBranches,
    isDeleteConfirmOpen,
    confirmDeleteProduct,
    closeDeleteConfirm,
    handleDeleteProduct,
    isDeletingProduct
  };
}
