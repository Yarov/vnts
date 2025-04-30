import { useRef, useEffect } from 'react';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BanknotesIcon,
  CreditCardIcon,
  DocumentTextIcon,
  CalculatorIcon,
} from '@heroicons/react/24/outline';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Database } from '../../types/database.types';

type PaymentMethod = Database['public']['Tables']['payment_methods']['Row'];

interface PaymentSelectionProps {
  paymentMethods: PaymentMethod[];
  selectedPaymentMethodId: string;
  setSelectedPaymentMethodId: (id: string) => void;
  cashAmount: string;
  setCashAmount: (amount: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
  calculateTotal: () => number;
  calculateChange: () => number;
  goToPreviousStep: () => void;
  goToNextStep: () => void;
  errors: {[key: string]: string};
}

const PaymentSelection: React.FC<PaymentSelectionProps> = ({
  paymentMethods,
  selectedPaymentMethodId,
  setSelectedPaymentMethodId,
  cashAmount,
  setCashAmount,
  notes,
  setNotes,
  calculateTotal,
  calculateChange,
  goToPreviousStep,
  goToNextStep,
  errors,
}) => {
  const cashInputRef = useRef<HTMLInputElement>(null);

  // Enfoque automático en el input de efectivo
  useEffect(() => {
    if (selectedPaymentMethodId === paymentMethods[0]?.id && cashInputRef.current) {
      cashInputRef.current.focus();
    }
  }, [selectedPaymentMethodId, paymentMethods]);

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
    
    return <CalculatorIcon className="h-6 w-6" />;
  };

  const total = calculateTotal();
  const change = calculateChange();

  // Establecer rápidamente cantidades predefinidas
  const setQuickAmount = (amount: number) => {
    setCashAmount(amount.toString());
  };

  return (
    <Card title="Método de Pago">
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-4">
          Seleccione el método de pago y complete la información necesaria.
        </p>
        
        {/* Selección de método de pago */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {paymentMethods.map(method => (
            <button
              key={method.id}
              className={`flex items-center p-4 border rounded-lg ${
                selectedPaymentMethodId === method.id
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedPaymentMethodId(method.id)}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
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
        
        {/* Efectivo - mostrar calculadora simple */}
        {selectedPaymentMethodId === paymentMethods[0]?.id && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="font-medium text-gray-700 mb-3">Cálculo de cambio</div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total a pagar
                </label>
                <div className="bg-white p-2 border border-gray-300 rounded-md text-center text-lg font-bold">
                  ${total.toFixed(2)}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto recibido
                </label>
                <input
                  ref={cashInputRef}
                  type="number"
                  step="0.01"
                  min={total}
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  className={`block w-full p-2 border rounded-md text-center text-lg font-bold ${
                    errors.cashAmount ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                  }`}
                  placeholder="0.00"
                />
                {errors.cashAmount && (
                  <p className="mt-1 text-sm text-red-600">{errors.cashAmount}</p>
                )}
              </div>
            </div>
            
            {/* Botones de cantidad rápida */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              <button
                type="button"
                onClick={() => setQuickAmount(Math.ceil(total))}
                className="w-full py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700 font-medium"
              >
                ${Math.ceil(total)}
              </button>
              <button
                type="button"
                onClick={() => setQuickAmount(Math.ceil(total/10)*10)}
                className="w-full py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700 font-medium"
              >
                ${Math.ceil(total/10)*10}
              </button>
              <button
                type="button"
                onClick={() => setQuickAmount(Math.ceil(total/100)*100)}
                className="w-full py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700 font-medium"
              >
                ${Math.ceil(total/100)*100}
              </button>
              <button
                type="button"
                onClick={() => setQuickAmount(Math.ceil(total/500)*500)}
                className="w-full py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700 font-medium"
              >
                ${Math.ceil(total/500)*500}
              </button>
            </div>
            
            {/* Cambio a devolver */}
            {parseFloat(cashAmount) >= total && (
              <div className="flex justify-between items-center mt-4 p-2 bg-primary-50 border border-primary-200 rounded-md">
                <span className="font-medium text-gray-700">Cambio a devolver:</span>
                <span className="text-lg font-bold text-primary-700">${change.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}
        
        {/* Notas de la venta */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notas de la venta (opcional)
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Añadir notas o comentarios sobre esta venta..."
          ></textarea>
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={goToPreviousStep}
          icon={<ArrowLeftIcon className="h-5 w-5 mr-1" />}
        >
          Volver a Cliente
        </Button>
        <Button
          variant="primary"
          onClick={goToNextStep}
          icon={<ArrowRightIcon className="h-5 w-5 ml-1" />}
          iconPosition="right"
          disabled={selectedPaymentMethodId === paymentMethods[0]?.id && parseFloat(cashAmount || '0') < total}
        >
          Revisar Venta
        </Button>
      </div>
    </Card>
  );
};

export default PaymentSelection;
