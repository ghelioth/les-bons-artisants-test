import axios from "axios";


export function getToken() {
  return localStorage.getItem("token") || ""; // Récupère le token depuis le stockage local
}


export function setToken(token) {
  if (token) localStorage.setItem("token", token); // Stocke le token dans le stockage local
  else localStorage.removeItem("token"); // Supprime le token du stockage local
}

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    // message d’erreur unifié
    const msg =
      err?.response?.data?.error?.message || err.message || "Network error";
    const erreur = new Error(msg);
    erreur.status = status;
    // Gestion globale des erreurs 401 Unauthorized
    if (err.response?.status === 401) {
      erreur.code = 'unauthorized';
      setToken(null); // Supprime le token en cas d'erreur 401
      window.location.href = "/login"; // Redirige vers la page de connexion
    }
    return Promise.reject(new Error(msg));
  }
);

export default http;
