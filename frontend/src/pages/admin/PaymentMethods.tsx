import { useAdminPaymentMethods } from '../../hooks/useAdminPaymentMethods';
import {
  PlusIcon,
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
import CheckboxField from '../../components/ui/CheckboxField';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Database } from '../../types/database.types';
import { useState } from 'react';

type PaymentMethod = Database['public']['Tables']['payment_methods']['Row'];

export default function PaymentMethods() {
  const {
    paymentMethods,
    loading,
    isModalOpen,
    openPaymentMethodModal,
    closeModal,
    currentPaymentMethod,
    setCurrentPaymentMethod,
    formErrors,
    isSubmitting,
    handleInputChange,
    handleSavePaymentMethod,
    togglePaymentMethodStatus,
    isDeleteConfirmOpen,
    confirmDeletePaymentMethod,
    handleDeletePaymentMethod,
    isDeletingMethod
  } = useAdminPaymentMethods();

  const columns = [
    {
      header: 'Nombre',
      accessor: (method: PaymentMethod) => (
        <div className="flex flex-col gap-1">
          <span className="text-lg font-semibold text-gray-800">{method.name}</span>
        </div>
      )
    },
    {
      header: 'Comisión',
      accessor: (method: PaymentMethod) => (
        <span className="text-gray-700">
          {method.commission_percentage > 0 ? `${method.commission_percentage}%` : 'Sin comisión'}
        </span>
      ),
      className: 'text-center'
    },
    {
      header: 'Estado',
      accessor: (method: PaymentMethod) => (
        <span className={`flex items-center ${method.active ? 'text-primary-600' : 'text-gray-500'}`}>
          {method.active ? (
            <><CheckCircleIcon className="h-5 w-5 mr-1" /> Activo</>
          ) : (
            <><XCircleIcon className="h-5 w-5 mr-1" /> Inactivo</>
          )}
        </span>
      )
    },
    {
      header: 'Acciones',
      accessor: (method: PaymentMethod) => (
        <div className="flex space-x-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => togglePaymentMethodStatus(method.id, method.active)}
            icon={method.active ? <XCircleIcon className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />}
            className={method.active ? "text-primary-600 hover:bg-primary-50 hover:border-primary-200 border-primary-200" : ""}
          >
            {method.active ? 'Desactivar' : 'Activar'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openPaymentMethodModal(method)}
            icon={<PencilIcon className="h-4 w-4" />}
          >
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => confirmDeletePaymentMethod(method.id)}
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
          <h2 className="text-2xl font-bold mb-1 text-gray-800">Gestión de Métodos de Pago</h2>
        </div>
        <div className="mt-4 md:mt-0">
          <Button
            variant="primary"
            onClick={() => openPaymentMethodModal()}
            icon={<PlusIcon className="h-5 w-5 mr-1" />}
          >
            Nuevo Método de Pago
          </Button>
        </div>
      </div>

      {/* Tabla solo en desktop */}
      <div className="hidden md:block">
        <Card>
          <div className="overflow-x-auto">
            <Table
              columns={columns}
              data={paymentMethods}
              keyExtractor={(item) => item.id}
              isLoading={loading}
              emptyMessage="No se encontraron métodos de pago"
            />
          </div>
        </Card>
      </div>

      {/* Cards en mobile */}
      <div className="block md:hidden space-y-4">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></span>
          </div>
        ) : paymentMethods.length === 0 ? (
          <Card>
            <div className="text-center py-8 text-gray-500">No se encontraron métodos de pago</div>
          </Card>
        ) : (
          paymentMethods.map((method) => (
            <Card key={method.id} className="relative p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-lg text-gray-800">{method.name}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Comisión: {method.commission_percentage > 0 ? `${method.commission_percentage}%` : 'Sin comisión'}
                  </div>
                  <div className={`flex items-center text-sm mt-1 ${method.active ? 'text-primary-600' : 'text-gray-500'}`}>
                    {method.active ? (
                      <><CheckCircleIcon className="h-4 w-4 mr-1" /> Activo</>
                    ) : (
                      <><XCircleIcon className="h-4 w-4 mr-1" /> Inactivo</>
                    )}
                  </div>
                </div>
                {/* Menú de acciones */}
                <MobilePaymentMethodActions
                  method={method}
                  onEdit={() => openPaymentMethodModal(method)}
                  onDelete={() => confirmDeletePaymentMethod(method.id)}
                  onToggleStatus={() => togglePaymentMethodStatus(method.id, method.active)}
                />
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modal de creación/edición de método de pago */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={currentPaymentMethod?.id ? 'Editar Método de Pago' : 'Crear Nuevo Método de Pago'}
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
              onClick={handleSavePaymentMethod}
              isLoading={isSubmitting}
            >
              {currentPaymentMethod?.id ? 'Guardar cambios' : 'Crear método de pago'}
            </Button>
          </>
        }
      >
        <form onSubmit={(e) => { e.preventDefault(); handleSavePaymentMethod(e); }}>
          <FormField
            label="Nombre del método de pago"
            name="name"
            value={currentPaymentMethod?.name || ''}
            onChange={handleInputChange}
            error={formErrors.name}
            required
          />
          
          <div>
            <FormField
              label="Comisión (%)"
              name="commission_percentage"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={currentPaymentMethod?.commission_percentage ?? 0}
              onChange={handleInputChange}
              error={formErrors.commission_percentage}
              placeholder="Ej: 3.00 para 3%"
            />
            <p className="text-xs text-gray-500 mt-1">
              Porcentaje de comisión que cobra este método de pago (0-100)
            </p>
          </div>
          
          <CheckboxField
            label="Método activo"
            name="active"
            checked={currentPaymentMethod?.active || false}
            onChange={(e) => {
              if (currentPaymentMethod) {
                setCurrentPaymentMethod({
                  ...currentPaymentMethod,
                  active: e.target.checked
                });
              }
            }}
          />
        </form>
      </Modal>

      {/* Diálogo de confirmación para eliminar método de pago */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={closeModal}
        onConfirm={handleDeletePaymentMethod}
        title="Eliminar Método de Pago"
        message="¿Estás seguro de que deseas eliminar este método de pago? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        isLoading={isDeletingMethod}
      />
    </div>
  );
}

// Componente de acciones mobile
function MobilePaymentMethodActions({ method, onEdit, onDelete, onToggleStatus }: {
  method: PaymentMethod;
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
            {method.active ? <XCircleIcon className="h-4 w-4 mr-2" /> : <CheckCircleIcon className="h-4 w-4 mr-2" />}
            {method.active ? 'Desactivar' : 'Activar'}
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
