import { useAdminProducts } from '../../hooks/useAdminProducts';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
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
  // Usar el hook de admin para productos
  const {
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
    isDeleteConfirmOpen,
    confirmDeleteProduct,
    handleDeleteProduct,
    isDeletingProduct
  } = useAdminProducts();

  // Columnas para la tabla de productos
  const columns = [
    {
      header: 'Nombre',
      accessor: (product: Product) => product.name
    },
    {
      header: 'Precio',
      accessor: (product: Product) => `${product.price.toFixed(2)}`,
      className: 'text-right'
    },
    {
      header: 'Categoría',
      accessor: (product: Product) => product.category ?? ''
    },
    {
      header: 'Estado',
      accessor: (product: Product) => (
        <span className={`flex items-center ${product.active ? 'text-green-600' : 'text-red-600'}`}>
          {product.active ? (
            <><CheckCircleIcon className="h-5 w-5 mr-1" /> Activo</>
          ) : (
            <><XCircleIcon className="h-5 w-5 mr-1" /> Inactivo</>
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
            variant="danger"
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
              loading={isSubmitting}
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
        onClose={closeModal}
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
