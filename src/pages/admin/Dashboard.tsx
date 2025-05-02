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
          <button className="text-xs text-primary-600 hover:text-primary-800 flex items-center">
            Ver histórico <ArrowRightIcon className="h-3 w-3 ml-1" />
          </button>
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
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Vendedor</th>
                  <th className="text-right">Ventas</th>
                  <th className="text-center">Comisión %</th>
                  <th className="text-right">Ganancia</th>
                </tr>
              </thead>
              <tbody>
                {sellerCommissions.length > 0 ? (
                  sellerCommissions.map((commission) => (
                    <tr key={commission.seller_id}>
                      <td>{commission.seller_name}</td>
                      <td className="text-right">{useAdminFormatCurrency(commission.total_sales)}</td>
                      <td className="text-center">
                        <Badge color="purple" className="mx-auto">
                          {commission.commission_percentage}%
                        </Badge>
                      </td>
                      <td className="text-right font-medium text-green-600">
                        {useAdminFormatCurrency(commission.commission_amount)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-gray-500">
                      No hay comisiones registradas hoy
                    </td>
                  </tr>
                )}
              </tbody>
              {sellerCommissions.length > 0 && (
                <tfoot>
                  <tr>
                    <th colSpan={3} className="text-right">Total Comisiones:</th>
                    <th className="text-right text-green-600">
                      {useAdminFormatCurrency(sellerCommissions.reduce((sum, item) => sum + item.commission_amount, 0))}
                    </th>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </Card>

      {/* Gráfico de ventas por vendedor y tabla de productos más vendidos */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
        {/* Tabla de productos más vendidos */}
        <Card
          title="Productos Más Vendidos"
          className="h-full"
          actions={
            <button className="text-xs text-primary-600 hover:text-primary-800 flex items-center">
              Ver todos <ArrowRightIcon className="h-3 w-3 ml-1" />
            </button>
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

      {/* Tabla de clientes frecuentes */}
      <Card
        title="Clientes Frecuentes"
        className="mb-6"
        actions={
          <button className="text-xs text-primary-600 hover:text-primary-800 flex items-center">
            Ver todos <ArrowRightIcon className="h-3 w-3 ml-1" />
          </button>
        }
      >
        <div className="flex items-center space-x-2 mb-4">
          <UserGroupIcon className="h-5 w-5 text-primary-600" />
          <span className="text-sm font-medium text-gray-700">Top clientes por frecuencia de compra</span>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></span>
          </div>
        ) : (
          <Table
            columns={clientColumns}
            data={topClients}
            keyExtractor={(item) => item.id}
            isLoading={false}
            emptyMessage="No hay datos de clientes frecuentes"
            className="overflow-hidden"
          />
        )}
      </Card>
    </div>
  );
}
