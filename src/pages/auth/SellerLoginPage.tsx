import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  KeyIcon,
  ArrowRightIcon,
  ExclamationCircleIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';

interface SellerLoginPageProps {
  onLogin: (sellerId: string, sellerName: string) => void;
}

export default function SellerLoginPage({ onLogin }: SellerLoginPageProps) {
  const [code, setCode] = useState('');
  const navigate = useNavigate();
  const { loading, error } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // signInAsSeller ahora retorna true/false, pero necesitamos el usuario para obtener el UUID y nombre
    const { userData, success } = await (async () => {
      // Hook useAuth no retorna el usuario, así que replicamos la lógica aquí
      // Usamos loginAsSeller directamente
      const { loginAsSeller } = await import('../../services/authService');
      const user = await loginAsSeller(code);
      return { userData: user, success: !!user };
    })();

    if (success && userData) {
      onLogin(userData.id, userData.name || 'Vendedor');
      navigate('/seller');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Lado izquierdo - Banner */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col justify-center items-center bg-gradient-to-br from-primary-600 to-primary-900 text-white p-12">
        <div className="w-full max-w-md mx-auto">
          <div className="mb-8">
            <div className="bg-white/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-6">
              <ShoppingCartIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">VNTS</h1>
            <p className="text-xl opacity-90 mb-6">Portal de acceso para vendedores</p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start">
              <div className="mr-4 bg-white/10 p-2 rounded-full">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium mb-1">Registra ventas fácilmente</h3>
                <p className="opacity-80 text-sm">Interfaz simple e intuitiva para procesar ventas</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="mr-4 bg-white/10 p-2 rounded-full">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium mb-1">Seguimiento de desempeño</h3>
                <p className="opacity-80 text-sm">Visualiza tu progreso y métricas de ventas</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="mr-4 bg-white/10 p-2 rounded-full">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium mb-1">Historial completo</h3>
                <p className="opacity-80 text-sm">Accede al historial de tus transacciones realizadas</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lado derecho - Formulario */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Acceso Vendedor</h2>
            <p className="text-gray-600">Ingresa tu código numérico para iniciar</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
              <div className="flex items-center">
                <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                Código de vendedor
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="code"
                  name="code"
                  type="text"
                  required
                  maxLength={6}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-center text-2xl tracking-wider font-medium"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
              <p className="mt-2 text-xs text-gray-500 text-center">
                Ingresa el código numérico proporcionado por tu administrador
              </p>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] transition-colors"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Verificando...</span>
                  </span>
                ) : (
                  <span className="flex items-center">
                    Acceder
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </span>
                )}
              </button>
            </div>
          </form>
{/*
          <div className="mt-10">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Acceso administrador</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/login"
                className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                Acceder como administrador
              </Link>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
