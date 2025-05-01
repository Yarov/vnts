import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database.types';

type Client = Database['public']['Tables']['clients']['Row'];

type ClientStats = {
  id: string;
  purchase_count: number;
  last_purchase: string | null;
};

export function useAdminClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientStats, setClientStats] = useState<ClientStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState<Partial<Client> | null>(null);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchClients();
    fetchClientStats();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');
      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      alert('Error al cargar clientes. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const fetchClientStats = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_top_clients', { limit_count: 100 });
      if (error) throw error;
      setClientStats(data || []);
    } catch (error) {
      console.error('Error al cargar estadísticas de clientes:', error);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.reference && client.reference.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
        const { error } = await supabase
          .from('clients')
          .update({
            name: currentClient.name,
            reference: currentClient.reference || null
          })
          .eq('id', currentClient.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('clients')
          .insert([{
            name: currentClient.name,
            reference: currentClient.reference || null
          }]);
        if (error) throw error;
      }
      await fetchClients();
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
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);
      if (error) throw error;
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
