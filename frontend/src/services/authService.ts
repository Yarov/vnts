import api from './api';
import { User } from '../store/auth';

export const register = async (data: {
  email: string;
  password: string;
  full_name: string;
  organization_name: string;
  primary_color?: string;
}) => {
  const response = await api.post('/auth/register/', data);
  localStorage.setItem('access_token', response.data.access);
  localStorage.setItem('refresh_token', response.data.refresh);
  
  const user: User = {
    id: response.data.user.id,
    email: response.data.user.email,
    role: response.data.user.role,
    name: response.data.user.full_name,
    organizationId: response.data.user.organization
  };
  
  return user;
};

export const loginAsAdmin = async (email: string, password: string): Promise<User | null> => {
  try {
    const response = await api.post('/auth/login/', { email, password });
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
    
    const user: User = {
      id: response.data.user.id,
      email: response.data.user.email,
      role: response.data.user.role,
      name: response.data.user.full_name,
      organizationId: response.data.user.organization
    };
    
    return user;
  } catch (error) {
    console.error('Error de inicio de sesión:', error);
    return null;
  }
};

export const loginAsSeller = async (code: string, organizationSlug?: string): Promise<User | null> => {
  try {
    const response = await api.post('/auth/seller-login/', {
      numeric_code: code,
      organization_slug: organizationSlug
    });
    
    localStorage.setItem('seller_data', JSON.stringify(response.data.seller));
    
    const user: User = {
      id: response.data.seller.id,
      email: '',
      role: 'seller',
      name: response.data.seller.name,
      organizationId: response.data.seller.organization_id
    };
    
    return user;
  } catch (error) {
    console.error('Error de inicio de sesión como vendedor:', error);
    return null;
  }
};

export const logout = async (): Promise<boolean> => {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    return false;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await api.get('/auth/me/');
    
    const user: User = {
      id: response.data.id,
      email: response.data.email,
      role: response.data.role,
      name: response.data.full_name,
      organizationId: response.data.organization
    };
    
    return user;
  } catch (error) {
    return null;
  }
};
