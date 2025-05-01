import { useState } from 'react';
import { useAtom } from 'jotai';
import { userAtom, User } from '../store/auth';
import { loginAsAdmin, loginAsSeller, logout } from '../services/authService';

/**
 * Hook personalizado para manejar la autenticación
 * @returns Objeto con datos y funciones para autenticación
 */
export function useAuth() {
  const [user, setUser] = useAtom(userAtom);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    signOut
  };
}
