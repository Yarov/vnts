import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Card from '../ui/Card';

// Formatear número como moneda
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(value);
};

const DebugCommissions = () => {
  const [debugData, setDebugData] = useState<any>({
    ventas: [],
    vendedores: [],
    comisiones: [],
    fechaActual: '',
    loading: true,
    error: null
  });

  const fetchDebugData = async () => {
    setDebugData(prev => ({ ...prev, loading: true }));
    
    try {
      // Obtener fecha actual
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayStr = today.toISOString();
      const formattedToday = today.toISOString().split('T')[0];
      
      // Fecha de hoy para filtrado
      const todayStart = new Date(today);
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(today);
      todayEnd.setHours(23, 59, 59, 999);
      
      // 1. Obtener vendedores activos
      const { data: vendedores, error: vendedoresError } = await supabase
        .from('sellers')
        .select('*')
        .eq('active', true);
        
      if (vendedoresError) throw vendedoresError;
      
      // 2. Obtener ventas del día
      const { data: ventas, error: ventasError } = await supabase
        .from('sales')
        .select(`
          id, seller_id, total, created_at,
          sellers:seller_id (id, name, commission_percentage)
        `)
        .gte('created_at', todayStart.toISOString())
        .lte('created_at', todayEnd.toISOString());
        
      if (ventasError) throw ventasError;
      
      // 3. Calcular comisiones manualmente
      const comisiones = vendedores.map(vendedor => {
        // Filtrar ventas para este vendedor
        const ventasVendedor = ventas?.filter(v => v.seller_id === vendedor.id) || [];
        
        // Calcular total de ventas
        const totalVentas = ventasVendedor.reduce((sum, v) => sum + parseFloat(v.total), 0);
        
        // Calcular comisión
        const montoComision = totalVentas * (vendedor.commission_percentage / 100);
        
        return {
          seller_id: vendedor.id,
          seller_name: vendedor.name,
          total_sales: totalVentas,
          commission_percentage: vendedor.commission_percentage,
          commission_amount: montoComision,
          ventas_count: ventasVendedor.length
        };
      });
      
      // Actualizar estado de debugger
      setDebugData({
        ventas,
        vendedores,
        comisiones: comisiones.filter(c => c.total_sales > 0),  // Solo comisiones con ventas
        fechaActual: formattedToday,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error("Error en depuración de comisiones:", error);
      setDebugData(prev => ({ 
        ...prev, 
        loading: false, 
        error: (error as Error).message || 'Error desconocido'
      }));
    }
  };
  
  useEffect(() => {
    fetchDebugData();
  }, []);
  
  return (
    <Card title="Depuración de Comisiones" 
      actions={
        <button 
          onClick={fetchDebugData}
          className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"
        >
          Actualizar
        </button>
      }
    >
      <div className="space-y-4">
        <div className="px-4 py-2 bg-purple-50 rounded border border-purple-100">
          <p className="text-sm text-purple-800 font-medium">
            Fecha actual: {debugData.fechaActual || 'Cargando...'}
          </p>
        </div>
        
        {debugData.loading ? (
          <div className="py-8 text-center text-gray-500">
            <p>Cargando datos de depuración...</p>
          </div>
        ) : debugData.error ? (
          <div className="p-4 text-red-600 border rounded border-red-200 bg-red-50">
            <p className="font-medium">Error:</p>
            <p>{debugData.error}</p>
          </div>
        ) : (
          <>
            {/* Resumen de datos */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="p-3 bg-blue-50 rounded border border-blue-100">
                <p className="text-sm font-medium text-blue-800">{debugData.vendedores.length} Vendedores</p>
              </div>
              <div className="p-3 bg-green-50 rounded border border-green-100">
                <p className="text-sm font-medium text-green-800">{debugData.ventas.length} Ventas hoy</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded border border-yellow-100">
                <p className="text-sm font-medium text-yellow-800">
                  {debugData.comisiones.length} Comisiones
                </p>
              </div>
            </div>
            
            {/* Información de vendedores */}
            <div>
              <h3 className="text-sm uppercase tracking-wider text-gray-500 font-medium mb-2">
                Vendedores ({debugData.vendedores.length})
              </h3>
              <div className="overflow-x-auto rounded border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Comisión %</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {debugData.vendedores.map((vendedor: any) => (
                      <tr key={vendedor.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap text-xs font-mono text-gray-500">
                          {vendedor.id.substring(0, 8)}...
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                          {vendedor.name}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 text-right">
                          {vendedor.commission_percentage}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Ventas del día */}
            <div>
              <h3 className="text-sm uppercase tracking-wider text-gray-500 font-medium mb-2">
                Ventas del día ({debugData.ventas.length})
              </h3>
              <div className="overflow-x-auto rounded border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Venta</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendedor</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {debugData.ventas.map((venta: any) => (
                      <tr key={venta.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap text-xs font-mono text-gray-500">
                          {venta.id.substring(0, 8)}...
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                          {venta.sellers?.name || 'Sin vendedor'}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 text-right">
                          {formatCurrency(venta.total)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                          {new Date(venta.created_at).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Comisiones calculadas */}
            <div>
              <h3 className="text-sm uppercase tracking-wider text-gray-500 font-medium mb-2">
                Comisiones Calculadas ({debugData.comisiones.length})
              </h3>
              {debugData.comisiones.length > 0 ? (
                <div className="overflow-x-auto rounded border">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendedor</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ventas</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">%</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Comisión</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {debugData.comisiones.map((comision: any) => (
                        <tr key={comision.seller_id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                            {comision.seller_name}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 text-right">
                            {formatCurrency(comision.total_sales)}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 text-center">
                            {comision.commission_percentage}%
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-green-600 text-right">
                            {formatCurrency(comision.commission_amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-4 px-6 text-center bg-gray-50 rounded border border-gray-200">
                  <p className="text-gray-500">No se encontraron comisiones para el día de hoy</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Card>
  );
};

export default DebugCommissions;
