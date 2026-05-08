'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/client';
import { User } from '@/lib/types';

interface Payout {
  id: string;
  amount: number;
  period_start: string;
  period_end: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
}

interface Booking {
  id: string;
  total_price: number;
  status: string;
  start_date: string;
  end_date: string;
  items: { title: string } | null;
}

export default function EarningsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser().then(async u => {
      if (!u || u.role !== 'decorator') { router.push('/auth/login'); return; }
      setUser(u);

      const [pb, bb] = await Promise.all([
        fetch('/api/admin/payouts?status=pending').then(r => r.json()),
        fetch(`/api/bookings?userId=${u.id}`).then(r => r.json()),
      ]);

      setPayouts(Array.isArray(pb) ? pb.filter((p: Payout) => true) : []);
      setBookings(Array.isArray(bb) ? bb : []);
      setLoading(false);
    });
  }, []);

  const completedBookings = bookings.filter(b => b.status === 'completed');
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const totalEarned = completedBookings.reduce((sum, b) => sum + (b.total_price * 0.97), 0); // 3% commission
  const pendingEarnings = confirmedBookings.reduce((sum, b) => sum + (b.total_price * 0.97), 0);

  const statusColor = (s: string) =>
    s === 'completed' ? '#4CAF50' : s === 'processing' ? 'var(--gold)' : s === 'pending' ? 'var(--text-sub)' : '#EB5757';

  if (loading || !user) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontFamily: 'Barlow Condensed', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: 13 }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <nav style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-void)', height: 64, display: 'flex', alignItems: 'center', padding: '0 32px', gap: 16, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/" style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 700, color: 'var(--gold)', textDecoration: 'none' }}>PropFlow</Link>
          <span style={{ color: 'var(--border)' }}>/</span>
          <Link href="/decorators/dashboard" style={{ fontFamily: 'Barlow Condensed', fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Dashboard</Link>
          <span style={{ color: 'var(--border)' }}>/</span>
          <span style={{ fontFamily: 'Barlow Condensed', fontSize: 12, color: 'var(--gold)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Earnings</span>
        </div>
        <span style={{ fontFamily: 'Barlow Condensed', fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{user.name}</span>
      </nav>

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 40, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Earnings</h1>
        <p style={{ fontFamily: 'Barlow', fontSize: 14, color: 'var(--text-sub)', marginBottom: 40 }}>
          After 3% platform commission. Subscription: 50 DHS/month.
        </p>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 48 }}>
          {[
            ['Total Earned', `${totalEarned.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} DHS`, 'var(--gold)'],
            ['Pending (Confirmed)', `${pendingEarnings.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} DHS`, 'var(--text-sub)'],
            ['Completed Bookings', completedBookings.length, 'var(--text-sub)'],
          ].map(([label, value, color]) => (
            <div key={String(label)} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 2, padding: '24px 28px' }}>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>{label}</div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700, color: String(color) }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Completed bookings breakdown */}
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: 'var(--text)', marginBottom: 20 }}>Booking History</h2>
        {completedBookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 2, marginBottom: 40 }}>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: 'var(--text-sub)' }}>No completed bookings yet.</div>
          </div>
        ) : (
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 2, overflow: 'hidden', marginBottom: 40 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
                  {['Prop', 'Dates', 'Gross', 'Your Cut (97%)'].map(h => (
                    <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {completedBookings.map((b, i) => (
                  <tr key={b.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                    <td style={{ padding: '14px 20px', fontFamily: 'Barlow', fontSize: 13, color: 'var(--text-sub)' }}>{b.items?.title || '—'}</td>
                    <td style={{ padding: '14px 20px', fontFamily: 'Barlow Condensed', fontSize: 12, color: 'var(--text-muted)' }}>{b.start_date} → {b.end_date}</td>
                    <td style={{ padding: '14px 20px', fontFamily: 'Barlow Condensed', fontSize: 14, color: 'var(--text-sub)' }}>{b.total_price.toLocaleString()} DHS</td>
                    <td style={{ padding: '14px 20px', fontFamily: 'Barlow Condensed', fontSize: 16, fontWeight: 700, color: 'var(--gold)' }}>{(b.total_price * 0.97).toLocaleString()} DHS</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Payouts */}
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: 'var(--text)', marginBottom: 20 }}>Payout History</h2>
        {payouts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 2 }}>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: 'var(--text-sub)' }}>No payouts yet.</div>
            <p style={{ fontFamily: 'Barlow', fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>Payouts are processed monthly by admin.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {payouts.map(p => (
              <div key={p.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 2, padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: 'Barlow Condensed', fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {p.period_start} → {p.period_end}
                  </div>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: 'var(--gold)', fontWeight: 700, marginTop: 4 }}>
                    {p.amount.toLocaleString()} DHS
                  </div>
                </div>
                <span style={{ fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: statusColor(p.status), border: `1px solid ${statusColor(p.status)}`, padding: '4px 12px', borderRadius: 1, opacity: 0.9 }}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
