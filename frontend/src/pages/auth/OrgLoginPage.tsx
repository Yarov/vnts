import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useOrgBranding } from '../../hooks/useOrgBranding';
import { useAuth } from '../../hooks/useAuth';
import { Button, Card, FormField } from '../../components/ui';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';

export default function OrgLoginPage() {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const navigate = useNavigate();
  const { signInAsAdmin, loading: authLoading, error: authError } = useAuth();
  const { branding, isLoading: loadingBranding, error: brandingError } = useOrgBranding(orgSlug);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!branding.orgId) {
      setError('Organización no encontrada');
      return;
    }
    
    try {
      const success = await signInAsAdmin(email, password);
      
      if (!success) {
        setError('Credenciales inválidas');
        return;
      }

      // TODO: Verificar que el usuario pertenece a esta organización
      // Por ahora, redirigir directamente
      // En el futuro, agregar validación de organization_id
      
      // Redirigir al dashboard de admin
      navigate(`/${orgSlug}/admin`);
      
    } catch (err) {
      console.error('Error en login:', err);
      setError('Error al iniciar sesión. Por favor, intenta de nuevo.');
    }
  };

  if (loadingBranding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (brandingError || !branding.orgId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Organización no encontrada</h2>
            <p className="text-gray-600 mb-6">
              La URL <span className="font-mono bg-gray-100 px-2 py-1 rounded">/{orgSlug}</span> no corresponde a ninguna organización.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Verifica que la URL sea correcta o contacta a tu administrador.
            </p>
            <Link to="/register">
              <Button variant="primary">Crear Nueva Organización</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary rounded-full flex items-center justify-center">
            <BuildingOfficeIcon className="h-10 w-10 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {branding.orgName || 'VNTS'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Panel de Administración
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField
              label="Correo Electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              autoFocus
            />

            <FormField
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              error={error || authError || undefined}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={authLoading || !email || !password}
            >
              {authLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className="mt-6 space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                ¿Eres vendedor?{' '}
                <Link 
                  to={`/${orgSlug}/seller`}
                  className="font-medium text-primary hover:text-primary-hover"
                >
                  Accede aquí
                </Link>
              </p>
            </div>

            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                ¿No tienes una organización?{' '}
                <Link 
                  to="/register"
                  className="font-medium text-primary hover:text-primary-hover"
                >
                  Crea una cuenta
                </Link>
              </p>
            </div>
          </div>
        </Card>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Al iniciar sesión, aceptas nuestros términos y condiciones
          </p>
        </div>
      </div>
    </div>
  );
}
