import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { userAtom } from '../store/auth';
import { getAllProducts } from '../services/productService';
import { getAllPaymentMethods } from '../services/paymentMethodService';
import { getOrCreateClient } from '../services/clientService';
import { processSale } from '../services/salesService';
import { Database } from '../types/database.types';

export type Product = Database['public']['Tables']['products']['Row'];
export type PaymentMethod = Database['public']['Tables']['payment_methods']['Row'];

export function useSellerNewSale() {
  const [user] = useAtom(userAtom);
  const navigate = useNavigate();
  const clientReferenceRef = useRef<HTMLInputElement>(null);

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

  // Cargar datos iniciales
  useEffect(() => {
    fetchProducts();
    fetchPaymentMethods();
    if (clientReferenceRef.current) {
      clientReferenceRef.current.focus();
    }
    // eslint-disable-next-line
  }, []);

  // Organizar productos por categoría cuando se cargan
  useEffect(() => {
    const categorized: {[key: string]: Product[]} = {};
    products.forEach(product => {
      const category = product.category || 'Sin categoría';
      if (!categorized[category]) {
        categorized[category] = [];
      }
      categorized[category].push(product);
    });
    setCategorizedProducts(categorized);
    const categories = Object.keys(categorized);
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]);
    }
    // eslint-disable-next-line
  }, [products]);

  const fetchProducts = async () => {
    try {
      const data = await getAllProducts(true);
      setProducts(data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const data = await getAllPaymentMethods(true);
      setPaymentMethods(data);
      if (data.length > 0) {
        setSelectedPaymentMethodId(data[0].id);
      }
    } catch (error) {
      console.error('Error al cargar métodos de pago:', error);
    }
  };

  const selectProduct = (product: Product) => {
    setSelectedProduct(product);
    const productElement = document.getElementById(`product-${product.id}`);
    if (productElement) {
      productElement.classList.add('bg-primary-50');
      setTimeout(() => {
        productElement.classList.remove('bg-primary-50');
      }, 300);
    }
  };

  const calculateTotal = () => {
    if (!selectedProduct) return 0;
    return Number(selectedProduct.price);
  };

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

  const handleSale = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const client = await getOrCreateClient(clientReference.trim());
      if (!client) throw new Error('Error al obtener o crear el cliente');
      if (selectedProduct) {
        const saleData = {
          seller_id: user?.id || '',
          client_id: client.id,
          payment_method_id: selectedPaymentMethodId,
          total: calculateTotal(),
          notes: notes.trim() || null,
          items: [
            {
              product_id: selectedProduct.id,
              product_name: selectedProduct.name,
              quantity: 1,
              price: Number(selectedProduct.price),
              subtotal: Number(selectedProduct.price)
            }
          ],
          client_name: client.name
        };
        const result = await processSale(saleData);
        if (result) {
          setIsSuccess(true);
          setTimeout(() => {
            resetSale();
            navigate('/seller');
          }, 2000);
        } else {
          throw new Error('Error al procesar venta');
        }
      }
    } catch (error) {
      console.error('Error al procesar venta:', error);
      alert('Error al procesar venta. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetSale = () => {
    setIsSuccess(false);
    setSelectedProduct(null);
    setClientReference('');
    setNotes('');
    if (clientReferenceRef.current) {
      clientReferenceRef.current.focus();
    }
  };

  const renderPaymentMethodIcon = (methodId: string) => {
    const methodName = paymentMethods.find(m => m.id === methodId)?.name.toLowerCase() || '';
    if (methodName.includes('efectivo')) {
      return 'cash';
    } else if (methodName.includes('tarjeta')) {
      return 'card';
    } else if (methodName.includes('transfer')) {
      return 'transfer';
    }
    return 'card';
  };

  return {
    clientReference,
    setClientReference,
    clientReferenceRef,
    products,
    categorizedProducts,
    selectedCategory,
    setSelectedCategory,
    selectedProduct,
    setSelectedProduct,
    selectProduct,
    paymentMethods,
    selectedPaymentMethodId,
    setSelectedPaymentMethodId,
    notes,
    setNotes,
    isLoading,
    isSuccess,
    errors,
    calculateTotal,
    handleSale,
    resetSale,
    renderPaymentMethodIcon
  };
}
