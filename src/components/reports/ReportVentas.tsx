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
import { useSalesReport } from '../../hooks/useSalesReport';
import { DollarSign, ShoppingCart, CreditCard, Users, ChevronDown, ChevronUp, Download, RefreshCw, X } from 'lucide-react';
import { exportSalesToExcel } from '../../utils/exportToExcel';
import ReportCard from './ReportCard';

export default function ReportVentas() {
  const {
    sales,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    dateFilter,
    setDateFilter,
    totals,
    refreshData
  } = useSalesReport();

  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);

  // Manejar cambios en las fechas
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    setDateFilter(prev => ({
      ...prev,
      startDate: newStartDate,
      // Si la fecha final es anterior a la inicial, la actualizamos
      endDate: prev.endDate && newStartDate > prev.endDate ? newStartDate : prev.endDate
    }));
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value;
    setDateFilter(prev => ({
      ...prev,
      endDate: newEndDate,
      // Si la fecha inicial es posterior a la final, la actualizamos
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
    const fileName = `ventas_${timestamp}.xlsx`;
    exportSalesToExcel(sales, fileName);
  };

  const hasActiveFilters = searchTerm || dateFilter.startDate || dateFilter.endDate;

  return (
    <div className="space-y-6">
      {/* Sección 1: KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ReportCard
          title="Total Ventas"
          value={formatCurrency(totals?.total_revenue ?? 0)}
          subtitle={`${totals?.total_sales ?? 0} transacciones`}
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
          title="Total Productos"
          value={totals?.total_items ?? 0}
          subtitle="Unidades vendidas"
          icon={ShoppingCart}
          iconColor="text-indigo-600"
          iconBgColor="bg-indigo-50"
        />

        <ReportCard
          title="Mejores Vendedores"
          value={totals?.top_sellers?.length ?? 0}
          subtitle={`Top vendedor: ${totals?.top_sellers?.[0]?.[0] ?? 'Sin datos'}`}
          icon={Users}
          iconColor="text-amber-600"
          iconBgColor="bg-amber-50"
          trend={{
            value: totals?.top_sellers?.[0]?.[1] ?? 0,
            isPositive: true
          }}
        />

        <ReportCard
          title="Promedio por Vendedor"
          value={formatCurrency((totals?.total_revenue ?? 0) / (totals?.top_sellers?.length || 1))}
          subtitle={`${totals?.top_sellers?.length ?? 0} vendedores activos`}
          icon={Users}
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
              placeholder="Buscar por cliente, vendedor, productos..."
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
            disabled={sales.length === 0}
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

      {/* Tabla de ventas */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Vendedor</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Método de Pago</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600"></div>
                  <p className="mt-4 text-slate-600">Cargando ventas...</p>
                </TableCell>
              </TableRow>
            ) : sales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  {error ? 'Error al cargar los datos' : 'No se encontraron ventas'}
                </TableCell>
              </TableRow>
            ) : (
              sales.map((sale) => (
                <React.Fragment key={sale.id}>
                  <TableRow>
                    <TableCell>
                      {formatDate(new Date(sale.created_at), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell>{sale.seller.name}</TableCell>
                    <TableCell>{sale.client?.name || '-'}</TableCell>
                    <TableCell>
                      <Badge>
                        {sale.payment_method.name}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(sale.total)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setExpandedSaleId(
                            expandedSaleId === sale.id ? null : sale.id
                          )
                        }
                      >
                        {expandedSaleId === sale.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expandedSaleId === sale.id && (
                    <TableRow>
                      <TableCell colSpan={6} className="bg-gray-50">
                        <div className="px-4 py-2">
                          <h4 className="font-medium mb-2">Productos:</h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Producto</TableHead>
                                <TableHead className="text-right">Cantidad</TableHead>
                                <TableHead className="text-right">Precio</TableHead>
                                <TableHead className="text-right">Subtotal</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {sale.items.map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell>{item.product_name}</TableCell>
                                  <TableCell className="text-right">{item.quantity}</TableCell>
                                  <TableCell className="text-right">
                                    {formatCurrency(item.price)}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {formatCurrency(item.subtotal)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
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
    </div>
  );
}