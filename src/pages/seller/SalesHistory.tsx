import { EyeIcon } from '@heroicons/react/24/outline';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import { useSellerSalesHistory, SaleWithDetails, SaleItem } from '../../hooks/useSellerSalesHistory';
import { formatCurrency } from '../../utils/formatters';

export default function SalesHistory() {
  const {
    filteredSales,
    isLoading,
    isDetailModalOpen,
    setIsDetailModalOpen,
    currentSale,
    currentDay,
    viewSaleDetails
  } = useSellerSalesHistory();

  const salesColumns = [
    {
      header: 'Fecha',
      accessor: (sale: SaleWithDetails) => sale.formatted_date || '',
    },
    {
      header: 'Cliente',
      accessor: (sale: SaleWithDetails) => sale.client_name || '',
    },
    {
      header: 'Método de pago',
      accessor: (sale: SaleWithDetails) => sale.payment_method_name || '',
    },
    {
      header: 'Total',
      accessor: (sale: SaleWithDetails) => formatCurrency(parseFloat(String(sale.total))),
      className: 'text-right'
    },
    {
      header: 'Acciones',
      accessor: (sale: SaleWithDetails) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => viewSaleDetails(sale)}
          icon={<EyeIcon className="h-4 w-4" />}
        >
          Ver detalles
        </Button>
      ),
      className: 'text-right'
    },
  ];

  const saleItemsColumns = [
    {
      header: 'Producto',
      accessor: (item: SaleItem) => item.product_name || '',
    },
    {
      header: 'Cantidad',
      accessor: (item: SaleItem) => item.quantity,
      className: 'text-center'
    },
    {
      header: 'Precio',
      accessor: (item: SaleItem) => formatCurrency(parseFloat(String(item.price))),
      className: 'text-right'
    },
    {
      header: 'Subtotal',
      accessor: (item: SaleItem) => formatCurrency(parseFloat(String(item.subtotal))),
      className: 'text-right'
    },
  ];

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Historial de Ventas
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {currentDay}
          </p>
        </div>
      </div>

      {/* Tabla de ventas */}
      <Card>
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-lg font-medium">Mis ventas</h3>
          <p className="text-sm text-gray-500">
            {filteredSales.length} venta{filteredSales.length !== 1 ? 's' : ''}
          </p>
        </div>

        <Table
          columns={salesColumns}
          data={filteredSales}
          keyExtractor={(item) => item.id}
          isLoading={isLoading}
          emptyMessage="No se encontraron ventas con los filtros aplicados"
        />
      </Card>

      {/* Modal de detalles de venta */}
      {isDetailModalOpen && currentSale && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Backdrop */}
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            {/* Modal */}
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Detalles de Venta
                </h3>

                <div className="bg-gray-50 p-4 rounded-lg mb-6 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Fecha</p>
                    <p className="font-medium">{currentSale.formatted_date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Cliente</p>
                    <p className="font-medium">{currentSale.client_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Método de pago</p>
                    <p className="font-medium">{currentSale.payment_method_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="font-medium">{formatCurrency(parseFloat(String(currentSale.total)))}</p>
                  </div>
                  {currentSale.notes && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Notas</p>
                      <p className="font-medium">{currentSale.notes}</p>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <h4 className="font-medium mb-2">Productos</h4>
                  <Table
                    columns={saleItemsColumns}
                    data={currentSale.items || []}
                    keyExtractor={(item) => item.id}
                    emptyMessage="No hay productos disponibles"
                  />
                </div>

                <div className="mt-5">
                  <Button
                    variant="outline"
                    onClick={() => setIsDetailModalOpen(false)}
                    className="w-full sm:w-auto"
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
