import React from 'react';

type ProductSale = {
  id: string;
  name: string;
  quantity: number;
  total: number;
  price: number;
};

type TopProductsTableProps = {
  products: ProductSale[];
  isLoading: boolean;
  className?: string;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(value);
};

const TopProductsTable = ({ products, isLoading, className = '' }: TopProductsTableProps) => {
  // Calcular el total general
  const totalAmount = React.useMemo(() => {
    return products.reduce((sum, product) => sum + product.total, 0);
  }, [products]);
  
  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden ${className}`}>
      <div className="px-6 py-4 bg-gray-50 border-b">
        <h3 className="text-lg font-semibold text-gray-800">Productos Más Vendidos</h3>
        <p className="text-sm text-gray-500 mt-1">Desglose de ventas por producto</p>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="px-6 py-10 text-center text-gray-500">
          <p>No hay ventas registradas para mostrar productos</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio Unit.
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % Ventas
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {product.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium text-right">
                    {formatCurrency(product.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {totalAmount > 0 ? `${Math.round((product.total / totalAmount) * 100)}%` : '0%'}
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div 
                        className="bg-primary-600 h-1.5 rounded-full" 
                        style={{ width: `${Math.round((product.total / totalAmount) * 100)}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50">
                <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900" colSpan={3}>
                  Total General
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                  {formatCurrency(totalAmount)}
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                  100%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};

export default TopProductsTable;
