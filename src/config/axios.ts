import axios from "axios";

import { ERP_BASE } from "./api";

const apiClient = axios.create({
  baseURL: ERP_BASE,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,

});

apiClient.interceptors.request.use((config) => {
  const sid = localStorage.getItem("session_id");
  if (sid) {
    config.headers.Authorization = `Bearer ${sid}`;
  }
  return config;
});


apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem("sid");
    }
    return Promise.reject(error);
  }
);

export default apiClient;