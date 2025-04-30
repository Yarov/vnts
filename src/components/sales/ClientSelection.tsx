import { useState } from 'react';
import {
  MagnifyingGlassIcon,
  UserIcon,
  PlusIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import Card from '../ui/Card';
import Button from '../ui/Button';
import FormField from '../ui/FormField';
import { Database } from '../../types/database.types';

type Client = Database['public']['Tables']['clients']['Row'];

interface ClientSelectionProps {
  clients: Client[];
  selectedClientId: string | null;
  setSelectedClientId: (id: string | null) => void;
  selectedClient: Client | null;
  goToPreviousStep: () => void;
  goToNextStep: () => void;
  openClientModal: () => void;
}

const ClientSelection: React.FC<ClientSelectionProps> = ({
  clients,
  selectedClientId,
  setSelectedClientId,
  selectedClient,
  goToPreviousStep,
  goToNextStep,
  openClientModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar clientes por término de búsqueda
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.reference && client.reference.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Card title="Selección de Cliente">
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-4">
          Seleccione un cliente existente o cree uno nuevo. Este paso es opcional, puede continuar sin seleccionar un cliente.
        </p>
        
        <div className="flex space-x-2 mb-4">
          <div className="flex-1 relative">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar cliente por nombre o referencia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <Button
            variant="outline"
            onClick={openClientModal}
            icon={<PlusIcon className="h-4 w-4 mr-1" />}
          >
            Nuevo Cliente
          </Button>
        </div>
        
        {/* Lista de clientes filtrados */}
        {searchTerm && filteredClients.length > 0 && (
          <div className="bg-white shadow-md rounded-md border border-gray-200 max-h-64 overflow-y-auto mb-4">
            <ul className="divide-y divide-gray-200">
              {filteredClients.map(client => (
                <li 
                  key={client.id}
                  className={`p-3 hover:bg-gray-50 cursor-pointer ${selectedClientId === client.id ? 'bg-primary-50' : ''}`}
                  onClick={() => setSelectedClientId(client.id)}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mr-3">
                      <UserIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{client.name}</p>
                      {client.reference && (
                        <p className="text-sm text-gray-500">{client.reference}</p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Cliente seleccionado */}
        {selectedClient && (
          <div className="bg-primary-50 border border-primary-200 rounded-md p-4 mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mr-4">
                <UserIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{selectedClient.name}</h3>
                {selectedClient.reference && (
                  <p className="text-sm text-gray-600">{selectedClient.reference}</p>
                )}
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedClientId(null)}
              >
                Cambiar Cliente
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={goToPreviousStep}
          icon={<ArrowLeftIcon className="h-5 w-5 mr-1" />}
        >
          Volver a Productos
        </Button>
        <Button
          variant="primary"
          onClick={goToNextStep}
          icon={<ArrowRightIcon className="h-5 w-5 ml-1" />}
          iconPosition="right"
        >
          Continuar a Pago
        </Button>
      </div>
    </Card>
  );
};

export default ClientSelection;
