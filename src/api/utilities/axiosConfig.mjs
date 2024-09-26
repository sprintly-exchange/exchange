
import axios from 'axios';


// Create an Axios instance
export const axiosInstance = axios.create({
  baseURL: ``, // Replace with your API base URL
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {

    return config;
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Optionally, you can add a response interceptor as well
axiosInstance.interceptors.response.use(
  (response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    return response;
  },
  (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    return Promise.reject(error);
  }
);


