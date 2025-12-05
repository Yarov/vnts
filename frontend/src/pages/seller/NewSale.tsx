import { CheckCircleIcon, BanknotesIcon, CreditCardIcon, DocumentTextIcon, UserIcon, BuildingStorefrontIcon, CalendarIcon } from '@heroicons/react/24/outline';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input, TextArea } from '../../components/forms';
import { useSellerNewSale } from '../../hooks/useSellerNewSale';
import { formatCurrency, formatDayMonthLong } from '../../utils/formatters';
import { useAtom } from 'jotai';
import { userAtom } from '../../store/auth';
import { useNavigate, useLocation } from 'react-router-dom';

export default function NewSale() {
  const [user] = useAtom(userAtom);
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    clientReference,
    setClientReference,
    clientReferenceRef,
    branches,
    selectedBranchId,
    setSelectedBranchId,
    categorizedProducts,
    selectedCategory,
    setSelectedCategory,
    selectedProduct,
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
    renderPaymentMethodIcon
  } = useSellerNewSale();

  // Fecha bonita
  const today = new Date();
  const prettyDate = formatDayMonthLong(today);
  const prettyDateCapitalized = prettyDate.charAt(0).toUpperCase() + prettyDate.slice(1);

  // Extraer orgSlug de la URL actual
  const getOrgSlug = () => {
    const pathParts = location.pathname.split('/');
    // Si la URL es /:orgSlug/seller/new-sale, el slug está en pathParts[1]
    if (pathParts.length > 1 && pathParts[1] && pathParts[1] !== 'seller') {
      return pathParts[1];
    }
    return null;
  };

  const handleCancel = () => {
    const orgSlug = getOrgSlug();
    if (orgSlug) {
      navigate(`/${orgSlug}/seller`);
    } else {
      navigate('/seller');
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
            className={`p-2 border rounded-lg flex flex-col h-24 transition-colors ${selectedProduct?.id === product.id
                ? 'border-[var(--primary-color)] bg-[var(--primary-50)] shadow-sm'
                : 'border-gray-200 hover:bg-gray-50'
              }`}
          >
            <span className="font-medium text-sm line-clamp-2">{product.name}</span>
            <span className="text-[var(--primary-color)] font-bold mt-1">{formatCurrency(product.price)}</span>
            <span className="text-xs text-gray-500 mt-auto">{product.category}</span>
          </button>
        ))}
      </div>
    );
  };

  // Renderizar el método de pago con su ícono correspondiente
  const renderPaymentMethodIconUI = (methodId: string) => {
    const iconType = renderPaymentMethodIcon(methodId);
    if (iconType === 'cash') {
      return <BanknotesIcon className="h-6 w-6" />;
    } else if (iconType === 'card') {
      return <CreditCardIcon className="h-6 w-6" />;
    } else if (iconType === 'transfer') {
      return <DocumentTextIcon className="h-6 w-6" />;
    }
    return <CreditCardIcon className="h-6 w-6" />;
  };

  return (
    <div>
      {/* Header igual al dashboard */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 px-6 py-5 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-1 text-gray-800">Nueva Venta</h2>
            {user?.activeBranchName && (
              <div className="flex items-center mt-2 text-sm">
                <BuildingStorefrontIcon className="h-4 w-4 mr-1.5 text-blue-600" />
                <span className="text-gray-600">Vendiendo en:</span>
                <span className="ml-1.5 font-semibold text-blue-600">{user.activeBranchName}</span>
              </div>
            )}
          </div>
          <div className="mt-4 md:mt-0 md:text-right flex items-center text-sm text-gray-500">
            <CalendarIcon className="h-4 w-4 mr-1" />
            <span>Hoy es {prettyDateCapitalized}</span>
          </div>
        </div>
      </div>

      {/* Alertas */}
      {isSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-xl">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
              <CheckCircleIcon className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="font-bold text-xl mt-4 text-center">¡Venta realizada con éxito!</h3>
            <p className="py-4 text-gray-600 text-center">
              La venta ha sido registrada correctamente.
            </p>
            <div className="flex justify-center mt-2">
              <div className="flex items-center text-primary-600">
                <span>Redirigiendo al dashboard</span>
                <svg className="animate-spin ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      <Card>
        <div className="space-y-6">
          {/* Información de cliente */}
          <div>
            <h3 className="text-lg font-medium mb-3 text-gray-800">Referencia de Cliente</h3>
            <Input
              ref={clientReferenceRef}
              type="text"
              value={clientReference}
              onChange={(e) => setClientReference(e.target.value)}
              placeholder="Identificador del cliente"
              error={errors.clientReference}
              icon={<UserIcon className="h-5 w-5 text-gray-400" />}
            />
          </div>

          {/* Sucursal - Solo mostrar si hay más de una opción */}
          {branches.length > 1 && (
            <div>
              <h3 className="text-lg font-medium mb-3 text-gray-800">Sucursal</h3>
              <div className="relative">
                <BuildingStorefrontIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name} ({branch.code})
                    </option>
                  ))}
                </select>
              </div>
              {errors.branch && (
                <p className="mt-1 text-sm text-red-600">{errors.branch}</p>
              )}
            </div>
          )}

          {/* Productos */}
          <div>
            <h3 className="text-lg font-medium mb-3 text-gray-800">Producto</h3>

            {/* Mostrar producto seleccionado */}
            {selectedProduct && (
              <div className="mb-4 p-3 bg-[var(--primary-50)] border border-[var(--primary-200)] rounded-lg">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{selectedProduct.name}</p>
                    <p className="text-sm text-gray-500">{selectedProduct.category || 'Sin categoría'}</p>
                  </div>
                  <div className="font-bold text-[var(--primary-color)] text-lg">
                    {formatCurrency(selectedProduct.price)}
                  </div>
                </div>
              </div>
            )}

            {errors.product && (
              <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-md">
                <p className="text-sm text-red-700">{errors.product}</p>
              </div>
            )}

            {/* Categorías */}
            <div className="mb-3">
              <div className="flex flex-wrap gap-2 pb-2">
                {Object.keys(categorizedProducts).map(category => (
                  <button
                    key={category}
                    className={`px-3 py-1 text-sm font-medium rounded-full ${
                      selectedCategory === category
                      ? 'bg-[var(--primary-50)] text-[var(--primary-color)]'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
            <h3 className="text-lg font-medium mb-3 text-gray-800">Método de Pago</h3>

            {errors.paymentMethod && (
              <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-md">
                <p className="text-sm text-red-700">{errors.paymentMethod}</p>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {paymentMethods.map(method => (
                <button
                  key={method.id}
                  className={`flex items-center px-3 py-2 border rounded-md transition-colors ${
                    selectedPaymentMethodId === method.id
                    ? 'bg-[var(--primary-50)] border-[var(--primary-color)] text-[var(--primary-color)]'
                    : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                  }`}
                  onClick={() => setSelectedPaymentMethodId(method.id)}
                >
                  <div className={`p-1 rounded-full mr-2 ${
                    selectedPaymentMethodId === method.id
                    ? 'bg-[var(--primary-50)]'
                    : 'bg-gray-100'
                  }`}>
                    {renderPaymentMethodIconUI(method.id)}
                  </div>
                  <span className="font-medium">{method.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notas */}
          <div>
            <h3 className="text-lg font-medium mb-3 text-gray-800">Notas (opcional)</h3>
            <TextArea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Añadir notas o comentarios sobre esta venta..."
              helperText="Esta información es interna y no se muestra al cliente"
            />
          </div>

          {/* Total y Botón finalizar */}
          <div className="border-t border-gray-200 pt-6 mt-2 flex flex-col sm:flex-row justify-between items-center">
            <div className="mb-4 sm:mb-0">
              <span className="text-gray-600 text-lg">Total:</span>
              <span className="ml-2 text-3xl font-bold text-gray-900">{formatCurrency(calculateTotal())}</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto px-10 py-3 text-base font-medium"
                onClick={handleCancel}
              >
                Cancelar Venta
              </Button>
              <Button
                variant="primary"
                className="w-full sm:w-auto px-10 py-3 text-base font-medium"
                onClick={handleSale}
                isLoading={isLoading}
                disabled={!selectedProduct}
              >
                Completar Venta
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}