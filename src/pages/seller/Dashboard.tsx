import { useSellerDashboard } from '../../hooks/useSellerDashboard';
import { CurrencyDollarIcon, ShoppingCartIcon, ReceiptPercentIcon, CalendarIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import StatsCard from '../../components/dashboard/StatsCard';
import PaymentsByMethodCard from '../../components/seller/PaymentsByMethodCard';
import { formatCurrency } from '../../utils/formatters';

export default function SellerDashboard() {
  const {
    salesSummary,
    paymentMethodsData,
    isLoading,
    currentDay,
    goToNewSale,
    handleLogout
  } = useSellerDashboard();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold mb-1 text-gray-800">Mi Panel</h2>
          <div className="flex items-center text-sm text-gray-500">
            <CalendarIcon className="h-4 w-4 mr-1" />
            <span>{currentDay}</span>
          </div>
        </div>
      </div>

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
  );
}