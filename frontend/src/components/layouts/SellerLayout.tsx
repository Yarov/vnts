import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAtom } from 'jotai';
import { userAtom } from '../../store/auth';

// Iconos
import {
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  ShoppingCartIcon,
  ClockIcon
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
  const location = useLocation();

  // Extraer orgSlug de la URL actual
  const getOrgSlug = () => {
    const pathParts = location.pathname.split('/');
    if (pathParts.length > 1 && pathParts[1] && pathParts[1] !== 'seller') {
      return pathParts[1];
    }
    return null;
  };

  const handleLogout = () => {
    // Limpiar el estado de usuario para cerrar sesión
    setUser(null);
    // Redirigir a la página de login de vendedor con slug si existe
    const orgSlug = getOrgSlug();
    if (orgSlug) {
      navigate(`/${orgSlug}/seller`);
    } else {
      navigate('/seller');
    }
  };

  // Función para cerrar el sidebar en dispositivos móviles después de clicar en un enlace
  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 1024) { // lg breakpoint
      setSidebarOpen(false);
    }
  };

  // Obtener el título de la página actual
  const getCurrentPageTitle = () => {
    const currentItem = navigation.find(item => item.href === location.pathname);
    return currentItem ? currentItem.name : 'Panel de Ventas';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar para móvil (overlay) */}
      <div className={`
        fixed inset-0 z-40 lg:hidden transition-opacity duration-300
        ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}>
        <div className="absolute inset-0 bg-gray-600 opacity-75" onClick={() => setSidebarOpen(false)}></div>

        <nav className="relative flex flex-col w-64 max-w-xs h-full bg-white shadow-xl">
          <div className="absolute top-0 right-0 p-1 -mr-14">
            <button
              className="flex items-center justify-center h-12 w-12 rounded-full focus:outline-none focus:bg-gray-600"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="py-4 px-4 border-b border-gray-200">
              <h1 className="text-lg font-bold text-gray-800">VNTS</h1>
              <p className="text-xs text-gray-500">Panel de Vendedor</p>
            </div>

            <div className="py-4">
              <div className="px-4 mb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                MENÚ PRINCIPAL
              </div>
              <nav className="space-y-1">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={closeSidebarOnMobile}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-2.5 text-sm transition-colors ${isActive
                        ? 'text-gray-900 font-medium'
                        : 'text-gray-600 hover:text-gray-900'
                      }`
                    }
                  >
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-gray-100 text-gray-700 rounded-full h-10 w-10 flex items-center justify-center">
                  <span className="text-sm font-medium">{user?.name?.charAt(0).toUpperCase() || 'V'}</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-800 truncate">{user?.name || 'Vendedor'}</p>
                <button
                  onClick={handleLogout}
                  className="text-xs text-gray-500 hover:text-gray-700 flex items-center mt-1"
                >
                  <ArrowLeftOnRectangleIcon className="h-3 w-3 mr-1" />
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Sidebar para escritorio (fijo) */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
            <div className="py-4 px-4 border-b border-gray-200">
              <h1 className="text-lg font-bold text-gray-800">VNTS</h1>
              <p className="text-xs text-gray-500">Panel de Vendedor</p>
            </div>

            <div className="flex-1 flex flex-col overflow-y-auto py-4">
              <div className="px-4 mb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                MENÚ PRINCIPAL
              </div>
              <nav className="flex-1 space-y-1">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-2.5 text-sm transition-colors ${isActive
                        ? 'text-gray-900 font-medium'
                        : 'text-gray-600 hover:text-gray-900'
                      }`
                    }
                  >
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="bg-gray-100 text-gray-700 rounded-full h-10 w-10 flex items-center justify-center">
                    <span className="text-sm font-medium">{user?.name?.charAt(0).toUpperCase() || 'V'}</span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-800 truncate">{user?.name || 'Vendedor'}</p>
                  <button
                    onClick={handleLogout}
                    className="text-xs text-gray-500 hover:text-gray-700 flex items-center mt-1"
                  >
                    <ArrowLeftOnRectangleIcon className="h-3 w-3 mr-1" />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Navbar superior */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            className="px-4 text-gray-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              <h1 className="text-xl font-semibold text-gray-800">{getCurrentPageTitle()}</h1>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors font-medium flex items-center"
              >
                <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" />
                Terminar Venta
              </button>
            </div>
          </div>
        </div>

        {/* Contenido de página */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
