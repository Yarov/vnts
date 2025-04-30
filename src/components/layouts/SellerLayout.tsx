import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { userAtom } from '../../store/auth';

// Iconos
import {
  HomeIcon,
  ShoppingCartIcon,
  ClockIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/seller', icon: HomeIcon },
  { name: 'Nueva Venta', href: '/seller/new-sale', icon: ShoppingCartIcon },
  { name: 'Historial', href: '/seller/sales-history', icon: ClockIcon },
];

export default function SellerLayout() {
  const [user, setUser] = useAtom(userAtom);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Limpiar el estado de usuario para cerrar sesión
    setUser(null);
    // Redirigir a la página de login de vendedor
    navigate('/seller-login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar para móvil */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`} role="dialog" aria-modal="true">
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" aria-hidden="true" onClick={() => setSidebarOpen(false)}></div>
        
        <div className="fixed inset-y-0 left-0 flex max-w-xs w-full flex-col bg-white shadow-xl">
          <div className="flex items-center justify-between h-16 px-4 bg-primary-700">
            <div className="text-white font-bold text-xl">VNTS Ventas</div>
            <button
              type="button"
              className="-mr-2 text-white hover:bg-primary-600 rounded-md p-2"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center px-2 py-2 text-base font-medium rounded-md ${
                      isActive
                        ? 'bg-primary-100 text-primary-900'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`
                  }
                >
                  <item.icon className="mr-3 h-6 w-6 flex-shrink-0" aria-hidden="true" />
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>
          
          <div className="flex-shrink-0 p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white">
                  {user?.email.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">{user?.email}</div>
                <button
                  onClick={handleLogout}
                  className="text-xs text-primary-600 hover:text-primary-800"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar para escritorio */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-1 min-h-0 bg-white border-r border-gray-200">
          <div className="flex items-center h-16 px-4 bg-primary-700">
            <div className="text-white font-bold text-xl">VNTS Ventas</div>
          </div>
          
          <div className="flex flex-col flex-1 pt-5 pb-4 overflow-y-auto">
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-primary-100 text-primary-900'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>
          
          <div className="flex-shrink-0 p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white">
                  {user?.email.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">{user?.email}</div>
                <button
                  onClick={handleLogout}
                  className="text-xs text-primary-600 hover:text-primary-800"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="lg:pl-64 flex flex-col">
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            type="button"
            className="lg:hidden px-4 text-gray-500 focus:outline-none"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              <h1 className="text-xl font-semibold text-gray-800">
                Panel de Ventas
              </h1>
            </div>
          </div>
        </div>

        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
