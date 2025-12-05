import { atom } from 'jotai';
import { Database } from '../types/database.types';

export type Sale = Database['public']['Tables']['sales']['Row'];
export type SaleWithItems = Sale & {
  items: {
    id: string;
    product_id: string;
    product_name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }[];
  seller_name?: string;
  client_name?: string;
  payment_method_name?: string;
};

export interface NewSaleItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface NewSale {
  seller_id: string;
  client_id: string | null;
  payment_method_id: string;
  total: number;
  notes: string | null;
  items: NewSaleItem[];
  client_name?: string;
}

// Estado para la lista de ventas
export const salesAtom = atom<SaleWithItems[]>([]);
export const loadingSalesAtom = atom<boolean>(false);

// Estado para una nueva venta
export const newSaleAtom = atom<NewSale>({
  seller_id: '',
  client_id: null,
  payment_method_id: '',
  total: 0,
  notes: null,
  items: [],
  client_name: '',
});

// Átomo para los ítems de la venta actual
export const saleItemsAtom = atom<NewSaleItem[]>([]);

// Átomos para filtrado de ventas
export const salesDateFilterAtom = atom<{ start: string | null; end: string | null }>({
  start: null,
  end: null,
});

export const salesSellerFilterAtom = atom<string>('');

// Átomo derivado para ventas filtradas
export const filteredSalesAtom = atom((get) => {
  const sales = get(salesAtom);
  const dateFilter = get(salesDateFilterAtom);
  const sellerFilter = get(salesSellerFilterAtom);
  
  return sales.filter(sale => {
    // Filtro por fechas
    const saleDate = new Date(sale.created_at);
    const matchesDateStart = !dateFilter.start || new Date(dateFilter.start) <= saleDate;
    const matchesDateEnd = !dateFilter.end || new Date(dateFilter.end) >= saleDate;
    
    // Filtro por vendedor
    const matchesSeller = !sellerFilter || sale.seller_id === sellerFilter;
    
    return matchesDateStart && matchesDateEnd && matchesSeller;
  });
});
