import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { userAtom } from '../store/auth';
import { getAllPaymentMethods, createPaymentMethod, updatePaymentMethod, deletePaymentMethod } from '../services/paymentMethodService';
import { Database } from '../types/database.types';

type PaymentMethod = Database['public']['Tables']['payment_methods']['Row'];

export function useAdminPaymentMethods() {
  const [user] = useAtom(userAtom);
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
    if (user?.organizationId) {
      fetchPaymentMethods();
    }
  }, [user?.organizationId]);

  // Función para obtener métodos de pago de Django
  const fetchPaymentMethods = async () => {
    if (!user?.organizationId) return;
    setLoading(true);
    try {
      const data = await getAllPaymentMethods(user.organizationId);
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
        active: true,
        commission_percentage: 0
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
        await updatePaymentMethod(currentPaymentMethod.id, {
          name: currentPaymentMethod.name || '',
          active: currentPaymentMethod.active ?? true,
          commission_percentage: Number(currentPaymentMethod.commission_percentage) || 0
        });
      } else {
        if (!user?.organizationId) {
          throw new Error('No se pudo obtener el organization_id del usuario');
        }
        await createPaymentMethod({
          name: currentPaymentMethod.name || '',
          active: currentPaymentMethod.active ?? true,
          commission_percentage: Number(currentPaymentMethod.commission_percentage) || 0,
          organization: user.organizationId
        });
      }
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
      await updatePaymentMethod(id, { active: !currentStatus });
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
      await deletePaymentMethod(methodToDelete);
      setPaymentMethods(paymentMethods.filter(method => method.id !== methodToDelete));
      setIsDeleteConfirmOpen(false);
    } catch (error) {
      console.error('Error al eliminar método de pago:', error);
      alert('Error al eliminar método de pago. Puede que tenga ventas asociadas.');
    } finally {
      setIsDeletingMethod(false);
    }
  };

  return {
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
  };
}