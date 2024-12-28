import { countryAndCityAxiosInstance, locationAxiosInstance } from "./config";

const googleAPIKey = import.meta.env.VITE_GOOGLE_API_KEY;


const apiKey = import.meta.env.VITE_API_KEY;




export const getCountryList = async () => {
    const response = await countryAndCityAxiosInstance.post(`/get-countries-v3/?api_key=${apiKey}`);
    const countries = response.data?.data[0]?.countries || [];
    return countries.map((country) => ({ name: country }));
  };

export const getCityList = async (data) => {
    const response = await countryAndCityAxiosInstance.post(`/get-coords-v3/?api_key=${apiKey}`, data);
    return response.data;
}

export const fetchSearchResults = async (data) => {
    const updatedData = {
        ...data,       
        api_key: googleAPIKey, 
    };
    const response = await locationAxiosInstance.post(`/accounts/get-local-nearby-v2/`, updatedData);
    return response.data;
}

export const fetchDetailsData = async (data) => {
    const updatedData = {
        ...data,       
        api_key: googleAPIKey, 
    };
    const response = await locationAxiosInstance.post('/accounts/get-details-list-stage1/',updatedData);
    return response.data;
}