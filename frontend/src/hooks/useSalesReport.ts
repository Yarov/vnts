import { useState } from 'react';

export function useSalesReport() {
  const [isLoading] = useState(false);
  const [sales] = useState([]);

  return {
    isLoading,
    sales
  };
}
