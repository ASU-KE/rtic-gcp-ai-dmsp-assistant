// TEST FILE for the Auth
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_DOMAIN,
  timeout: 2000,
});
