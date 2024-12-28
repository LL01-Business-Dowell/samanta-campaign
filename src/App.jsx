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
import SearchStepper from "./SearchStepper";
import { Loader2 } from "lucide-react";



const App = () => {
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [rangeValue, setRangeValue] = useState(0);
  const [queryString, setQueryString] = useState("");
  const [searchLimit, setSearchLimit] = useState(20);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [searchProgress, setSearchProgress] = useState({
    activeStep: -1,
    steps: [
      {
        label: "Searching Locations",
        description: "Searching for places within the specified range",
        details: ""
      },
      {
        label: "Fetching Details",
        description: "Retrieving detailed information for found locations",
        details: ""
      }
    ]
  });
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Previous useEffects remain the same...
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

  const calculateRangeParts = (maxRange) => {
    const parts = [];
    const step = maxRange / 5;
    for (let i = 0; i < 5; i++) {
      parts.push({
        radius1: i * step,
        radius2: (i + 1) * step
      });
    }
    return parts;
  };

  const updateStepDetails = (step, details) => {
    setSearchProgress(prev => ({
      ...prev,
      steps: prev.steps.map((s, i) => 
        i === step ? { ...s, details } : s
      )
    }));
  };

  const processBatchSearch = async () => {
    if (!selectedCity) {
      toast.error("Please select a city before searching.");
      return;
    }

    setIsSearching(true);
    setSearchResults([]);
    setError(null);
    setSearchProgress(prev => ({ ...prev, activeStep: 0 }));

    const rangeParts = calculateRangeParts(parseFloat(rangeValue));
    let allPlaceIds = [];

    // First Step: Searching Locations
    for (let i = 0; i < rangeParts.length; i++) {
      try {
        const { radius1, radius2 } = rangeParts[i];
        updateStepDetails(0, 
          `Searching range ${(radius1).toFixed(1)}km to ${(radius2).toFixed(1)}km (${i + 1}/5)`
        );

        const batchResults = await fetchSearchResults({
          radius1: radius1 * 1000,
          radius2: radius2 * 1000,
          center_lat: selectedCity.lat,
          center_lon: selectedCity.lon,
          query_string: queryString,
          limit: searchLimit,
        });

        if (batchResults && batchResults.place_id_list) {
          allPlaceIds = [...allPlaceIds, ...batchResults.place_id_list];
        }
      } catch (error) {
        console.error(error);
        setError("An error occurred during the batch search or The API quota has been exceeded..");
        toast.error("The API quota has been exceeded..");
        setIsSearching(false);
        return;
      }
    }

    // Second Step: Fetching Details
    setSearchProgress(prev => ({ ...prev, activeStep: 1 }));
    updateStepDetails(1, `Fetching details for ${allPlaceIds.length} locations`);

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
          setSearchProgress(prev => ({ ...prev, activeStep: 2 }));
        }
      } catch (error) {
        console.error(error);
        setError("Failed to fetch detailed data.");
        toast.error("Failed to fetch detailed data.");
      }
    }

    setIsSearching(false);
  };

  const handleLimitChange = (value) => {
    const allowedLimits = [20, 40, 60];
    if (allowedLimits.includes(value)) {
      setSearchLimit(value);
    } else {
      toast.error("Please select either 20, 40, or 60 as the search limit.");
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
            Range (0-10.0 KM)
          </label>
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={rangeValue}
            onChange={(e) => setRangeValue(e.target.value)}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-gray-400 text-sm">
            <span>0 KM</span>
            <span>{rangeValue} KM</span>
            <span>10.0 KM</span>
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
          <select
            value={searchLimit}
            onChange={(e) => handleLimitChange(Number(e.target.value))}
            className="w-full p-4 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          >
            <option value={20}>20 results</option>
            <option value={40}>40 results</option>
            <option value={60}>60 results</option>
          </select>
        </div>

        <button
          onClick={processBatchSearch}
          disabled={!selectedCity || isSearching}
          className="w-full p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isSearching ? (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="animate-spin" />
              <span>Searching...</span>
            </div>
          ) : (
            "Search"
          )}
        </button>

        {searchProgress.activeStep >= 0 && (
          <SearchStepper
            activeStep={searchProgress.activeStep}
            steps={searchProgress.steps}
          />
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