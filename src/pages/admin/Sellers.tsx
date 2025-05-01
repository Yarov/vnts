import { useAdminSellers } from '../../hooks/useAdminSellers';
import { useState, useEffect } from 'react';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  IdentificationIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import CheckboxField from '../../components/ui/CheckboxField';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Database } from '../../types/database.types';

type Seller = Database['public']['Tables']['sellers']['Row'];

export default function Sellers() {
  const {
    filteredSellers,
    loading,
    searchTerm,
    setSearchTerm,
    isModalOpen,
    openSellerModal,
    closeModal,
    currentSeller,
    setCurrentSeller,
    formErrors,
    setFormErrors,
    isSubmitting,
    handleInputChange,
    handleSaveSeller,
    toggleSellerStatus,
    isDeleteConfirmOpen,
    confirmDeleteSeller,
    handleDeleteSeller,
    isDeletingSeller
  } = useAdminSellers();

  const columns = [
    {
      header: 'Nombre',
      accessor: (seller: Seller) => seller.name
    },
    {
      header: 'Código',
      accessor: (seller: Seller) => (
        <span className="badge badge-outline font-mono">
          {seller.numeric_code}
        </span>
      )
    },
    {
      header: 'Estado',
      accessor: (seller: Seller) => (
        <span className={`flex items-center ${seller.active ? 'text-green-600' : 'text-red-600'}`}>
          {seller.active ? (
            <><CheckCircleIcon className="h-5 w-5 mr-1" /> Activo</>
          ) : (
            <><XCircleIcon className="h-5 w-5 mr-1" /> Inactivo</>
          )}
        </span>
      )
    },
    {
      header: 'Comisión (%)',
      accessor: (seller: Seller) => seller.commission_percentage
    },
    {
      header: 'Acciones',
      accessor: (seller: Seller) => (
        <div className="flex space-x-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleSellerStatus(seller.id, seller.active)}
            icon={seller.active ? <XCircleIcon className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />}
          >
            {seller.active ? 'Desactivar' : 'Activar'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openSellerModal(seller)}
            icon={<PencilIcon className="h-4 w-4" />}
          >
            Editar
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => confirmDeleteSeller(seller.id)}
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
          <h2 className="text-2xl font-bold mb-1">Gestión de Vendedores</h2>
        </div>
        <div className="mt-4 md:mt-0">
          <Button
            variant="primary"
            onClick={() => openSellerModal()}
            icon={<PlusIcon className="h-5 w-5 mr-1" />}
          >
            Nuevo Vendedor
          </Button>
        </div>
      </div>

      <Card>
        <div className="mb-4">
          <FormField
            label="Buscar vendedores"
            placeholder="Buscar por nombre o código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />}
          />
        </div>
        <Table
          columns={columns}
          data={filteredSellers}
          keyExtractor={(item) => item.id}
          isLoading={loading}
          emptyMessage="No se encontraron vendedores"
        />
      </Card>

      {/* Modal de creación/edición de vendedor */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={currentSeller?.id ? 'Editar Vendedor' : 'Crear Nuevo Vendedor'}
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
              onClick={handleSaveSeller}
              loading={isSubmitting}
            >
              {currentSeller?.id ? 'Guardar cambios' : 'Crear vendedor'}
            </Button>
          </>
        }
      >
        <form onSubmit={(e) => { e.preventDefault(); handleSaveSeller(e); }}>
          <FormField
            label="Nombre del vendedor"
            name="name"
            value={currentSeller?.name || ''}
            onChange={handleInputChange}
            error={formErrors.name}
            required
          />
          <FormField
            label="Código numérico"
            name="numeric_code"
            value={currentSeller?.numeric_code || ''}
            onChange={handleInputChange}
            error={formErrors.numeric_code}
            required
          />
          <FormField
            label="Comisión (%)"
            name="commission_percentage"
            type="number"
            value={currentSeller?.commission_percentage || 0}
            onChange={handleInputChange}
          />
          <CheckboxField
            label="Vendedor activo"
            name="active"
            checked={currentSeller?.active || false}
            onChange={(e) => {
              if (currentSeller) {
                setCurrentSeller({
                  ...currentSeller,
                  active: e.target.checked
                });
              }
            }}
          />
        </form>
      </Modal>

      {/* Diálogo de confirmación para eliminar vendedor */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={closeModal}
        onConfirm={handleDeleteSeller}
        title="Eliminar Vendedor"
        message="¿Estás seguro de que deseas eliminar este vendedor? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        isLoading={isDeletingSeller}
      />
    </div>
  );
}
