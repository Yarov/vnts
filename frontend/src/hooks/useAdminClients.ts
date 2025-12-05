import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { userAtom } from '../store/auth';
import { getAllClients, createClient, updateClient, deleteClient } from '../services/clientService';
import { Database } from '../types/database.types';
import api from '../services/api';

type Client = Database['public']['Tables']['clients']['Row'];

type ClientStats = {
  id: string;
  purchase_count: number;
  last_purchase: string | null;
};

type SortOption = 'name' | 'purchases' | 'lastPurchase';

export function useAdminClients() {
  const [user] = useAtom(userAtom);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientStats, setClientStats] = useState<ClientStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState<Partial<Client> | null>(null);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('purchases');

  useEffect(() => {
    if (user?.organizationId) {
      fetchClients();
      fetchClientStats();
    }
  }, [user?.organizationId]);

  const fetchClients = async () => {
    if (!user?.organizationId) return;
    setLoading(true);
    try {
      const data = await getAllClients(user.organizationId);
      setClients(data || []);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      alert('Error al cargar clientes. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const fetchClientStats = async () => {
    if (!user?.organizationId) return;
    try {
      const response = await api.get('/sales/client_stats/', {
        params: { organization_id: user.organizationId }
      });
      setClientStats(response.data || []);
    } catch (error) {
      console.error('Error al cargar estadísticas de clientes:', error);
    }
  };

  const filteredClients = clients
    .filter(client =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.reference && client.reference.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      const statsA = clientStats.find(cs => cs.id === a.id);
      const statsB = clientStats.find(cs => cs.id === b.id);
      
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'purchases':
          const purchasesA = statsA?.purchase_count || 0;
          const purchasesB = statsB?.purchase_count || 0;
          return purchasesB - purchasesA;
        case 'lastPurchase':
          const dateA = statsA?.last_purchase ? new Date(statsA.last_purchase).getTime() : 0;
          const dateB = statsB?.last_purchase ? new Date(statsB.last_purchase).getTime() : 0;
          return dateB - dateA;
        default:
          return 0;
      }
    });

  const openClientModal = (client?: Client) => {
    setFormErrors({});
    if (client) {
      setCurrentClient({...client});
    } else {
      setCurrentClient({
        name: '',
        reference: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentClient(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (currentClient) {
      setCurrentClient({
        ...currentClient,
        [name]: value
      });
    }
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    if (!currentClient?.name) {
      errors.name = 'El nombre es obligatorio';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveClient = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm() || !currentClient) return;
    setIsSubmitting(true);
    try {
      if (currentClient.id) {
        await updateClient(currentClient.id, {
          name: currentClient.name || '',
          reference: currentClient.reference || ''
        });
      } else {
        if (!user?.organizationId) {
          throw new Error('No se pudo obtener el organization_id del usuario.');
        }
        
        await createClient({
          name: currentClient.name || '',
          reference: currentClient.reference || '',
          organization: user.organizationId
        });
      }
      await fetchClients();
      await fetchClientStats();
      closeModal();
    } catch (error) {
      console.error('Error al guardar cliente:', error);
      alert('Error al guardar cliente. Por favor, intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) return;
    try {
      await deleteClient(id);
      setClients(clients.filter(client => client.id !== id));
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      alert('Error al eliminar cliente. Puede que tenga ventas asociadas.');
    }
  };

  const getClientStats = (clientId: string) => {
    const stats = clientStats.find(cs => cs.id === clientId);
    return stats || { purchase_count: 0, last_purchase: null };
  };

  return {
    clients,
    filteredClients,
    loading,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    isModalOpen,
    openClientModal,
    closeModal,
    currentClient,
    setCurrentClient,
    formErrors,
    setFormErrors,
    isSubmitting,
    handleInputChange,
    handleSaveClient,
    handleDeleteClient,
    getClientStats
  };
}
