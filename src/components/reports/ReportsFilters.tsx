import React, { useState } from 'react';
import { CalendarIcon, UserGroupIcon, ArrowPathIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import Select from '../ui/Select';
import Button from '../ui/Button';
import DateInput from '../ui/DateInput';
import { Dialog, DialogContent, DialogTitle } from '../ui/Dialog';

interface ReportsFiltersProps {
  periodFilter: string;
  setPeriodFilter: (v: string) => void;
  dateRange: { start: Date; end: Date };
  setDateRange: (r: { start: Date; end: Date }) => void;
  sellerOptions: { value: string; label: string }[];
  selectedSellerId: string;
  setSelectedSellerId: (v: string) => void;
  onReset: () => void;
  onExport: () => void;
}

const periodOptions = [
  { value: 'today', label: 'Hoy' },
  { value: 'yesterday', label: 'Ayer' },
  { value: 'week', label: 'Esta semana' },
  { value: 'month', label: 'Este mes' },
  { value: 'custom', label: 'Personalizado' },
];

const ReportsFilters: React.FC<ReportsFiltersProps> = ({
  periodFilter,
  setPeriodFilter,
  dateRange,
  setDateRange,
  sellerOptions,
  selectedSellerId,
  setSelectedSellerId,
  onReset,
  onExport,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Filtros completos (contenido reutilizable)
  const filtersContent = (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
      {/* Período */}
      <Select
        label="Período"
        options={periodOptions}
        value={periodFilter}
        onChange={setPeriodFilter}
        icon={<CalendarIcon className="h-4 w-4 text-primary-500" />}
      />
      {/* Fechas personalizadas */}
      {periodFilter === 'custom' && (
        <>
          <DateInput
            label="Inicio"
            value={dateRange.start.toISOString().slice(0, 10)}
            onChange={val => setDateRange({ ...dateRange, start: new Date(val) })}
          />
          <DateInput
            label="Fin"
            value={dateRange.end.toISOString().slice(0, 10)}
            onChange={val => setDateRange({ ...dateRange, end: new Date(val) })}
          />
        </>
      )}
      {/* Vendedor */}
      <Select
        label="Vendedor"
        options={sellerOptions}
        value={selectedSellerId}
        onChange={setSelectedSellerId}
        icon={<UserGroupIcon className="h-4 w-4 text-primary-500" />}
      />
      {/* Acciones */}
      <div className="flex gap-2 mt-2 md:mt-0">
        <Button
          variant="ghost"
          size="sm"
          icon={<ArrowPathIcon className="h-4 w-4 mr-1" />}
          onClick={onReset}
        >
          Limpiar
        </Button>
        <Button
          variant="outline"
          size="sm"
          icon={<ArrowDownTrayIcon className="h-4 w-4 mr-1" />}
          onClick={onExport}
        >
          Exportar
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: filtro expandido */}
      <div className="sticky top-14 z-10 bg-white border-b border-gray-100 mb-6 py-4 px-4 rounded-md shadow-sm hidden md:block">
        {filtersContent}
      </div>
      {/* Mobile: botón de filtros y modal */}
      <div className="block md:hidden mb-4 px-2">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setMobileOpen(true)}
          icon={<CalendarIcon className="h-5 w-5 mr-2" />}
        >
          Filtros
        </Button>
        <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
          <DialogContent>
            <DialogTitle>Filtros</DialogTitle>
            <div className="space-y-4 py-2">
              {filtersContent}
              <Button
                variant="primary"
                className="w-full mt-4"
                onClick={() => setMobileOpen(false)}
              >
                Aplicar filtros
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default ReportsFilters;