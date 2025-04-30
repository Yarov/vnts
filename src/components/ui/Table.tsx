import { ReactNode } from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => ReactNode);
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  isLoading?: boolean;
  onRowClick?: (item: T) => void;
  className?: string;
}

export default function Table<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No hay datos disponibles',
  isLoading = false,
  onRowClick,
  className = '',
}: TableProps<T>) {
  const renderCell = (item: T, column: Column<T>) => {
    try {
      if (typeof column.accessor === 'function') {
        return column.accessor(item);
      }
      
      const value = item[column.accessor as keyof T];
      return value as ReactNode;
    } catch (error) {
      console.error('Error rendering cell:', error);
      return '-';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></span>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length > 0 ? (
            data.map((item) => (
              <tr 
                key={(() => {
                  try {
                    return keyExtractor(item);
                  } catch (error) {
                    console.error('Error extracting key:', error);
                    return Math.random().toString(36).substring(2, 9); // Fallback to random ID
                  }
                })()} 
                className={`${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
              >
                {columns.map((column, index) => (
                  <td 
                    key={index} 
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-800 ${column.className || ''}`}
                  >
                    {renderCell(item, column)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-6 py-4 text-center text-sm text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
