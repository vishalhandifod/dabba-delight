import React from 'react';
import { CheckCircle, Clock, Package, Truck, XCircle } from 'lucide-react';

const OrderStatusTracker = ({ currentStatus, orderId }) => {
  const statusSteps = [
    { key: 'PENDING', label: 'Order Placed', icon: Clock },
    { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle },
    { key: 'PREPARING', label: 'Preparing', icon: Package },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
    { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle }
  ];

  const getCurrentStepIndex = () => {
    const index = statusSteps.findIndex(step => step.key === currentStatus);
    return index === -1 ? 0 : index;
  };

  const currentStepIndex = getCurrentStepIndex();

  if (currentStatus === 'CANCELLED') {
    return (
      <div className="w-full bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center justify-center text-red-600">
          <XCircle className="h-6 w-6 mr-2" />
          <span className="font-medium">Order Cancelled</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Order Status</h3>
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200">
          <div 
            className="h-full bg-green-500 transition-all duration-500"
            style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
          />
        </div>
        
        {/* Status Steps */}
        <div className="relative flex justify-between">
          {statusSteps.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            
            return (
              <div key={step.key} className="flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                    ${isCompleted 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : 'bg-white border-gray-300 text-gray-400'
                    }
                    ${isCurrent ? 'ring-4 ring-green-100 ring-opacity-50' : ''}
                  `}
                >
                  <StepIcon className="h-5 w-5" />
                </div>
                <span
                  className={`
                    mt-2 text-sm font-medium text-center max-w-20
                    ${isCompleted ? 'text-green-600' : 'text-gray-500'}
                  `}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Current Status Description */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Current Status: </span>
          <span className="text-green-600">{statusSteps[currentStepIndex]?.label}</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Order #{orderId} • Last updated: {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default OrderStatusTracker;