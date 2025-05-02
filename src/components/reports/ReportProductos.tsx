import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/Table';
import Badge from '../ui/Badge';
import { formatCurrency } from '../../utils/formatters';
import { useProductReport } from '../../hooks/useProductReport';
import { Package2, DollarSign, ShoppingCart, BarChart3 } from 'lucide-react';
import ReportCard from './ReportCard';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function ReportProductos() {
  const {
    products,
    isLoading,
    totals
  } = useProductReport();

  // Función para formatear valores en el tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
          <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name === 'Ventas' ? formatCurrency(entry.value) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

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
          title="Valor del Inventario"
          value={formatCurrency(totals.total_revenue)}
          icon={DollarSign}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-50"
          trend={{ value: 1, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ReportCard
          title="Stock Total"
          value={totals.total_quantity}
          subtitle="Unidades en inventario"
          icon={Package2}
          iconColor="text-indigo-600"
          iconBgColor="bg-indigo-50"
        />

        <ReportCard
          title="Rotación Promedio"
          value={totals.average_price.toFixed(1)}
          subtitle="Veces por mes"
          icon={BarChart3}
          iconColor="text-amber-600"
          iconBgColor="bg-amber-50"
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

      {/* Sección 2: Gráfico de Tendencias */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Tendencia de Ventas e Inventario</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={products}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="last_sale"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                orientation="left"
                stroke="#3b82f6"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#f59e0b"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="total_revenue"
                name="Ventas"
                stroke="#3b82f6"
                fill="url(#colorVentas)"
                strokeWidth={2}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="total_quantity"
                name="Stock"
                stroke="#f59e0b"
                fill="url(#colorStock)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
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
                <TableHead className="text-center bg-gray-50">Categoría</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600"></div>
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No hay productos destacados
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium hover:bg-gray-50 transition-colors">
                      {product.name}
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
                    <TableCell className="text-center hover:bg-gray-50 transition-colors">
                      <Badge
                        className={
                          product.total_quantity > 0
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : 'bg-red-50 text-red-700 border-red-100'
                        }
                      >
                        {product.category ? product.category : 'Sin categoría'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}