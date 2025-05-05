import React, { useState } from 'react';
import { useAdminClients } from '../../hooks/useAdminClients';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  PhoneIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import Modal from '../../components/ui/Modal';

export default function Clients() {
  const {
    filteredClients,
    loading,
    searchTerm,
    setSearchTerm,
    isModalOpen,
    openClientModal,
    closeModal,
    currentClient,
    formErrors,
    isSubmitting,
    handleInputChange,
    handleSaveClient,
    handleDeleteClient,
    getClientStats
  } = useAdminClients();

  const columns = [
    {
      header: 'Nombre',
      accessor: (client: any) => client.name
    },
    {
      header: 'Referencia',
      accessor: (client: any) => client.reference || '-'
    },
    {
      header: 'Compras',
      accessor: (client: any) => {
        const stats = getClientStats(client.id);
        return (
          <span className="text-gray-800 font-medium">{stats.purchase_count || 0}</span>
        );
      },
      className: 'text-center'
    },
    {
      header: 'Última compra',
      accessor: (client: any) => {
        const stats = getClientStats(client.id);
        return (
          <span className="text-gray-600">
            {stats.last_purchase
              ? new Date(String(stats.last_purchase)).toLocaleDateString()
              : 'Nunca'}
          </span>
        );
      }
    },
    {
      header: 'Acciones',
      accessor: (client: any) => (
        <div className="flex space-x-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openClientModal(client)}
            icon={<PencilIcon className="h-4 w-4" />}
          >
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteClient(client.id)}
            icon={<TrashIcon className="h-4 w-4" />}
            className="text-primary-600 hover:bg-primary-50 hover:border-primary-200 border-primary-200"
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
          <h2 className="text-2xl font-bold mb-1 text-gray-800">Gestión de Clientes</h2>
        </div>
        <div className="mt-4 md:mt-0">
          <Button
            variant="primary"
            onClick={() => openClientModal()}
            icon={<PlusIcon className="h-5 w-5 mr-1" />}
          >
            Nuevo Cliente
          </Button>
        </div>
      </div>

      {/* Tabla solo en desktop */}
      <div className="hidden md:block">
        <Card>
          <div className="mb-4">
            <FormField
              label="Buscar clientes"
              placeholder="Buscar por nombre o referencia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />}
            />
          </div>
          <Table
            columns={columns}
            data={filteredClients}
            keyExtractor={(item) => item.id}
            isLoading={loading}
            emptyMessage="No se encontraron clientes"
          />
        </Card>
      </div>

      {/* Cards en mobile */}
      <div className="block md:hidden space-y-4">
        <FormField
          label="Buscar clientes"
          placeholder="Buscar por nombre o referencia..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />}
        />
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></span>
          </div>
        ) : filteredClients.length === 0 ? (
          <Card>
            <div className="text-center py-8 text-gray-500">No se encontraron clientes</div>
          </Card>
        ) : (
          filteredClients.map((client) => (
            <Card key={client.id} className="relative p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-lg text-gray-800">{client.name}</div>
                  <div className="text-sm text-gray-500">{client.reference || '-'}</div>
                </div>
                {/* Menú de acciones */}
                <MobileClientActions
                  onEdit={() => openClientModal(client)}
                  onDelete={() => handleDeleteClient(client.id)}
                />
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-gray-500">Compras: {getClientStats(client.id).purchase_count || 0}</span>
                <span className="text-xs text-gray-500">Última: {getClientStats(client.id).last_purchase ? new Date(String(getClientStats(client.id).last_purchase)).toLocaleDateString() : 'Nunca'}</span>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modal de creación/edición de cliente */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={currentClient?.id ? 'Editar Cliente' : 'Crear Nuevo Cliente'}
        size="md"
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
              onClick={handleSaveClient}
              isLoading={isSubmitting}
            >
              {currentClient?.id ? 'Guardar cambios' : 'Crear cliente'}
            </Button>
          </>
        }
      >
        <form onSubmit={(e) => { e.preventDefault(); handleSaveClient(e); }}>
          <FormField
            label="Nombre del cliente"
            name="name"
            value={currentClient?.name || ''}
            onChange={handleInputChange}
            error={formErrors.name}
            required
          />
          <FormField
            label="Referencia (teléfono, email, etc.)"
            name="reference"
            value={currentClient?.reference || ''}
            onChange={handleInputChange}
            leftIcon={
              <div className="flex">
                <PhoneIcon className="h-5 w-5 text-gray-400 mr-1" />
              </div>
            }
          />
        </form>
      </Modal>
    </div>
  );
}

// Componente de acciones mobile
function MobileClientActions({ onEdit, onDelete }: {
  onEdit: () => void;
  onDelete: () => void;
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