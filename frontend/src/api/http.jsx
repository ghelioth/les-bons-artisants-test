import axios from "axios";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

http.interceptors.response.use(
  (res) => res,
  (err) => {
    // message d’erreur unifié
    const msg =
      err?.response?.data?.error?.message || err.message || "Network error";
    return Promise.reject(new Error(msg));
  }
);

export default http;
