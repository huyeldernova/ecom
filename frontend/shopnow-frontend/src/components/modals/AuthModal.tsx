'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Eye, EyeOff, CheckCircle, Loader2 } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/authService';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

// ─── Zod Schemas ──────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
  rememberMe: z.boolean().optional(),
});

const registerSchema = z.object({
  firstName: z.string().min(1, 'Vui lòng nhập họ'),
  lastName: z.string().min(1, 'Vui lòng nhập tên'),
  email: z.string().email('Email không hợp lệ'),
  password: z
    .string()
    .min(8, 'Mật khẩu tối thiểu 8 ký tự')
    .regex(/[A-Z]/, 'Phải có ít nhất 1 chữ hoa')
    .regex(/[0-9]/, 'Phải có ít nhất 1 số'),
  terms: z.literal(true, {
    errorMap: () => ({ message: 'Vui lòng đồng ý điều khoản' }),
  }),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

// ─── Password Strength Indicator ─────────────────────────
const getStrength = (pw: string): { score: number; label: string; color: string } => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: '', color: 'bg-gray-200' },
    { label: 'Yếu', color: 'bg-red-400' },
    { label: 'Trung bình', color: 'bg-amber-400' },
    { label: 'Mạnh', color: 'bg-blue-400' },
    { label: 'Rất mạnh', color: 'bg-green-500' },
  ];
  return { score, ...map[score] };
};

const PasswordStrength = ({ password }: { password: string }) => {
  if (!password) return null;
  const { score, label, color } = getStrength(password);
  return (
    <div className="space-y-1 mt-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors duration-300',
              i <= score ? color : 'bg-gray-200'
            )}
          />
        ))}
      </div>
      {label && <p className="text-xs text-mid-gray">{label}</p>}
    </div>
  );
};

// ─── Field Error ──────────────────────────────────────────
const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="text-xs text-red-500 mt-1">{message}</p> : null;

