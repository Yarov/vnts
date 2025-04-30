import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  EnvelopeIcon,
  LockClosedIcon,
  ArrowRightIcon,
  ExclamationCircleIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { Input } from '../../components/forms';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError('Error de autenticación: ' + error.message);
        return;
      }

      if (data?.user) {
        navigate('/admin');
      }
    } catch (err) {
      console.error('Error inesperado:', err);
      setError('Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Lado izquierdo - Banner */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col justify-center items-center bg-gradient-to-br from-purple-700 to-purple-900 text-white p-12">
        <div className="w-full max-w-md mx-auto">
          <div className="mb-8">
            <div className="bg-white/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-6">
              <UserIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">VNTS</h1>
            <p className="text-xl opacity-90 mb-6">Sistema de gestión para administradores y vendedores</p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start">
              <div className="mr-4 bg-white/10 p-2 rounded-full">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium mb-1">Control completo de ventas</h3>
                <p className="opacity-80 text-sm">Gestiona productos, vendedores y clientes desde un solo lugar</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="mr-4 bg-white/10 p-2 rounded-full">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium mb-1">Reportes avanzados</h3>
                <p className="opacity-80 text-sm">Analiza el rendimiento con gráficos detallados y estadísticas</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="mr-4 bg-white/10 p-2 rounded-full">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium mb-1">Acceso multiplataforma</h3>
                <p className="opacity-80 text-sm">Accede desde cualquier dispositivo, en cualquier momento</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lado derecho - Formulario */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Bienvenido</h2>
            <p className="text-gray-600">Ingresa tus credenciales de administrador</p>
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
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                label="Correo electrónico"
                icon={<EnvelopeIcon className="h-5 w-5 text-gray-400" />}
              />
            </div>

            <div>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                label="Contraseña"
                icon={<LockClosedIcon className="h-5 w-5 text-gray-400" />}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Iniciando sesión...</span>
                  </span>
                ) : (
                  <span className="flex items-center">
                    Iniciar sesión
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </span>
                )}
              </button>
            </div>
          </form>

          <div className="mt-10">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Acceso vendedor</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/seller-login"
                className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
              >
                Acceder como vendedor
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
