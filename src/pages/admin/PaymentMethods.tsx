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
import CheckboxField from '../../components/ui/CheckboxField';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Database } from '../../types/database.types';

type PaymentMethod = Database['public']['Tables']['payment_methods']['Row'];

export default function PaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState<Partial<PaymentMethod> | null>(null);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState<string | null>(null);
  const [isDeletingMethod, setIsDeletingMethod] = useState(false);

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
  const handleSavePaymentMethod = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
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
  const confirmDeletePaymentMethod = (id: string) => {
    setMethodToDelete(id);
    setIsDeleteConfirmOpen(true);
  };
  
  const handleDeletePaymentMethod = async () => {
    if (!methodToDelete) return;
    
    setIsDeletingMethod(true);
    
    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', methodToDelete);
      
      if (error) throw error;
      
      // Actualizar la lista localmente
      setPaymentMethods(paymentMethods.filter(method => method.id !== methodToDelete));
      setIsDeleteConfirmOpen(false);
    } catch (error) {
      console.error('Error al eliminar método de pago:', error);
      alert('Error al eliminar método de pago. Puede que tenga ventas asociadas.');
    } finally {
      setIsDeletingMethod(false);
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
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={currentPaymentMethod?.id ? 'Editar Método de Pago' : 'Crear Nuevo Método de Pago'}
        size="md"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={closeModal}
              className="ml-2"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleSavePaymentMethod}
              isLoading={isSubmitting}
            >
              {currentPaymentMethod?.id ? 'Guardar cambios' : 'Crear método'}
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
            onChange={handleInputChange}
          />
        </form>
      </Modal>
      
      {/* Diálogo de confirmación para eliminar método de pago */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeletePaymentMethod}
        title="Eliminar Método de Pago"
        message="¿Estás seguro de que deseas eliminar este método de pago? Esta acción no se puede deshacer y podría afectar a las ventas registradas."
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        isLoading={isDeletingMethod}
      />
    </div>
  );
}
