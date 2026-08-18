import axios from "axios";
import { API_BASE_URL } from "./constants";
import { useAuthStore } from "@/store/authStore";

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingRequests: Array<() => void> = [];

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes("/auth/refresh")) {
      useAuthStore.getState().logout();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve) => {
        pendingRequests.push(() => resolve(axiosClient(originalRequest)));
      });
    }

    isRefreshing = true;

    try {
      const { data } = await axiosClient.post("/auth/refresh");
      useAuthStore.getState().setAccessToken(data.token);

      pendingRequests.forEach((callback) => callback());
      pendingRequests = [];

      return axiosClient(originalRequest);
    } catch (refreshError) {
      useAuthStore.getState().logout();
      pendingRequests = [];
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);