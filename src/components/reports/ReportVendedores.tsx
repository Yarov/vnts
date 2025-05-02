import React from 'react';
import Card from '../ui/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/Table';
import Badge from '../ui/Badge';
import {
  DollarSign,
  ShoppingCart,
  Wallet,
  TrendingUp,
  Users,
  Target,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  Area,
  AreaChart,
} from 'recharts';

interface CommissionItem {
  seller_id: string;
  seller_name: string;
  total_sales: number;
  commission_percentage: number;
  commission_amount: number;
}

interface ReportVendedoresProps {
  commissions: CommissionItem[];
  ventasPorVendedor: Array<{
    seller_id: string;
    seller_name: string;
    total_sales: number;
    total_transactions: number;
    average_ticket: number;
    products_sold: number;
  }>;
  formatCurrency: (value: number) => string;
  formatDate: (date: string | Date, format: string) => string;
  isLoading: boolean;
  periodLabel: string;
}

const ReportVendedores: React.FC<ReportVendedoresProps> = ({
  commissions,
  ventasPorVendedor,
  formatCurrency,
  formatDate,
  isLoading,
  periodLabel,
}) => {
  // Calcular métricas generales
  const totalComisiones = commissions.reduce((sum, c) => sum + c.commission_amount, 0);
  const totalVentas = commissions.reduce((sum, c) => sum + c.total_sales, 0);
  const promedioComision = commissions.length > 0
    ? commissions.reduce((sum, c) => sum + c.commission_percentage, 0) / commissions.length
    : 0;

  // Función para formatear valores en el tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
          <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
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
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-base font-medium text-gray-900">Total Comisiones</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {formatCurrency(totalComisiones)}
          </p>
          <p className="text-sm text-gray-500 flex items-center gap-2">
            <Users className="w-4 h-4" />
            {commissions.length} vendedores activos
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-base font-medium text-gray-900">Total Ventas</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {formatCurrency(totalVentas)}
          </p>
          <p className="text-sm text-gray-500">
            Base para comisiones
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Wallet className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-base font-medium text-gray-900">Promedio Comisión</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {promedioComision.toFixed(2)}%
          </p>
          <p className="text-sm text-gray-500">
            Porcentaje promedio
          </p>
        </div>
      </div>

      {/* Sección 2: Gráficos de Análisis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Distribución de Ventas y Comisiones</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={commissions}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorComision" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="seller_name"
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
                  stroke="#10b981"
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
                  dataKey="total_sales"
                  name="Ventas"
                  stroke="#3b82f6"
                  fill="url(#colorVentas)"
                  strokeWidth={2}
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="commission_amount"
                  name="Comisión"
                  stroke="#10b981"
                  fill="url(#colorComision)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Métricas por Vendedor</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={ventasPorVendedor}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="seller_name"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
                <Line
                  type="monotone"
                  dataKey="average_ticket"
                  name="Ticket Promedio"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ stroke: '#8b5cf6', strokeWidth: 2, r: 4, fill: '#fff' }}
                  activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2, fill: '#fff' }}
                />
                <Line
                  type="monotone"
                  dataKey="total_transactions"
                  name="Transacciones"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ stroke: '#f59e0b', strokeWidth: 2, r: 4, fill: '#fff' }}
                  activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2, fill: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Sección 3: Tabla Detallada */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-900">Detalle por Vendedor</h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="bg-gray-50">Vendedor</TableHead>
                <TableHead className="text-right bg-gray-50">Ventas</TableHead>
                <TableHead className="text-center bg-gray-50">Transacciones</TableHead>
                <TableHead className="text-right bg-gray-50">Ticket Promedio</TableHead>
                <TableHead className="text-center bg-gray-50">% Comisión</TableHead>
                <TableHead className="text-right bg-gray-50">Total Comisión</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-r-transparent"></div>
                  </TableCell>
                </TableRow>
              ) : ventasPorVendedor.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No hay datos disponibles para este periodo
                  </TableCell>
                </TableRow>
              ) : (
                ventasPorVendedor.map((vendedor) => {
                  const commission = commissions.find(c => c.seller_id === vendedor.seller_id);
                  return (
                    <TableRow key={vendedor.seller_id}>
                      <TableCell className="font-medium hover:bg-gray-50 transition-colors">
                        {vendedor.seller_name}
                      </TableCell>
                      <TableCell className="text-right hover:bg-gray-50 transition-colors">
                        {formatCurrency(vendedor.total_sales)}
                      </TableCell>
                      <TableCell className="text-center hover:bg-gray-50 transition-colors">
                        {vendedor.total_transactions}
                      </TableCell>
                      <TableCell className="text-right hover:bg-gray-50 transition-colors">
                        {formatCurrency(vendedor.average_ticket)}
                      </TableCell>
                      <TableCell className="text-center hover:bg-gray-50 transition-colors">
                        <Badge className="bg-purple-50 text-purple-700 border-purple-100">
                          {commission?.commission_percentage}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-emerald-600 hover:bg-gray-50 transition-colors">
                        {formatCurrency(commission?.commission_amount || 0)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default ReportVendedores;