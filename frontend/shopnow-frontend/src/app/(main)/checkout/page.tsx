'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronRight, MapPin, Truck, CreditCard, CheckCircle, Lock, Loader2 } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { formatPrice } from '@/lib/utils';
import { ShippingAddress } from '@/types/common.types';
import { ShippingMethod } from '@/types/order.types';
import { orderService } from '@/services/orderService';
import { toast } from '@/components/ui/Toast';
import { useCartStore } from '@/stores/cartStore';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// ─── Schemas ──────────────────────────────────────────────
const shippingSchema = z.object({
  firstName: z.string().min(1, 'Vui lòng nhập họ'),
  lastName: z.string().min(1, 'Vui lòng nhập tên'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().min(10, 'Số điện thoại không hợp lệ'),
  street: z.string().min(1, 'Vui lòng nhập địa chỉ'),
  city: z.string().min(1, 'Vui lòng nhập thành phố'),
  state: z.string().min(1, 'Vui lòng nhập tỉnh/thành'),
  zipCode: z.string().min(1, 'Vui lòng nhập mã bưu điện'),
  country: z.string().min(1, 'Vui lòng nhập quốc gia'),
});


type ShippingFormData = z.infer<typeof shippingSchema>;

const SHIPPING_OPTIONS = [
  { id: 'standard' as ShippingMethod, label: 'Giao hàng tiêu chuẩn', desc: '3-5 ngày làm việc', price: 0 },
  { id: 'express' as ShippingMethod, label: 'Giao hàng nhanh', desc: '1-2 ngày làm việc', price: 9.99 },
  { id: 'overnight' as ShippingMethod, label: 'Giao hàng trong ngày', desc: 'Nhận hàng hôm nay', price: 19.99 },
];

// ─── Step indicator ───────────────────────────────────────
const Steps = ({ current }: { current: number }) => {
  const steps = [
    { icon: <MapPin className="w-4 h-4" />, label: 'Địa chỉ' },
    { icon: <Truck className="w-4 h-4" />, label: 'Vận chuyển' },
    { icon: <CreditCard className="w-4 h-4" />, label: 'Thanh toán' },
  ];
  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-0">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            i + 1 === current ? 'bg-primary text-white' :
            i + 1 < current ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-mid-gray'
          }`}>
            {i + 1 < current ? <CheckCircle className="w-4 h-4" /> : step.icon}
            <span className="hidden sm:inline">{step.label}</span>
          </div>
          {i < steps.length - 1 && (
            <ChevronRight className="w-4 h-4 text-gray-300 mx-1" />
          )}
        </div>
      ))}
    </div>
  );
};

// ─── Order Summary sidebar ────────────────────────────────
const OrderSummary = ({ shippingCost }: { shippingCost: number }) => {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.totalAmount());
  const total = subtotal + shippingCost;

  return (
    <div className="bg-white rounded-2xl border border-border p-5 space-y-4 sticky top-24">
      <h3 className="font-head font-bold text-navy">Đơn hàng của bạn</h3>
      <div className="space-y-2 max-h-52 overflow-y-auto">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-background border border-border overflow-hidden shrink-0">
              {item.imageUrl
                ? <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                : <span className="w-full h-full flex items-center justify-center text-lg">🛍️</span>
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-navy font-medium truncate">{item.productName}</p>
              <p className="text-xs text-mid-gray">{item.variantName} × {item.quantity}</p>
            </div>
            <span className="text-sm font-semibold text-navy shrink-0">
              {formatPrice(item.snapshotPrice * item.quantity)}
            </span>
          </div>
        ))}
      </div>
      <div className="border-t border-border pt-3 space-y-2 text-sm">
        <div className="flex justify-between text-mid-gray">
          <span>Tạm tính</span>
          <span className="text-navy font-medium">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-mid-gray">
          <span>Vận chuyển</span>
          <span className={shippingCost === 0 ? 'text-green-600 font-medium' : 'text-navy font-medium'}>
            {shippingCost === 0 ? 'Miễn phí' : formatPrice(shippingCost)}
          </span>
        </div>
        <div className="flex justify-between font-bold text-navy text-base border-t border-border pt-2">
          <span>Tổng cộng</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
};

// ─── Field helper ─────────────────────────────────────────
const Field = ({ label, error, children }: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-navy">{label}</label>
    {children}
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const inputCls = (hasError?: boolean) =>
  `w-full px-4 py-2.5 rounded-xl border text-sm text-navy placeholder:text-light-gray bg-white
   focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors
   ${hasError ? 'border-red-400' : 'border-border'}`;

// ─── Payment Form ─────────────────────────────────────────
const PaymentForm = ({ orderId }: { orderId: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const clearCart = useCartStore((s) => s.clearCart);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setPaying(true);
    setErrorMsg('');

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/orders?payment=success`,
      },
    });

    if (error) {
      setErrorMsg(error.message ?? 'Thanh toán thất bại');
      setPaying(false);
    } else {
      clearCart();
    }
  };

  return (
    <div className="space-y-4">
      <PaymentElement />
      {errorMsg && (
        <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{errorMsg}</p>
      )}
      <button
        onClick={handlePay}
        disabled={!stripe || paying}
        className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl
                   transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {paying ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý...</>
        ) : (
          <><Lock className="w-4 h-4" /> Thanh toán an toàn</>
        )}
      </button>
      <p className="text-xs text-center text-mid-gray">
        🔒 Thông tin thẻ được mã hóa bởi Stripe. ShopNow không lưu số thẻ của bạn.
      </p>
    </div>
  );
};

