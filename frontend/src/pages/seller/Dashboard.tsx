import { useState, useEffect } from 'react';
import { useSellerDashboard } from '../../hooks/useSellerDashboard';
import { CurrencyDollarIcon, ShoppingCartIcon, ReceiptPercentIcon, CalendarIcon, ArrowRightOnRectangleIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import StatsCard from '../../components/dashboard/StatsCard';
import PaymentsByMethodCard from '../../components/seller/PaymentsByMethodCard';
import { formatCurrency, formatDayMonthLong } from '../../utils/formatters';
import { useAtom } from 'jotai';
import { userAtom } from '../../store/auth';
import Button from '../../components/ui/Button';

export default function SellerDashboard() {
  const [user, setUser] = useAtom(userAtom);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  
  const {
    salesSummary,
    paymentMethodsData,
    isLoading,
    goToNewSale,
    handleLogout,
    name
  } = useSellerDashboard();
  console.log(name);

  // Verificar si necesita seleccionar sucursal al cargar
  useEffect(() => {
    const checkBranchSelection = async () => {
      if (!user?.id || user.activeBranchId) return;
      
      // Obtener sucursales asignadas
      const { getSellerById } = await import('../../services/sellerService');
      const seller = await getSellerById(user.id);
      
      if (seller?.assigned_branches && seller.assigned_branches.length > 0) {
        const activeBranches = seller.assigned_branches.filter((b: any) => b.active !== false);
        
        if (activeBranches.length === 1) {
          // Si solo tiene una, asignarla automáticamente
          setUser({
            ...user,
            activeBranchId: activeBranches[0].id,
            activeBranchName: activeBranches[0].name
          });
        } else if (activeBranches.length > 1) {
          // Si tiene múltiples, mostrar modal
          setBranches(activeBranches);
          setSelectedBranchId(activeBranches[0].id);
          setShowBranchModal(true);
        }
      }
    };
    
    checkBranchSelection();
  }, [user?.id]);

  const handleBranchSelection = () => {
    if (user && selectedBranchId) {
      const selectedBranch = branches.find(b => b.id === selectedBranchId);
      setUser({
        ...user,
        activeBranchId: selectedBranchId,
        activeBranchName: selectedBranch?.name
      });
      setShowBranchModal(false);
    }
  };

  // Fecha bonita usando utilitario
  const today = new Date();
  const prettyDate = formatDayMonthLong(today); // Ej: "lunes 10 de junio"
  const prettyDateCapitalized = prettyDate.charAt(0).toUpperCase() + prettyDate.slice(1);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></span>
      </div>
    );
  }

  return (
    <>
      {/* Header full width */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 px-6 py-5 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-1 text-gray-800">¡Hola, {name}!</h2>
            {user?.activeBranchName && (
              <div className="flex items-center mt-2 text-sm">
                <BuildingStorefrontIcon className="h-4 w-4 mr-1.5 text-blue-600" />
                <span className="text-gray-600">Vendiendo en:</span>
                <span className="ml-1.5 font-semibold text-blue-600">{user.activeBranchName}</span>
              </div>
            )}
          </div>
          <div className="mt-4 md:mt-0 md:text-right flex items-center text-sm text-gray-500">
            <CalendarIcon className="h-4 w-4 mr-1" />
            <span>Hoy es {prettyDateCapitalized}</span>
          </div>
        </div>
      </div>
      {/* Contenido centrado */}
      <div className="container mx-auto px-4">
        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-10">
          <div className="sm:col-span-2 lg:col-span-1">
            <StatsCard
              title="Ventas del Día"
              value={formatCurrency(salesSummary.todaySalesAmount)}
              icon={<CurrencyDollarIcon className="h-6 w-6" />}
              change={salesSummary.dailyChange}
              footer={`${salesSummary.todaySalesCount} venta${salesSummary.todaySalesCount !== 1 ? 's' : ''} hoy`}
              className="bg-gradient-to-br from-primary-50 to-white h-full"
            />
          </div>
          <StatsCard
            title="Comisión del Día"
            value={formatCurrency(salesSummary.commission)}
            icon={<ReceiptPercentIcon className="h-6 w-6" />}
            footer={`${salesSummary.commissionPercentage}% sobre ventas`}
            className="bg-gradient-to-br from-green-50 to-white h-full"
          />
          <div className={`${paymentMethodsData.length > 4 ? 'sm:col-span-2 lg:col-span-1' : ''}`}>
            <PaymentsByMethodCard
              title="Pagos por método"
              methods={paymentMethodsData}
              className="h-full"
              maxVisibleItems={4}
            />
          </div>
        </div>

        {/* Botones grandes de acción */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={goToNewSale}
            className="py-8 px-6 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors flex flex-col items-center shadow-sm border border-primary-400"
          >
            <ShoppingCartIcon className="h-14 w-14 mb-3" />
            <span className="text-xl font-bold">Nueva Venta</span>
            <span className="text-sm opacity-80 mt-2">Registrar una nueva transacción</span>
          </button>

          <button
            onClick={handleLogout}
            className="py-8 px-6 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors flex flex-col items-center shadow-sm border border-gray-200"
          >
            <ArrowRightOnRectangleIcon className="h-14 w-14 mb-3" />
            <span className="text-xl font-bold">Terminar Venta</span>
            <span className="text-sm opacity-80 mt-2">Finalizar y cerrar sesión</span>
          </button>
        </div>
      </div>

      {/* Modal de selección de sucursal con backdrop blur */}
      {showBranchModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop con blur */}
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" />
          
          {/* Modal centrado */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 transform transition-all">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 mb-4">
                  <BuildingStorefrontIcon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Selecciona tu Sucursal
                </h3>
                <p className="text-sm text-gray-600">
                  Elige la sucursal en la que trabajarás durante esta sesión
                </p>
              </div>

              {/* Grid de cards de sucursales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {branches.map((branch) => (
                  <button
                    key={branch.id}
                    onClick={() => setSelectedBranchId(branch.id)}
                    className={`relative p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                      selectedBranchId === branch.id
                        ? 'border-primary-500 bg-primary-50 shadow-lg scale-105'
                        : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-md'
                    }`}
                  >
                    {/* Checkmark cuando está seleccionado */}
                    {selectedBranchId === branch.id && (
                      <div className="absolute top-4 right-4">
                        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary-500">
                          <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                    
                    {/* Icono de sucursal */}
                    <div className={`flex items-center justify-center h-12 w-12 rounded-lg mb-4 ${
                      selectedBranchId === branch.id
                        ? 'bg-primary-100'
                        : 'bg-gray-100'
                    }`}>
                      <BuildingStorefrontIcon className={`h-6 w-6 ${
                        selectedBranchId === branch.id
                          ? 'text-primary-600'
                          : 'text-gray-600'
                      }`} />
                    </div>
                    
                    {/* Nombre de la sucursal */}
                    <h4 className={`text-lg font-semibold mb-1 ${
                      selectedBranchId === branch.id
                        ? 'text-primary-900'
                        : 'text-gray-900'
                    }`}>
                      {branch.name}
                    </h4>
                    
                    {/* Código de la sucursal */}
                    <p className={`text-sm ${
                      selectedBranchId === branch.id
                        ? 'text-primary-600'
                        : 'text-gray-500'
                    }`}>
                      Código: {branch.code}
                    </p>
                  </button>
                ))}
              </div>

              {/* Botón de continuar */}
              <Button
                variant="primary"
                onClick={handleBranchSelection}
                className="w-full py-4 text-lg font-semibold"
                disabled={!selectedBranchId}
              >
                Continuar con {branches.find(b => b.id === selectedBranchId)?.name || 'esta sucursal'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}