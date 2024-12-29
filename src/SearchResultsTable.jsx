/* eslint-disable react/prop-types */
import { useState } from 'react';
import Papa from 'papaparse';
import { Download, Star, Globe, Phone, MapPin, Tag, Building } from 'lucide-react';

const SearchResultsTable = ({ searchResults }) => {
  const [hoveredRow, setHoveredRow] = useState(null);

  const downloadCSV = () => {
    const csvData = Papa.unparse(searchResults);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'search_results.csv';
    link.click();
  };

  console.log(hoveredRow);
  
  if (searchResults.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-800/50 rounded-lg border border-gray-700">
        <p className="text-gray-400">No results to display.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">
          Search Results ({searchResults.length})
        </h2>
        <button
          onClick={downloadCSV}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Download className="w-4 h-4" />
          Download CSV
        </button>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-gray-700 bg-gray-800/50 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="p-4 text-left text-sm font-medium text-gray-400">Place Details</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Category</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Contact</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {searchResults.map((result, index) => (
                <tr
                  key={index}
                  className="group transition-colors hover:bg-gray-700/50"
                  onMouseEnter={() => setHoveredRow(index)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-blue-400" />
                        <span className="font-medium text-white">
                          {result.place_name || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <MapPin className="w-4 h-4" />
                        <span>{result.address || 'No address available'}</span>
                      </div>
                      <div className="text-xs text-gray-500">ID: {result.placeId}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-400" />
                      <span className="text-gray-300">
                        {Array.isArray(result.category)
                          ? result.category.join(', ')
                          : result.category || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-2">
                      {result.phone && (
                        <div className="flex items-center gap-2 text-gray-300">
                          <Phone className="w-4 h-4 text-purple-400" />
                          <span>{result.phone}</span>
                        </div>
                      )}
                      {result.website && (
                        <a
                          href={result.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <Globe className="w-4 h-4" />
                          <span>Visit website</span>
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Star className={`w-4 h-4 ${
                        result.rating ? 'text-yellow-400' : 'text-gray-500'
                      }`} />
                      <span className="text-gray-300">
                        {result.rating || 'No rating'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsTable;