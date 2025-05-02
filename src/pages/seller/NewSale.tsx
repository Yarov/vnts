import { CheckCircleIcon, BanknotesIcon, CreditCardIcon, DocumentTextIcon, UserIcon } from '@heroicons/react/24/outline';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input, TextArea } from '../../components/forms';
import { useSellerNewSale } from '../../hooks/useSellerNewSale';
import { formatCurrency } from '../../utils/formatters';

export default function NewSale() {
  const {
    clientReference,
    setClientReference,
    clientReferenceRef,
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
    resetSale,
    renderPaymentMethodIcon
  } = useSellerNewSale();

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
                ? 'border-primary-300 bg-primary-50 shadow-sm'
                : 'border-gray-200 hover:bg-gray-50'
              }`}
          >
            <span className="font-medium text-sm line-clamp-2">{product.name}</span>
            <span className="text-primary-700 font-bold mt-1">{formatCurrency(product.price)}</span>
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Nueva Venta</h2>
          <p className="text-sm text-gray-500">Registra una venta de manera rápida y sencilla</p>
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

          {/* Productos */}
          <div>
            <h3 className="text-lg font-medium mb-3 text-gray-800">Producto</h3>

            {/* Mostrar producto seleccionado */}
            {selectedProduct && (
              <div className="mb-4 p-3 bg-primary-50 border border-primary-200 rounded-lg">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{selectedProduct.name}</p>
                    <p className="text-sm text-gray-500">{selectedProduct.category || 'Sin categoría'}</p>
                  </div>
                  <div className="font-bold text-primary-700 text-lg">
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
                      ? 'bg-primary-100 text-primary-800'
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
                    ? 'bg-primary-50 border-primary-300 text-primary-700'
                    : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                  }`}
                  onClick={() => setSelectedPaymentMethodId(method.id)}
                >
                  <div className={`p-1 rounded-full mr-2 ${
                    selectedPaymentMethodId === method.id
                    ? 'bg-primary-100'
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
                onClick={() => window.location.href = '/seller'}
              >
                Cancelar Venta
              </Button>
              <Button
                variant="primary"
                className="w-full sm:w-auto px-10 py-3 text-base font-medium"
                onClick={handleSale}
                loading={isLoading}
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
