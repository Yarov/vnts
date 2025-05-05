import {
  CurrencyDollarIcon,
  ReceiptPercentIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  CalendarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import StatsCard from '../../components/dashboard/StatsCard';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';
import { Link, useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const {
    isLoading,
    salesSummary,
    topProducts,
    sellerCommissions,
    topClients,
    currentDay,
    formatCurrency: useAdminFormatCurrency,
    formatDate: useAdminFormatDate
  } = useAdminDashboard();

  const navigate = useNavigate();

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

  // Columnas para tabla de clientes
  const clientColumns = [
    { header: 'Cliente', accessor: 'name' },
    {
      header: 'Compras',
      accessor: (item: any) => (
        <Badge color="purple" className="mx-auto">
          {item.purchase_count}
        </Badge>
      ),
      className: 'text-center'
    },
    {
      header: 'Última compra',
      accessor: (item: any) => useAdminFormatDate(new Date(item.last_purchase), 'dd/MM/yyyy'),
      className: 'text-center'
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

      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCard
          title="Ventas Totales"
          value={useAdminFormatCurrency(salesSummary.totalSales)}
          icon={<CurrencyDollarIcon className="h-6 w-6" />}
          footer="Desde el inicio"
          className="bg-gradient-to-br from-purple-50 to-white"
        />
        <StatsCard
          title="Ventas del Día"
          value={useAdminFormatCurrency(salesSummary.dailySales)}
          icon={<ReceiptPercentIcon className="h-6 w-6" />}
          change={salesSummary.dailyChange}
          footer="vs. día anterior"
          className="bg-gradient-to-br from-purple-50 to-white"
        />
        <StatsCard
          title="Ventas Semanales"
          value={useAdminFormatCurrency(salesSummary.weeklySales)}
          icon={<CurrencyDollarIcon className="h-6 w-6" />}
          change={salesSummary.weeklyChange}
          footer="vs. semana anterior"
          className="bg-gradient-to-br from-purple-50 to-white"
        />
        <StatsCard
          title="Productos Activos"
          value={salesSummary.productCount}
          icon={<ShoppingBagIcon className="h-6 w-6" />}
          footer="Productos disponibles"
          className="bg-gradient-to-br from-purple-50 to-white"
        />
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

      {/* Gráfico de ventas por vendedor y tabla de productos más vendidos */}
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
