import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { userAtom } from '../../store/auth';

export default function SimplifiedSellerLayout() {
  const [user, setUser] = useAtom(userAtom);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Limpiar el estado de usuario para cerrar sesión
    setUser(null);
    // Redirigir a la página de login de vendedor
    navigate('/seller-login');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Navbar superior simple */}
      <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
        <div className="flex-1 px-4 flex justify-between">
          <div className="flex-1 flex items-center">
            <h1 className="text-xl font-semibold text-gray-800">VNTS</h1>
          </div>
          <div className="ml-4 flex items-center md:ml-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-gray-100 text-gray-700 rounded-full h-10 w-10 flex items-center justify-center">
                  <span className="text-sm font-medium">{user?.email?.charAt(0).toUpperCase() || 'V'}</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-800 truncate">{user?.email || 'Vendedor'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido de página */}
      <main className="flex-1 relative overflow-y-auto focus:outline-none p-6 bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}
