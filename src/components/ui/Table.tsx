import { ReactNode } from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => ReactNode);
  className?: string;
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  isLoading?: boolean;
  onRowClick?: (item: T) => void;
  className?: string;
}

interface TableProps {
  children?: ReactNode;
  className?: string;
}

interface TableHeaderProps {
  children?: ReactNode;
}

interface TableBodyProps {
  children?: ReactNode;
}

interface TableRowProps {
  children?: ReactNode;
  onClick?: () => void;
}

interface TableHeadProps {
  children?: ReactNode;
  className?: string;
}

interface TableCellProps {
  children?: ReactNode;
  className?: string;
  colSpan?: number;
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children }: TableHeaderProps) {
  return (
    <thead className="bg-gray-50">
      {children}
    </thead>
  );
}

export function TableBody({ children }: TableBodyProps) {
  return (
    <tbody className="bg-white divide-y divide-gray-200">
      {children}
    </tbody>
  );
}

export function TableRow({ children, onClick }: TableRowProps) {
  return (
    <tr
      className={`${onClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function TableHead({ children, className = '' }: TableHeadProps) {
  return (
    <th className={`px-2 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>
      {children}
    </th>
  );
}

export function TableCell({ children, className = '', colSpan }: TableCellProps) {
  return (
    <td className={`px-2 py-2 md:px-6 md:py-4 whitespace-nowrap text-sm text-gray-800 ${className}`} colSpan={colSpan}>
      {children}
    </td>
  );
}

// DataTable component for backward compatibility
export default function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No hay datos disponibles',
  isLoading = false,
  onRowClick,
  className = '',
}: DataTableProps<T>) {
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

  // Filtrar columnas visibles en mobile
  const visibleColumns = columns.filter(col => !col.hideOnMobile);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></span>
      </div>
    );
  }

  return (
    <Table className={className}>
      <TableHeader>
        <TableRow>
          {columns.map((column, index) => (
            <TableHead
              key={index}
              className={
                (column.hideOnMobile ? 'hidden md:table-cell ' : '') + (column.className || '')
              }
            >
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length > 0 ? (
          data.map((item) => (
            <TableRow
              key={(() => {
                try {
                  return keyExtractor(item);
                } catch (error) {
                  console.error('Error extracting key:', error);
                  return Math.random().toString(36).substring(2, 9); // Fallback to random ID
                }
              })()}
              onClick={onRowClick ? () => onRowClick(item) : undefined}
            >
              {columns.map((column, index) => (
                <TableCell
                  key={index}
                  className={
                    (column.hideOnMobile ? 'hidden md:table-cell ' : '') + (column.className || '')
                  }
                >
                  {renderCell(item, column)}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="text-center">
              {emptyMessage}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}