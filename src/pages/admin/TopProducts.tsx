import { useAdminReports } from '../../hooks/useAdminReports';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CalendarIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import ReportsFilters from '../../components/reports/ReportsFilters';

export default function TopProducts() {
  const {
    dateRange,
    setDateRange,
    periodFilter,
    setPeriodFilter,
    isLoading,
    topProducts,
    handleResetFilters,
    handleExport,
    sellers,
    selectedSellerId,
    setSelectedSellerId
  } = useAdminReports();

  // Opciones para selector de vendedores
  const sellerOptions = [
    { value: '', label: 'Todos los vendedores' },
    ...sellers.map(seller => ({
      value: seller.id,
      label: seller.name,
    })),
  ];

  const columns = [
    {
      header: 'Producto',
      accessor: (product: any) => (
        <div className="flex flex-col gap-1">
          <span className="text-lg font-semibold text-gray-800">{product.name}</span>
        </div>
      )
    },
    {
      header: 'Unidades Vendidas',
      accessor: (product: any) => (
        <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-blue-200 rounded-full px-2 py-1">
          {product.quantity}
        </Badge>
      ),
      className: 'text-center'
    },
    {
      header: 'Total Vendido',
      accessor: (product: any) => (
        <span className="text-primary-600 font-medium">{formatCurrency(product.total)}</span>
      ),
      className: 'text-right'
    }
  ];

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <Link to="/admin" className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2">
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Volver al Dashboard
          </Link>
          <h2 className="text-2xl font-bold mb-1 text-gray-800">Productos Más Vendidos</h2>
          <div className="flex items-center text-sm text-gray-500">
            <CalendarIcon className="h-4 w-4 mr-1" />
            <span>{formatDate(dateRange.start, 'dd/MM/yyyy')} - {formatDate(dateRange.end, 'dd/MM/yyyy')}</span>
          </div>
        </div>
      </div>

      {/* Filtros de fecha */}
      <div className="mb-6">
        <ReportsFilters
          periodFilter={periodFilter}
          setPeriodFilter={setPeriodFilter}
          dateRange={dateRange}
          setDateRange={setDateRange}
          sellerOptions={sellerOptions}
          selectedSellerId={selectedSellerId}
          setSelectedSellerId={setSelectedSellerId}
          onReset={handleResetFilters}
          onExport={handleExport}
        />
      </div>

      <Card>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></span>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <Table
                columns={columns}
                data={topProducts}
                keyExtractor={(item) => item.id}
                isLoading={false}
                emptyMessage="No hay productos vendidos en este periodo"
                className="overflow-hidden"
              />
              {topProducts.length > 0 && (
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <div className="flex justify-end items-center">
                    <span className="font-medium text-gray-700 mr-4">Total Vendido:</span>
                    <span className="font-bold text-lg text-primary-600">
                      {formatCurrency(topProducts.reduce((sum, item) => sum + item.total, 0))}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Cards */}
            <div className="block md:hidden space-y-4">
              {topProducts.length > 0 ? (
                <>
                  {topProducts.map((product) => (
                    <div key={product.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <div className="font-bold text-lg text-gray-800 mb-2">{product.name}</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-sm text-gray-500">Unidades Vendidas</div>
                          <div className="font-medium">{product.quantity}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Total Vendido</div>
                          <div className="font-medium text-primary-600">{formatCurrency(product.total)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Total Vendido:</span>
                      <span className="font-bold text-lg text-primary-600">
                        {formatCurrency(topProducts.reduce((sum, item) => sum + item.total, 0))}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No hay productos vendidos en este periodo
                </div>
              )}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}