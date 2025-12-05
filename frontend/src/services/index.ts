// Exportar todos los servicios desde un único punto de entrada
export * from './authService';
export * from './clientService';
export * from './productService';
export * from './sellerService';
export * from './dashboardService';
export {
  getSalesWithDetails,
  getSaleById,
  processSale,
  getSalesSummary,
  getSalesBySeller,
  getDailySalesData
} from './salesService';
