import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database.types';

type Seller = Database['public']['Tables']['sellers']['Row'];

export function useAdminSellers() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSeller, setCurrentSeller] = useState<Partial<Seller> | null>(null);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [sellerToDelete, setSellerToDelete] = useState<string | null>(null);
  const [isDeletingSeller, setIsDeletingSeller] = useState(false);

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sellers')
        .select('*')
        .order('name');
      if (error) throw error;
      setSellers(data || []);
    } catch (error) {
      console.error('Error al cargar vendedores:', error);
      alert('Error al cargar vendedores. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const filteredSellers = sellers.filter(seller =>
    seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.numeric_code.includes(searchTerm)
  );

  const openSellerModal = (seller?: Seller) => {
    setFormErrors({});
    if (seller) {
      setCurrentSeller({...seller});
    } else {
      setCurrentSeller({
        name: '',
        numeric_code: '',
        active: true,
        commission_percentage: 0
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentSeller(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (currentSeller) {
      if (type === 'checkbox') {
        setCurrentSeller({
          ...currentSeller,
          [name]: checked
        });
      } else if (type === 'number') {
        setCurrentSeller({
          ...currentSeller,
          [name]: parseFloat(value)
        });
      } else {
        setCurrentSeller({
          ...currentSeller,
          [name]: value
        });
      }
    }
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    if (!currentSeller?.name) {
      errors.name = 'El nombre es obligatorio';
    }
    if (!currentSeller?.numeric_code) {
      errors.numeric_code = 'El código numérico es obligatorio';
    } else if (!/^[0-9]+$/.test(currentSeller.numeric_code)) {
      errors.numeric_code = 'El código debe contener solo números';
    } else {
      const existingCode = sellers.find(
        s => s.numeric_code === currentSeller.numeric_code && s.id !== currentSeller.id
      );
      if (existingCode) {
        errors.numeric_code = 'Este código ya está en uso';
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveSeller = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm() || !currentSeller) return;
    setIsSubmitting(true);
    try {
      if (currentSeller.id) {
        const { error } = await supabase
          .from('sellers')
          .update({
            name: currentSeller.name,
            numeric_code: currentSeller.numeric_code,
            active: currentSeller.active,
            commission_percentage: currentSeller.commission_percentage || 0
          })
          .eq('id', currentSeller.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('sellers')
          .insert([{
            name: currentSeller.name,
            numeric_code: currentSeller.numeric_code,
            active: currentSeller.active,
            commission_percentage: currentSeller.commission_percentage || 0
          }]);
        if (error) throw error;
      }
      await fetchSellers();
      closeModal();
    } catch (error) {
      console.error('Error al guardar vendedor:', error);
      alert('Error al guardar vendedor. Por favor, intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSellerStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('sellers')
        .update({ active: !currentStatus })
        .eq('id', id);
      if (error) throw error;
      setSellers(sellers.map(seller => {
        if (seller.id === id) {
          return { ...seller, active: !currentStatus };
        }
        return seller;
      }));
    } catch (error) {
      console.error('Error al cambiar estado del vendedor:', error);
      alert('Error al cambiar estado del vendedor. Por favor, intenta de nuevo.');
    }
  };

  const confirmDeleteSeller = (id: string) => {
    setSellerToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteSeller = async () => {
    if (!sellerToDelete) return;
    setIsDeletingSeller(true);
    try {
      const { error } = await supabase
        .from('sellers')
        .delete()
        .eq('id', sellerToDelete);
      if (error) throw error;
      setSellers(sellers.filter(seller => seller.id !== sellerToDelete));
      setIsDeleteConfirmOpen(false);
    } catch (error) {
      console.error('Error al eliminar vendedor:', error);
      alert('Error al eliminar vendedor. Puede que tenga ventas asociadas.');
    } finally {
      setIsDeletingSeller(false);
    }
  };

  return {
    sellers,
    filteredSellers,
    loading,
    searchTerm,
    setSearchTerm,
    isModalOpen,
    openSellerModal,
    closeModal,
    currentSeller,
    setCurrentSeller,
    formErrors,
    setFormErrors,
    isSubmitting,
    handleInputChange,
    handleSaveSeller,
    toggleSellerStatus,
    isDeleteConfirmOpen,
    confirmDeleteSeller,
    handleDeleteSeller,
    isDeletingSeller
  };
}