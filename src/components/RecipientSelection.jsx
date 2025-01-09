/* eslint-disable react/prop-types */

import {  AlertCircle } from 'lucide-react';


const RecipientSelection = ({
  recipients,
  selectedRecipients,
  onRecipientSelect,
}) => {
  const handleSelectAll = () => {
    if (selectedRecipients.length === recipients.length) {
      onRecipientSelect([]);
    } else {
      onRecipientSelect(recipients.map(r => r.place_id));
    }
  };

  const toggleRecipient = (id) => {
    if (selectedRecipients.includes(id)) {
      onRecipientSelect(selectedRecipients.filter(r => r !== id));
    } else {
      onRecipientSelect([...selectedRecipients, id]);
    }
  };

  const hasRequiredInfo = (recipient, method) => {
    switch (method) {
      case 'whatsapp':
      case 'sms':
        return !!recipient.phone;
      case 'email':
        return !!recipient.email;
      default:
        return false;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-white">Select Recipients</h3>
        <button
          onClick={handleSelectAll}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {selectedRecipients.length === recipients.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      <div className="space-y-2">
        {recipients.map((recipient) => (
          <div
            key={recipient.place_id}
            className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
          >
            <div className="flex items-center space-x-4">
              <input
                type="checkbox"
                checked={selectedRecipients.includes(recipient.place_id)}
                onChange={() => toggleRecipient(recipient.place_id)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div>
                <p className="text-white font-medium">{recipient.place_name || 'Unknown Name'}</p>
                <p className="text-gray-400 text-sm">
                  {recipient.phone || 'No phone'} • {recipient.email || 'No email'}
                </p>
              </div>
            </div>
            {!hasRequiredInfo(recipient, 'whatsapp') && (
              <AlertCircle className="text-yellow-500" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecipientSelection;