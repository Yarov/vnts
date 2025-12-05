import * as XLSX from 'xlsx';
import { Sale } from '../types/sales';
import { formatCurrency, formatDate } from './formatters';

interface ExportableItem {
  Fecha: string;
  Vendedor: string;
  Cliente: string;
  'Método de Pago': string;
  Total: string;
  Productos: string;
}

interface ClientWithStats {
  id: string;
  name: string;
  reference: string | null;
  created_at: string;
  total_purchases: number;
  total_spent: number;
  average_ticket: number;
  last_purchase: string | null;
}

export function exportSalesToExcel(sales: any[], fileName: string) {
  const data = sales.map(sale => ({
    'Fecha': formatDate(new Date(sale.created_at), 'dd/MM/yyyy HH:mm'),
    'Vendedor': sale.seller.name,
    'Cliente': sale.client?.name || '-',
    'Método de Pago': sale.payment_method.name,
    'Total': formatCurrency(sale.total),
    'Productos': sale.items.map((item: any) =>
      `${item.product_name} (${item.quantity})`
    ).join(', ')
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Ventas');
  XLSX.writeFile(wb, fileName);
}

export function exportClientsToExcel(clients: any[], fileName: string) {
  const data = clients.map(client => ({
    'Cliente': client.name,
    'Referencia': client.reference || '-',
    'Total Compras': client.total_purchases,
    'Total Gastado': formatCurrency(client.total_spent),
    'Ticket Promedio': formatCurrency(client.average_ticket),
    'Última Compra': client.last_purchase ? formatDate(new Date(client.last_purchase), 'dd/MM/yyyy') : '-',
    'Primera Compra': client.first_purchase ? formatDate(new Date(client.first_purchase), 'dd/MM/yyyy') : '-',
    'Productos Favoritos': client.favorite_products.map((p: any) =>
      `${p.product_name} (${p.quantity})`
    ).join(', '),
    'Métodos de Pago': Object.entries(client.payment_methods)
      .map(([method, count]) => `${method}: ${count}`)
      .join(', ')
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Clientes');
  XLSX.writeFile(wb, fileName);
}

export function exportProductsToExcel(products: any[], fileName: string) {
  const data = products.map(product => ({
    'Producto': product.name,
    'Total Ventas': product.total_sales,
    'Cantidad Vendida': product.total_quantity,
    'Ingresos Totales': formatCurrency(product.total_revenue),
    'Precio Promedio': formatCurrency(product.average_price),
    'Última Venta': product.last_sale ? formatDate(new Date(product.last_sale), 'dd/MM/yyyy') : '-',
    'Categoría': product.category || '-'
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Productos');
  XLSX.writeFile(wb, fileName);
}

export function exportSalesDetailsToExcel(sales: Sale[], fileName: string = 'ventas_detalladas.xlsx') {
  // Crear una hoja para el resumen de ventas
  const summaryData: ExportableItem[] = sales.map(sale => ({
    Fecha: formatDate(new Date(sale.created_at), 'dd/MM/yyyy HH:mm'),
    Vendedor: sale.seller.name,
    Cliente: sale.client?.name || '-',
    'Método de Pago': sale.payment_method?.name || 'Efectivo',
    Total: formatCurrency(sale.total),
    Productos: sale.items.map(item =>
      `${item.product.name} (${item.quantity} x ${formatCurrency(item.price)})`
    ).join(', ')
  }));

  // Crear una hoja para los detalles de productos
  const detailsData = sales.flatMap(sale =>
    sale.items.map(item => ({
      Fecha: formatDate(new Date(sale.created_at), 'dd/MM/yyyy HH:mm'),
      Vendedor: sale.seller.name,
      Cliente: sale.client?.name || '-',
      Producto: item.product.name,
      Cantidad: item.quantity,
      'Precio Unitario': formatCurrency(item.price),
      Subtotal: formatCurrency(item.subtotal)
    }))
  );

  // Crear el libro de trabajo
  const wb = XLSX.utils.book_new();

  // Añadir la hoja de resumen
  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  wsSummary['!cols'] = [
    { wch: 20 }, // Fecha
    { wch: 20 }, // Vendedor
    { wch: 20 }, // Cliente
    { wch: 15 }, // Método de Pago
    { wch: 15 }, // Total
    { wch: 50 }, // Productos
  ];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen');

  // Añadir la hoja de detalles
  const wsDetails = XLSX.utils.json_to_sheet(detailsData);
  wsDetails['!cols'] = [
    { wch: 20 }, // Fecha
    { wch: 20 }, // Vendedor
    { wch: 20 }, // Cliente
    { wch: 30 }, // Producto
    { wch: 10 }, // Cantidad
    { wch: 15 }, // Precio Unitario
    { wch: 15 }, // Subtotal
  ];
  XLSX.utils.book_append_sheet(wb, wsDetails, 'Detalles');

  // Guardar el archivo
  XLSX.writeFile(wb, fileName);
}

export function exportClientStatsToExcel(clients: ClientWithStats[], fileName: string = 'clientes.xlsx') {
  // Transformar los datos para la exportación
  const data = clients.map(client => ({
    'Nombre': client.name,
    'Referencia': client.reference || '-',
    'Total Compras': client.total_purchases,
    'Total Gastado': formatCurrency(client.total_spent),
    'Ticket Promedio': formatCurrency(client.average_ticket),
    'Última Compra': client.last_purchase
      ? formatDate(new Date(client.last_purchase), 'dd/MM/yyyy HH:mm')
      : 'Nunca',
    'Fecha de Registro': formatDate(new Date(client.created_at), 'dd/MM/yyyy HH:mm')
  }));

  // Crear el libro de trabajo
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  // Ajustar el ancho de las columnas
  const columnWidths = [
    { wch: 30 }, // Nombre
    { wch: 20 }, // Referencia
    { wch: 15 }, // Total Compras
    { wch: 15 }, // Total Gastado
    { wch: 15 }, // Ticket Promedio
    { wch: 20 }, // Última Compra
    { wch: 20 }, // Fecha de Registro
  ];
  ws['!cols'] = columnWidths;

  // Añadir la hoja al libro
  XLSX.utils.book_append_sheet(wb, ws, 'Clientes');

  // Guardar el archivo
  XLSX.writeFile(wb, fileName);
}

export function exportPaymentsToExcel(payments: any[], fileName: string = 'pagos.xlsx') {
  // Transformar los datos para la exportación
  const data = payments.map(payment => ({
    'Fecha': payment.created_at
      ? formatDate(new Date(payment.created_at), 'dd/MM/yyyy HH:mm')
      : 'Sin fecha',
    'Método': payment.method.name,
    'Referencia': payment.reference || '-',
    'Estado': payment.status === 'completed' ? 'Completado' :
              payment.status === 'pending' ? 'Pendiente' : 'Fallido',
    'Monto': formatCurrency(payment.amount),
    'Cliente': payment.client_name,
    'Vendedor': payment.seller_name,
    'Venta #': payment.sale_id,
    'Notas': payment.notes || '-'
  }));

  // Crear el libro de trabajo
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  // Ajustar el ancho de las columnas
  const columnWidths = [
    { wch: 20 }, // Fecha
    { wch: 15 }, // Método
    { wch: 15 }, // Referencia
    { wch: 12 }, // Estado
    { wch: 15 }, // Monto
    { wch: 30 }, // Cliente
    { wch: 30 }, // Vendedor
    { wch: 10 }, // Venta #
    { wch: 30 }, // Notas
  ];
  ws['!cols'] = columnWidths;

  // Añadir la hoja al libro
  XLSX.utils.book_append_sheet(wb, ws, 'Pagos');

  // Guardar el archivo
  XLSX.writeFile(wb, fileName);
}