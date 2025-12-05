import { useState, useEffect, useMemo } from 'react';
import { useAtom } from 'jotai';
import { userAtom } from '../store/auth';
import { getAllBranches, createBranch, updateBranch, deleteBranch } from '../services/branchService';
import { Database } from '../types/database.types';

type Branch = Database['public']['Tables']['branches']['Row'];

export function useAdminBranches() {
  const [user] = useAtom(userAtom);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBranch, setCurrentBranch] = useState<Partial<Branch> | null>(null);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<string | null>(null);
  const [isDeletingBranch, setIsDeletingBranch] = useState(false);

  useEffect(() => {
    if (user?.organizationId) {
      fetchBranches();
    }
  }, [user?.organizationId]);

  const fetchBranches = async () => {
    if (!user?.organizationId) return;
    setLoading(true);
    try {
      const data = await getAllBranches(user.organizationId);
      // Mostrar todas las sucursales excepto PRINCIPAL
      // PRINCIPAL solo se usa internamente como fallback
      const visibleBranches = (data || []).filter(b => b.code !== 'PRINCIPAL');
      setBranches(visibleBranches);
    } catch (error) {
      console.error('Error al cargar sucursales:', error);
      alert('Error al cargar sucursales. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const filteredBranches = useMemo(() => {
    if (!Array.isArray(branches)) return [];
    return branches.filter(branch =>
      branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (branch.address && branch.address.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [branches, searchTerm]);

  const openBranchModal = (branch?: Branch) => {
    setFormErrors({});
    if (branch) {
      setCurrentBranch({...branch});
    } else {
      setCurrentBranch({
        name: '',
        code: '',
        address: '',
        phone: '',
        active: true
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentBranch(null);
    setFormErrors({});
  };

  const handleInputChange = (field: string, value: any) => {
    setCurrentBranch(prev => prev ? { ...prev, [field]: value } : null);
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (!currentBranch?.name?.trim()) {
      errors.name = 'El nombre es requerido';
    }
    
    if (!currentBranch?.code?.trim()) {
      errors.code = 'El código es requerido';
    } else if (Array.isArray(branches)) {
      // Verificar código único
      const existingCode = branches.find(
        b => b.code === currentBranch.code && b.id !== currentBranch.id
      );
      if (existingCode) {
        errors.code = 'Este código ya está en uso';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveBranch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm() || !currentBranch) return;
    setIsSubmitting(true);
    try {
      if (currentBranch.id) {
        await updateBranch(currentBranch.id, {
          name: currentBranch.name || '',
          code: currentBranch.code || '',
          address: currentBranch.address || '',
          phone: currentBranch.phone || '',
          active: currentBranch.active ?? true
        });
      } else {
        if (!user?.organizationId) {
          throw new Error('No se pudo obtener el organization_id del usuario');
        }
        
        await createBranch({
          name: currentBranch.name || '',
          code: currentBranch.code || '',
          address: currentBranch.address || '',
          phone: currentBranch.phone || '',
          active: currentBranch.active ?? true,
          organization: user.organizationId
        });
      }
      await fetchBranches();
      closeModal();
    } catch (error) {
      console.error('Error al guardar sucursal:', error);
      alert('Error al guardar sucursal. Por favor, intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleBranchStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateBranch(id, { active: !currentStatus });
      setBranches(branches.map(branch => {
        if (branch.id === id) {
          return { ...branch, active: !currentStatus };
        }
        return branch;
      }));
    } catch (error) {
      console.error('Error al cambiar estado de sucursal:', error);
      alert('Error al cambiar estado de sucursal. Por favor, intenta de nuevo.');
    }
  };

  const confirmDeleteBranch = (id: string) => {
    setBranchToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteBranch = async () => {
    if (!branchToDelete) return;
    setIsDeletingBranch(true);
    try {
      const result = await deleteBranch(branchToDelete);
      if (result) {
        setBranches(branches.filter(branch => branch.id !== branchToDelete));
        setIsDeleteConfirmOpen(false);
        setBranchToDelete(null);
      }
    } catch (error: any) {
      console.error('Error al eliminar sucursal:', error);
      const errorMessage = error?.response?.data?.error || 'Error al eliminar sucursal. Puede que tenga ventas asociadas.';
      alert(errorMessage);
    } finally {
      setIsDeletingBranch(false);
    }
  };

  return {
    branches,
    filteredBranches,
    loading,
    searchTerm,
    setSearchTerm,
    isModalOpen,
    openBranchModal,
    closeModal,
    currentBranch,
    setCurrentBranch,
    formErrors,
    setFormErrors,
    isSubmitting,
    handleInputChange,
    handleSaveBranch,
    toggleBranchStatus,
    isDeleteConfirmOpen,
    confirmDeleteBranch,
    handleDeleteBranch,
    isDeletingBranch
  };
}
