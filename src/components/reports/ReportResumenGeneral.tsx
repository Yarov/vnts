import React from 'react';
import StatsCard from '../dashboard/StatsCard';
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
import { CurrencyDollarIcon, ReceiptPercentIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import {
  TrendingUpIcon,
  TrendingDownIcon,
  DollarSign,
  ShoppingCart,
  Package2,
  Users,
  Wallet,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface TopProductoItem {
  id: string;
  name: string;
  quantity: number;
  total: number;
}

interface TopClienteItem {
  id: string;
  name: string;
  purchase_count?: number;
}

interface CommissionItem {
  seller_id: string;
  seller_name: string;
  total_sales: number;
  commission_percentage: number;
  commission_amount: number;
}

interface ReportResumenGeneralProps {
  resumen: {
    totalVentas: number;
    ventasHoy: number;
    ventasSemana: number;
    productosActivos: number;
    cambioDiario: { value: number; isPositive: boolean };
    cambioSemanal: { value: number; isPositive: boolean };
  };
  topProductos: TopProductoItem[];
  topClientes: TopClienteItem[];
  ventasDiarias: Array<{
    date: string;
    total: number;
    count: number;
  }>;
  commissions: CommissionItem[];
  formatCurrency: (value: number) => string;
  formatDate: (date: string | Date, format: string) => string;
  isLoading: boolean;
  periodLabel: string;
}

const ReportResumenGeneral: React.FC<ReportResumenGeneralProps> = ({
  resumen,
  topProductos,
  topClientes,
  ventasDiarias,
  commissions,
  formatCurrency,
  formatDate,
  isLoading,
  periodLabel = 'diario',
}) => {
  // Columnas para tabla de productos
  const productColumns = [
    { header: 'Producto', accessor: 'name' },
    { header: 'Unidades vendidas', accessor: 'quantity', className: 'text-center' },
    { header: 'Total', accessor: (item: any) => formatCurrency(item.total), className: 'text-right font-medium' }
  ];

  // Columnas para tabla de clientes
  const clientColumns = [
    { header: 'Cliente', accessor: 'name' },
    { header: 'Compras', accessor: (item: any) => <Badge color="purple" className="mx-auto">{item.purchase_count}</Badge>, className: 'text-center' },
    { header: 'Última compra', accessor: (item: any) => formatDate(item.last_purchase, 'dd/MM/yyyy'), className: 'text-center' }
  ];

  // KPIs adicionales
  const totalPeriodo = ventasDiarias.reduce((sum, d) => sum + d.total, 0);
  const cantidadVentas = ventasDiarias.reduce((sum, d) => sum + (d.count || 0), 0);
  const ticketPromedio = cantidadVentas > 0 ? totalPeriodo / cantidadVentas : 0;
  const promedioDiario = ventasDiarias.length > 0 ? totalPeriodo / ventasDiarias.length : 0;
  const diaMax = ventasDiarias.length > 0 ? ventasDiarias.reduce((max, d) => d.total > max.total ? d : max, ventasDiarias[0]) : { date: '', total: 0, count: 0 };
  const diaMin = ventasDiarias.length > 0 ? ventasDiarias.reduce((min, d) => d.total < min.total ? d : min, ventasDiarias[0]) : { date: '', total: 0, count: 0 };
  const diaMasTransacciones = ventasDiarias.length > 0 ? ventasDiarias.reduce((max, d) => (d.count || 0) > (max.count || 0) ? d : max, ventasDiarias[0]) : { date: '', total: 0, count: 0 };

  // Producto más vendido
  const productoMasVendido = topProductos && topProductos.length > 0 ? topProductos[0] : null;
  // Cliente más frecuente
  const clienteMasFrecuente = topClientes && topClientes.length > 0 ? topClientes[0] : null;

  // Tendencia y crecimiento
  let tendencia = { value: 0, isPositive: true };
  if (ventasDiarias.length > 2) {
    const mitad = Math.floor(ventasDiarias.length / 2);
    const prom1 = ventasDiarias.slice(0, mitad).reduce((sum, d) => sum + d.total, 0) / mitad;
    const prom2 = ventasDiarias.slice(mitad).reduce((sum, d) => sum + d.total, 0) / (ventasDiarias.length - mitad);
    const diff = prom2 - prom1;
    tendencia = {
      value: prom1 === 0 ? 0 : Math.round((diff / prom1) * 100),
      isPositive: diff >= 0
    };
  }

  let crecimiento = { value: 0, isPositive: true };
  if (ventasDiarias.length > 6) {
    const mitad = Math.floor(ventasDiarias.length / 2);
    const totalAnterior = ventasDiarias.slice(0, mitad).reduce((sum, d) => sum + d.total, 0);
    const totalActual = ventasDiarias.slice(mitad).reduce((sum, d) => sum + d.total, 0);
    const diff = totalActual - totalAnterior;
    crecimiento = {
      value: totalAnterior === 0 ? 0 : Math.round((diff / totalAnterior) * 100),
      isPositive: diff >= 0
    };
  }

  return (
    <div className="space-y-6">
      {/* Sección 1: Resumen General del Periodo */}
      <Card title="Resumen General del Periodo">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total del Periodo"
            value={formatCurrency(totalPeriodo)}
            icon={<CurrencyDollarIcon className="h-6 w-6 text-primary-600" />}
            footer={periodLabel ? `Periodo: ${periodLabel}` : ''}
            className="bg-gradient-to-br from-primary-50 to-white"
          />
          <StatsCard
            title="Cantidad de Ventas"
            value={cantidadVentas}
            icon={<ReceiptPercentIcon className="h-6 w-6 text-primary-600" />}
            footer="Total de transacciones"
            className="bg-gradient-to-br from-primary-50 to-white"
          />
          <StatsCard
            title="Ticket Promedio"
            value={formatCurrency(ticketPromedio)}
            icon={<CurrencyDollarIcon className="h-6 w-6 text-blue-600" />}
            footer="Por venta"
            className="bg-gradient-to-br from-blue-50 to-white"
          />
          <StatsCard
            title="Promedio Diario"
            value={formatCurrency(promedioDiario)}
            icon={<ReceiptPercentIcon className="h-6 w-6 text-primary-600" />}
            footer="Promedio por día"
            className="bg-gradient-to-br from-primary-50 to-white"
          />
        </div>
      </Card>

      {/* Sección 2: Días Destacados */}
      <Card title="Días Destacados">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Día con Más Ventas"
            value={formatCurrency(diaMax.total)}
            icon={<CurrencyDollarIcon className="h-6 w-6 text-green-600" />}
            footer={diaMax.date ? `Fecha: ${formatDate(diaMax.date, 'dd/MM')}` : ''}
            className="bg-gradient-to-br from-green-50 to-white"
          />
          <StatsCard
            title="Día con Menos Ventas"
            value={formatCurrency(diaMin.total)}
            icon={<CurrencyDollarIcon className="h-6 w-6 text-red-600" />}
            footer={diaMin.date ? `Fecha: ${formatDate(diaMin.date, 'dd/MM')}` : ''}
            className="bg-gradient-to-br from-red-50 to-white"
          />
          <StatsCard
            title="Día con Más Transacciones"
            value={diaMasTransacciones.count || 0}
            icon={<ReceiptPercentIcon className="h-6 w-6 text-green-600" />}
            footer={diaMasTransacciones.date ? `Fecha: ${formatDate(diaMasTransacciones.date, 'dd/MM')}` : ''}
            className="bg-gradient-to-br from-green-50 to-white"
          />
          <StatsCard
            title="Tendencia"
            value={tendencia.value + '%'}
            icon={<ReceiptPercentIcon className={`h-6 w-6 ${tendencia.isPositive ? 'text-green-600' : 'text-red-600'}`} />}
            change={tendencia}
            footer={tendencia.isPositive ? 'Tendencia positiva' : 'Tendencia negativa'}
            className="bg-gradient-to-br from-purple-50 to-white"
          />
        </div>
      </Card>

      {/* Sección 3: Top y Crecimientos */}
      <Card title="Top y Crecimientos">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="Producto Más Vendido"
            value={productoMasVendido ? productoMasVendido.name : 'N/A'}
            icon={<ShoppingBagIcon className="h-6 w-6 text-primary-600" />}
            footer={productoMasVendido ? `Unidades: ${productoMasVendido.quantity}` : ''}
            className="bg-gradient-to-br from-primary-50 to-white"
          />
          <StatsCard
            title="Cliente Más Frecuente"
            value={clienteMasFrecuente ? clienteMasFrecuente.name : 'N/A'}
            icon={<ReceiptPercentIcon className="h-6 w-6 text-primary-600" />}
            footer={clienteMasFrecuente ? `Compras: ${clienteMasFrecuente.purchase_count}` : ''}
            className="bg-gradient-to-br from-primary-50 to-white"
          />
          <StatsCard
            title="Crecimiento vs. Periodo Anterior"
            value={crecimiento.value + '%'}
            icon={<ReceiptPercentIcon className={`h-6 w-6 ${crecimiento.isPositive ? 'text-green-600' : 'text-red-600'}`} />}
            change={crecimiento}
            footer={crecimiento.isPositive ? 'Crecimiento positivo' : 'Crecimiento negativo'}
            className="bg-gradient-to-br from-purple-50 to-white"
          />
        </div>
      </Card>

      {/* Sección 4: Tablas de Top */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Top Productos">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProductos.map((producto) => (
                  <TableRow key={producto.id}>
                    <TableCell>{producto.name}</TableCell>
                    <TableCell className="text-right">{producto.quantity}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(producto.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
        <Card title="Top Clientes">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Compras</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topClientes.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell>{cliente.name}</TableCell>
                    <TableCell className="text-right">
                      {cliente.purchase_count || 0}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Comisiones */}
      <div className="space-y-6">
        <Card title="Comisiones del Periodo">
          {/* Tarjetas de resumen de comisiones */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl shadow-sm border border-emerald-200">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-medium text-emerald-900">Total Comisiones</h3>
              </div>
              <p className="mt-4 text-3xl font-bold text-emerald-900">
                {formatCurrency(commissions.reduce((sum, c) => sum + c.commission_amount, 0))}
              </p>
              <p className="mt-2 text-sm text-emerald-700">
                {commissions.length} vendedores activos
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm border border-blue-200">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-medium text-blue-900">Total Ventas</h3>
              </div>
              <p className="mt-4 text-3xl font-bold text-blue-900">
                {formatCurrency(commissions.reduce((sum, c) => sum + c.total_sales, 0))}
              </p>
              <p className="mt-2 text-sm text-blue-700">
                Base para comisiones
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-sm border border-purple-200">
              <div className="flex items-center gap-3">
                <Wallet className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm font-medium text-purple-900">Promedio Comisión</h3>
              </div>
              <p className="mt-4 text-3xl font-bold text-purple-900">
                {commissions.length > 0
                  ? (commissions.reduce((sum, c) => sum + c.commission_percentage, 0) / commissions.length).toFixed(2)
                  : '0.00'}%
              </p>
              <p className="mt-2 text-sm text-purple-700">
                Porcentaje promedio
              </p>
            </div>
          </div>

          {/* Gráfico de comisiones */}
          {commissions.length > 0 && (
            <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="text-sm font-medium text-gray-600 mb-4">Distribución de Comisiones</h4>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={commissions.map(c => ({
                      name: c.seller_name,
                      ventas: c.total_sales,
                      comision: c.commission_amount
                    }))}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="ventas"
                      stroke="#3b82f6"
                      name="Ventas"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="comision"
                      stroke="#10b981"
                      name="Comisión"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Tabla de comisiones */}
          <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendedor</TableHead>
                  <TableHead className="text-right">Ventas</TableHead>
                  <TableHead className="text-center">%</TableHead>
                  <TableHead className="text-right">Comisión</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-r-transparent"></div>
                    </TableCell>
                  </TableRow>
                ) : commissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      No hay comisiones en este periodo
                    </TableCell>
                  </TableRow>
                ) : (
                  commissions.map((commission) => (
                    <TableRow key={commission.seller_id}>
                      <TableCell className="font-medium hover:bg-gray-50">{commission.seller_name}</TableCell>
                      <TableCell className="text-right hover:bg-gray-50">
                        {formatCurrency(commission.total_sales)}
                      </TableCell>
                      <TableCell className="text-center hover:bg-gray-50">
                        <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                          {commission.commission_percentage}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-emerald-600 hover:bg-gray-50">
                        {formatCurrency(commission.commission_amount)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
                {commissions.length > 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-right bg-gray-50 font-medium">
                      Total Comisiones:
                    </TableCell>
                    <TableCell className="text-right bg-gray-50 text-emerald-600">
                      {formatCurrency(
                        commissions.reduce((sum, c) => sum + c.commission_amount, 0)
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ReportResumenGeneral;
