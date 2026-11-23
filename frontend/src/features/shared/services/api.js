import axios from "axios";

const PRODUCTION_API = "";

export const API_ROOT = (
  import.meta.env.VITE_API_URL || PRODUCTION_API
).replace(/\/+$/, "");

const api = axios.create({
  baseURL: API_ROOT,
  withCredentials: true,
});

export default api;
