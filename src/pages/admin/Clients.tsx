import { useState, useEffect } from 'react';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { supabase } from '../../lib/supabase';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import { Database } from '../../types/database.types';

type Client = Database['public']['Tables']['clients']['Row'];

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState<Partial<Client> | null>(null);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientStats, setClientStats] = useState<any[]>([]);

  // Cargar clientes al montar el componente
  useEffect(() => {
    fetchClients();
    fetchClientStats();
  }, []);

  // Función para obtener clientes de Supabase
  const fetchClients = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      alert('Error al cargar clientes. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener estadísticas de clientes
  const fetchClientStats = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_top_clients', { limit_count: 100 });

      if (error) throw error;
      setClientStats(data || []);
    } catch (error) {
      console.error('Error al cargar estadísticas de clientes:', error);
    }
  };

  // Filtrar clientes según término de búsqueda
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.reference && client.reference.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Abrir modal para crear/editar cliente
  const openClientModal = (client?: Client) => {
    setFormErrors({});
    if (client) {
      setCurrentClient({...client});
    } else {
      setCurrentClient({
        name: '',
        reference: ''
      });
    }
    setIsModalOpen(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentClient(null);
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (currentClient) {
      setCurrentClient({
        ...currentClient,
        [name]: value
      });
    }
  };

  // Validar formulario
  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    if (!currentClient?.name) {
      errors.name = 'El nombre es obligatorio';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Guardar cliente
  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !currentClient) return;

    setIsSubmitting(true);

    try {
      if (currentClient.id) {
        // Actualizar cliente existente
        const { error } = await supabase
          .from('clients')
          .update({
            name: currentClient.name,
            reference: currentClient.reference || null
          })
          .eq('id', currentClient.id);

        if (error) throw error;
      } else {
        // Crear nuevo cliente
        const { error } = await supabase
          .from('clients')
          .insert([{
            name: currentClient.name,
            reference: currentClient.reference || null
          }]);

        if (error) throw error;
      }

      // Actualizar lista de clientes
      await fetchClients();
      closeModal();
    } catch (error) {
      console.error('Error al guardar cliente:', error);
      alert('Error al guardar cliente. Por favor, intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar un cliente
  const deleteClient = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este cliente?')) return;

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Actualizar la lista localmente
      setClients(clients.filter(client => client.id !== id));
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      alert('Error al eliminar cliente. Puede que tenga ventas asociadas.');
    }
  };

  // Obtener estadísticas de un cliente
  const getClientStats = (clientId: string) => {
    const stats = clientStats.find(cs => cs.id === clientId);
    return stats || { purchase_count: 0, last_purchase: null };
  };

  // Columnas para la tabla de clientes
  const columns = [
    {
      header: 'Nombre',
      accessor: 'name'
    },
    {
      header: 'Referencia',
      accessor: (client: Client) => client.reference || '-'
    },
    {
      header: 'Compras',
      accessor: (client: Client) => {
        const stats = getClientStats(client.id);
        return stats.purchase_count || 0;
      },
      className: 'text-center'
    },
    {
      header: 'Última compra',
      accessor: (client: Client) => {
        const stats = getClientStats(client.id);
        return stats.last_purchase
          ? new Date(stats.last_purchase).toLocaleDateString()
          : 'Nunca';
      }
    },
    {
      header: 'Acciones',
      accessor: (client: Client) => (
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
            onClick={() => deleteClient(client.id)}
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

      {/* Modal de creación/edición de cliente */}
      {isModalOpen && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Backdrop */}
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            {/* Modal */}
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  {currentClient?.id ? 'Editar Cliente' : 'Crear Nuevo Cliente'}
                </h3>

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
                      isLoading={isSubmitting}
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
