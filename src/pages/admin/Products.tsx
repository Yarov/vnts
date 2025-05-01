import { useState } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { useProducts } from '../../hooks';
import { createProduct, updateProduct, deleteProduct } from '../../services/productService';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import TextAreaField from '../../components/ui/TextAreaField';
import CheckboxField from '../../components/ui/CheckboxField';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Database } from '../../types/database.types';

type Product = Database['public']['Tables']['products']['Row'];

export default function Products() {
  // Usar nuestro hook personalizado para productos
  const {
    products: filteredProducts,
    loading,
    searchQuery,
    searchProducts,
    refreshProducts
  } = useProducts();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product> | null>(null);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);



  // Abrir modal para crear/editar producto
  const openProductModal = (product?: Product) => {
    setFormErrors({});
    if (product) {
      setCurrentProduct({...product});
    } else {
      setCurrentProduct({
        name: '',
        price: 0,
        category: '',
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
        // Actualizar producto existente
        await updateProduct(currentProduct.id, {
          name: currentProduct.name || '',
          price: currentProduct.price || 0,
          category: currentProduct.category,
          description: currentProduct.description,
          active: currentProduct.active
        });
      } else {
        // Crear nuevo producto
        await createProduct({
          name: currentProduct.name || '',
          price: currentProduct.price || 0,
          category: currentProduct.category,
          description: currentProduct.description,
          active: currentProduct.active
        });
      }
      
      // Actualizar lista de productos
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
      // Actualizar la lista de productos
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

  // Manejar eliminación del producto
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    
    setIsDeletingProduct(true);
    
    try {
      await deleteProduct(productToDelete);
      // Actualizar la lista de productos
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

  // Columnas para la tabla de productos
  const columns = [
    { 
      header: 'Nombre', 
      accessor: 'name' 
    },
    { 
      header: 'Precio', 
      accessor: (product: Product) => `${product.price.toFixed(2)}`,
      className: 'text-right' 
    },
    { 
      header: 'Categoría', 
      accessor: 'category' 
    },
    { 
      header: 'Estado', 
      accessor: (product: Product) => (
        <span className={`badge ${product.active ? 'badge-success' : 'badge-error'} gap-1`}>
          {product.active ? (
            <><CheckCircleIcon className="h-4 w-4" /> Activo</>
          ) : (
            <><XCircleIcon className="h-4 w-4" /> Inactivo</>
          )}
        </span>
      )
    },
    { 
      header: 'Acciones', 
      accessor: (product: Product) => (
        <div className="flex space-x-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleProductStatus(product.id, product.active)}
            icon={product.active ? <XCircleIcon className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />}
          >
            {product.active ? 'Desactivar' : 'Activar'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openProductModal(product)}
            icon={<PencilIcon className="h-4 w-4" />}
          >
            Editar
          </Button>
          <Button
            variant="error"
            size="sm"
            onClick={() => confirmDeleteProduct(product.id)}
            icon={<TrashIcon className="h-4 w-4" />}
          >
            Eliminar
          </Button>
        </div>
      ),
      className: 'text-right'
    },
  ];

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">Gestión de Productos</h2>
        </div>
        <div className="mt-4 md:mt-0">
          <Button
            variant="primary"
            onClick={() => openProductModal()}
            icon={<PlusIcon className="h-5 w-5 mr-1" />}
          >
            Nuevo Producto
          </Button>
        </div>
      </div>

      <Card>
        <div className="mb-4">
          <FormField
            label="Buscar productos"
            placeholder="Buscar por nombre, categoría o descripción..."
            value={searchQuery}
            onChange={(e) => searchProducts(e.target.value)}
            leftIcon={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />}
          />
        </div>

        <Table
          columns={columns}
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          isLoading={loading}
          emptyMessage="No se encontraron productos"
        />
      </Card>

      {/* Modal de creación/edición de producto */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={currentProduct?.id ? 'Editar Producto' : 'Crear Nuevo Producto'}
        size="lg"
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              onClick={closeModal}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleSaveProduct}
              isLoading={isSubmitting}
            >
              {currentProduct?.id ? 'Guardar cambios' : 'Crear producto'}
            </Button>
          </>
        }
      >
        <form onSubmit={(e) => { e.preventDefault(); handleSaveProduct(e); }}>
          <FormField
            label="Nombre del producto"
            name="name"
            value={currentProduct?.name || ''}
            onChange={handleInputChange}
            error={formErrors.name}
            required
          />
          
          <FormField
            label="Precio"
            name="price"
            type="number"
            step="0.01"
            value={currentProduct?.price || ''}
            onChange={handleInputChange}
            error={formErrors.price}
            required
          />
          
          <FormField
            label="Categoría"
            name="category"
            value={currentProduct?.category || ''}
            onChange={handleInputChange}
          />
          
          <TextAreaField
            label="Descripción"
            name="description"
            rows={3}
            placeholder="Descripción del producto"
            value={currentProduct?.description || ''}
            onChange={handleInputChange}
          />
          
          <CheckboxField
            label="Producto activo"
            name="active"
            checked={currentProduct?.active || false}
            onChange={(e) => {
              if (currentProduct) {
                setCurrentProduct({
                  ...currentProduct,
                  active: e.target.checked
                });
              }
            }}
          />
        </form>
      </Modal>

      {/* Diálogo de confirmación para eliminar producto */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteProduct}
        title="Eliminar Producto"
        message="¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        isLoading={isDeletingProduct}
      />
    </div>
  );
}
