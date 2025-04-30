import { 
  UserIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import Button from '../ui/Button';
import FormField from '../ui/FormField';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientName: string;
  setClientName: (name: string) => void;
  clientReference: string;
  setClientReference: (reference: string) => void;
  saveClient: () => void;
}

const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  clientName,
  setClientName,
  clientReference,
  setClientReference,
  saveClient
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 overflow-y-auto z-50">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 mb-4">
              <UserIcon className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 text-center mb-4">
              Nuevo Cliente
            </h3>
            
            <div className="space-y-4">
              <FormField
                label="Nombre del cliente"
                placeholder="Nombre completo"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
              />
              
              <FormField
                label="Referencia (opcional)"
                placeholder="Teléfono, email, etc."
                value={clientReference}
                onChange={(e) => setClientReference(e.target.value)}
                leftIcon={
                  <div className="flex">
                    <PhoneIcon className="h-5 w-5 text-gray-400 mr-1" />
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                }
              />
            </div>
            
            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
              <Button
                variant="primary"
                onClick={saveClient}
                className="sm:col-start-2"
              >
                Guardar cliente
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                className="mt-3 sm:mt-0 sm:col-start-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientModal;
