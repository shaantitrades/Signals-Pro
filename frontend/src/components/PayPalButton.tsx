'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

// ----------------------------------------------------------------------------
// PayPal recurring payment (Subscriptions API).
// Redirect flow, consistent with Stripe Checkout and NOWPayments:
//  1. POST /api/paypal/create-subscription  ->  approveUrl
//  2. Redirect the user to PayPal to approve the subscription
//  3. PayPal returns to /dashboard/signals?payment=success (or /tarifs?payment=cancelled)
//  4. The webhook activates the local subscription
// ----------------------------------------------------------------------------

interface PayPalButtonProps {
  planSlug: string;
  disabled?: boolean;
  onError: (message: string) => void;
}

export default function PayPalButton({
  planSlug,
  disabled,
  onError,
}: PayPalButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) {
      window.location.href = '/register';
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/paypal/create-subscription', { planSlug });
      const approveUrl = res.data?.data?.approveUrl;
      if (approveUrl) {
        window.location.href = approveUrl;
      } else {
        onError('Could not start the PayPal subscription. Please try again.');
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        'PayPal payment could not be started.';
      onError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className="flex items-center justify-center gap-2 w-full bg-[#003087] hover:bg-[#00205c] disabled:opacity-60 text-white rounded-lg px-4 py-2.5 transition-colors cursor-pointer font-semibold"
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
      ) : (
        <span className="italic font-bold tracking-tight">
          Pay<span className="text-[#009cde]">Pal</span>
        </span>
      )}
    </button>
  );
}
