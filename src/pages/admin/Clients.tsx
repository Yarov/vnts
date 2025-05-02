import { useAdminClients } from '../../hooks/useAdminClients';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import { Database } from '../../types/database.types';
import Modal from '../../components/ui/Modal';

type Client = Database['public']['Tables']['clients']['Row'];

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
        return stats.purchase_count || 0;
      },
      className: 'text-center'
    },
    {
      header: 'Última compra',
      accessor: (client: any) => {
        const stats = getClientStats(client.id);
        return stats.last_purchase
          ? new Date(stats.last_purchase).toLocaleDateString()
          : 'Nunca';
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
            variant="danger"
            size="sm"
            onClick={() => handleDeleteClient(client.id)}
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
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Gestión de Clientes
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Button
            variant="primary"
            onClick={() => openClientModal()}
            icon={<PlusIcon className="h-5 w-5 mr-1" />}
          >
            Nuevo Cliente
          </Button>
        </div>
      </div>

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

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={currentClient?.id ? 'Editar Cliente' : 'Crear Nuevo Cliente'}
        size="md"
      >
        <form onSubmit={handleSaveClient}>
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
          <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              className="sm:col-start-2"
            >
              {currentClient?.id ? 'Guardar cambios' : 'Crear cliente'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={closeModal}
              className="mt-3 sm:mt-0 sm:col-start-1"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
