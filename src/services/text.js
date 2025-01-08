import { useState, useEffect } from 'react';
import {
  fetchDetailsData,
  fetchSearchResults,
  getCityList,
  getCountryList,
} from './services/apiServices';
import CustomSelect from './CustomSelect';
import { toast, Toaster } from 'react-hot-toast';
import { Loader2, Download } from 'lucide-react';
import CampaignMethodSelect from './components/CampaignMethodSelect';
import CampaignLink from './components/CampaignLink';
import RecipientSelection from './components/RecipientSelection';

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
  const [currentStep, setCurrentStep] = useState(1);
  const [campaignMethod, setCampaignMethod] = useState('');
  const [campaignLink, setCampaignLink] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState([]);

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

    try {
      updateStepDetails(0, `Searching within ${rangeValue}km radius`);

      const searchResponse = await fetchSearchResults({
        radius1: 0,
        radius2: rangeValue * 1000, 
        center_lat: selectedCity.lat,
        center_lon: selectedCity.lon,
        query_string: queryString,
        limit: searchLimit,
      });

      let allPlaceIds = [];
      if (searchResponse && searchResponse.place_id_list) {
        allPlaceIds = searchResponse.place_id_list;
      }

      setSearchProgress(prev => ({ ...prev, activeStep: 1 }));
      updateStepDetails(1, `Fetching details for ${allPlaceIds.length} locations`);

      if (allPlaceIds.length > 0) {
        const response = await fetchDetailsData({
          place_id_list: allPlaceIds,
          center_loc: `${selectedCity.lat}, ${selectedCity.lon}`,
        });

        if (response.succesful_results) {
          const detailsMap = new Map(
            response.succesful_results.map((result) => [result.placeId, result])
          );

          const updatedResults = allPlaceIds.map((placeId) => {
            const details = detailsMap.get(placeId);
            return details ? { place_id: placeId, ...details } : { place_id: placeId };
          });

          setSearchResults(updatedResults);
          toast.success("Search completed successfully!");
          setSearchProgress(prev => ({ ...prev, activeStep: 2 }));
        }
      } else {
        toast.info("No results found in the specified range.");
      }
    } catch (error) {
      console.error(error);
      setError("An error occurred during the search or the API quota has been exceeded.");
      toast.error("The API quota has been exceeded.");
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

  const downloadCSV = () => {
    const headers = ['Name', 'Phone', 'Email', 'Address'];
    const csvContent = [
      headers.join(','),
      ...searchResults.map(result => [
        result.name || 'N/A',
        result.phone || 'N/A',
        result.email || 'N/A',
        result.address || 'N/A'
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'campaign_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV file downloaded successfully!');
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return searchResults.length > 0;
      case 2:
        return !!campaignMethod;
      case 3:
        return !!campaignLink;
      case 4:
        return selectedRecipients.length > 0;
      default:
        return false;
    }
  };

  const handleNextStep = () => {
    if (canProceedToNextStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const startCampaign = () => {
    // This will be handled by your API
    console.log({
      recipients: selectedRecipients,
      method: campaignMethod,
      link: campaignLink,
    });
    toast.success('Campaign started successfully!');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
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
                onChange={(e) => setRangeValue(parseFloat(e.target.value))}
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
              <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                <h3 className="text-lg font-medium text-white mb-4">Search Progress</h3>
                {searchProgress.steps.map((step, index) => (
                  <div key={index} className="mb-2">
                    <p className="text-gray-300">{step.label}</p>
                    {step.details && (
                      <p className="text-sm text-gray-400">{step.details}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {searchResults.length > 0 && (
              <button
                onClick={downloadCSV}
                className="flex items-center justify-center w-full p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Results as CSV
              </button>
            )}
          </div>
        );
      case 2:
        return (
          <CampaignMethodSelect
            selectedMethod={campaignMethod}
            onMethodSelect={setCampaignMethod}
          />
        );
      case 3:
        return <CampaignLink onLinkSubmit={setCampaignLink} />;
      case 4:
        return (
          <RecipientSelection
            recipients={searchResults}
            selectedRecipients={selectedRecipients}
            onRecipientSelect={setSelectedRecipients}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-6">
      <Toaster />
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center text-white mb-8">
          DoWell Campaign Management System
        </h1>

        <div className="flex justify-between mb-8">
          {[
            { step: 1, title: 'Select Location' },
            { step: 2, title: 'Choose Method' },
            { step: 3, title: 'Campaign Link' },
            { step: 4, title: 'Select Recipients' },
          ].map(({ step, title }) => (
            <div
              key={step}
              className={`flex items-center ${
                step !== 4 ? 'flex-1 after:content-[""] after:h-0.5 after:w-full after:bg-gray-300' : ''
              }`}
            >
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 
                  ${currentStep > step ? 'bg-green-500 border-green-500 text-white' :
                    currentStep === step ? 'border-blue-500 text-blue-500' :
                    'border-gray-300 text-gray-300'}`}
              >
                {step}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-500">{title}</span>
            </div>
          ))}
        </div>

        {error && <div className="text-red-500 text-center mb-4">{error}</div>}

        {renderStepContent()}

        <div className="flex justify-between mt-8">
          {currentStep > 1 && (
            <button
              onClick={handlePreviousStep}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Previous
            </button>
          )}
          {currentStep < 4 ? (
            <button
              onClick={handleNextStep}
              disabled={!canProceedToNextStep()}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
            >
              Next
            </button>
          ) : (
            <button
              onClick={startCampaign}
              disabled={!canProceedToNextStep()}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
            >
              Start Campaign
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;





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

    try {
      updateStepDetails(0, `Searching within ${rangeValue}km radius`);

      const searchResponse = await fetchSearchResults({
        radius1: 0,
        radius2: rangeValue * 1000, 
        center_lat: selectedCity.lat,
        center_lon: selectedCity.lon,
        query_string: queryString,
        limit: searchLimit,
      });

      let allPlaceIds = [];
      if (searchResponse && searchResponse.place_id_list) {
        allPlaceIds = searchResponse.place_id_list;
      }

      setSearchProgress(prev => ({ ...prev, activeStep: 1 }));
      updateStepDetails(1, `Fetching details for ${allPlaceIds.length} locations`);

      if (allPlaceIds.length > 0) {
        const response = await fetchDetailsData({
          place_id_list: allPlaceIds,
          center_loc: `${selectedCity.lat}, ${selectedCity.lon}`,
        });

        if (response.succesful_results) {
          const detailsMap = new Map(
            response.succesful_results.map((result) => [result.placeId, result])
          );

          const updatedResults = allPlaceIds.map((placeId) => {
            const details = detailsMap.get(placeId);
            return details ? { place_id: placeId, ...details } : { place_id: placeId };
          });

          setSearchResults(updatedResults);
          toast.success("Search completed successfully!");
          setSearchProgress(prev => ({ ...prev, activeStep: 2 }));
        }
      } else {
        toast.info("No results found in the specified range.");
      }
    } catch (error) {
      console.error(error);
      setError("An error occurred during the search or the API quota has been exceeded.");
      toast.error("The API quota has been exceeded.");
      setIsSearching(false);
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