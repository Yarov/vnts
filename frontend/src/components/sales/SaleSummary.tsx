import { 
  ShoppingCartIcon,
  TrashIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface SaleItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface SaleSummaryProps {
  saleItems: SaleItem[];
  updateItemQuantity: (index: number, newQuantity: number) => void;
  removeItem: (index: number) => void;
  calculateTotal: () => number;
  errors: {[key: string]: string};
  goToNextStep: () => void;
}

const SaleSummary: React.FC<SaleSummaryProps> = ({
  saleItems,
  updateItemQuantity,
  removeItem,
  calculateTotal,
  errors,
  goToNextStep
}) => {
  return (
    <Card title="Resumen de venta">
      {errors.items && (
        <p className="text-sm text-red-600 mb-2">{errors.items}</p>
      )}
      
      {saleItems.length > 0 ? (
        <div className="max-h-96 overflow-y-auto">
          <ul className="divide-y divide-gray-200">
            {saleItems.map((item, index) => (
              <li key={index} className="py-3">
                <div className="flex justify-between items-start">
                  <div className="text-sm font-medium text-gray-900 flex-1 pr-2">{item.product_name}</div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 flex items-center">
                      <button 
                        className="w-6 h-6 bg-gray-100 rounded-l-md flex items-center justify-center hover:bg-gray-200 text-gray-600"
                        onClick={() => updateItemQuantity(index, Math.max(1, item.quantity - 1))}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        className="w-8 h-6 text-center text-sm border-y border-gray-200 focus:outline-none"
                        value={item.quantity}
                        onChange={(e) => updateItemQuantity(index, Math.max(1, parseInt(e.target.value) || 1))}
                      />
                      <button 
                        className="w-6 h-6 bg-gray-100 rounded-r-md flex items-center justify-center hover:bg-gray-200 text-gray-600"
                        onClick={() => updateItemQuantity(index, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button 
                      onClick={() => removeItem(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">${item.price.toFixed(2)} x {item.quantity}</span>
                  <span className="font-medium">${item.subtotal.toFixed(2)}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          <ShoppingCartIcon className="h-12 w-12 mx-auto text-gray-300 mb-2" />
          <p>No hay productos en esta venta</p>
          <p className="text-sm mt-1">Agrega productos desde la barra de búsqueda</p>
        </div>
      )}
      
      {saleItems.length > 0 && (
        <>
          <div className="border-t border-gray-200 mt-4 pt-4">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">Total</span>
              <span className="text-xl font-bold text-primary-600">${calculateTotal().toFixed(2)}</span>
            </div>
          </div>
          
          <div className="mt-6">
            <Button
              variant="primary"
              className="w-full"
              onClick={goToNextStep}
              disabled={saleItems.length === 0}
              icon={<ArrowRightIcon className="h-5 w-5 ml-1" />}
              iconPosition="right"
            >
              Continuar a Cliente
            </Button>
          </div>
        </>
      )}
    </Card>
  );
};

export default SaleSummary;
