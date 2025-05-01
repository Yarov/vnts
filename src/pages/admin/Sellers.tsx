import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  IdentificationIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { supabase } from '../../lib/supabase';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import CheckboxField from '../../components/ui/CheckboxField';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Database } from '../../types/database.types';

type Seller = Database['public']['Tables']['sellers']['Row'];

export default function Sellers() {
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

  // Cargar vendedores al montar el componente
  useEffect(() => {
    fetchSellers();
  }, []);

  // Función para obtener vendedores de Supabase
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

  // Filtrar vendedores según término de búsqueda
  const filteredSellers = sellers.filter(seller => 
    seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.numeric_code.includes(searchTerm)
  );

  // Abrir modal para crear/editar vendedor
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

  // Cerrar modal
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentSeller(null);
  };

  // Manejar cambios en el formulario
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

  // Validar formulario
  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!currentSeller?.name) {
      errors.name = 'El nombre es obligatorio';
    }
    
    if (!currentSeller?.numeric_code) {
      errors.numeric_code = 'El código numérico es obligatorio';
    } else if (!/^\d+$/.test(currentSeller.numeric_code)) {
      errors.numeric_code = 'El código debe contener solo números';
    } else {
      // Verificar si el código ya existe (solo para nuevos vendedores)
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

  // Guardar vendedor
  const handleSaveSeller = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!validateForm() || !currentSeller) return;
    
    setIsSubmitting(true);
    
    try {
      if (currentSeller.id) {
        // Actualizar vendedor existente
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
        // Crear nuevo vendedor
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
      
      // Actualizar lista de vendedores
      await fetchSellers();
      closeModal();
    } catch (error) {
      console.error('Error al guardar vendedor:', error);
      alert('Error al guardar vendedor. Por favor, intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cambiar estado de un vendedor (activar/desactivar)
  const toggleSellerStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('sellers')
        .update({ active: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      // Actualizar la lista localmente
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

  // Eliminar un vendedor
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
      
      // Actualizar la lista localmente
      setSellers(sellers.filter(seller => seller.id !== sellerToDelete));
      setIsDeleteConfirmOpen(false);
    } catch (error) {
      console.error('Error al eliminar vendedor:', error);
      alert('Error al eliminar vendedor. Puede que tenga ventas asociadas.');
    } finally {
      setIsDeletingSeller(false);
    }
  };

  // Columnas para la tabla de vendedores
  const columns = [
    { 
      header: 'Nombre', 
      accessor: 'name' 
    },
    { 
      header: 'Código', 
      accessor: (seller: Seller) => (
        <span className="badge badge-outline font-mono">
          {seller.numeric_code}
        </span>
      )
    },
    { 
      header: 'Comisión', 
      accessor: (seller: Seller) => (
        <span className="badge badge-outline gap-1">
          <CurrencyDollarIcon className="h-4 w-4" /> {seller.commission_percentage}%
        </span>
      )
    },
    { 
      header: 'Estado', 
      accessor: (seller: Seller) => (
        <span className={`badge ${seller.active ? 'badge-success' : 'badge-error'} gap-1`}>
          {seller.active ? (
            <><CheckCircleIcon className="h-4 w-4" /> Activo</>
          ) : (
            <><XCircleIcon className="h-4 w-4" /> Inactivo</>
          )}
        </span>
      )
    },
    { 
      header: 'Acciones', 
      accessor: (seller: Seller) => (
        <div className="flex space-x-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleSellerStatus(seller.id, seller.active)}
            icon={seller.active ? <XCircleIcon className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />}
          >
            {seller.active ? 'Desactivar' : 'Activar'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openSellerModal(seller)}
            icon={<PencilIcon className="h-4 w-4" />}
          >
            Editar
          </Button>
          <Button
            variant="error"
            size="sm"
            onClick={() => confirmDeleteSeller(seller.id)}
            icon={<TrashIcon className="h-4 w-4" />}
          >
            Eliminar
          </Button>
        </div>
      ),
      className: 'text-right'
    },
  ];

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">Gestión de Vendedores</h2>
        </div>
        <div className="mt-4 md:mt-0">
          <Button
            variant="primary"
            onClick={() => openSellerModal()}
            icon={<PlusIcon className="h-5 w-5 mr-1" />}
          >
            Nuevo Vendedor
          </Button>
        </div>
      </div>

      <Card>
        <div className="mb-4">
          <FormField
            label="Buscar vendedores"
            placeholder="Buscar por nombre o código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />}
          />
        </div>

        <Table
          columns={columns}
          data={filteredSellers}
          keyExtractor={(item) => item.id}
          isLoading={loading}
          emptyMessage="No se encontraron vendedores"
        />
      </Card>

      {/* Modal de creación/edición de vendedor */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={currentSeller?.id ? 'Editar Vendedor' : 'Crear Nuevo Vendedor'}
        size="lg"
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              onClick={closeModal}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleSaveSeller}
              isLoading={isSubmitting}
            >
              {currentSeller?.id ? 'Guardar cambios' : 'Crear vendedor'}
            </Button>
          </>
        }
      >
        <form onSubmit={(e) => { e.preventDefault(); handleSaveSeller(e); }}>
          <FormField
            label="Nombre del vendedor"
            name="name"
            value={currentSeller?.name || ''}
            onChange={handleInputChange}
            error={formErrors.name}
            required
          />
          
          <FormField
            label="Código numérico"
            name="numeric_code"
            value={currentSeller?.numeric_code || ''}
            onChange={handleInputChange}
            error={formErrors.numeric_code}
            required
            maxLength={6}
            leftIcon={<IdentificationIcon className="h-5 w-5 text-gray-400" />}
            helper="Código de 4-6 dígitos para acceso del vendedor"
          />
          
          <FormField
            label="Porcentaje de comisión"
            name="commission_percentage"
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={currentSeller?.commission_percentage?.toString() || '0'}
            onChange={handleInputChange}
            leftIcon={<CurrencyDollarIcon className="h-5 w-5 text-gray-400" />}
            helper="Porcentaje de comisión por ventas (0-100%)"
          />
          
          <CheckboxField
            label="Vendedor activo"
            name="active"
            checked={currentSeller?.active || false}
            onChange={handleInputChange}
          />
        </form>
      </Modal>
      
      {/* Diálogo de confirmación para eliminar vendedor */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteSeller}
        title="Eliminar Vendedor"
        message="¿Estás seguro de que deseas eliminar este vendedor? Esta acción no se puede deshacer y podría afectar a las ventas asociadas."
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        isLoading={isDeletingSeller}
      />
    </div>
  );
}
