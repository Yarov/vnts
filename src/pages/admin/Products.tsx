import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { supabase } from '../../lib/supabase';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import { Database } from '../../types/database.types';

type Product = Database['public']['Tables']['products']['Row'];

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product> | null>(null);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar productos al montar el componente
  useEffect(() => {
    fetchProducts();
  }, []);

  // Función para obtener productos de Supabase
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      alert('Error al cargar productos. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar productos según término de búsqueda
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Abrir modal para crear/editar producto
  const openProductModal = (product?: Product) => {
    setFormErrors({});
    if (product) {
      setCurrentProduct({...product});
    } else {
      setCurrentProduct({
        name: '',
        price: 0,
        category: '',
        description: '',
        active: true
      });
    }
    setIsModalOpen(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentProduct(null);
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (currentProduct) {
      if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setCurrentProduct({
          ...currentProduct,
          [name]: checked
        });
      } else if (type === 'number') {
        setCurrentProduct({
          ...currentProduct,
          [name]: parseFloat(value)
        });
      } else {
        setCurrentProduct({
          ...currentProduct,
          [name]: value
        });
      }
    }
  };

  // Validar formulario
  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!currentProduct?.name) {
      errors.name = 'El nombre es obligatorio';
    }
    
    if (currentProduct?.price === undefined || currentProduct.price <= 0) {
      errors.price = 'El precio debe ser mayor que 0';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Guardar producto
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !currentProduct) return;
    
    setIsSubmitting(true);
    
    try {
      if (currentProduct.id) {
        // Actualizar producto existente
        const { error } = await supabase
          .from('products')
          .update({
            name: currentProduct.name,
            price: currentProduct.price,
            category: currentProduct.category,
            description: currentProduct.description,
            active: currentProduct.active
          })
          .eq('id', currentProduct.id);
        
        if (error) throw error;
      } else {
        // Crear nuevo producto
        const { error } = await supabase
          .from('products')
          .insert([{
            name: currentProduct.name,
            price: currentProduct.price || 0,
            category: currentProduct.category,
            description: currentProduct.description,
            active: currentProduct.active
          }]);
        
        if (error) throw error;
      }
      
      // Actualizar lista de productos
      await fetchProducts();
      closeModal();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      alert('Error al guardar producto. Por favor, intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cambiar estado de un producto (activar/desactivar)
  const toggleProductStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ active: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      // Actualizar la lista localmente
      setProducts(products.map(product => {
        if (product.id === id) {
          return { ...product, active: !currentStatus };
        }
        return product;
      }));
    } catch (error) {
      console.error('Error al cambiar estado del producto:', error);
      alert('Error al cambiar estado del producto. Por favor, intenta de nuevo.');
    }
  };

  // Eliminar un producto
  const deleteProduct = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Actualizar la lista localmente
      setProducts(products.filter(product => product.id !== id));
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      alert('Error al eliminar producto. Por favor, intenta de nuevo.');
    }
  };

  // Columnas para la tabla de productos
  const columns = [
    { 
      header: 'Nombre', 
      accessor: 'name' 
    },
    { 
      header: 'Precio', 
      accessor: (product: Product) => `$${product.price.toFixed(2)}`,
      className: 'text-right' 
    },
    { 
      header: 'Categoría', 
      accessor: 'category' 
    },
    { 
      header: 'Estado', 
      accessor: (product: Product) => (
        <span className={`flex items-center ${product.active ? 'text-green-600' : 'text-red-600'}`}>
          {product.active ? (
            <><CheckCircleIcon className="h-5 w-5 mr-1" /> Activo</>
          ) : (
            <><XCircleIcon className="h-5 w-5 mr-1" /> Inactivo</>
          )}
        </span>
      )
    },
    { 
      header: 'Acciones', 
      accessor: (product: Product) => (
        <div className="flex space-x-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleProductStatus(product.id, product.active)}
            icon={product.active ? <XCircleIcon className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />}
          >
            {product.active ? 'Desactivar' : 'Activar'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openProductModal(product)}
            icon={<PencilIcon className="h-4 w-4" />}
          >
            Editar
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => deleteProduct(product.id)}
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
            Gestión de Productos
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Button
            variant="primary"
            onClick={() => openProductModal()}
            icon={<PlusIcon className="h-5 w-5 mr-1" />}
          >
            Nuevo Producto
          </Button>
        </div>
      </div>

      <Card>
        <div className="mb-4">
          <FormField
            label="Buscar productos"
            placeholder="Buscar por nombre, categoría o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />}
          />
        </div>

        <Table
          columns={columns}
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          isLoading={loading}
          emptyMessage="No se encontraron productos"
        />
      </Card>

      {/* Modal de creación/edición de producto */}
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
                  {currentProduct?.id ? 'Editar Producto' : 'Crear Nuevo Producto'}
                </h3>
                
                <form onSubmit={handleSaveProduct}>
                  <FormField
                    label="Nombre del producto"
                    name="name"
                    value={currentProduct?.name || ''}
                    onChange={handleInputChange}
                    error={formErrors.name}
                    required
                  />
                  
                  <FormField
                    label="Precio"
                    name="price"
                    type="number"
                    step="0.01"
                    value={currentProduct?.price || ''}
                    onChange={handleInputChange}
                    error={formErrors.price}
                    required
                  />
                  
                  <FormField
                    label="Categoría"
                    name="category"
                    value={currentProduct?.category || ''}
                    onChange={handleInputChange}
                  />
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      name="description"
                      rows={3}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Descripción del producto"
                      value={currentProduct?.description || ''}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                  
                  <div className="flex items-center mb-4">
                    <input
                      id="active"
                      name="active"
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      checked={currentProduct?.active || false}
                      onChange={(e) => {
                        if (currentProduct) {
                          setCurrentProduct({
                            ...currentProduct,
                            active: e.target.checked
                          });
                        }
                      }}
                    />
                    <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                      Producto activo
                    </label>
                  </div>
                  
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={isSubmitting}
                      className="sm:col-start-2"
                    >
                      {currentProduct?.id ? 'Guardar cambios' : 'Crear producto'}
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
