export type Sale = {
  id: string;
  created_at: string;
  total: number;
  seller: {
    id: string;
    name: string;
  };
  client?: {
    id: string;
    name: string;
  };
  payment_method?: {
    id: string;
    name: string;
  };
  items: Array<{
    id: string;
    product: {
      id: string;
      name: string;
    };
    quantity: number;
    price: number;
    subtotal: number;
  }>;
};