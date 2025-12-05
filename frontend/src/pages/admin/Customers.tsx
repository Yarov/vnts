import React, { useState } from 'react';
import { Button, Card, Modal, FormField, CheckboxField } from '../../components/ui';
import { Database } from '../../types/database.types';
import { CheckCircleIcon, XCircleIcon, PencilIcon, TrashIcon, EllipsisVerticalIcon, PlusIcon } from '@heroicons/react/24/outline';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useAdminCustomers } from '../../hooks/useAdminCustomers';

type Customer = Database['public']['Tables']['customers']['Row'];

export default function Customers() {
  const {
    customers,
    loading,
    isModalOpen,
    openCustomerModal,
    closeModal,
    currentCustomer,
    setCurrentCustomer,
    formErrors,
    isSubmitting,
    handleInputChange,
    handleSaveCustomer,
    toggleCustomerStatus,
    isDeleteConfirmOpen,
    confirmDeleteCustomer,
    handleDeleteCustomer,
    isDeletingCustomer
  } = useAdminCustomers();

  const columns = [
    {
      header: 'Cliente',
      accessor: (customer: Customer) => (
        <div className="flex flex-col gap-1">
          <span className="text-lg font-semibold text-gray-800">{customer.name}</span>
          <span className="text-sm text-gray-500">{customer.email}</span>
        </div>
      )
    },
    {
      header: 'Teléfono',
      accessor: (customer: Customer) => (
        <span className="text-gray-600">{customer.phone || 'No especificado'}</span>
      )
    },
    {
      header: 'Estado',
      accessor: (customer: Customer) => (
        <span className={`flex items-center ${customer.active ? 'text-primary-600' : 'text-gray-500'}`}>
          {customer.active ? (
            <><CheckCircleIcon className="h-5 w-5 mr-1" /> Activo</>
          ) : (
            <><XCircleIcon className="h-5 w-5 mr-1" /> Inactivo</>
          )}
        </span>
      )
    },
    {
      header: 'Acciones',
      accessor: (customer: Customer) => (
        <div className="flex space-x-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleCustomerStatus(customer.id, customer.active)}
            icon={customer.active ? <XCircleIcon className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />}
            className={customer.active ? "text-primary-600 hover:bg-primary-50 hover:border-primary-200 border-primary-200" : ""}
          >
            {customer.active ? 'Desactivar' : 'Activar'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openCustomerModal(customer)}
            icon={<PencilIcon className="h-4 w-4" />}
          >
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => confirmDeleteCustomer(customer.id)}
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
            onClick={() => openCustomerModal()}
            icon={<PlusIcon className="h-5 w-5 mr-1" />}
          >
            Nuevo Cliente
          </Button>
        </div>
      </div>

      {/* Tabla solo en desktop */}
      <div className="hidden md:block">
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></span>
                      </div>
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      No se encontraron clientes
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-lg font-semibold text-gray-800">{customer.name}</span>
                          <span className="text-sm text-gray-500">{customer.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600">{customer.phone || 'No especificado'}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`flex items-center justify-center ${customer.active ? 'text-primary-600' : 'text-gray-500'}`}>
                          {customer.active ? (
                            <><CheckCircleIcon className="h-5 w-5 mr-1" /> Activo</>
                          ) : (
                            <><XCircleIcon className="h-5 w-5 mr-1" /> Inactivo</>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex space-x-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleCustomerStatus(customer.id, customer.active)}
                            icon={customer.active ? <XCircleIcon className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />}
                            className={customer.active ? "text-primary-600 hover:bg-primary-50 hover:border-primary-200 border-primary-200" : ""}
                          >
                            {customer.active ? 'Desactivar' : 'Activar'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openCustomerModal(customer)}
                            icon={<PencilIcon className="h-4 w-4" />}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => confirmDeleteCustomer(customer.id)}
                            icon={<TrashIcon className="h-4 w-4" />}
                            className="text-primary-600 hover:bg-primary-50 hover:border-primary-200 border-primary-200"
                          >
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Cards en mobile */}
      <div className="block md:hidden space-y-4">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></span>
          </div>
        ) : customers.length === 0 ? (
          <Card>
            <div className="text-center py-8 text-gray-500">No se encontraron clientes</div>
          </Card>
        ) : (
          customers.map((customer) => (
            <Card key={customer.id} className="relative p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-lg text-gray-800">{customer.name}</div>
                  <div className="text-sm text-gray-500">{customer.email}</div>
                  <div className="text-sm text-gray-600 mt-1">{customer.phone || 'No especificado'}</div>
                  <div className={`flex items-center text-sm mt-1 ${customer.active ? 'text-primary-600' : 'text-gray-500'}`}>
                    {customer.active ? (
                      <><CheckCircleIcon className="h-4 w-4 mr-1" /> Activo</>
                    ) : (
                      <><XCircleIcon className="h-4 w-4 mr-1" /> Inactivo</>
                    )}
                  </div>
                </div>
                {/* Menú de acciones */}
                <MobileCustomerActions
                  customer={customer}
                  onEdit={() => openCustomerModal(customer)}
                  onDelete={() => confirmDeleteCustomer(customer.id)}
                  onToggleStatus={() => toggleCustomerStatus(customer.id, customer.active)}
                />
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modal de creación/edición de cliente */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={currentCustomer?.id ? 'Editar Cliente' : 'Crear Nuevo Cliente'}
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
              onClick={handleSaveCustomer}
              isLoading={isSubmitting}
            >
              {currentCustomer?.id ? 'Guardar cambios' : 'Crear cliente'}
            </Button>
          </>
        }
      >
        <form onSubmit={(e) => { e.preventDefault(); handleSaveCustomer(e); }}>
          <FormField
            label="Nombre del cliente"
            name="name"
            value={currentCustomer?.name || ''}
            onChange={handleInputChange}
            error={formErrors.name}
            required
          />
          <FormField
            label="Email"
            name="email"
            type="email"
            value={currentCustomer?.email || ''}
            onChange={handleInputChange}
            error={formErrors.email}
            required
          />
          <FormField
            label="Teléfono"
            name="phone"
            value={currentCustomer?.phone || ''}
            onChange={handleInputChange}
            error={formErrors.phone}
          />
          <CheckboxField
            label="Cliente activo"
            name="active"
            checked={currentCustomer?.active || false}
            onChange={(e) => {
              if (currentCustomer) {
                setCurrentCustomer({
                  ...currentCustomer,
                  active: e.target.checked
                });
              }
            }}
          />
        </form>
      </Modal>

      {/* Diálogo de confirmación para eliminar cliente */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={closeModal}
        onConfirm={handleDeleteCustomer}
        title="Eliminar Cliente"
        message="¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        isLoading={isDeletingCustomer}
      />
    </div>
  );
}

// Componente de acciones mobile
function MobileCustomerActions({ customer, onEdit, onDelete, onToggleStatus }: {
  customer: Customer;
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
            {customer.active ? <XCircleIcon className="h-4 w-4 mr-2" /> : <CheckCircleIcon className="h-4 w-4 mr-2" />}
            {customer.active ? 'Desactivar' : 'Activar'}
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