// ─── Password Input ───────────────────────────────────────
const PasswordInput = ({
  label,
  error,
  showStrength,
  watchValue,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  showStrength?: boolean;
  watchValue?: string;
}) => {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-navy">
        {label} <span className="text-primary">*</span>
      </label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          className={cn(
            'w-full px-4 py-2.5 pr-10 rounded-lg border text-sm text-navy',
            'placeholder:text-light-gray bg-white',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors',
            error ? 'border-red-400' : 'border-border'
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-light-gray hover:text-mid-gray"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {showStrength && <PasswordStrength password={watchValue ?? ''} />}
      <FieldError message={error} />
    </div>
  );
};

// ─── Login Tab ────────────────────────────────────────────
const LoginTab = ({ onSuccess }: { onSuccess: () => void }) => {
  const { login } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    try {
      const res = await authService.login({ email: data.email, password: data.password });
      // Phase 1-2: mock user
      login(res.accessToken, {
        id: 'mock-user-id',
        email: data.email,
        firstName: 'Nguyễn',
        lastName: 'Văn A',
        role: 'USER',
      });
      toast.success('Đăng nhập thành công! Chào mừng bạn trở lại 👋');
      onSuccess();
    } catch {
      toast.error('Email hoặc mật khẩu không đúng');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Email */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-navy">
          Email <span className="text-primary">*</span>
        </label>
        <input
          type="email"
          placeholder="you@example.com"
          {...register('email')}
          className={cn(
            'w-full px-4 py-2.5 rounded-lg border text-sm text-navy bg-white',
            'placeholder:text-light-gray focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors',
            errors.email ? 'border-red-400' : 'border-border'
          )}
        />
        <FieldError message={errors.email?.message} />
      </div>

      {/* Password */}
      <PasswordInput
        label="Mật khẩu"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register('password')}
      />

      {/* Remember + Forgot */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            {...register('rememberMe')}
            className="w-4 h-4 rounded accent-primary"
          />
          <span className="text-sm text-mid-gray">Ghi nhớ đăng nhập</span>
        </label>
        <button type="button" className="text-sm text-primary hover:underline">
          Quên mật khẩu?
        </button>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white font-semibold
                   rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
        {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </button>

      {/* Divider */}
      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs text-light-gray">hoặc tiếp tục với</span>
        </div>
      </div>

      {/* Social login — Phase 3 */}
      <div className="grid grid-cols-2 gap-3">
        {['Google', 'Facebook'].map((provider) => (
          <button
            key={provider}
            type="button"
            className="flex items-center justify-center gap-2 py-2.5 border border-border
                       rounded-lg text-sm font-medium text-mid-gray hover:bg-gray-50 transition-colors"
          >
            {provider === 'Google' ? '🇬' : '🇫'} {provider}
          </button>
        ))}
      </div>
    </form>
  );
};

// ─── Register Tab ─────────────────────────────────────────
const RegisterTab = ({ onSuccess }: { onSuccess: () => void }) => {
  const { login } = useAuthStore();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const passwordValue = watch('password');

  const onSubmit = async (data: RegisterForm) => {
    try {
      await authService.register({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });
      // Auto login after register (Phase 1-2 mock)
      login('mock-access-token', {
        id: 'mock-user-id',
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'USER',
      });
      toast.success('Đăng ký thành công! Chào mừng bạn đến với ShopNow 🎉');
      onSuccess();
    } catch {
      toast.error('Đã có lỗi xảy ra, vui lòng thử lại');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name row */}
      <div className="grid grid-cols-2 gap-3">
        {(['firstName', 'lastName'] as const).map((field) => (
          <div key={field} className="space-y-1">
            <label className="block text-sm font-medium text-navy">
              {field === 'firstName' ? 'Họ' : 'Tên'}{' '}
              <span className="text-primary">*</span>
            </label>
            <input
              placeholder={field === 'firstName' ? 'Nguyễn' : 'Văn A'}
              {...register(field)}
              className={cn(
                'w-full px-4 py-2.5 rounded-lg border text-sm text-navy bg-white',
                'placeholder:text-light-gray focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors',
                errors[field] ? 'border-red-400' : 'border-border'
              )}
            />
            <FieldError message={errors[field]?.message} />
          </div>
        ))}
      </div>

      {/* Email */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-navy">
          Email <span className="text-primary">*</span>
        </label>
        <input
          type="email"
          placeholder="you@example.com"
          {...register('email')}
          className={cn(
            'w-full px-4 py-2.5 rounded-lg border text-sm text-navy bg-white',
            'placeholder:text-light-gray focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors',
            errors.email ? 'border-red-400' : 'border-border'
          )}
        />
        <FieldError message={errors.email?.message} />
      </div>

      {/* Password */}
      <PasswordInput
        label="Mật khẩu"
        placeholder="Tối thiểu 8 ký tự"
        error={errors.password?.message}
        showStrength
        watchValue={passwordValue}
        {...register('password')}
      />

      {/* Terms */}
      <label className="flex items-start gap-2 cursor-pointer">
        <input
          type="checkbox"
          {...register('terms')}
          className="w-4 h-4 mt-0.5 rounded accent-primary shrink-0"
        />
        <span className="text-sm text-mid-gray leading-snug">
          Tôi đồng ý với{' '}
          <button type="button" className="text-primary hover:underline">
            Điều khoản sử dụng
          </button>{' '}
          và{' '}
          <button type="button" className="text-primary hover:underline">
            Chính sách bảo mật
          </button>
        </span>
      </label>
      <FieldError message={errors.terms?.message} />

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white font-semibold
                   rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
        {isSubmitting ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
      </button>
    </form>
  );
};

// ─── Success Screen ───────────────────────────────────────
const SuccessScreen = ({ onClose }: { onClose: () => void }) => (
  <div className="flex flex-col items-center justify-center py-10 text-center">
    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4 animate-scale-in">
      <CheckCircle className="w-8 h-8 text-green-500" />
    </div>
    <h3 className="font-head font-bold text-navy text-xl mb-1">Thành công!</h3>
    <p className="text-mid-gray text-sm mb-6">Đang chuyển hướng...</p>
    <button
      onClick={onClose}
      className="px-6 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors"
    >
      Tiếp tục mua sắm
    </button>
  </div>
);

// ─── Main AuthModal ───────────────────────────────────────
const AuthModal = () => {
  const { authModalOpen, authModalTab, closeAuthModal, openAuthModal } = useUIStore();
  const [success, setSuccess] = useState(false);

  // Reset success state on open
  useEffect(() => {
    if (authModalOpen) setSuccess(false);
  }, [authModalOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAuthModal();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [closeAuthModal]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = authModalOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [authModalOpen]);

  if (!authModalOpen) return null;

  const handleSuccess = () => {
    setSuccess(true);
    setTimeout(() => closeAuthModal(), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Overlay */}
      <div
        className="modal-overlay"
        onClick={closeAuthModal}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl z-10 animate-scale-in overflow-hidden">
        {/* Close button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-light-gray hover:text-navy hover:bg-gray-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="p-8">
            <SuccessScreen onClose={closeAuthModal} />
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-8 pt-8 pb-0">
              <h2 className="font-head font-bold text-2xl text-navy">
                {authModalTab === 'login' ? 'Chào mừng trở lại' : 'Tạo tài khoản'}
              </h2>
              <p className="text-mid-gray text-sm mt-1">
                {authModalTab === 'login'
                  ? 'Đăng nhập để tiếp tục mua sắm'
                  : 'Tham gia ShopNow để nhận ưu đãi độc quyền'}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex mx-8 mt-6 bg-background rounded-lg p-1">
              {(['login', 'register'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => openAuthModal(tab)}
                  className={cn(
                    'flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-200',
                    authModalTab === tab
                      ? 'bg-white text-navy shadow-sm'
                      : 'text-mid-gray hover:text-navy'
                  )}
                >
                  {tab === 'login' ? 'Đăng nhập' : 'Đăng ký'}
                </button>
              ))}
            </div>

            {/* Form content */}
            <div className="px-8 py-6">
              {authModalTab === 'login' ? (
                <LoginTab onSuccess={handleSuccess} />
              ) : (
                <RegisterTab onSuccess={handleSuccess} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
