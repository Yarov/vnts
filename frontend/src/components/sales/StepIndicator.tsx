type SaleStep = 'products' | 'client' | 'payment' | 'confirmation';

interface StepIndicatorProps {
  currentStep: SaleStep;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const steps = [
    { key: 'products', label: 'Productos' },
    { key: 'client', label: 'Cliente' },
    { key: 'payment', label: 'Pago' },
    { key: 'confirmation', label: 'Confirmar' }
  ];
  
  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.key === currentStep);
  };
  
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.key} className="flex flex-col items-center relative">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
              index <= getCurrentStepIndex() 
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {index + 1}
            </div>
            <span className="text-xs mt-1">{step.label}</span>
            
            {/* Línea de conexión */}
            {index < steps.length - 1 && (
              <div className={`absolute h-0.5 w-full top-4 left-8 ${
                index < getCurrentStepIndex() ? 'bg-primary-600' : 'bg-gray-200'
              }`} style={{ width: 'calc(100% - 2rem)' }}></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepIndicator;
