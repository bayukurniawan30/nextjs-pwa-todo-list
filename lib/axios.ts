import Axios from "axios";
import { enqueueSnackbar } from "notistack";

export const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL;

const axios = Axios.create({
  withCredentials: true,
  headers: {
    "X-Requested-With": "XMLHttpRequest",
  },
  baseURL: baseURL,
});

axios.interceptors.response.use(
  (config) => {
    const token = localStorage.getItem("token"); // replace with your actual key

    // Set the Bearer token in the request headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  }
  // (error) => {
  //   const { config } = error;

  //   // Check if the request URL contains "/api/me"
  //   if (config.url && config.url.includes("/me")) {
  //     // Do something specific for requests to "/api/me" (e.g., don't show the snackbar)
  //     return Promise.reject(error);
  //   }

  //   console.log("Failed to process your request. Please try again");

  //   // Trigger an alert here (e.g., using a notification library or custom function)
  //   return Promise.reject(error);
  // }
);

export default axios;
