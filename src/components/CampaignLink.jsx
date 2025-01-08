/* eslint-disable react/prop-types */
import { useState } from 'react';
import QRCode from 'qrcode.react';


const CampaignLink = ({ onLinkSubmit }) => {
  const [link, setLink] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLinkSubmit(link);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="campaign-link" className="block text-sm font-medium text-gray-200">
            Campaign Link
          </label>
          <input
            type="url"
            id="campaign-link"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Enter your campaign link"
            className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Generate QR Code
        </button>
      </form>

      {link && (
        <div className="flex flex-col items-center space-y-4 p-4 bg-white rounded-lg">
          <QRCode value={link} size={200} level="H" />
          <p className="text-sm text-gray-600">Scan this QR code to access your campaign</p>
        </div>
      )}
    </div>
  );
}

export default CampaignLink;