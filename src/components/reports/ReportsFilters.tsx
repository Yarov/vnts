import React from 'react';
import { CalendarIcon, UserGroupIcon, ArrowPathIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import Select from '../ui/Select';
import Button from '../ui/Button';
import DateInput from '../ui/DateInput';

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
  return (
    <div className="sticky top-14 z-10 bg-white border-b border-gray-100 mb-6 py-4 px-4 rounded-md shadow-sm">
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
    </div>
  );
};

export default ReportsFilters;