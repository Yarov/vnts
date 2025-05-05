import { useAdminReports } from '../../hooks/useAdminReports';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CalendarIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import ReportsFilters from '../../components/reports/ReportsFilters';

export default function Commissions() {
  const {
    dateRange,
    setDateRange,
    periodFilter,
    setPeriodFilter,
    isLoading,
    commissions,
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
      header: 'Vendedor',
      accessor: (commission: any) => (
        <div className="flex flex-col gap-1">
          <span className="text-lg font-semibold text-gray-800">{commission.seller_name}</span>
        </div>
      )
    },
    {
      header: 'Ventas',
      accessor: (commission: any) => (
        <span className="text-gray-800 font-medium">{formatCurrency(commission.total_sales)}</span>
      ),
      className: 'text-right'
    },
    {
      header: 'Comisión %',
      accessor: (commission: any) => (
        <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-blue-200 rounded-full px-2 py-1">
          {commission.commission_percentage}%
        </Badge>
      ),
      className: 'text-center'
    },
    {
      header: 'Ganancia',
      accessor: (commission: any) => (
        <span className="text-primary-600 font-medium">{formatCurrency(commission.commission_amount)}</span>
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
          <h2 className="text-2xl font-bold mb-1 text-gray-800">Histórico de Comisiones</h2>
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
            <Table
              columns={columns}
              data={commissions}
              keyExtractor={(item) => item.seller_id}
              isLoading={isLoading}
              emptyMessage="No hay comisiones registradas en este periodo"
            />
            {/* Mobile Cards */}
            <div className="block md:hidden space-y-4">
              {commissions.length > 0 ? (
                <>
                  {commissions.map((commission) => (
                    <div key={commission.seller_id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <div className="font-bold text-lg text-gray-800 mb-2">{commission.seller_name}</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-sm text-gray-500">Ventas</div>
                          <div className="font-medium">{formatCurrency(commission.total_sales)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Comisión</div>
                          <div className="font-medium text-primary-600">{formatCurrency(commission.commission_amount)}</div>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-end">
                        <span className="text-sm text-gray-500">
                          {commission.commission_percentage}%
                        </span>

                      </div>
                    </div>
                  ))}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Total Comisiones:</span>
                      <span className="font-bold text-lg text-primary-600">
                        {formatCurrency(commissions.reduce((sum, item) => sum + item.commission_amount, 0))}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No hay comisiones registradas en este periodo
                </div>
              )}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}