import { useAdminProducts } from '../../hooks/useAdminProducts';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  EllipsisVerticalIcon
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
import { useState } from 'react';

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
  } = useAdminProducts();

  // Columnas para la tabla de productos
  const columns = [
    {
      header: 'Nombre',
      accessor: (product: Product) => (
        <div className="flex flex-col gap-1">
          <span className="text-lg font-semibold text-gray-800">{product.category || 'Sin categoría'}</span>
          <p className="text-sm text-gray-600">{product.name}</p>
        </div>
      )
    },
    {
      header: 'Precio',
      accessor: (product: Product) => `${product.price.toFixed(2)}`,
      className: 'text-right'
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
      ),
      hideOnMobile: true
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
            variant="outline"
            size="sm"
            onClick={() => confirmDeleteProduct(product.id)}
            icon={<TrashIcon className="h-4 w-4" />}
            className="text-primary-600 hover:bg-primary-50 hover:border-primary-200 border-primary-200"
          >
            Eliminar
          </Button>
        </div>
      ),
      className: 'text-right',
      hideOnMobile: true
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

      {/* Tabla solo en desktop */}
      <div className="hidden md:block">
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
      </div>

      {/* Cards en mobile */}
      <div className="block md:hidden space-y-4">
        <FormField
          label="Buscar productos"
          placeholder="Buscar por nombre, categoría o descripción..."
          value={searchQuery}
          onChange={(e) => searchProducts(e.target.value)}
          leftIcon={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />}
        />
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card>
            <div className="text-center py-8 text-gray-500">No se encontraron productos</div>
          </Card>
        ) : (
          filteredProducts.map((product) => (
            <Card key={product.id} className="relative p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-lg text-gray-800">{product.name}</div>
                  <div className="text-sm text-gray-500">{product.category}</div>
                </div>
                {/* Menú de acciones */}
                <MobileProductActions
                  product={product}
                  onEdit={() => openProductModal(product)}
                  onDelete={() => confirmDeleteProduct(product.id)}
                  onToggleStatus={() => toggleProductStatus(product.id, product.active)}
                />
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-primary-700 font-semibold text-lg">${Number(product.price).toFixed(2)}</span>
                <span className={`flex items-center text-xs ${product.active ? 'text-green-600' : 'text-red-600'}`}>{product.active ? <CheckCircleIcon className="h-4 w-4 mr-1" /> : <XCircleIcon className="h-4 w-4 mr-1" />}{product.active ? 'Activo' : 'Inactivo'}</span>
              </div>
            </Card>
          ))
        )}
      </div>

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
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                closeModal();
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSaveProduct();
              }}
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

          {/* Selector de sucursales - solo si hay múltiples */}
          {branches.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sucursales (opcional)
              </label>
              <select
                multiple
                value={selectedBranches}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                  setSelectedBranches(selected);
                }}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                size={Math.min(branches.length, 5)}
              >
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name} ({branch.code})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Mantén presionado Ctrl/Cmd para seleccionar múltiples. Si no seleccionas ninguna, el producto estará disponible en todas las sucursales.
              </p>
            </div>
          )}

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
        onClose={closeDeleteConfirm}
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

// Componente de acciones mobile
function MobileProductActions({ product, onEdit, onDelete, onToggleStatus }: {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
        onClick={() => setOpen((v) => !v)}
        aria-label="Acciones"
      >
        <EllipsisVerticalIcon className="h-6 w-6 text-gray-500" />
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1">
          <button
            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => { setOpen(false); onEdit(); }}
          >
            <PencilIcon className="h-4 w-4 mr-2" /> Editar
          </button>
          <button
            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => { setOpen(false); onToggleStatus(); }}
          >
            {product.active ? <XCircleIcon className="h-4 w-4 mr-2" /> : <CheckCircleIcon className="h-4 w-4 mr-2" />}
            {product.active ? 'Desactivar' : 'Activar'}
          </button>
          <button
            className="w-full flex items-center px-4 py-2 text-sm text-primary-600 hover:bg-primary-50"
            onClick={() => { setOpen(false); onDelete(); }}
          >
            <TrashIcon className="h-4 w-4 mr-2" /> Eliminar
          </button>
        </div>
      )}
    </div>
  );
}
