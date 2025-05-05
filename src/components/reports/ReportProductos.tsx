import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/Table';
import { formatCurrency } from '../../utils/formatters';
import { useProductReport } from '../../hooks/useProductReport';
import { Package2, ShoppingCart, BarChart3 } from 'lucide-react';
import ReportCard from './ReportCard';

export default function ReportProductos() {
  const {
    products,
    isLoading,
    totals
  } = useProductReport();


  return (
    <div className="space-y-8 p-6 bg-gray-50">
      {/* Sección 1: KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ReportCard
          title="Total Productos"
          value={totals.total_products}
          subtitle={`${totals.active_products} productos activos`}
          icon={Package2}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-50"
        />

        <ReportCard
          title="Ventas Totales"
          value={formatCurrency(totals.total_revenue)}
          icon={ShoppingCart}
          iconColor="text-emerald-600"
          iconBgColor="bg-emerald-50"
          trend={{ value: 1, isPositive: true }}
        />

        <ReportCard
          title="Productos Activos"
          value={totals.active_products}
          subtitle={`${((totals.active_products / totals.total_products) * 100).toFixed(1)}% del total`}
          icon={BarChart3}
          iconColor="text-rose-600"
          iconBgColor="bg-rose-50"
        />
      </div>

      {/* Sección 3: Tabla de Productos Destacados */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-900">Productos Destacados</h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="bg-gray-50">Producto</TableHead>
                <TableHead className="text-right bg-gray-50">Ventas</TableHead>
                <TableHead className="text-right bg-gray-50">Ingresos</TableHead>
                <TableHead className="text-center bg-gray-50">Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600"></div>
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    No hay productos destacados
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col gap-1">
                        <span className="text-lg font-semibold text-gray-800">{product.category ? product.category : 'Sin categoría'}</span>
                        <p className="text-sm text-gray-600">{product.name}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right hover:bg-gray-50 transition-colors">
                      {product.total_sales}
                    </TableCell>
                    <TableCell className="text-right hover:bg-gray-50 transition-colors">
                      {formatCurrency(product.total_revenue)}
                    </TableCell>
                    <TableCell className="text-center hover:bg-gray-50 transition-colors">
                      {product.total_quantity}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="block md:hidden space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No hay productos destacados</div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="font-bold text-lg text-gray-800">{product.name}</div>
              <div className="text-sm text-gray-500">{product.category ? product.category : 'Sin categoría'}</div>
              <div className="flex justify-between mt-2">
                <span className="text-sm text-gray-600">Ventas: {product.total_sales}</span>
                <span className="text-sm font-medium text-gray-800">{formatCurrency(product.total_revenue)}</span>
              </div>
              <div className="mt-2 text-sm font-medium text-gray-800">
                Stock: {product.total_quantity}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}