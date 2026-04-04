import axios, { AxiosInstance } from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';

// withLogout = true → chỉ dành cho authApi
// Các service khác trả 401 (cart chưa login, product không có quyền...) thì bỏ qua
const createApiInstance = (baseURL: string, withLogout = false): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
  });

  instance.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  instance.interceptors.response.use(
    (res) => res,
    (error) => {
      if (withLogout && error.response?.status === 401) {
        useAuthStore.getState().logout();
        useUIStore.getState().openAuthModal('login');
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// ✅ authApi: logout khi 401 (token hết hạn, sai token thật sự)
export const authApi = createApiInstance(
  process.env.NEXT_PUBLIC_AUTH_SERVICE_URL ?? 'http://localhost:8080/authentication',
  true
);

// ❌ Các service còn lại: KHÔNG logout khi 401
// (cart/product trả 401 khi user chưa login là bình thường)
export const productApi = createApiInstance(
  process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL ?? 'http://localhost:8081/product'
);
export const inventoryApi = createApiInstance(
  process.env.NEXT_PUBLIC_INVENTORY_SERVICE_URL ?? 'http://localhost:8082/inventory'
);
export const cartApi = createApiInstance(
  process.env.NEXT_PUBLIC_CART_SERVICE_URL ?? 'http://localhost:8083/cart'
);
export const orderApi = createApiInstance(
  process.env.NEXT_PUBLIC_ORDER_SERVICE_URL ?? 'http://localhost:8084/order'
);
export const paymentApi = createApiInstance(
  process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL ?? 'http://localhost:8085/payment'
);
export const profileApi = createApiInstance(
  process.env.NEXT_PUBLIC_PROFILE_SERVICE_URL ?? 'http://localhost:8086/profile'
);
export const fileApi = createApiInstance(
  process.env.NEXT_PUBLIC_FILE_SERVICE_URL ?? 'http://localhost:8087/file'
);