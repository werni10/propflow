'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/client';
import { User, Item } from '@/lib/types';

function NewBookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const itemId = searchParams.get('itemId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const quantity = searchParams.get('quantity') || '1';

  const [user, setUser] = useState<User | null>(null);
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'renter') {
      router.push('/auth/login');
      return;
    }
    setUser(currentUser);
    fetchItem();
  }

  async function fetchItem() {
    try {
      const res = await fetch(`/api/items?id=${itemId}`);
      const data = await res.json();
      setItem(data);
    } catch (err) {
      console.error('Failed to fetch item:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !item || !startDate || !endDate) return;

    setProcessing(true);

    try {
      const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
      const totalPrice = days * item.price_per_day * parseInt(quantity);

      const bookingRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: itemId,
          renter_id: user.id,
          decorator_id: item.decorator_id,
          start_date: startDate,
          end_date: endDate,
          quantity: parseInt(quantity),
          total_price: totalPrice,
        }),
      });

      if (!bookingRes.ok) throw new Error('Failed to create booking');
      const booking = await bookingRes.json();

      const paymentRes = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: booking.id,
          amount: totalPrice,
          user_id: user.id,
          user_email: user.email,
        }),
      });

      if (!paymentRes.ok) throw new Error('Failed to process payment');
      const paymentData = await paymentRes.json();

      window.location.href = paymentData.checkout_url;
    } catch (err) {
      alert(String(err));
    } finally {
      setProcessing(false);
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user || !item) return null;

  const days = startDate && endDate ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const totalPrice = days * item.price_per_day * parseInt(quantity);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-orange-600">PropFlow</Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Confirm booking</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-4">Booking details</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Item</span>
                    <span className="font-semibold">{item.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-in</span>
                    <span className="font-semibold">{startDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-out</span>
                    <span className="font-semibold">{endDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity</span>
                    <span className="font-semibold">{quantity}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between">
                    <span className="text-gray-600">Total nights</span>
                    <span className="font-semibold">{days}</span>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4">Your details</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name</span>
                    <span className="font-semibold">{user.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email</span>
                    <span className="font-semibold">{user.email}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={processing}
                className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Proceed to payment'}
              </button>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="font-bold mb-4">Price breakdown</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>{item.price_per_day} DHS × {days} nights × {quantity}</span>
                  <span>{totalPrice} DHS</span>
                </div>
                {item.deposit_required && (
                  <div className="flex justify-between">
                    <span>Deposit</span>
                    <span>{item.deposit_amount} DHS</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between font-bold">
                  <span>Total</span>
                  <span>{totalPrice + (item.deposit_required ? item.deposit_amount || 0 : 0)} DHS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function NewBooking() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <NewBookingForm />
    </Suspense>
  );
}
