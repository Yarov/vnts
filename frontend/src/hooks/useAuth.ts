import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { userAtom } from '../store/auth';
import { loginAsAdmin, loginAsSeller, logout, getCurrentUser, register } from '../services/authService';

/**
 * Hook personalizado para manejar la autenticación
 * @returns Objeto con datos y funciones para autenticación
 */
export function useAuth() {
  const [user, setUser] = useAtom(userAtom);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar si hay token al cargar
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token && !user) {
      getCurrentUser().then(userData => {
        if (userData) {
          setUser(userData);
        }
      });
    }
  }, []);

  /**
   * Inicia sesión como administrador
   * @param email Correo electrónico
   * @param password Contraseña
   * @returns true si el login fue exitoso
   */
  const signInAsAdmin = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const userData = await loginAsAdmin(email, password);
      
      if (userData) {
        setUser(userData);
        return true;
      } else {
        setError('Credenciales inválidas');
        return false;
      }
    } catch (err) {
      setError('Error al iniciar sesión');
      console.error('Error de inicio de sesión:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Inicia sesión como vendedor con código numérico
   * @param code Código numérico del vendedor
   * @returns true si el login fue exitoso
   */
  const signInAsSeller = async (code: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const userData = await loginAsSeller(code);
      
      if (userData) {
        setUser(userData);
        return true;
      } else {
        setError('Código de vendedor inválido');
        return false;
      }
    } catch (err) {
      setError('Error al validar el código');
      console.error('Error al iniciar sesión como vendedor:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Registra un nuevo usuario administrador
   * @param email Correo electrónico
   * @param password Contraseña
   * @param fullName Nombre completo
   * @param organizationName Nombre de la organización
   * @returns true si el registro fue exitoso
   */
  const signUp = async (
    email: string, 
    password: string, 
    fullName: string,
    organizationName: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const userData = await register({
        email,
        password,
        full_name: fullName,
        organization_name: organizationName
      });
      
      if (userData) {
        setUser(userData);
        return true;
      } else {
        setError('Error al crear la cuenta. Por favor intenta de nuevo.');
        return false;
      }
    } catch (err) {
      setError('Error al registrar usuario');
      console.error('Error de registro:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cierra la sesión actual
   */
  const signOut = async (): Promise<void> => {
    setLoading(true);

    try {
      await logout();
      setUser(null);
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isSeller: user?.role === 'seller',
    signInAsAdmin,
    signInAsSeller,
    signUp,
    signOut
  };
}