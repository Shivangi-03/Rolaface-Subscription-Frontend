import axios from "axios";
import type { AxiosInstance } from "axios";
import { emitSessionExpired } from "../utils/SessionEvent";

const SID_KEY = "session_id";
const USER_KEY = "auth_user";

export const createAxiosInstance = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Clear session data
        localStorage.removeItem(SID_KEY);
        localStorage.removeItem(USER_KEY);

        // Notify app, only if user isn't already on the login page
        if (!window.location.pathname.includes("/login")) {
          emitSessionExpired();
        }
      }
      return Promise.reject(error);
    },
  );

  return instance;
};