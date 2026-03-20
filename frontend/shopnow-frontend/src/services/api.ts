import axios, { AxiosInstance } from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';

// ─── Factory: tạo axios instance riêng cho từng service ───
const createApiInstance = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
  });

  // Request interceptor — tự động attach JWT
  instance.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  // Response interceptor — xử lý lỗi chung
  instance.interceptors.response.use(
    (res) => res,
    (error) => {
      if (error.response?.status === 401) {
        useAuthStore.getState().logout();
        useUIStore.getState().openAuthModal('login');
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// ─── Một instance cho mỗi microservice ───────────────────
export const authApi = createApiInstance(
  process.env.NEXT_PUBLIC_AUTH_SERVICE_URL ?? 'http://localhost:8080'
);
export const productApi = createApiInstance(
  process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL ?? 'http://localhost:8081'
);
export const cartApi = createApiInstance(
  process.env.NEXT_PUBLIC_CART_SERVICE_URL ?? 'http://localhost:8082'
);
export const orderApi = createApiInstance(
  process.env.NEXT_PUBLIC_ORDER_SERVICE_URL ?? 'http://localhost:8083'
);
export const inventoryApi = createApiInstance(
  process.env.NEXT_PUBLIC_INVENTORY_SERVICE_URL ?? 'http://localhost:8084'
);
export const paymentApi = createApiInstance(
  process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL ?? 'http://localhost:8085'
);
