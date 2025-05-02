import React from 'react';

interface ReportsTabsProps {
  active: string;
  onChange: (tab: string) => void;
}

const TABS = [
  { key: 'resumen', label: 'Resumen' },
  { key: 'ventas', label: 'Ventas' },
  { key: 'productos', label: 'Productos' },
  { key: 'clientes', label: 'Clientes' },
  { key: 'vendedores', label: 'Vendedores' },
  { key: 'pagos', label: 'Métodos de Pago' },
  { key: 'comparativas', label: 'Comparativas' },
];

const ReportsTabs: React.FC<ReportsTabsProps> = ({ active, onChange }) => (
  <nav className="sticky top-0 z-10 bg-white border-b border-gray-200 mb-6">
    <ul className="flex space-x-2 px-2">
      {TABS.map(tab => (
        <li key={tab.key}>
          <button
            className={`px-4 py-2 rounded-t-md font-medium transition-colors focus:outline-none ${
              active === tab.key
                ? 'bg-primary-100 text-primary-700 border-b-2 border-primary-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => onChange(tab.key)}
          >
            {tab.label}
          </button>
        </li>
      ))}
    </ul>
  </nav>
);

export default ReportsTabs;
