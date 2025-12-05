import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  EnvelopeIcon,
  LockClosedIcon,
  ArrowRightIcon,
  ExclamationCircleIcon,
  UserIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Input } from '../../components/forms';
import { useAuth } from '../../hooks/useAuth';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const navigate = useNavigate();

  const { loading, error, signUp } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validaciones
    if (password.length < 6) {
      setValidationError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Las contraseñas no coinciden');
      return;
    }

    if (fullName.trim().length < 2) {
      setValidationError('Por favor ingresa tu nombre completo');
      return;
    }

    if (organizationName.trim().length < 2) {
      setValidationError('Por favor ingresa el nombre de tu organización');
      return;
    }

    const success = await signUp(email, password, fullName, organizationName);

    if (success) {
      // Redirigir al dashboard de admin después del registro exitoso
      navigate('/admin');
    }
  };

  const displayError = validationError || error;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Lado izquierdo - Banner */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col justify-center items-center bg-gradient-to-br from-primary-600 to-primary-900 text-white p-12">
        <div className="w-full max-w-md mx-auto">
          <div className="mb-8">
            <div className="bg-white/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-6">
              <UserIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">VNTS</h1>
            <p className="text-xl opacity-90 mb-6">Crea tu cuenta y comienza a gestionar tu negocio</p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start">
              <div className="mr-4 bg-white/10 p-2 rounded-full">
                <CheckCircleIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Configuración automática</h3>
                <p className="opacity-80 text-sm">Tu organización se crea automáticamente al registrarte</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="mr-4 bg-white/10 p-2 rounded-full">
                <CheckCircleIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Métodos de pago incluidos</h3>
                <p className="opacity-80 text-sm">Efectivo, tarjetas y transferencias ya configurados</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="mr-4 bg-white/10 p-2 rounded-full">
                <CheckCircleIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Comienza de inmediato</h3>
                <p className="opacity-80 text-sm">Agrega productos y vendedores en minutos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lado derecho - Formulario */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Crear cuenta</h2>
            <p className="text-gray-600">Regístrate como administrador</p>
          </div>

          {displayError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
              <div className="flex items-center">
                <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-red-700 text-sm">{displayError}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                placeholder="Juan Pérez"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                label="Nombre completo"
                icon={<UserIcon className="h-5 w-5 text-gray-400" />}
              />
            </div>

            <div>
              <Input
                id="organizationName"
                name="organizationName"
                type="text"
                required
                placeholder="Mi Empresa"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                label="Nombre de la organización"
                icon={<UserIcon className="h-5 w-5 text-gray-400" />}
              />
            </div>

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
                autoComplete="new-password"
                required
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                label="Contraseña"
                icon={<LockClosedIcon className="h-5 w-5 text-gray-400" />}
              />
            </div>

            <div>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Confirma tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                label="Confirmar contraseña"
                icon={<LockClosedIcon className="h-5 w-5 text-gray-400" />}
              />
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
                    <span>Creando cuenta...</span>
                  </span>
                ) : (
                  <span className="flex items-center">
                    Crear cuenta
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </span>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">¿Ya tienes cuenta?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/login"
                className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] transition-colors"
              >
                Iniciar sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
