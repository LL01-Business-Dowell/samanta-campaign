import { useState, useEffect } from "react";
import {
  fetchDetailsData,
  fetchSearchResults,
  getCityList,
  getCountryList,
} from "./services/apiServices";
import CustomSelect from "./CustomSelect";
import SearchResultsTable from "./SearchResultsTable";
import { toast, Toaster } from "react-hot-toast";

const App = () => {
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [rangeValue, setRangeValue] = useState(0);
  const [queryString, setQueryString] = useState("");
  const [searchLimit, setSearchLimit] = useState(40);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [batchProgress, setBatchProgress] = useState({
    completed: 0,
    total: 0,
  });
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);

  // Fetch countries on initial load
  useEffect(() => {
    const fetchCountries = async () => {
      setLoadingCountries(true);
      try {
        const response = await getCountryList();
        setCountries(response);
        toast.success("Countries loaded successfully!");
      } catch (error) {
        console.error("Error fetching countries:", error);
        setError("Failed to load countries.");
        toast.error("Failed to load countries.");
      }
      setLoadingCountries(false);
    };
    fetchCountries();
  }, []);

  // Fetch cities based on selected country
  useEffect(() => {
    if (selectedCountry) {
      const fetchCities = async () => {
        setLoadingCities(true);
        setCities([]);
        setSelectedCity(null);
        try {
          const response = await getCityList({
            country: selectedCountry.name,
            query: "all",
            limit: 10000,
            offset: 0,
          });
          setCities(response.data.slice(1));
          toast.success("Cities loaded successfully!");
        } catch (error) {
          console.error("Error fetching cities:", error);
          setError("Failed to load cities.");
          toast.error("Failed to load cities.");
        }
        setLoadingCities(false);
      };
      fetchCities();
    }
  }, [selectedCountry]);

  const processBatchSearch = async () => {
    if (!selectedCity) {
      toast.error("Please select a city before searching.");
      return;
    }

    const batchSize = 20;
    const totalBatches = Math.ceil(searchLimit / batchSize);
    setBatchProgress({ completed: 0, total: totalBatches });
    setSearchResults([]); // Clear previous results
    setError(null);

    let allPlaceIds = [];

    // First phase: Collect all place IDs
    for (let i = 0; i < totalBatches; i++) {
      try {
        const batchResults = await fetchSearchResults({
          radius1: 0,
          radius2: parseInt(rangeValue),
          center_lat: selectedCity.lat,
          center_lon: selectedCity.lon,
          query_string: queryString,
          limit: batchSize,
        });

        if (batchResults && batchResults.place_id_list) {
          allPlaceIds = [...allPlaceIds, ...batchResults.place_id_list];
        }

        setBatchProgress((prev) => ({ ...prev, completed: i + 1 }));
      } catch (error) {
        console.log(error);
        
        setError("An error occurred during the batch search.",);
        toast.error("An error occurred during the batch search.");
        break;
      }
    }

    if (allPlaceIds.length > 0) {
      try {
        const response = await fetchDetailsData({
          place_ids: allPlaceIds,
          center_loc: `${selectedCity.lat}, ${selectedCity.lon}`,
        });
        const data = await response.json();

        if (data.succesful_results) {
          const detailsMap = new Map(
            data.succesful_results.map((result) => [result.placeId, result])
          );

          const updatedResults = allPlaceIds.map((placeId) => {
            const details = detailsMap.get(placeId);
            return details ? { place_id: placeId, ...details } : { place_id: placeId };
          });

          setSearchResults(updatedResults);
          toast.success("Search completed successfully!");
        }
      } catch (error) {
        console.log(error);
        
        setError("Failed to fetch detailed data.");
        toast.error("Failed to fetch detailed data.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-6">
      <Toaster reverseOrder={false} />
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center text-white mb-8">
          DoWell Samanta Campaign AI
        </h1>

        {error && <div className="text-red-500 text-center mb-4">{error}</div>}

        <CustomSelect
          options={countries}
          value={selectedCountry}
          onChange={setSelectedCountry}
          placeholder="Select a Country"
          loading={loadingCountries}
          disabled={loadingCountries}
        />

        <CustomSelect
          options={cities}
          value={selectedCity}
          onChange={setSelectedCity}
          placeholder="Select a City"
          loading={loadingCities}
          disabled={!selectedCountry || loadingCities}
        />

        <div className="space-y-4">
          <label className="block text-white text-sm font-medium">
            Range (0-10000)
          </label>
          <input
            type="range"
            min="0"
            max="10000"
            value={rangeValue}
            onChange={(e) => setRangeValue(e.target.value)}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-gray-400 text-sm">
            <span>0</span>
            <span>{rangeValue}</span>
            <span>10000</span>
          </div>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Enter search query"
            value={queryString}
            onChange={(e) => setQueryString(e.target.value)}
            className="w-full p-4 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="Search limit"
            value={searchLimit}
            onChange={(e) => setSearchLimit(Number(e.target.value))}
            min="1"
            max="100"
            className="w-full p-4 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={processBatchSearch}
          disabled={!selectedCity}
          className="w-full p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          Search
        </button>

        {batchProgress.total > 0 && (
          <div className="space-y-2">
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-500"
                style={{
                  width: `${
                    (batchProgress.completed / batchProgress.total) * 100
                  }%`,
                }}
              />
            </div>
            <p className="text-center text-gray-400">
              Processing batch {batchProgress.completed} of{" "}
              {batchProgress.total}
            </p>
          </div>
        )}

        {searchResults.length > 0 ? (
          <div className="text-white">
            <p>Number of results: {searchResults.length}</p>
            <SearchResultsTable searchResults={searchResults} />
          </div>
        ) : (
          <p className="text-gray-400">No results found</p>
        )}
      </div>
    </div>
  );
};

export default App;
