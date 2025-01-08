/* eslint-disable react/prop-types */

import { Check } from 'lucide-react';


const Step = ({ currentStep, stepNumber, title }) => {
  const isCompleted = currentStep > stepNumber;
  const isActive = currentStep === stepNumber;

  return (
    <div className="flex items-center">
      <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 
        ${isCompleted ? 'bg-green-500 border-green-500' : 
          isActive ? 'border-blue-500 text-blue-500' : 
          'border-gray-300 text-gray-300'}`}>
        {isCompleted ? <Check className="w-5 h-5 text-white" /> : stepNumber}
      </div>
      <div className="ml-4">
        <p className={`text-sm font-medium ${isActive ? 'text-blue-500' : 'text-gray-500'}`}>
          {title}
        </p>
      </div>
    </div>
  );
};

export default Step;