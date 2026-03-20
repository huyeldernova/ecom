import { paymentApi } from './api';
import { ApiResponse } from '@/types/common.types';

export interface PaymentStatus {
  orderId: string;
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED';
  amount: number;
  currency: string;
}

export const paymentService = {
  // ─── Kiểm tra trạng thái payment ────────────────────────
  // Dùng sau khi Stripe redirect về return_url
  getPaymentStatus: async (orderId: string): Promise<PaymentStatus> => {
    // ✅ Phase 3:
    // const res = await paymentApi.get<ApiResponse<PaymentStatus>>(
    //   `/api/payment/status/${orderId}`
    // );
    // return res.data.data;

    // 🔶 Phase 1-2 mock:
    await new Promise((r) => setTimeout(r, 400));
    return {
      orderId,
      status: 'SUCCEEDED',
      amount: 0,
      currency: 'usd',
    };
  },

  // ─── Stripe confirmPayment được handle bởi Stripe SDK ───
  // Xem PaymentSection.tsx và Section 10 của build doc
  // KHÔNG tự implement card processing ở đây
};
