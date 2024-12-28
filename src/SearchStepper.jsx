/* eslint-disable react/prop-types */
import { Loader2 } from "lucide-react";
const SearchStepper = ({ activeStep, steps }) => {
    return (
      <div className="flex flex-col space-y-4 p-4 bg-gray-800 rounded-lg">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start space-x-4">
            <div className="flex flex-col items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index < activeStep
                    ? "bg-green-500"
                    : index === activeStep
                    ? "bg-blue-500"
                    : "bg-gray-600"
                }`}
              >
                {index < activeStep ? (
                  "✓"
                ) : index === activeStep ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  index + 1
                )}
              </div>
              {index < steps.length - 1 && (
                <div 
                  className={`w-0.5 h-16 ${
                    index < activeStep ? "bg-green-500" : "bg-gray-600"
                  }`}
                />
              )}
            </div>
            <div className="flex-1">
              <h3 className={`font-medium ${
                index <= activeStep ? "text-white" : "text-gray-400"
              }`}>
                {step.label}
              </h3>
              <p className="text-sm text-gray-400 mt-1">{step.description}</p>
              {step.details && (
                <div className="mt-2 text-sm text-gray-300">
                  {step.details}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

export default SearchStepper;