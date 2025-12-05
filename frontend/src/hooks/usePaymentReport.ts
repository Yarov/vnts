import { useState } from 'react';

export function usePaymentReport() {
  const [isLoading] = useState(false);
  const [payments] = useState([]);

  return {
    isLoading,
    payments
  };
}
