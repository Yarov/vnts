import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/Table';
import Badge from '../ui/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useClientReport } from '../../hooks/useClientReport';
import { Users, DollarSign, ShoppingCart, CreditCard } from 'lucide-react';
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

export default function ReportClientes() {
  const {
    clients,
    isLoading,
    totals
  } = useClientReport();

  return (
    <div className="space-y-8 p-6 bg-gray-50">
      {/* Sección 1: KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ReportCard
          title="Total Ventas"
          value={formatCurrency(totals?.total_revenue ?? 0)}
          subtitle={`${totals?.total_purchases ?? 0} transacciones`}
          icon={DollarSign}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-50"
        />

        <ReportCard
          title="Ticket Promedio"
          value={formatCurrency(totals?.average_ticket ?? 0)}
          subtitle="Por transacción"
          icon={ShoppingCart}
          iconColor="text-emerald-600"
          iconBgColor="bg-emerald-50"
          trend={{
            value: totals?.average_ticket ?? 0,
            isPositive: (totals?.average_ticket ?? 0) > 0
          }}
        />

        <ReportCard
          title="Métodos de Pago"
          value={Object.keys(totals?.payment_methods ?? {}).length}
          subtitle={`${Object.entries(totals?.payment_methods ?? {})
            .sort(([,a], [,b]) => b - a)[0]?.[0] ?? 'Sin datos'}`}
          icon={CreditCard}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-50"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ReportCard
          title="Total Clientes"
          value={totals?.total_clients ?? 0}
          subtitle="Base de clientes"
          icon={Users}
          iconColor="text-indigo-600"
          iconBgColor="bg-indigo-50"
        />

        <ReportCard
          title="Clientes Activos"
          value={totals?.active_clients ?? 0}
          subtitle={`${((totals?.active_clients ?? 0) / (totals?.total_clients ?? 1) * 100).toFixed(1)}% del total`}
          icon={Users}
          iconColor="text-amber-600"
          iconBgColor="bg-amber-50"
          trend={{
            value: ((totals?.active_clients ?? 0) / (totals?.total_clients ?? 1) * 100),
            isPositive: true
          }}
        />

        <ReportCard
          title="Clientes Inactivos"
          value={totals?.inactive_clients ?? 0}
          subtitle={`${((totals?.inactive_clients ?? 0) / (totals?.total_clients ?? 1) * 100).toFixed(1)}% del total`}
          icon={Users}
          iconColor="text-rose-600"
          iconBgColor="bg-rose-50"
        />
      </div>

      {/* Sección 2: Gráfico de Tendencias */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Tendencia de Ventas</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={clients
                .filter(client => client.last_purchase)
                .sort((a, b) => new Date(a.last_purchase!).getTime() - new Date(b.last_purchase!).getTime())
                .map(client => ({
                  date: formatDate(new Date(client.last_purchase!), 'dd/MM/yyyy'),
                  ventas: client.total_spent,
                  transacciones: client.total_purchases
                }))}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorTransacciones" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="left"
                orientation="left"
                stroke="#6366f1"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#f59e0b"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
                        <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
                        {payload.map((entry, index) => (
                          <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name === 'ventas'
                              ? `Ventas: ${formatCurrency(Number(entry.value) || 0)}`
                              : `Transacciones: ${Number(entry.value) || 0}`}
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="ventas"
                name="Ventas"
                stroke="#6366f1"
                fill="url(#colorVentas)"
                strokeWidth={2}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="transacciones"
                name="Transacciones"
                stroke="#f59e0b"
                fill="url(#colorTransacciones)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sección 3: Tabla de Clientes Recientes */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-900">Clientes Recientes</h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="bg-gray-50">Cliente</TableHead>
                <TableHead className="text-right bg-gray-50">Total Gastado</TableHead>
                <TableHead className="text-center bg-gray-50">Compras</TableHead>
                <TableHead className="text-right bg-gray-50">Última Compra</TableHead>
                <TableHead className="text-center bg-gray-50">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600"></div>
                  </TableCell>
                </TableRow>
              ) : clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No hay clientes recientes
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell className="font-medium hover:bg-gray-50 transition-colors">
                      {cliente.name}
                    </TableCell>
                    <TableCell className="text-right hover:bg-gray-50 transition-colors">
                      {formatCurrency(cliente.total_spent)}
                    </TableCell>
                    <TableCell className="text-center hover:bg-gray-50 transition-colors">
                      {cliente.total_purchases}
                    </TableCell>
                    <TableCell className="text-right hover:bg-gray-50 transition-colors">
                      {cliente.last_purchase ? formatDate(new Date(cliente.last_purchase), 'dd/MM/yyyy') : 'Nunca'}
                    </TableCell>
                    <TableCell className="text-center hover:bg-gray-50 transition-colors">
                      <Badge
                        className={
                          cliente.last_purchase && new Date(cliente.last_purchase) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : 'bg-amber-50 text-amber-700 border-amber-100'
                        }
                      >
                        {cliente.last_purchase && new Date(cliente.last_purchase) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                          ? 'Activo'
                          : 'Inactivo'}
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