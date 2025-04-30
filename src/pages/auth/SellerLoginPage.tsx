import { useState } from 'react';
import { Link } from 'react-router-dom';
import { validateSellerCode } from '../../lib/supabase';

interface SellerLoginPageProps {
  onLogin: (sellerId: string, sellerName: string) => void;
}

export default function SellerLoginPage({ onLogin }: SellerLoginPageProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const seller = await validateSellerCode(code);
      
      if (!seller) {
        setError('Código de vendedor no válido');
        return;
      }
      
      onLogin(seller.id, seller.name);
    } catch (err) {
      console.error('Error inesperado:', err);
      setError('Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            VNTS Control de Ingresos
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Acceso para vendedores
          </p>
        </div>
        
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                Código de vendedor
              </label>
              <div className="mt-1">
                <input
                  id="code"
                  name="code"
                  type="text"
                  autoComplete="off"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="input w-full text-center text-2xl tracking-wider"
                  maxLength={6}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full flex justify-center"
              >
                {loading ? 'Verificando...' : 'Acceder'}
              </button>
            </div>
          </form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Acceso administrador</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/login"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Acceder como administrador
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
