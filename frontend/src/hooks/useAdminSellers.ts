import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { userAtom } from '../store/auth';
import { getAllSellers, createSeller, updateSeller, deleteSeller } from '../services/sellerService';
import { getAllBranches } from '../services/branchService';
import { Database } from '../types/database.types';

type Seller = Database['public']['Tables']['sellers']['Row'];
type Branch = Database['public']['Tables']['branches']['Row'];

export function useAdminSellers() {
  const [user] = useAtom(userAtom);
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
  
  // Estado para sucursales
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);

  useEffect(() => {
    if (user?.organizationId) {
      fetchSellers();
      fetchBranches();
    }
  }, [user?.organizationId]);

  const fetchBranches = async () => {
    if (!user?.organizationId) return;
    try {
      const data = await getAllBranches(user.organizationId);
      // Filtrar sucursales activas y excluir la default (PRINCIPAL)
      setBranches(data.filter(b => b.active && b.code !== 'PRINCIPAL') || []);
    } catch (error) {
      console.error('Error al cargar sucursales:', error);
    }
  };

  const fetchSellers = async () => {
    if (!user?.organizationId) return;
    setLoading(true);
    try {
      const data = await getAllSellers(user.organizationId);
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
      // Cargar sucursales asignadas si existen
      if (seller.assigned_branches && seller.assigned_branches.length > 0) {
        setSelectedBranches(seller.assigned_branches.map(b => b.id));
      } else {
        setSelectedBranches([]);
      }
    } else {
      setCurrentSeller({
        name: '',
        numeric_code: '',
        active: true,
        commission_percentage: 0
      });
      setSelectedBranches([]);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentSeller(null);
    setSelectedBranches([]);
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
        // Preparar datos de actualización
        const updateData: any = {
          name: currentSeller.name || '',
          numeric_code: currentSeller.numeric_code || '',
          active: currentSeller.active ?? true,
          commission_percentage: currentSeller.commission_percentage || 0
        };
        
        // Agregar sucursales si hay múltiples
        if (branches.length > 1) {
          updateData.branches = selectedBranches.length > 0 ? selectedBranches : branches.map(b => b.id);
        }
        
        await updateSeller(currentSeller.id, updateData);
      } else {
        if (!user?.organizationId) {
          throw new Error('No se pudo obtener el organization_id del usuario');
        }
        
        // Lógica de asignación de sucursales:
        // - Si no hay sucursales (solo PRINCIPAL): dejar que backend maneje
        // - Si hay 1 sucursal: asignar automáticamente
        // - Si hay múltiples y no se selecciona ninguna: asignar a todas
        // - Si se seleccionan específicas: asignar solo a esas
        let branchesToAssign: string[] | undefined = undefined;
        
        if (branches.length === 0) {
          // Solo existe PRINCIPAL, dejar que backend maneje
          branchesToAssign = undefined;
        } else if (branches.length === 1) {
          branchesToAssign = [branches[0].id];
        } else if (branches.length > 1) {
          branchesToAssign = selectedBranches.length > 0 ? selectedBranches : branches.map(b => b.id);
        }
        
        const sellerData: any = {
          name: currentSeller.name || '',
          numeric_code: currentSeller.numeric_code || '',
          active: currentSeller.active ?? true,
          commission_percentage: currentSeller.commission_percentage || 0,
          organization: user.organizationId
        };
        
        if (branchesToAssign !== undefined) {
          sellerData.branches = branchesToAssign;
        }
        
        await createSeller(sellerData);
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
      await updateSeller(id, { active: !currentStatus });
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

  const closeDeleteConfirm = () => {
    setIsDeleteConfirmOpen(false);
    setSellerToDelete(null);
  };

  const handleDeleteSeller = async () => {
    if (!sellerToDelete) return;
    setIsDeletingSeller(true);
    try {
      const result = await deleteSeller(sellerToDelete);
      if (result) {
        setSellers(sellers.filter(seller => seller.id !== sellerToDelete));
        setIsDeleteConfirmOpen(false);
        setSellerToDelete(null);
      }
    } catch (error: any) {
      console.error('Error al eliminar vendedor:', error);
      const errorMessage = error?.response?.data?.error || 'Error al eliminar vendedor. Puede que tenga ventas asociadas.';
      alert(errorMessage);
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
    branches,
    selectedBranches,
    setSelectedBranches,
    isSubmitting,
    handleInputChange,
    handleSaveSeller,
    toggleSellerStatus,
    isDeleteConfirmOpen,
    confirmDeleteSeller,
    closeDeleteConfirm,
    handleDeleteSeller,
    isDeletingSeller
  };
}