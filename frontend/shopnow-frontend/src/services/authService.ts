import { authApi } from './api';
import { ApiResponse } from '@/types/common.types';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
} from '@/types/auth.types';

export const authService = {
  // ─── Login ───────────────────────────────────────────────
  login: async (req: LoginRequest): Promise<LoginResponse> => {
    // ✅ Phase 3: uncomment dòng dưới, xóa mock return
    // const res = await authApi.post<ApiResponse<LoginResponse>>('/api/v1/auth/login', req);
    // return res.data.data;

    // 🔶 Phase 1-2 mock:
    await new Promise((r) => setTimeout(r, 600)); // giả lập network delay
    if (req.email && req.password) {
      return { accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token' };
    }
    throw new Error('Invalid credentials');
  },

  // ─── Register ────────────────────────────────────────────
  register: async (req: RegisterRequest): Promise<void> => {
    // ✅ Phase 3: await authApi.post('/api/v1/auth/register', req);

    // 🔶 Phase 1-2 mock:
    await new Promise((r) => setTimeout(r, 800));
    if (!req.email || !req.password) throw new Error('Invalid data');
  },

  // ─── Logout ──────────────────────────────────────────────
  logout: async (token: string): Promise<void> => {
    // ✅ Phase 3:
    // await authApi.post('/api/v1/auth/logout', null, {
    //   headers: { Authorization: `Bearer ${token}` },
    // });

    // 🔶 Phase 1-2 mock:
    await new Promise((r) => setTimeout(r, 300));
  },

  // ─── Get current user ────────────────────────────────────
  getMe: async (): Promise<User> => {
    // ✅ Phase 3:
    // const res = await authApi.get<ApiResponse<User>>('/api/v1/auth/me');
    // return res.data.data;

    // 🔶 Phase 1-2 mock:
    return {
      id: 'mock-user-id',
      email: 'user@shopnow.com',
      firstName: 'Nguyễn',
      lastName: 'Văn A',
      role: 'USER',
    };
  },
};
