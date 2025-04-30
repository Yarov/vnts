import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircleIcon,
  BanknotesIcon,
  CreditCardIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { useAtom } from 'jotai';
import { userAtom } from '../../store/auth';
import { supabase } from '../../lib/supabase';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Database } from '../../types/database.types';

type Product = Database['public']['Tables']['products']['Row'];
type PaymentMethod = Database['public']['Tables']['payment_methods']['Row'];


export default function NewSale() {
  const [user] = useAtom(userAtom);
  let navigate = useNavigate();
  // Estado para cliente
  const [clientReference, setClientReference] = useState('');

  // Estado para productos
  const [products, setProducts] = useState<Product[]>([]);
  const [categorizedProducts, setCategorizedProducts] = useState<{[key: string]: Product[]}>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Estado para pagos
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState('');
  const [notes, setNotes] = useState('');

  // Estado general
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Referencias
  const clientReferenceRef = useRef<HTMLInputElement>(null);

  // Cargar datos iniciales
  useEffect(() => {
    fetchProducts();
    fetchPaymentMethods();

    // Enfocar en la referencia del cliente al cargar
    if (clientReferenceRef.current) {
      clientReferenceRef.current.focus();
    }
  }, []);

  // Organizar productos por categoría cuando se cargan
  useEffect(() => {
    const categorized: {[key: string]: Product[]} = {};

    // Agrupar por categoría
    products.forEach(product => {
      const category = product.category || 'Sin categoría';

      if (!categorized[category]) {
        categorized[category] = [];
      }

      categorized[category].push(product);
    });

    setCategorizedProducts(categorized);

    // Seleccionar la primera categoría si hay alguna
    const categories = Object.keys(categorized);
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]);
    }
  }, [products]);

  // Obtener productos
  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  // Obtener métodos de pago
  const fetchPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setPaymentMethods(data || []);

      // Establecer el primer método como predeterminado
      if (data && data.length > 0) {
        setSelectedPaymentMethodId(data[0].id);
      }
    } catch (error) {
      console.error('Error al cargar métodos de pago:', error);
    }
  };

  // Seleccionar producto
  const selectProduct = (product: Product) => {
    setSelectedProduct(product);

    // Proporcionar feedback visual
    const productElement = document.getElementById(`product-${product.id}`);
    if (productElement) {
      productElement.classList.add('bg-green-50');
      setTimeout(() => {
        productElement.classList.remove('bg-green-50');
      }, 300);
    }
  };

  // Calcular total de venta
  const calculateTotal = () => {
    if (!selectedProduct) return 0;
    return Number(selectedProduct.price);
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!selectedProduct) {
      newErrors.product = 'Debes seleccionar un producto';
    }

    if (!selectedPaymentMethodId) {
      newErrors.paymentMethod = 'Selecciona un método de pago';
    }

    if (!clientReference.trim()) {
      newErrors.clientReference = 'La referencia del cliente es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Procesar venta
  const processSale = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Crear/buscar cliente
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('reference', clientReference.trim())
        .maybeSingle();

      let clientId;

      if (clientError) throw clientError;

      if (clientData) {
        // Cliente existente
        clientId = clientData.id;
      } else {
        // Crear nuevo cliente
        const { data: newClient, error: newClientError } = await supabase
          .from('clients')
          .insert([{
            name: clientReference.trim(), // Usamos la referencia como nombre también
            reference: clientReference.trim()
          }])
          .select()
          .single();

        if (newClientError) throw newClientError;
        clientId = newClient?.id;
      }

      // Crear venta
      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert([{
          seller_id: user?.id || '',
          client_id: clientId,
          payment_method_id: selectedPaymentMethodId,
          total: calculateTotal(),
          notes: notes.trim() || null
        }])
        .select()
        .single();

      if (saleError) throw saleError;

      if (saleData && selectedProduct) {
        // Crear item de venta
        const { error: itemsError } = await supabase
          .from('sale_items')
          .insert([{
            sale_id: saleData.id,
            product_id: selectedProduct.id,
            quantity: 1,
            price: Number(selectedProduct.price),
            subtotal: Number(selectedProduct.price)
          }]);

        if (itemsError) throw itemsError;

        // Mostrar éxito y resetear
        setIsSuccess(true);
        setTimeout(() => {
          resetSale();
          navigate('/');
        }, 2000);
      }
    } catch (error) {
      console.error('Error al procesar venta:', error);
      alert('Error al procesar venta. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resetear venta para empezar una nueva
  const resetSale = () => {
    setIsSuccess(false);
    setSelectedProduct(null);
    setClientReference('');
    setNotes('');
    // Mantener el método de pago seleccionado para la próxima venta

    // Enfocar en la referencia del cliente
    if (clientReferenceRef.current) {
      clientReferenceRef.current.focus();
    }
  };

  // Renderizar productos por categoría
  const renderProductsByCategory = () => {
    if (!selectedCategory) return null;

    const productsInCategory = categorizedProducts[selectedCategory] || [];

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {productsInCategory.map(product => (
          <button
            key={product.id}
            id={`product-${product.id}`}
            onClick={() => selectProduct(product)}
            className={`p-2 bg-white border rounded-lg shadow-sm text-left transition-colors flex flex-col h-24 ${
              selectedProduct?.id === product.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <span className="font-medium text-gray-900 text-sm line-clamp-2">{product.name}</span>
            <span className="text-primary-600 font-bold mt-1">${Number(product.price).toFixed(2)}</span>
            <span className="text-xs text-gray-500 mt-auto">{product.category}</span>
          </button>
        ))}
      </div>
    );
  };

  // Renderizar el método de pago con su ícono correspondiente
  const renderPaymentMethodIcon = (methodId: string) => {
    const methodName = paymentMethods.find(m => m.id === methodId)?.name.toLowerCase() || '';

    if (methodName.includes('efectivo')) {
      return <BanknotesIcon className="h-6 w-6" />;
    } else if (methodName.includes('tarjeta')) {
      return <CreditCardIcon className="h-6 w-6" />;
    } else if (methodName.includes('transfer')) {
      return <DocumentTextIcon className="h-6 w-6" />;
    }

    return <CreditCardIcon className="h-6 w-6" />;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Nueva Venta</h2>

      {/* Alertas */}
      {isSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
              <CheckCircleIcon className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">¡Venta realizada con éxito!</h3>
            <p className="mt-2 text-sm text-gray-500">
              La venta ha sido registrada correctamente.
            </p>
          </div>
        </div>
      )}

      <Card>
        <div className="space-y-6">
          {/* Información de cliente */}
          <div>
            <h3 className="text-lg font-medium mb-3">Referencia de Cliente</h3>
            <div className="relative">
              <input
                ref={clientReferenceRef}
                type="text"
                value={clientReference}
                onChange={(e) => setClientReference(e.target.value)}
                className={`block w-full px-4 py-3 rounded-lg shadow-sm text-base ${
                  errors.clientReference
                    ? 'border-red-300 focus:border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                }`}
                placeholder="Nombre o identificador del cliente"
              />
              {errors.clientReference && (
                <p className="mt-1 text-sm text-red-600">{errors.clientReference}</p>
              )}
            </div>
          </div>

          {/* Productos */}
          <div>
            <h3 className="text-lg font-medium mb-3">Producto</h3>

            {/* Mostrar producto seleccionado */}
            {selectedProduct && (
              <div className="mb-4 p-3 bg-primary-50 border border-primary-300 rounded-lg">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{selectedProduct.name}</p>
                    <p className="text-sm text-gray-500">{selectedProduct.category || 'Sin categoría'}</p>
                  </div>
                  <div className="font-bold text-primary-700 text-lg">
                    ${Number(selectedProduct.price).toFixed(2)}
                  </div>
                </div>
              </div>
            )}

            {errors.product && (
              <p className="text-sm text-red-600 mb-2">{errors.product}</p>
            )}

            {/* Categorías */}
            <div className="mb-3">
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {Object.keys(categorizedProducts).map(category => (
                  <button
                    key={category}
                    className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                      selectedCategory === category
                        ? 'bg-primary-100 text-primary-800 border border-primary-300'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200'
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Productos por categoría */}
            {renderProductsByCategory()}
          </div>

          {/* Método de pago */}
          <div>
            <h3 className="text-lg font-medium mb-3">Método de Pago</h3>

            {errors.paymentMethod && (
              <p className="text-sm text-red-600 mb-2">{errors.paymentMethod}</p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {paymentMethods.map(method => (
                <button
                  key={method.id}
                  className={`flex items-center p-3 border rounded-lg ${
                    selectedPaymentMethodId === method.id
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedPaymentMethodId(method.id)}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                    selectedPaymentMethodId === method.id
                      ? 'bg-primary-100 text-primary-600'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {renderPaymentMethodIcon(method.id)}
                  </div>
                  <span className="font-medium">{method.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notas */}
          <div>
            <h3 className="text-lg font-medium mb-3">Notas (opcional)</h3>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="block w-full px-4 py-3 border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 text-base"
              placeholder="Añadir notas o comentarios sobre esta venta..."
            ></textarea>
          </div>

          {/* Total y Botón finalizar */}
          <div className="border-t border-gray-200 pt-6 mt-2 flex flex-col sm:flex-row justify-between items-center">
            <div className="mb-4 sm:mb-0">
              <span className="text-gray-700 text-lg">Total:</span>
              <span className="ml-2 text-3xl font-bold text-primary-700">${calculateTotal().toFixed(2)}</span>
            </div>

            <Button
              variant="primary"
              className="w-full sm:w-auto px-10 py-4 text-lg font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
              onClick={processSale}
              isLoading={isLoading}
              disabled={!selectedProduct}
            >
              Completar Venta
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