// ─── Main Checkout page ───────────────────────────────────
export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const [step, setStep] = useState(1);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('standard');
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [creatingOrder, setCreatingOrder] = useState(false);

  const selectedShipping = SHIPPING_OPTIONS.find((o) => o.id === shippingMethod)!;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingFormData>({ resolver: zodResolver(shippingSchema) });

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-2xl mb-3">🛒</p>
        <h2 className="font-head font-bold text-xl text-navy mb-2">Giỏ hàng trống</h2>
        <Link href="/products" className="text-primary hover:underline">Tiếp tục mua sắm →</Link>
      </div>
    );
  }

  const onShippingSubmit = (data: ShippingFormData) => {
    setShippingAddress(data as ShippingAddress);
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

const handleProceedToPayment = async () => {
  if (!shippingAddress) return;
  setCreatingOrder(true);
  try {
    // Bước 1: Tạo order
    const order = await orderService.createOrder({
      shippingAddress,
      note: '',
    });

    // Bước 2: Checkout → lấy clientSecret
    const checkoutOrder = await orderService.checkout(order.id);

    setOrderId(checkoutOrder.id);
    setClientSecret(checkoutOrder.clientSecret ?? null);
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch {
    toast.error('Không thể tạo đơn hàng. Vui lòng thử lại.');
  } finally {
    setCreatingOrder(false);
  }
};

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-mid-gray mb-6">
        <Link href="/cart" className="hover:text-primary">Giỏ hàng</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-navy font-medium">Thanh toán</span>
      </nav>

      <div className="mb-8"><Steps current={step} /></div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left - Form */}
        <div className="lg:col-span-2 space-y-6">

          {/* Step 1: Shipping address */}
          {step >= 1 && (
            <div className="bg-white rounded-2xl border border-border p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                  step > 1 ? 'bg-green-500 text-white' : 'bg-primary text-white'
                }`}>
                  {step > 1 ? <CheckCircle className="w-4 h-4" /> : '1'}
                </div>
                <h2 className="font-head font-bold text-navy">Địa chỉ giao hàng</h2>
              </div>

              {step > 1 && shippingAddress ? (
                <div className="flex items-start justify-between">
                  <div className="text-sm text-mid-gray">
                    <p className="font-semibold text-navy">{shippingAddress.firstName} {shippingAddress.lastName}</p>
                    <p>{shippingAddress.street}, {shippingAddress.city}</p>
                    <p>{shippingAddress.phone}</p>
                  </div>
                  <button onClick={() => setStep(1)} className="text-xs text-primary hover:underline font-medium">
                    Thay đổi
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onShippingSubmit)} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Họ" error={errors.firstName?.message}>
                      <input {...register('firstName')} placeholder="Nguyễn" className={inputCls(!!errors.firstName)} />
                    </Field>
                    <Field label="Tên" error={errors.lastName?.message}>
                      <input {...register('lastName')} placeholder="Văn A" className={inputCls(!!errors.lastName)} />
                    </Field>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Email" error={errors.email?.message}>
                      <input type="email" {...register('email')} placeholder="you@example.com" className={inputCls(!!errors.email)} />
                    </Field>
                    <Field label="Số điện thoại" error={errors.phone?.message}>
                      <input type="tel" {...register('phone')} placeholder="0901234567" className={inputCls(!!errors.phone)} />
                    </Field>
                  </div>
                  <Field label="Địa chỉ" error={errors.street?.message}>
                    <input {...register('street')} placeholder="123 Nguyễn Huệ" className={inputCls(!!errors.street)} />
                  </Field>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <Field label="Thành phố" error={errors.city?.message}>
                      <input {...register('city')} placeholder="Hồ Chí Minh" className={inputCls(!!errors.city)} />
                    </Field>
                    <Field label="Tỉnh/Thành" error={errors.state?.message}>
                      <input {...register('state')} placeholder="HCM" className={inputCls(!!errors.state)} />
                    </Field>
                    <Field label="Mã bưu điện" error={errors.zipCode?.message}>
                      <input {...register('zipCode')} placeholder="700000" className={inputCls(!!errors.zipCode)} />
                    </Field>
                  </div>
                  <Field label="Quốc gia" error={errors.country?.message}>
                    <input {...register('country')} placeholder="Vietnam" defaultValue="Vietnam" className={inputCls(!!errors.country)} />
                  </Field>
                  <button
                    type="submit"
                    className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors"
                  >
                    Tiếp tục
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Step 2: Shipping method */}
          {step >= 2 && (
            <div className="bg-white rounded-2xl border border-border p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                  step > 2 ? 'bg-green-500 text-white' : 'bg-primary text-white'
                }`}>
                  {step > 2 ? <CheckCircle className="w-4 h-4" /> : '2'}
                </div>
                <h2 className="font-head font-bold text-navy">Phương thức vận chuyển</h2>
              </div>
              <div className="space-y-3">
                {SHIPPING_OPTIONS.map((opt) => (
                  <label key={opt.id} className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    shippingMethod === opt.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                  }`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shipping"
                        value={opt.id}
                        checked={shippingMethod === opt.id}
                        onChange={() => setShippingMethod(opt.id)}
                        className="accent-primary"
                      />
                      <div>
                        <p className="font-semibold text-navy text-sm">{opt.label}</p>
                        <p className="text-xs text-mid-gray">{opt.desc}</p>
                      </div>
                    </div>
                    <span className="font-bold text-navy">
                      {opt.price === 0
                        ? <span className="text-green-600">Miễn phí</span>
                        : formatPrice(opt.price)
                      }
                    </span>
                  </label>
                ))}
              </div>
              {/* ✅ Tạo order thật khi bấm tiếp tục */}
              <button
                onClick={handleProceedToPayment}
                disabled={creatingOrder}
                className="w-full mt-4 py-3 bg-primary hover:bg-primary-dark text-white font-semibold
                           rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {creatingOrder
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang tạo đơn hàng...</>
                  : 'Tiếp tục'
                }
              </button>
            </div>
          )}

          {/* Step 3: Payment — Stripe Elements */}
          {step >= 3 && clientSecret && (
            <div className="bg-white rounded-2xl border border-border p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <h2 className="font-head font-bold text-navy">Thanh toán</h2>
              </div>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm orderId={orderId!} />
              </Elements>
            </div>
          )}

        </div>

        {/* Right - Summary */}
        <div className="lg:col-span-1">
          <OrderSummary shippingCost={selectedShipping.price} />
        </div>
      </div>
    </div>
  );
}