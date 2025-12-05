import {
  CurrencyDollarIcon,
  ReceiptPercentIcon,
  CalendarIcon,
  ArrowRightIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const {
    isLoading,
    salesSummary,
    topProducts,
    sellerCommissions,
    paymentMethodSales,
    branches,
    selectedBranchId,
    setSelectedBranchId,
    currentDay,
    formatCurrency: useAdminFormatCurrency
  } = useAdminDashboard();

  // Columnas para tabla de productos
  const productColumns = [
    { header: 'Producto', accessor: 'name' },
    {
      header: 'Unidades vendidas',
      accessor: 'quantity',
      className: 'text-center'
    },
    {
      header: 'Total',
      accessor: (item: any) => useAdminFormatCurrency(item.total),
      className: 'text-right font-medium'
    }
  ];

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold mb-1 text-gray-800">Panel de Control</h2>
          <div className="flex items-center text-sm text-gray-500">
            <CalendarIcon className="h-4 w-4 mr-1" />
            <span>{currentDay}</span>
          </div>
        </div>

        {/* Selector de sucursal - solo si hay múltiples */}
        {branches.length > 1 && (
          <div className="mt-4 md:mt-0">
            <div className="relative">
              <BuildingStorefrontIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              >
                <option value="all">Todas las sucursales</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Tarjetas de estadísticas con desglose de métodos de pago */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        {/* Ventas Totales */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <CurrencyDollarIcon className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ventas Totales</p>
                  <p className="text-xs text-gray-400">Desde el inicio</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-5">
            <div className="text-3xl font-bold text-gray-900 mb-4">
              {useAdminFormatCurrency(salesSummary.totalSales)}
            </div>
            
            {paymentMethodSales.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Top 3 Métodos</p>
                {paymentMethodSales.slice(0, 3).map((method, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-600">{method.payment_method__name}</span>
                    <span className="text-sm font-semibold text-gray-900">{useAdminFormatCurrency(method.total)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ventas del Día */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <ReceiptPercentIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ventas del Día</p>
                  {salesSummary.dailyChange && (
                    <div className="flex items-center text-xs mt-0.5">
                      <span className={`inline-flex items-center font-semibold ${salesSummary.dailyChange.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {salesSummary.dailyChange.isPositive ? '↑' : '↓'} {Math.abs(salesSummary.dailyChange.value)}%
                      </span>
                      <span className="text-gray-400 ml-1">vs. ayer</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-5">
            <div className="text-3xl font-bold text-gray-900 mb-5">
              {useAdminFormatCurrency(salesSummary.dailySales)}
            </div>
            
            {paymentMethodSales.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Desglose por Método</span>
                  <span className="text-xs text-gray-400">{paymentMethodSales.length} métodos</span>
                </div>
                {paymentMethodSales.map((method, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-700">{method.payment_method__name}</span>
                      <span className="text-sm font-bold text-gray-900">{useAdminFormatCurrency(method.total)}</span>
                    </div>
                    {method.commission > 0 && (
                      <div className="space-y-1 pl-3 border-l-2 border-gray-300 ml-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-red-600">Comisión ({method.commissionPercentage}%)</span>
                          <span className="text-red-600 font-semibold">-{useAdminFormatCurrency(method.commission)}</span>
                        </div>
                        <div className="flex justify-between text-xs pt-1">
                          <span className="text-green-600 font-semibold">Neto</span>
                          <span className="text-green-600 font-bold">{useAdminFormatCurrency(method.netAmount)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ventas Semanales */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ventas Semanales</p>
                  {salesSummary.weeklyChange && (
                    <div className="flex items-center text-xs mt-0.5">
                      <span className={`inline-flex items-center font-semibold ${salesSummary.weeklyChange.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {salesSummary.weeklyChange.isPositive ? '↑' : '↓'} {Math.abs(salesSummary.weeklyChange.value)}%
                      </span>
                      <span className="text-gray-400 ml-1">vs. semana anterior</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-5">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {useAdminFormatCurrency(salesSummary.weeklySales)}
            </div>
            <p className="text-xs text-gray-500 mb-5">Últimos 7 días</p>
            
            {paymentMethodSales.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Resumen</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Total Cobrado</span>
                    <span className="text-sm font-bold text-gray-900">
                      {useAdminFormatCurrency(paymentMethodSales.reduce((sum, m) => sum + m.total, 0))}
                    </span>
                  </div>
                  {paymentMethodSales.some(m => m.commission > 0) && (
                    <>
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-sm text-red-600">Comisiones Métodos</span>
                        <span className="text-sm font-semibold text-red-600">
                          -{useAdminFormatCurrency(paymentMethodSales.reduce((sum, m) => sum + m.commission, 0))}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-sm font-semibold text-gray-700">Total Neto</span>
                        <span className="text-lg font-bold text-green-600">
                          {useAdminFormatCurrency(paymentMethodSales.reduce((sum, m) => sum + m.netAmount, 0))}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Comisiones de vendedores del día */}
      <Card
        title="Comisiones del Día"
        className="mb-6"
        actions={
          <Link
            to="/admin/commissions"
            className="text-xs text-primary-600 hover:text-primary-800 flex items-center"
          >
            Ver histórico <ArrowRightIcon className="h-3 w-3 ml-1" />
          </Link>
        }
      >
        <div className="flex items-center space-x-2 mb-4">
          <CurrencyDollarIcon className="h-5 w-5 text-primary-600" />
          <span className="text-sm font-medium text-gray-700">Comisiones ganadas por vendedores hoy</span>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></span>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendedor</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ventas</th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Comisión %</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ganancia</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sellerCommissions.length > 0 ? (
                    sellerCommissions.map((commission) => (
                      <tr key={commission.seller_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-lg font-semibold text-gray-800">{commission.seller_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">{useAdminFormatCurrency(commission.total_sales)}</td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-blue-200 rounded-full px-2 py-1">
                            {commission.commission_percentage}%
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap font-medium text-primary-600">
                          {useAdminFormatCurrency(commission.commission_amount)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                        No hay comisiones registradas hoy
                      </td>
                    </tr>
                  )}
                  {sellerCommissions.length > 0 && (
                    <tr className="bg-gray-50 font-medium">
                      <td colSpan={3} className="px-6 py-4 text-right">Total Comisiones:</td>
                      <td className="px-6 py-4 text-right text-primary-600">
                        {useAdminFormatCurrency(sellerCommissions.reduce((sum, item) => sum + item.commission_amount, 0))}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="block md:hidden space-y-4">
              {sellerCommissions.length > 0 ? (
                <>
                  {sellerCommissions.map((commission) => (
                    <div key={commission.seller_id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <div className="font-bold text-lg text-gray-800 mb-2">{commission.seller_name}</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-sm text-gray-500">Ventas</div>
                          <div className="font-medium">{useAdminFormatCurrency(commission.total_sales)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Comisión</div>
                          <div className="font-medium text-primary-600">{useAdminFormatCurrency(commission.commission_amount)}</div>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-end">
                        <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-blue-200 rounded-full px-2 py-1">
                          {commission.commission_percentage}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Total Comisiones:</span>
                      <span className="font-bold text-lg text-primary-600">
                        {useAdminFormatCurrency(sellerCommissions.reduce((sum, item) => sum + item.commission_amount, 0))}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No hay comisiones registradas hoy
                </div>
              )}
            </div>
          </>
        )}
      </Card>

      {/* Tabla de productos más vendidos */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
        {/* Tabla de productos más vendidos */}
        <Card
          title="Productos Más Vendidos"
          className="h-full"
          actions={
            <Link
              to="/admin/top-products"
              className="text-xs text-primary-600 hover:text-primary-800 flex items-center"
            >
              Ver todos <ArrowRightIcon className="h-3 w-3 ml-1" />
            </Link>
          }
        >
          {isLoading ? (
            <div className="flex justify-center py-8">
              <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></span>
            </div>
          ) : (
            <Table
              columns={productColumns}
              data={topProducts}
              keyExtractor={(item) => item.id}
              isLoading={false}
              emptyMessage="No hay datos de productos vendidos"
              className="overflow-hidden"
            />
          )}
        </Card>
      </div>
    </div>
  );
}
