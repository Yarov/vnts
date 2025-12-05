import api from './api';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  primary_color: string;
  created_at: string;
  updated_at: string;
}

export const getOrganizationBySlug = async (slug: string): Promise<Organization | null> => {
  try {
    const response = await api.get(`/organizations/${slug}/`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener organización:', error);
    return null;
  }
};

export const getAllOrganizations = async () => {
  try {
    const response = await api.get('/organizations/');
    return response.data.results || response.data;
  } catch (error) {
    console.error('Error al obtener organizaciones:', error);
    return [];
  }
};

export const updateOrganization = async (id: string, organization: Partial<Organization>): Promise<Organization | null> => {
  try {
    const response = await api.put(`/organizations/${id}/`, organization);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar organización:', error);
    return null;
  }
};
