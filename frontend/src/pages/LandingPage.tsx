import { Link } from 'react-router-dom';
import { 
  ShoppingCartIcon, 
  ChartBarIcon, 
  UserGroupIcon, 
  BuildingStorefrontIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  CurrencyDollarIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';

export default function LandingPage() {
  const features = [
    {
      icon: ShoppingCartIcon,
      title: 'Ventas Rápidas',
      description: 'Registra ventas en segundos con una interfaz intuitiva diseñada para vendedores.'
    },
    {
      icon: ChartBarIcon,
      title: 'Reportes en Tiempo Real',
      description: 'Visualiza tus ventas, comisiones y estadísticas actualizadas al instante.'
    },
    {
      icon: UserGroupIcon,
      title: 'Gestión de Vendedores',
      description: 'Administra tu equipo de ventas con códigos de acceso y comisiones personalizadas.'
    },
    {
      icon: BuildingStorefrontIcon,
      title: 'Multi-Sucursal',
      description: 'Gestiona múltiples sucursales desde una sola plataforma centralizada.'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Control de Comisiones',
      description: 'Calcula automáticamente comisiones de vendedores y métodos de pago.'
    },
    {
      icon: DevicePhoneMobileIcon,
      title: 'Responsive',
      description: 'Accede desde cualquier dispositivo: computadora, tablet o móvil.'
    }
  ];

  const benefits = [
    'Sin instalación, 100% web',
    'Interfaz simple y rápida',
    'Reportes detallados',
    'Gestión de inventario',
    'Múltiples métodos de pago',
    'Soporte técnico incluido'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <ShoppingCartIcon className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">VNTS</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Comenzar Gratis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
              Sistema de Ventas
              <span className="block text-blue-600 mt-2">Simple y Poderoso</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Gestiona tu negocio de manera profesional. Controla ventas, inventario, 
              vendedores y sucursales desde una sola plataforma.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-lg hover:shadow-xl"
              >
                Comenzar Ahora
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Ver Características
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas
            </h2>
            <p className="text-xl text-gray-600">
              Características diseñadas para hacer crecer tu negocio
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200"
              >
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-100 mb-4">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                ¿Por qué elegir VNTS?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Diseñado específicamente para negocios que necesitan un sistema 
                de ventas confiable, rápido y fácil de usar.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircleIcon className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 lg:p-12">
              <div className="bg-white rounded-lg shadow-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-500">Dashboard</span>
                  <div className="flex space-x-1">
                    <div className="h-3 w-3 rounded-full bg-red-400"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                    <div className="h-3 w-3 rounded-full bg-green-400"></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-32 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ChartBarIcon className="h-16 w-16 text-blue-600" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-16 bg-gray-100 rounded"></div>
                    <div className="h-16 bg-gray-100 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Comienza a vender hoy mismo
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Únete a los negocios que ya confían en VNTS para gestionar sus ventas
          </p>
          <Link
            to="/register"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-blue-600 bg-white hover:bg-gray-100 rounded-lg transition-colors shadow-lg"
          >
            Crear Cuenta Gratis
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <ShoppingCartIcon className="h-8 w-8 text-blue-500" />
                <span className="ml-2 text-xl font-bold text-white">VNTS</span>
              </div>
              <p className="text-sm">
                Sistema de ventas profesional para tu negocio.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Producto</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white">Características</a></li>
                <li><Link to="/login" className="hover:text-white">Iniciar Sesión</Link></li>
                <li><Link to="/register" className="hover:text-white">Registrarse</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Contacto</h3>
              <p className="text-sm">
                ¿Necesitas ayuda?<br />
                Contáctanos para más información
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2024 VNTS. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
