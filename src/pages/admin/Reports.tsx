import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ReportsTabs from '../../components/reports/ReportsTabs';
import ReportsFilters from '../../components/reports/ReportsFilters';
import ReportResumenGeneral from '../../components/reports/ReportResumenGeneral';
import ReportVentas from '../../components/reports/ReportVentas';
import ReportClientes from '../../components/reports/ReportClientes';
import ReportProductos from '../../components/reports/ReportProductos';
import ReportVendedores from '../../components/reports/ReportVendedores';
import { useAdminReports } from '../../hooks/useAdminReports';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function Reports() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    dateRange,
    setDateRange,
    periodFilter,
    setPeriodFilter,
    isLoading,
    sellers,
    selectedSellerId,
    setSelectedSellerId,
    topProducts,
    dailySales,
    totalSales,
    activeTab,
    setActiveTab,
    topClientes,
    handleResetFilters,
    handleExport,
    ventas,
    commissions,
  } = useAdminReports();

  // Calcular métricas por vendedor
  const ventasPorVendedor = sellers.map(seller => {
    const ventasVendedor = ventas.filter(v => v.seller?.id === seller.id);
    const totalVentas = ventasVendedor.reduce((sum, v) => sum + (typeof v.total === 'string' ? parseFloat(v.total) : v.total), 0);
    return {
      seller_id: seller.id,
      seller_name: seller.name,
      total_sales: totalVentas,
      total_transactions: ventasVendedor.length,
      average_ticket: ventasVendedor.length > 0 ? totalVentas / ventasVendedor.length : 0,
      products_sold: ventasVendedor.reduce((sum, v) => sum + v.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0),
    };
  });

  // Inicializar la pestaña activa desde la URL o usar 'resumen' como valor predeterminado
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && ['resumen', 'ventas', 'clientes', 'productos', 'vendedores', 'pagos', 'comparativas'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    } else if (!tabFromUrl && activeTab !== 'resumen') {
      setSearchParams({ tab: activeTab });
    }
  }, [searchParams, activeTab, setActiveTab, setSearchParams]);

  // Manejar el cambio de pestaña
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Opciones para selector de vendedores
  const sellerOptions = [
    { value: '', label: 'Todos los vendedores' },
    ...sellers.map(seller => ({
      value: seller.id,
      label: seller.name,
    })),
  ];

  // Etiqueta para el periodo de la gráfica
  const periodLabelMap: Record<string, string> = {
    today: 'diario',
    yesterday: 'diario',
    week: 'semanal',
    month: 'mensual',
    custom: 'personalizado',
  };
  const periodLabel = periodLabelMap[periodFilter] || 'diario';

  return (
    <div>
      <ReportsTabs active={activeTab} onChange={handleTabChange} />
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
        formatDate={formatDate}
      />
      {activeTab === 'resumen' && (
        <ReportResumenGeneral
          resumen={{
            totalVentas: totalSales,
            ventasHoy: dailySales.length > 0 ? dailySales[dailySales.length - 1].total : 0,
            ventasSemana: dailySales.slice(-7).reduce((sum, d) => sum + d.total, 0),
            productosActivos: topProducts.length,
            cambioDiario: { value: 0, isPositive: true },
            cambioSemanal: { value: 0, isPositive: true },
          }}
          topProductos={topProducts}
          topClientes={topClientes}
          ventasDiarias={dailySales}
          commissions={commissions}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          isLoading={isLoading}
          periodLabel={periodLabel}
        />
      )}
      {activeTab === 'ventas' && (
        <ReportVentas />
      )}
      {activeTab === 'clientes' && (
        <ReportClientes />
      )}
      {activeTab === 'productos' && (
        <ReportProductos />
      )}
      {activeTab === 'vendedores' && (
        <ReportVendedores
          commissions={commissions}
          ventasPorVendedor={ventasPorVendedor}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          isLoading={isLoading}
          periodLabel={periodLabel}
        />
      )}
      {activeTab !== 'resumen' &&
        activeTab !== 'ventas' &&
        activeTab !== 'clientes' &&
        activeTab !== 'productos' &&
        activeTab !== 'vendedores' && (
        <div className="py-20 text-center text-gray-400 text-xl">
          <span>Próximamente: Reporte de {activeTab?.charAt(0)?.toUpperCase() + activeTab?.slice(1) || 'desconocido'}</span>
        </div>
      )}
    </div>
  );
}
