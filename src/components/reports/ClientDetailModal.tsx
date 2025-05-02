import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/Dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/Table';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ClientStats } from '../../hooks/useClientReport';
import { supabase } from '../../lib/supabase';
import { Calendar, DollarSign, ShoppingCart } from 'lucide-react';

interface Sale {
  id: string;
  created_at: string;
  total: number;
  seller_name: string;
  seller_id: string;
  items: {
    product_name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }[];
}

interface ClientDetailModalProps {
  client: ClientStats | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ClientDetailModal({ client, isOpen, onClose }: ClientDetailModalProps) {
  const [sales, setSales] = React.useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = React.useState<Sale[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!sales.length) {
      setFilteredSales([]);
      return;
    }

    setFilteredSales([...sales]);
  }, [sales]);

  React.useEffect(() => {
    if (isOpen && client) {
      fetchClientSales(client.id);
    }
  }, [isOpen, client]);

  const fetchClientSales = async (clientId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: rawData, error: salesError } = await supabase
        .from('sales')
        .select(`
          id,
          created_at,
          total,
          seller:sellers(id, name),
          items:sale_items(
            product_name:products(name),
            quantity,
            price,
            subtotal
          )
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (salesError) throw salesError;

      // Transformar los datos para que coincidan con el tipo Sale
      const transformedSales: Sale[] = (rawData || []).map((rawSale: any) => ({
        id: rawSale.id,
        created_at: rawSale.created_at,
        total: rawSale.total,
        seller_name: rawSale.seller?.name || 'Desconocido',
        seller_id: rawSale.seller?.id || 'unknown',
        items: rawSale.items.map((item: any) => ({
          product_name: item.product_name.name,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal
        }))
      }));

      setSales(transformedSales);
      setFilteredSales(transformedSales);
    } catch (error) {
      console.error('Error al cargar ventas:', error);
      setError('Error al cargar el historial de compras');
    } finally {
      setIsLoading(false);
    }
  };

  // Calcular totales de ventas filtradas
  const filteredTotals = React.useMemo(() => {
    return {
      total_purchases: filteredSales.length,
      total_spent: filteredSales.reduce((sum, sale) => sum + sale.total, 0),
      average_ticket: filteredSales.length > 0
        ? filteredSales.reduce((sum, sale) => sum + sale.total, 0) / filteredSales.length
        : 0
    };
  }, [filteredSales]);

  if (!client) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            Historial de Compras
            <span className="text-blue-600">•</span>
            <span className="font-normal text-slate-600">{client.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumen del cliente */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm border border-blue-200">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-medium text-blue-900">Total Compras</h3>
              </div>
              <p className="mt-4 text-3xl font-bold text-blue-900">
                {filteredTotals.total_purchases}
              </p>
              {filteredTotals.total_purchases !== client.total_purchases && (
                <p className="mt-1 text-sm text-blue-600">
                  de {client.total_purchases} totales
                </p>
              )}
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm border border-green-200">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-green-600" />
                <h3 className="text-sm font-medium text-green-900">Total Gastado</h3>
              </div>
              <p className="mt-4 text-3xl font-bold text-green-900">
                {formatCurrency(filteredTotals.total_spent)}
              </p>
              {filteredTotals.total_spent !== client.total_spent && (
                <p className="mt-1 text-sm text-green-600">
                  de {formatCurrency(client.total_spent)} total
                </p>
              )}
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-sm border border-purple-200">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm font-medium text-purple-900">Ticket Promedio</h3>
              </div>
              <p className="mt-4 text-3xl font-bold text-purple-900">
                {formatCurrency(filteredTotals.average_ticket)}
              </p>
              {filteredTotals.average_ticket !== client.average_ticket && (
                <p className="mt-1 text-sm text-purple-600">
                  vs {formatCurrency(client.average_ticket)} general
                </p>
              )}
            </div>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg relative">
              {error}
            </div>
          )}

          {/* Lista de compras */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600"></div>
              <p className="mt-4 text-slate-600">Cargando historial de compras...</p>
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="text-center py-12 text-slate-600">
              <ShoppingCart className="w-12 h-12 mx-auto text-slate-400 mb-4" />
              <p>No se encontraron compras para los filtros seleccionados</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredSales.map((sale) => (
                <div key={sale.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-slate-50 to-white p-4 border-b border-slate-200">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-600">
                          {formatDate(new Date(sale.created_at), 'dd/MM/yyyy HH:mm')}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-500">
                          Vendedor: <span className="text-slate-700">{sale.seller_name}</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-600">Total:</span>
                          <span className="text-lg font-semibold text-slate-900">
                            {formatCurrency(sale.total)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
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
                        {sale.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.product_name}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right text-slate-600">{formatCurrency(item.price)}</TableCell>
                            <TableCell className="text-right font-semibold">{formatCurrency(item.subtotal)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}