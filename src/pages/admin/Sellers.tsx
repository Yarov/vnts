import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';
import { supabase } from '../../lib/supabase';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
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
        active: true
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
  const handleSaveSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
            active: currentSeller.active
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
            active: currentSeller.active
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
  const deleteSeller = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este vendedor?')) return;
    
    try {
      const { error } = await supabase
        .from('sellers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Actualizar la lista localmente
      setSellers(sellers.filter(seller => seller.id !== id));
    } catch (error) {
      console.error('Error al eliminar vendedor:', error);
      alert('Error al eliminar vendedor. Puede que tenga ventas asociadas.');
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
        <span className="bg-gray-100 rounded-full px-3 py-1 text-sm font-mono">
          {seller.numeric_code}
        </span>
      )
    },
    { 
      header: 'Estado', 
      accessor: (seller: Seller) => (
        <span className={`flex items-center ${seller.active ? 'text-green-600' : 'text-red-600'}`}>
          {seller.active ? (
            <><CheckCircleIcon className="h-5 w-5 mr-1" /> Activo</>
          ) : (
            <><XCircleIcon className="h-5 w-5 mr-1" /> Inactivo</>
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
            variant="danger"
            size="sm"
            onClick={() => deleteSeller(seller.id)}
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
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Gestión de Vendedores
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
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
      {isModalOpen && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Backdrop */}
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            {/* Modal */}
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  {currentSeller?.id ? 'Editar Vendedor' : 'Crear Nuevo Vendedor'}
                </h3>
                
                <form onSubmit={handleSaveSeller}>
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
                  
                  <div className="flex items-center mb-4">
                    <input
                      id="active"
                      name="active"
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      checked={currentSeller?.active || false}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                      Vendedor activo
                    </label>
                  </div>
                  
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={isSubmitting}
                      className="sm:col-start-2"
                    >
                      {currentSeller?.id ? 'Guardar cambios' : 'Crear vendedor'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={closeModal}
                      className="mt-3 sm:mt-0 sm:col-start-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
