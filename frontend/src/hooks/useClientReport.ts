import { useState } from 'react';

export function useClientReport() {
  const [isLoading] = useState(false);
  const [clients] = useState([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  return {
    isLoading,
    clients,
    selectedClient,
    setSelectedClient,
    isDetailModalOpen,
    setIsDetailModalOpen,
    viewClientDetails: () => {},
    closeDetailModal: () => setIsDetailModalOpen(false)
  };
}
