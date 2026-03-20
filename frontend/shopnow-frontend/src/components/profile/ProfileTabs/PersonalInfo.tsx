'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Camera } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/components/ui/Toast';

const schema = z.object({
  firstName: z.string().min(1, 'Vui lòng nhập họ'),
  lastName: z.string().min(1, 'Vui lòng nhập tên'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const PersonalInfo = () => {
  const { user, login, accessToken } = useAuthStore();
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      email: user?.email ?? '',
      phone: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    if (user && accessToken) {
      login(accessToken, { ...user, firstName: data.firstName, lastName: data.lastName });
    }
    toast.success('Cập nhật thông tin thành công!');
    setSaving(false);
  };

  const fields = [
    { name: 'firstName' as const, label: 'Họ', placeholder: 'Nguyễn' },
    { name: 'lastName' as const, label: 'Tên', placeholder: 'Văn A' },
    { name: 'email' as const, label: 'Email', placeholder: 'you@example.com', type: 'email' },
    { name: 'phone' as const, label: 'Số điện thoại', placeholder: '0901234567', type: 'tel' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-head font-bold text-xl text-navy">Thông tin cá nhân</h2>
        <p className="text-mid-gray text-sm mt-1">Cập nhật thông tin hồ sơ của bạn</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold text-3xl">
              {user?.firstName?.[0] ?? 'U'}
            </span>
          </div>
          <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full
                             flex items-center justify-center shadow-md hover:bg-primary-dark transition-colors">
            <Camera className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
        <div>
          <p className="font-semibold text-navy">{user?.firstName} {user?.lastName}</p>
          <p className="text-sm text-mid-gray">{user?.email}</p>
          <span className="inline-block mt-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
            {user?.role}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          {fields.map((f) => (
            <div key={f.name} className="space-y-1.5">
              <label className="block text-sm font-medium text-navy">{f.label}</label>
              <input
                type={f.type ?? 'text'}
                placeholder={f.placeholder}
                {...register(f.name)}
                className="w-full px-4 py-2.5 rounded-xl border border-border text-sm text-navy
                           placeholder:text-light-gray bg-white focus:outline-none
                           focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
              {errors[f.name] && (
                <p className="text-xs text-red-500">{errors[f.name]?.message}</p>
              )}
            </div>
          ))}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving || !isDirty}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-dark
                       text-white font-semibold rounded-xl transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PersonalInfo;
