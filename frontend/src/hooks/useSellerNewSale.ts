import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAtom } from 'jotai';
import { userAtom } from '../store/auth';
import { getAllProducts } from '../services/productService';
import { getAllPaymentMethods } from '../services/paymentMethodService';
import { getAllBranches } from '../services/branchService';
import { getOrCreateClient } from '../services/clientService';
import { processSale } from '../services/salesService';
import { Database } from '../types/database.types';

export type Product = Database['public']['Tables']['products']['Row'];
export type PaymentMethod = Database['public']['Tables']['payment_methods']['Row'];
export type Branch = Database['public']['Tables']['branches']['Row'];

export function useSellerNewSale() {
  const [user] = useAtom(userAtom);
  const navigate = useNavigate();
  const location = useLocation();
  const clientReferenceRef = useRef<HTMLInputElement>(null);

  // Extraer orgSlug de la URL actual
  const getOrgSlug = () => {
    const pathParts = location.pathname.split('/');
    // Si la URL es /:orgSlug/seller/new-sale, el slug está en pathParts[1]
    if (pathParts.length > 1 && pathParts[1] && pathParts[1] !== 'seller') {
      return pathParts[1];
    }
    return null;
  };

  // Estado para cliente
  const [clientReference, setClientReference] = useState('');

  // Estado para sucursales
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');

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
    if (user?.organizationId) {
      fetchBranches();
      fetchProducts();
      fetchPaymentMethods();
    }
    if (clientReferenceRef.current) {
      clientReferenceRef.current.focus();
    }
    // eslint-disable-next-line
  }, [user?.organizationId]);

  // Recargar productos cuando cambie la sucursal activa
  useEffect(() => {
    if (user?.activeBranchId) {
      fetchProducts();
    }
    // eslint-disable-next-line
  }, [user?.activeBranchId]);

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

  const fetchBranches = async () => {
    if (!user?.organizationId) return;
    
    // Si el vendedor tiene una sucursal activa en su sesión, usarla directamente
    if (user.activeBranchId) {
      setSelectedBranchId(user.activeBranchId);
      setBranches([]); // No necesitamos cargar sucursales, ya está seleccionada
      return;
    }
    
    // Fallback: Si no tiene sucursal activa (sesión antigua), cargar PRINCIPAL
    try {
      const data = await getAllBranches(user.organizationId);
      const principalBranch = data.find(b => b.code === 'PRINCIPAL');
      if (principalBranch) {
        setSelectedBranchId(principalBranch.id);
      }
    } catch (error) {
      console.error('Error al cargar sucursales:', error);
    }
  };

  const fetchProducts = async () => {
    if (!user?.organizationId) return;
    try {
      // Filtrar productos por sucursal activa del vendedor
      const branchId = user.activeBranchId || selectedBranchId;
      const data = await getAllProducts(user.organizationId, true, branchId);
      setProducts(data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  const fetchPaymentMethods = async () => {
    if (!user?.organizationId) return;
    try {
      const data = await getAllPaymentMethods(user.organizationId, true);
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
      if (!user?.organizationId) throw new Error('Error de configuración: Organización no identificada');

      const client = await getOrCreateClient(clientReference.trim(), user.organizationId);
      if (!client) throw new Error('Error al obtener o crear el cliente');
      if (!user?.id) throw new Error('El vendedor no está autenticado.');
      if (!selectedProduct) throw new Error('No hay producto seleccionado.');
      if (!selectedPaymentMethodId) throw new Error('No hay método de pago seleccionado.');
      if (!selectedBranchId) throw new Error('No hay sucursal seleccionada.');
      const total = calculateTotal();
      if (!total || isNaN(total) || total <= 0) throw new Error('El total de la venta no es válido.');
      const saleData = {
        branch_id: selectedBranchId,
        seller_id: user.id,
        client_id: client.id,
        payment_method_id: selectedPaymentMethodId,
        total,
        notes: notes.trim() || undefined,
        items: [
          {
            product_id: selectedProduct.id,
            product_name: selectedProduct.name,
            quantity: 1,
            price: Number(selectedProduct.price),
            subtotal: Number(selectedProduct.price),
            organization_id: user.organizationId
          }
        ],
        client_name: client.name,
        organization_id: user.organizationId
      };
      const result = await processSale(saleData);
      if (result) {
        setIsSuccess(true);
        setTimeout(() => {
          resetSale();
          // Navegar de vuelta al dashboard del vendedor con el slug correcto
          const orgSlug = getOrgSlug();
          if (orgSlug) {
            navigate(`/${orgSlug}/seller`);
          } else {
            // Fallback a ruta legacy si no hay slug
            navigate('/seller');
          }
        }, 2000);
      } else {
        throw new Error('Error al procesar venta');
      }
    } catch (error: any) {
      console.error('Error al procesar venta:', error);
      alert('Error al procesar venta.\n' + (error?.message || 'Por favor, intenta de nuevo.'));
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
    branches,
    selectedBranchId,
    setSelectedBranchId,
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
