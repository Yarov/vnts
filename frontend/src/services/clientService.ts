import api from './api';

export interface Client {
  id: string;
  name: string;
  reference: string;
  organization: string;
  created_at: string;
  updated_at: string;
}

export const getAllClients = async (organizationId?: string) => {
  const params: any = {};
  if (organizationId) params.organization_id = organizationId;
  
  const response = await api.get('/clients/', { params });
  return response.data.results || response.data;
};

export const getClientById = async (id: string): Promise<Client | null> => {
  try {
    const response = await api.get(`/clients/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    return null;
  }
};

export const createClient = async (client: Partial<Client>, keepOrganization: boolean = false): Promise<Client | null> => {
  try {
    let payload = client;
    if (!keepOrganization) {
      const { organization, ...clientData } = client;
      payload = clientData;
    }
    const response = await api.post('/clients/', payload);
    return response.data;
  } catch (error) {
    console.error('Error al crear cliente:', error);
    return null;
  }
};

export const updateClient = async (id: string, client: Partial<Client>): Promise<Client | null> => {
  try {
    const response = await api.patch(`/clients/${id}/`, client);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    return null;
  }
};

export const deleteClient = async (id: string): Promise<boolean> => {
  try {
    await api.delete(`/clients/${id}/`);
    return true;
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    return false;
  }
};

export const getOrCreateClient = async (name: string, organizationId: string): Promise<Client | null> => {
  try {
    // Buscar cliente existente
    const response = await api.get('/clients/', {
      params: { search: name, organization_id: organizationId }
    });
    
    const clients = response.data.results || response.data;
    if (clients.length > 0) {
      return clients[0];
    }
    
    // Crear nuevo cliente manteniendo el campo organization
    return createClient({ name, organization: organizationId }, true);
  } catch (error) {
    console.error('Error al obtener o crear cliente:', error);
    return null;
  }
};
