import { authApi, profileApi } from './api';
import { ApiResponse } from '@/types/common.types';
import { LoginRequest, LoginResponse, RegisterRequest, User } from '@/types/auth.types';

export const authService = {
  // ─── Login ───────────────────────────────────────────────
  login: async (req: LoginRequest): Promise<LoginResponse> => {
    const res = await authApi.post<ApiResponse<LoginResponse>>('/api/v1/auth/login', req);
    return res.data.data;
  },

  register: async (req: RegisterRequest): Promise<void> => {
    await authApi.post('/api/v1/users/register', req);
  },

  // ─── Logout ──────────────────────────────────────────────
  logout: async (token: string): Promise<void> => {
    await authApi.post('/api/v1/auth/logout', null, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },


  getMe: async (): Promise<User> => {
    const res = await profileApi.get<ApiResponse<{
      id: string;
      firstName: string;
      lastName: string;
      userName: string;
    }>>('/api/v1/profiles/me');
    const profile = res.data.data;

    return {
      id: profile.id,
      email: '',
      firstName: profile.firstName ?? '',
      lastName: profile.lastName ?? '',
      role: 'USER',
    };
  },
};