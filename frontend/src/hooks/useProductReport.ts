import { useState } from 'react';

export function useProductReport() {
  const [isLoading] = useState(false);
  const [products] = useState([]);

  return {
    isLoading,
    products
  };
}
