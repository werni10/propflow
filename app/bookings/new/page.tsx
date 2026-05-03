'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/client';
import { User, Item } from '@/lib/types';

function BookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const itemId    = searchParams.get('itemId');
  const startDate = searchParams.get('startDate');
  const endDate   = searchParams.get('endDate');
  const quantity  = searchParams.get('quantity') || '1';

  const [user, setUser]         = useState<User | null>(null);
  const [item, setItem]         = useState<Item | null>(null);
  const [loading, setLoading]   = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => { checkAuth(); }, []);

  async function checkAuth() {
    const u = await getCurrentUser();
    if (!u || u.role !== 'renter') { router.push('/auth/login'); return; }
    setUser(u);
    try {
      const res = await fetch(`/api/items?id=${itemId}`);
      setItem(await res.json());
    } catch {}
    setLoading(false);
  }

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !item || !startDate || !endDate) return;
    setProcessing(true);
    try {
      const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000);
      const totalPrice = days * item.price_per_day * parseInt(quantity);
      const bookingRes = await fetch('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ item_id: itemId, renter_id: user.id, decorator_id: item.decorator_id, start_date: startDate, end_date: endDate, quantity: parseInt(quantity), total_price: totalPrice }) });
      if (!bookingRes.ok) throw new Error('Booking failed');
      const booking = await bookingRes.json();
      const payRes = await fetch('/api/payments/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ booking_id: booking.id, amount: totalPrice, user_id: user.id, user_email: user.email }) });
      if (!payRes.ok) throw new Error('Payment failed');
      const { checkout_url } = await payRes.json();
      window.location.href = checkout_url;
    } catch (err) { alert(String(err)); }
    finally { setProcessing(false); }
  }

  if (loading) return <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontFamily: 'Barlow Condensed', letterSpacing: '0.15em', textTransform: 'uppercase', fontSize: 13 }}>Loading...</div>;
  if (!user || !item) return null;

  const days  = startDate && endDate ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000) : 0;
  const total = days * item.price_per_day * parseInt(quantity);
  const grandTotal = total + (item.deposit_required ? item.deposit_amount || 0 : 0);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <nav style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-void)', height: 56, display: 'flex', alignItems: 'center', padding: '0 32px', gap: 16 }}>
        <Link href="/" style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 700, color: 'var(--gold)', textDecoration: 'none' }}>PropFlow</Link>
        <span style={{ color: 'var(--border)' }}>/</span>
        <span style={{ fontFamily: 'Barlow Condensed', fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Checkout</span>
      </nav>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 40 }}>
        {/* Left */}
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 36, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Confirm Booking</h1>
          <p style={{ fontFamily: 'Barlow', fontSize: 14, color: 'var(--text-sub)', marginBottom: 40 }}>Review your booking details before proceeding to payment.</p>

          <div className="divider-gold" style={{ marginBottom: 40 }} />

          {/* Booking details */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 2, marginBottom: 24, overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
              <span style={{ fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Prop</span>
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', gap: 20, alignItems: 'center' }}>
              <div style={{ width: 80, height: 60, background: 'var(--bg-elevated)', borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
                {item.photos?.length > 0 ? <img src={item.photos[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
              </div>
              <div>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: 'var(--text)', marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontFamily: 'Barlow Condensed', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{item.location} · {item.condition}</div>
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 2, marginBottom: 24, overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
              <span style={{ fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Dates & Quantity</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1 }}>
              {[['Check-in', startDate||'–'], ['Check-out', endDate||'–'], ['Quantity', quantity]].map(([k, v]) => (
                <div key={k} style={{ padding: '20px 24px' }}>
                  <div style={{ fontFamily: 'Barlow Condensed', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>{k}</div>
                  <div style={{ fontFamily: 'Barlow Condensed', fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
              <span style={{ fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Your Account</span>
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', gap: 16 }}>
              <div style={{ width: 48, height: 48, background: 'var(--bg-elevated)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Playfair Display, serif', fontSize: 20, color: 'var(--gold)', fontWeight: 700, flexShrink: 0 }}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, color: 'var(--text)', marginBottom: 4 }}>{user.name}</div>
                <div style={{ fontFamily: 'Barlow', fontSize: 12, color: 'var(--text-muted)' }}>{user.email}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right — Price card */}
        <div style={{ position: 'sticky', top: 24, height: 'fit-content' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-gold)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)', padding: '20px 24px' }}>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Price Summary</div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 40, fontWeight: 700, color: 'var(--gold)' }}>{grandTotal.toLocaleString()}</div>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>DHS Total</div>
            </div>
            <div style={{ padding: '20px 24px' }}>
              {[
                [`${item.price_per_day} DHS × ${days} day${days!==1?'s':''} × ${quantity}`, `${total.toLocaleString()} DHS`],
                ...(item.deposit_required ? [['Security Deposit', `${item.deposit_amount} DHS`]] : []),
              ].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontFamily: 'Barlow', fontSize: 13, color: 'var(--text-sub)' }}>{l}</span>
                  <span style={{ fontFamily: 'Barlow Condensed', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 16, marginTop: 8 }}>
                <span style={{ fontFamily: 'Barlow Condensed', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)' }}>Grand Total</span>
                <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: 'var(--gold)', fontWeight: 700 }}>{grandTotal.toLocaleString()} DHS</span>
              </div>

              <button onClick={handleCheckout} disabled={processing} className="btn-gold" style={{ width: '100%', padding: '14px', borderRadius: 2, fontSize: 13, border: 'none', cursor: processing ? 'not-allowed' : 'pointer', marginTop: 20 }}>
                {processing ? 'Processing...' : 'Pay with YouCanPay →'}
              </button>
              <p style={{ textAlign: 'center', fontFamily: 'Barlow', fontSize: 11, color: 'var(--text-muted)', marginTop: 12 }}>Secure payment via YouCanPay</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewBooking() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontFamily: 'Barlow Condensed', letterSpacing: '0.15em', textTransform: 'uppercase', fontSize: 13 }}>Loading...</div>}>
      <BookingForm />
    </Suspense>
  );
}
