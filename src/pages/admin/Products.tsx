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
      accessor: (product: Product) => `${product.price.toFixed(2)}`,
      className: 'text-right' 
    },
    { 
      header: 'Categoría', 
      accessor: 'category' 
    },
    { 
      header: 'Estado', 
      accessor: (product: Product) => (
        <span className={`badge ${product.active ? 'badge-success' : 'badge-error'} gap-1`}>
          {product.active ? (
            <><CheckCircleIcon className="h-4 w-4" /> Activo</>
          ) : (
            <><XCircleIcon className="h-4 w-4" /> Inactivo</>
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
            variant="error"
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">Gestión de Productos</h2>
        </div>
        <div className="mt-4 md:mt-0">
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
            leftIcon={<MagnifyingGlassIcon className="h-5 w-5 opacity-70" />}
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
        <dialog open className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
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
              
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Descripción</span>
                </label>
                <textarea
                  name="description"
                  rows={3}
                  className="textarea textarea-bordered"
                  placeholder="Descripción del producto"
                  value={currentProduct?.description || ''}
                  onChange={handleInputChange}
                ></textarea>
              </div>
              
              <div className="form-control mb-4">
                <label className="label cursor-pointer justify-start gap-2">
                  <input
                    type="checkbox"
                    className="checkbox"
                    name="active"
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
                  <span className="label-text">Producto activo</span>
                </label>
              </div>
              
              <div className="modal-action">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={closeModal}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                >
                  {currentProduct?.id ? 'Guardar cambios' : 'Crear producto'}
                </Button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={closeModal}>cerrar</button>
          </form>
        </dialog>
      )}
    </div>
  );
}
