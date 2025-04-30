import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { supabase } from '../../lib/supabase';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import { Database } from '../../types/database.types';

type PaymentMethod = Database['public']['Tables']['payment_methods']['Row'];

export default function PaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState<Partial<PaymentMethod> | null>(null);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar métodos de pago al montar el componente
  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  // Función para obtener métodos de pago de Supabase
  const fetchPaymentMethods = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (error) {
      console.error('Error al cargar métodos de pago:', error);
      alert('Error al cargar métodos de pago. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal para crear/editar método de pago
  const openPaymentMethodModal = (paymentMethod?: PaymentMethod) => {
    setFormErrors({});
    if (paymentMethod) {
      setCurrentPaymentMethod({...paymentMethod});
    } else {
      setCurrentPaymentMethod({
        name: '',
        active: true
      });
    }
    setIsModalOpen(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentPaymentMethod(null);
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (currentPaymentMethod) {
      if (type === 'checkbox') {
        setCurrentPaymentMethod({
          ...currentPaymentMethod,
          [name]: checked
        });
      } else {
        setCurrentPaymentMethod({
          ...currentPaymentMethod,
          [name]: value
        });
      }
    }
  };

  // Validar formulario
  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!currentPaymentMethod?.name) {
      errors.name = 'El nombre es obligatorio';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Guardar método de pago
  const handleSavePaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !currentPaymentMethod) return;
    
    setIsSubmitting(true);
    
    try {
      if (currentPaymentMethod.id) {
        // Actualizar método de pago existente
        const { error } = await supabase
          .from('payment_methods')
          .update({
            name: currentPaymentMethod.name,
            active: currentPaymentMethod.active
          })
          .eq('id', currentPaymentMethod.id);
        
        if (error) throw error;
      } else {
        // Crear nuevo método de pago
        const { error } = await supabase
          .from('payment_methods')
          .insert([{
            name: currentPaymentMethod.name,
            active: currentPaymentMethod.active
          }]);
        
        if (error) throw error;
      }
      
      // Actualizar lista de métodos de pago
      await fetchPaymentMethods();
      closeModal();
    } catch (error) {
      console.error('Error al guardar método de pago:', error);
      alert('Error al guardar método de pago. Por favor, intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cambiar estado de un método de pago (activar/desactivar)
  const togglePaymentMethodStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .update({ active: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      // Actualizar la lista localmente
      setPaymentMethods(paymentMethods.map(method => {
        if (method.id === id) {
          return { ...method, active: !currentStatus };
        }
        return method;
      }));
    } catch (error) {
      console.error('Error al cambiar estado del método de pago:', error);
      alert('Error al cambiar estado del método de pago. Por favor, intenta de nuevo.');
    }
  };

  // Eliminar un método de pago
  const deletePaymentMethod = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este método de pago?')) return;
    
    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Actualizar la lista localmente
      setPaymentMethods(paymentMethods.filter(method => method.id !== id));
    } catch (error) {
      console.error('Error al eliminar método de pago:', error);
      alert('Error al eliminar método de pago. Puede que tenga ventas asociadas.');
    }
  };

  // Columnas para la tabla de métodos de pago
  const columns = [
    { 
      header: 'Nombre', 
      accessor: 'name' 
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
            onClick={() => deletePaymentMethod(method.id)}
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
            Métodos de Pago
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Button
            variant="primary"
            onClick={() => openPaymentMethodModal()}
            icon={<PlusIcon className="h-5 w-5 mr-1" />}
          >
            Nuevo Método
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
                  {currentPaymentMethod?.id ? 'Editar Método de Pago' : 'Crear Nuevo Método de Pago'}
                </h3>
                
                <form onSubmit={handleSavePaymentMethod}>
                  <FormField
                    label="Nombre del método de pago"
                    name="name"
                    value={currentPaymentMethod?.name || ''}
                    onChange={handleInputChange}
                    error={formErrors.name}
                    required
                  />
                  
                  <div className="flex items-center mb-4">
                    <input
                      id="active"
                      name="active"
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      checked={currentPaymentMethod?.active || false}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                      Método activo
                    </label>
                  </div>
                  
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={isSubmitting}
                      className="sm:col-start-2"
                    >
                      {currentPaymentMethod?.id ? 'Guardar cambios' : 'Crear método'}
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
