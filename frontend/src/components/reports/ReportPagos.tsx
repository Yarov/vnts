import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/Table';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { usePaymentReport, Payment, DateFilter } from '../../hooks/usePaymentReport';
import { DollarSign, CreditCard, TrendingUp, Wallet, ChevronDown, ChevronUp, Download, RefreshCw, X } from 'lucide-react';
import { exportPaymentsToExcel } from '../../utils/exportToExcel';
import ReportCard from './ReportCard';

export default function ReportPagos() {
  const {
    payments,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    dateFilter,
    setDateFilter,
    totals,
    refreshData
  } = usePaymentReport();

  const [expandedPaymentId, setExpandedPaymentId] = useState<string | null>(null);

  // Manejar cambios en las fechas
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    setDateFilter((prev: DateFilter) => ({
      ...prev,
      startDate: newStartDate,
      endDate: prev.endDate && newStartDate > prev.endDate ? newStartDate : prev.endDate
    }));
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value;
    setDateFilter((prev: DateFilter) => ({
      ...prev,
      endDate: newEndDate,
      startDate: prev.startDate && newEndDate < prev.startDate ? newEndDate : prev.startDate
    }));
  };

  // Limpiar filtros
  const handleClearFilters = () => {
    setSearchTerm('');
    setDateFilter({ startDate: '', endDate: '' });
  };

  // Exportar a Excel
  const handleExport = () => {
    const timestamp = formatDate(new Date(), 'yyyy-MM-dd_HH-mm');
    const fileName = `pagos_${timestamp}.xlsx`;
    exportPaymentsToExcel(payments, fileName);
  };

  const hasActiveFilters = searchTerm || dateFilter.startDate || dateFilter.endDate;

  return (
    <div className="space-y-6">
      {/* Sección 1: KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ReportCard
          title="Total Ingresos"
          value={formatCurrency(totals?.total_revenue ?? 0)}
          subtitle={`${totals?.total_transactions ?? 0} transacciones`}
          icon={DollarSign}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-50"
        />

        <ReportCard
          title="Método Principal"
          value={totals?.main_method?.name ?? 'Sin datos'}
          subtitle={`${formatCurrency(totals?.main_method?.total ?? 0)}`}
          icon={CreditCard}
          iconColor="text-emerald-600"
          iconBgColor="bg-emerald-50"
          trend={{
            value: totals?.main_method?.percentage ?? 0,
            isPositive: true
          }}
        />

        <ReportCard
          title="Promedio Diario"
          value={formatCurrency(totals?.daily_average ?? 0)}
          subtitle="Por día activo"
          icon={TrendingUp}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-50"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ReportCard
          title="Métodos Activos"
          value={totals?.active_methods ?? 0}
          subtitle="Métodos de pago"
          icon={Wallet}
          iconColor="text-indigo-600"
          iconBgColor="bg-indigo-50"
        />

        <ReportCard
          title="Ticket Promedio"
          value={formatCurrency(totals?.average_ticket ?? 0)}
          subtitle="Por transacción"
          icon={DollarSign}
          iconColor="text-amber-600"
          iconBgColor="bg-amber-50"
          trend={{
            value: totals?.average_ticket_change ?? 0,
            isPositive: (totals?.average_ticket_change ?? 0) > 0
          }}
        />

        <ReportCard
          title="Efectividad"
          value={`${(totals?.success_rate ?? 0).toFixed(1)}%`}
          subtitle={`${totals?.successful_transactions ?? 0} exitosas de ${totals?.total_transactions ?? 0}`}
          icon={TrendingUp}
          iconColor="text-rose-600"
          iconBgColor="bg-rose-50"
        />
      </div>

      {/* Filtros y acciones */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-full md:w-72">
            <Input
              type="search"
              placeholder="Buscar por método, referencia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={dateFilter.startDate}
              onChange={handleStartDateChange}
              className="w-40"
              max={dateFilter.endDate || undefined}
            />
            <span className="text-gray-500">hasta</span>
            <Input
              type="date"
              value={dateFilter.endDate}
              onChange={handleEndDateChange}
              className="w-40"
              min={dateFilter.startDate || undefined}
            />
          </div>
        </div>
        <div className="flex gap-2">
          {hasActiveFilters && (
            <Button
              onClick={handleClearFilters}
              variant="outline"
              size="sm"
              className="h-10 w-10"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            onClick={refreshData}
            variant="outline"
            size="sm"
            className="h-10 w-10"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleExport}
            variant="primary"
            size="sm"
            disabled={payments.length === 0}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar a Excel
          </Button>
        </div>
      </div>

      {/* Mensaje de filtros activos */}
      {hasActiveFilters && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded relative">
          Filtros activos: {[
            searchTerm && 'Búsqueda',
            (dateFilter.startDate || dateFilter.endDate) && 'Rango de fechas'
          ].filter(Boolean).join(', ')}
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {/* Tabla de pagos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Referencia</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-r-transparent"></div>
                  <p className="mt-4 text-slate-600">Cargando pagos...</p>
                </TableCell>
              </TableRow>
            ) : payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  {error ? 'Error al cargar los datos' : 'No se encontraron pagos'}
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment: Payment) => (
                <React.Fragment key={payment.id}>
                  <TableRow>
                    <TableCell>
                      {formatDate(new Date(payment.created_at), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell>{payment.method.name}</TableCell>
                    <TableCell>{payment.reference || '-'}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          payment.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : payment.status === 'pending'
                            ? 'bg-amber-50 text-amber-700 border-amber-100'
                            : 'bg-red-50 text-red-700 border-red-100'
                        }
                      >
                        {payment.status === 'completed' ? 'Completado' :
                         payment.status === 'pending' ? 'Pendiente' : 'Fallido'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setExpandedPaymentId(
                            expandedPaymentId === payment.id ? null : payment.id
                          )
                        }
                      >
                        {expandedPaymentId === payment.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expandedPaymentId === payment.id && (
                    <TableRow>
                      <TableCell colSpan={6} className="bg-gray-50">
                        <div className="px-4 py-2">
                          <h4 className="font-medium mb-2">Detalles del pago:</h4>
                          <dl className="grid grid-cols-3 gap-4">
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Venta</dt>
                              <dd className="mt-1 text-sm text-gray-900">#{payment.sale_id}</dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Cliente</dt>
                              <dd className="mt-1 text-sm text-gray-900">{payment.client_name}</dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Vendedor</dt>
                              <dd className="mt-1 text-sm text-gray-900">{payment.seller_name}</dd>
                            </div>
                            {payment.notes && (
                              <div className="col-span-3">
                                <dt className="text-sm font-medium text-gray-500">Notas</dt>
                                <dd className="mt-1 text-sm text-gray-900">{payment.notes}</dd>
                              </div>
                            )}
                          </dl>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Sección de Desglose de Métodos de Pago */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Desglose por Método de Pago</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(totals.payment_methods).map(([method, count]) => {
            const methodTotal = payments
              .filter((p: Payment) => p.method.name === method)
              .reduce((sum: number, p: Payment) => sum + p.amount, 0);
            const percentage = (methodTotal / totals.total_revenue) * 100;

            return (
              <div key={method} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{method}</h4>
                  <Badge className="bg-blue-50 text-blue-700 border-blue-100">
                    {count} transacciones
                  </Badge>
                </div>
                <div className="text-2xl font-semibold mb-1">
                  {formatCurrency(methodTotal)}
                </div>
                <div className="text-sm text-gray-500">
                  {percentage.toFixed(1)}% del total
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}