import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAtom } from 'jotai';
import { userAtom } from '../../store/auth';
import { useOrgBranding } from '../../hooks/useOrgBranding';
import { loginAsSeller, getCurrentUser } from '../../services/authService';
import { Button, Card, FormField } from '../../components/ui';
import { UserIcon } from '@heroicons/react/24/outline';

export default function OrgSellerLoginPage() {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const navigate = useNavigate();
  const [, setUser] = useAtom(userAtom);
  const { branding, isLoading: loadingBranding, error: brandingError } = useOrgBranding(orgSlug);
  
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Si ya hay un usuario autenticado, redirigir
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        const user = await getCurrentUser();
        if (user && user.role === 'seller') {
          navigate(`/${orgSlug}/seller`);
        }
      }
    };
    checkAuth();
  }, [navigate, orgSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orgSlug) {
      setError('URL de organización inválida');
      return;
    }

    if (!branding.orgId) {
      setError('Organización no encontrada');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Login con Django
      const userData = await loginAsSeller(code);
      
      if (!userData) {
        setError('Código inválido o vendedor inactivo');
        return;
      }
      
      // Verificar que el vendedor pertenece a esta organización
      if (userData.organizationId !== branding.orgId) {
        setError('Código inválido para esta organización');
        return;
      }
      
      setUser(userData);
      navigate(`/${orgSlug}/seller`);
      
    } catch (err) {
      console.error('Error en login:', err);
      setError('Error al iniciar sesión. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
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
            <p className="text-sm text-gray-500">
              Verifica que la URL sea correcta o contacta a tu administrador.
            </p>
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
            <UserIcon className="h-10 w-10 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {branding.orgName || 'VNTS'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Acceso para vendedores
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField
              label="Código de Vendedor"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ingresa tu código numérico"
              required
              autoFocus
              error={error}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading || !code}
            >
              {isLoading ? 'Validando...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Eres administrador?{' '}
              <Link 
                to={`/${orgSlug}/login`}
                className="font-medium text-primary hover:text-primary-hover"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </Card>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Si no tienes un código de acceso, contacta a tu administrador
          </p>
        </div>
      </div>
    </div>
  );
}
