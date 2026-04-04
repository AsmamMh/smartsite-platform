import { useAuthStore } from "@/app/store/authStore";
import axios from "axios";
import { AUTH_API_URL } from "@/lib/auth-api-url";

export const planingApi = axios.create({
  baseURL:
    process.env.VITE_PLANNING_URL || "http://localhost:3002",
  headers: {
    "Content-Type": "application/json",
  },
});

export const userApi = axios.create({
  baseURL: AUTH_API_URL,
  headers: { "Content-Type": "application/json" },
});

export const NotificationApi = axios.create({
  baseURL:
    process.env.VITE_NOTIFICATION_URL ||
    "http://localhost:3004/notification",
  headers: {
    "Content-Type": "application/json",
  },
});


userApi.interceptors.request.use((config) => {
  const token = useAuthStore.getState().user.access_token;
  console.log(token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


NotificationApi.interceptors.request.use((config) => {
  const token = useAuthStore.getState().user.access_token;
  console.log(token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
planingApi.interceptors.request.use((config) => {
  const token = useAuthStore.getState().user.access_token;
  console.log("interceptor token", token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
