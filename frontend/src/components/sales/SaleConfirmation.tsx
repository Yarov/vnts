import {
  ArrowLeftIcon,
  CheckIcon,
  ShoppingCartIcon,
  UserIcon,
  CreditCardIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Database } from '../../types/database.types';

type PaymentMethod = Database['public']['Tables']['payment_methods']['Row'];
type Client = Database['public']['Tables']['clients']['Row'];

interface SaleItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface SaleConfirmationProps {
  saleItems: SaleItem[];
  selectedClient: Client | null;
  selectedPaymentMethod: PaymentMethod | null;
  notes: string;
  calculateTotal: () => number;
  goToPreviousStep: () => void;
  processSale: () => void;
  isSubmitting: boolean;
}

const SaleConfirmation: React.FC<SaleConfirmationProps> = ({
  saleItems,
  selectedClient,
  selectedPaymentMethod,
  notes,
  calculateTotal,
  goToPreviousStep,
  processSale,
  isSubmitting,
}) => {
  const total = calculateTotal();

  return (
    <Card title="Confirmar Venta">
      <div className="mb-6">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
            <ShoppingCartIcon className="h-5 w-5 mr-2 text-primary-600" />
            Resumen de la venta
          </h3>
          
          <div className="overflow-y-auto max-h-40 mb-3">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {saleItems.map((item, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.product_name}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-center">
                      {item.quantity}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                      ${item.price.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 font-medium text-right">
                      ${item.subtotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between text-base font-medium text-gray-900">
              <p>Total</p>
              <p>${total.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-base font-medium text-gray-900 mb-2 flex items-center">
              <UserIcon className="h-5 w-5 mr-2 text-primary-600" />
              Cliente
            </h3>
            {selectedClient ? (
              <div>
                <p className="text-gray-900">{selectedClient.name}</p>
                {selectedClient.reference && (
                  <p className="text-sm text-gray-500">{selectedClient.reference}</p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 italic">Sin cliente asignado</p>
            )}
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-base font-medium text-gray-900 mb-2 flex items-center">
              <CreditCardIcon className="h-5 w-5 mr-2 text-primary-600" />
              Método de Pago
            </h3>
            {selectedPaymentMethod && (
              <p className="text-gray-900">{selectedPaymentMethod.name}</p>
            )}
          </div>
        </div>
        
        {notes && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6">
            <h3 className="text-base font-medium text-gray-900 mb-2 flex items-center">
              <DocumentTextIcon className="h-5 w-5 mr-2 text-primary-600" />
              Notas
            </h3>
            <p className="text-gray-700 whitespace-pre-line">{notes}</p>
          </div>
        )}
      </div>
      
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={goToPreviousStep}
          icon={<ArrowLeftIcon className="h-5 w-5 mr-1" />}
        >
          Volver a Pago
        </Button>
        <Button
          variant="primary"
          onClick={processSale}
          icon={<CheckIcon className="h-5 w-5 ml-1" />}
          iconPosition="right"
          isLoading={isSubmitting}
        >
          {isSubmitting ? 'Procesando...' : 'Completar Venta'}
        </Button>
      </div>
    </Card>
  );
};

export default SaleConfirmation;
