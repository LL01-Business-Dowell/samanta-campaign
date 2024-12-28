/* eslint-disable react/prop-types */

import Papa from "papaparse";

const SearchResultsTable = ({ searchResults }) => {
  const downloadCSV = () => {
    const csvData = Papa.unparse(searchResults);
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "search_results.csv";
    link.click();
  };

  if (searchResults.length === 0) {
    return <p className="text-white">No results to display.</p>;
  }

  return (
    <div className="space-y-4">
      <table className="min-w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
        <thead>
          <tr className="bg-gray-900 text-white">
            <th className="py-3 px-4 text-left">Place ID</th>
            <th className="py-3 px-4 text-left">Place Name</th>
            <th className="py-3 px-4 text-left">Category</th>
            <th className="py-3 px-4 text-left">Address</th>
            <th className="py-3 px-4 text-left">Rating</th>
            <th className="py-3 px-4 text-left">Phone</th>
            <th className="py-3 px-4 text-left">Website</th>
          </tr>
        </thead>
        <tbody>
          {searchResults.map((result, index) => (
            <tr
              key={index}
              className="bg-gray-700 text-white hover:bg-gray-600"
            >
              <td className="py-3 px-4">{result.placeId}</td>
              <td className="py-3 px-4">{result.place_name}</td>
              <td className="py-3 px-4">
                {Array.isArray(result.category)
                  ? result.category.join(", ")
                  : result.category}
              </td>
              <td className="py-3 px-4">{result.address}</td>
              <td className="py-3 px-4">{result.rating}</td>
              <td className="py-3 px-4">{result.phone}</td>
              <td className="py-3 px-4">
                {result.website ? (
                  <a
                    href={result.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Visit
                  </a>
                ) : (
                  "N/A"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Download Button */}
      <div className="mt-4 text-center">
        <button
          onClick={downloadCSV}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
        >
          Download CSV
        </button>
      </div>
    </div>
  );
};

export default SearchResultsTable;
