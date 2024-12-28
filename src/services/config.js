import axios from 'axios';

const countryAndCityDataBaseURL = "https://100074.pythonanywhere.com" 
const locationDataBaseURL = "https://100086.pythonanywhere.com"

const countryAndCityAxiosInstance = axios.create({
    baseURL: countryAndCityDataBaseURL
});

const locationAxiosInstance = axios.create({
    baseURL: locationDataBaseURL
});

export {
    countryAndCityAxiosInstance,
    locationAxiosInstance
}