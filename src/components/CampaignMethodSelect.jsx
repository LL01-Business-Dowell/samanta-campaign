/* eslint-disable react/prop-types */

import { MessageSquare, Mail, Phone } from 'lucide-react';


const CampaignMethodSelect = ({
  selectedMethod,
  onMethodSelect,
}) => {
  const methods = [
    { id: 'whatsapp', name: 'WhatsApp', icon: MessageSquare },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'sms', name: 'SMS', icon: Phone },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {methods.map(({ id, name, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onMethodSelect(id)}
          className={`p-6 rounded-lg border-2 transition-all ${
            selectedMethod === id
              ? 'border-blue-500 bg-blue-50 text-blue-500'
              : 'border-gray-200 hover:border-blue-200'
          }`}
        >
          <div className="flex flex-col items-center space-y-2">
            <Icon className="w-8 h-8" />
            <span className="font-medium">{name}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

export default CampaignMethodSelect;