import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

// =========================================================
// REQUEST INTERCEPTOR
// =========================================================

axiosClient.interceptors.request.use(
  (config) => {

    // -----------------------------------------------------
    // AUTHENTICATION TOKEN
    // -----------------------------------------------------

    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("accessToken");

    if (token) {
      config.headers = config.headers || {};

      config.headers.Authorization = `Bearer ${token}`;
    }

    // -----------------------------------------------------
    // CONTENT TYPE
    // -----------------------------------------------------

    config.headers = config.headers || {};

    // If Content-Type was already explicitly provided
    // (for example, login uses form-urlencoded),
    // don't overwrite it.
    if (!config.headers["Content-Type"] &&
        !config.headers["content-type"]) {

      if (config.data instanceof FormData) {

        // Let Axios/browser set multipart/form-data
        // with the correct boundary.

        delete config.headers["Content-Type"];
        delete config.headers["content-type"];

      } else {

        // Normal API requests use JSON.
        config.headers["Content-Type"] = "application/json";
      }
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);


// =========================================================
// RESPONSE INTERCEPTOR
// =========================================================

axiosClient.interceptors.response.use(

  (response) => {
    return response;
  },

  (error) => {

    if (error.response?.status === 401) {

      console.error(
        "Authentication failed:",
        error.response?.data
      );

      // Do not automatically remove the token.
    }

    return Promise.reject(error);
  }
);


export default axiosClient;