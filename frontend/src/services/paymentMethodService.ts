import api from './api';

export interface PaymentMethod {
  id: string;
  name: string;
  active: boolean;
  commission_percentage: number;
  organization: string;
  created_at: string;
  updated_at: string;
}

export const getAllPaymentMethods = async (organizationId?: string, activeOnly: boolean = false) => {
  const params: any = {};
  if (organizationId) params.organization_id = organizationId;
  if (activeOnly) params.active = true;
  
  const response = await api.get('/payments/methods/', { params });
  return response.data.results || response.data;
};

export const getPaymentMethodById = async (id: string): Promise<PaymentMethod | null> => {
  try {
    const response = await api.get(`/payments/methods/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener método de pago:', error);
    return null;
  }
};

export const createPaymentMethod = async (paymentMethod: Partial<PaymentMethod>): Promise<PaymentMethod | null> => {
  try {
    const { organization, ...paymentData } = paymentMethod;
    const response = await api.post('/payments/methods/', paymentData);
    return response.data;
  } catch (error) {
    console.error('Error al crear método de pago:', error);
    return null;
  }
};

export const updatePaymentMethod = async (id: string, paymentMethod: Partial<PaymentMethod>): Promise<PaymentMethod | null> => {
  try {
    const response = await api.patch(`/payments/methods/${id}/`, paymentMethod);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar método de pago:', error);
    return null;
  }
};

export const deletePaymentMethod = async (id: string): Promise<boolean> => {
  try {
    await api.delete(`/payments/methods/${id}/`);
    return true;
  } catch (error) {
    console.error('Error al eliminar método de pago:', error);
    return false;
  }
};
