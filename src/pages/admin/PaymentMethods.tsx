import { useAdminPaymentMethods } from '../../hooks/useAdminPaymentMethods';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import CheckboxField from '../../components/ui/CheckboxField';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Database } from '../../types/database.types';

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
    setFormErrors,
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
      accessor: (method: PaymentMethod) => method.name
    },
    {
      header: 'Estado',
      accessor: (method: PaymentMethod) => (
        <span className={`flex items-center ${method.active ? 'text-green-600' : 'text-red-600'}`}>
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
            variant="danger"
            size="sm"
            onClick={() => confirmDeletePaymentMethod(method.id)}
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
          <h2 className="text-2xl font-bold mb-1">Gestión de Métodos de Pago</h2>
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

      <Card>
        <Table
          columns={columns}
          data={paymentMethods}
          keyExtractor={(item) => item.id}
          isLoading={loading}
          emptyMessage="No se encontraron métodos de pago"
        />
      </Card>

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
              loading={isSubmitting}
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
