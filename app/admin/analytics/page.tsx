'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';

interface Stats {
  totalBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  totalGMV: number;
  totalRevenue: number;
  totalUsers: number;
  totalDecorators: number;
  totalFilmmakers: number;
  totalItems: number;
  avgRating: number;
  bookingsByMonth: { month: string; count: number; gmv: number }[];
  topItems: { id: string; title: string; booking_count: number; total_revenue: number }[];
  topDecorators: { id: string; name: string; total_listings: number; average_rating: number }[];
}

function fmt(n: number) {
  return n.toLocaleString('en-MA', { maximumFractionDigits: 0 });
}

function Stars({ rating }: { rating: number }) {
  const full  = Math.floor(rating);
  const half  = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span style={{ color: 'var(--gold)', fontSize: 13, letterSpacing: 1 }}>
      {'★'.repeat(full)}
      {half ? '½' : ''}
      {'☆'.repeat(empty)}
      <span style={{ color: 'var(--text-muted)', fontSize: 11, marginLeft: 4 }}>
        ({rating.toFixed(1)})
      </span>
    </span>
  );
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [stats, setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    getSupabase().auth.getSession().then(({ data }) => {
      const t = data.session?.access_token ?? null;
      if (!t) { router.push('/auth/login'); return; }
      fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${t}` } })
        .then(r => r.json())
        .then(d => {
          if (d.error) { setError(d.error); } else { setStats(d); }
          setLoading(false);
        })
        .catch(e => { setError(String(e)); setLoading(false); });
    });
  }, []);

  const kpis = stats
    ? [
        { label: 'Total GMV',         value: `${fmt(stats.totalGMV)} DHS`,      accent: true  },
        { label: 'Platform Revenue',   value: `${fmt(stats.totalRevenue)} DHS`,  accent: true  },
        { label: 'Total Bookings',     value: stats.totalBookings,               accent: false },
        { label: 'Completed Bookings', value: stats.completedBookings,           accent: false },
        { label: 'Total Users',        value: stats.totalUsers,                  accent: false },
        { label: 'Total Props',        value: stats.totalItems,                  accent: false },
      ]
    : [];

  // chart helpers
  const months      = stats?.bookingsByMonth ?? [];
  const maxCount    = Math.max(...months.map(m => m.count), 1);
  const BAR_MAX_H   = 200; // px

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>

      {/* NAV */}
      <nav style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-void)', height: 56, display: 'flex', alignItems: 'center', padding: '0 32px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <Link href="/" style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 700, color: 'var(--gold)', textDecoration: 'none' }}>PropFlow</Link>
          <span style={{ fontFamily: 'Barlow Condensed', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', borderLeft: '1px solid var(--border)', paddingLeft: 32 }}>Admin Console</span>
          <Link href="/admin/dashboard" style={{ fontFamily: 'Barlow Condensed', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', textDecoration: 'none' }}>Dashboard</Link>
          <Link href="/admin/analytics" style={{ fontFamily: 'Barlow Condensed', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', textDecoration: 'none' }}>Analytics</Link>
        </div>
        <div className="tag">Sami / Anas</div>
      </nav>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 32px' }}>

        {/* Header */}
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 40, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Analytics</h1>
        <p style={{ fontFamily: 'Barlow', fontSize: 14, color: 'var(--text-sub)', marginBottom: 40 }}>Platform performance overview</p>

        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)', fontFamily: 'Barlow Condensed', letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: 13 }}>
            Loading metrics...
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(155,58,58,0.15)', border: '1px solid rgba(155,58,58,0.4)', borderRadius: 2, padding: '16px 24px', color: '#EB5757', fontFamily: 'Barlow', fontSize: 14 }}>
            Error: {error}
          </div>
        )}

        {stats && (
          <>
            {/* ── KPI Row ──────────────────────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 48 }}>
              {kpis.map(k => (
                <div key={k.label} style={{ background: 'var(--bg-surface)', border: `1px solid ${k.accent ? 'rgba(212,168,50,0.25)' : 'var(--border)'}`, borderRadius: 2, padding: '24px 28px' }}>
                  <div style={{ fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: k.accent ? 'var(--gold)' : 'var(--text-muted)', marginBottom: 12 }}>{k.label}</div>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 32, fontWeight: 700, color: k.accent ? 'var(--gold)' : 'var(--text)', letterSpacing: '-0.01em' }}>
                    {k.value}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Bookings by Month Chart ───────────────────────────────────── */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 2, padding: '32px 32px 24px', marginBottom: 40 }}>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 32 }}>Bookings by Month</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, height: 260, padding: '0 8px' }}>
                {months.map(m => {
                  const barH = Math.max(4, Math.round((m.count / maxCount) * BAR_MAX_H));
                  return (
                    <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                      {/* count above bar */}
                      <span style={{ fontFamily: 'Barlow Condensed', fontSize: 14, fontWeight: 700, color: 'var(--gold)', marginBottom: 8 }}>
                        {m.count}
                      </span>
                      {/* bar */}
                      <div
                        style={{
                          width: '100%',
                          height: barH,
                          background: 'linear-gradient(to top, rgba(212,168,50,0.9) 0%, rgba(212,168,50,0.4) 100%)',
                          border: '1px solid rgba(212,168,50,0.5)',
                          borderRadius: '2px 2px 0 0',
                          transition: 'height 0.3s ease',
                          position: 'relative',
                        }}
                      />
                      {/* month label */}
                      <div style={{ marginTop: 10, fontFamily: 'Barlow Condensed', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                        {m.month}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Top Performers ────────────────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 40 }}>

              {/* Top Props */}
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontFamily: 'Barlow Condensed', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Top Props</span>
                </div>
                {stats.topItems.length === 0 ? (
                  <div style={{ padding: '24px', color: 'var(--text-muted)', fontFamily: 'Barlow', fontSize: 13 }}>No data yet.</div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-elevated)' }}>
                        {['#', 'Prop', 'Bookings', 'Revenue'].map(h => (
                          <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {stats.topItems.map((item, i) => (
                        <tr key={item.id} style={{ borderTop: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                          <td style={{ padding: '12px 16px', fontFamily: 'Barlow Condensed', fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>#{i + 1}</td>
                          <td style={{ padding: '12px 16px', fontFamily: 'Barlow', fontSize: 13, color: 'var(--text)', fontWeight: 500, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <Link href={`/items/${item.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{item.title}</Link>
                          </td>
                          <td style={{ padding: '12px 16px', fontFamily: 'Barlow Condensed', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{item.booking_count}</td>
                          <td style={{ padding: '12px 16px', fontFamily: 'Barlow Condensed', fontSize: 13, fontWeight: 600, color: 'var(--gold)' }}>{fmt(item.total_revenue)} DHS</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Top Decorators */}
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontFamily: 'Barlow Condensed', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Top Decorators</span>
                </div>
                {stats.topDecorators.length === 0 ? (
                  <div style={{ padding: '24px', color: 'var(--text-muted)', fontFamily: 'Barlow', fontSize: 13 }}>No data yet.</div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-elevated)' }}>
                        {['#', 'Name', 'Listings', 'Rating'].map(h => (
                          <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {stats.topDecorators.map((dec, i) => (
                        <tr key={dec.id} style={{ borderTop: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                          <td style={{ padding: '12px 16px', fontFamily: 'Barlow Condensed', fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>#{i + 1}</td>
                          <td style={{ padding: '12px 16px', fontFamily: 'Barlow', fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{dec.name}</td>
                          <td style={{ padding: '12px 16px', fontFamily: 'Barlow Condensed', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{dec.total_listings}</td>
                          <td style={{ padding: '12px 16px' }}><Stars rating={dec.average_rating} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* ── User Breakdown ────────────────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {[
                { label: 'Decorators',   value: stats.totalDecorators, color: 'rgba(212,168,50,0.15)',       border: 'rgba(212,168,50,0.35)',     text: 'var(--gold)' },
                { label: 'Filmmakers',   value: stats.totalFilmmakers,  color: 'rgba(100,160,220,0.12)',     border: 'rgba(100,160,220,0.3)',     text: 'rgba(100,160,220,0.9)' },
                { label: 'Avg Rating',   value: `${stats.avgRating} ★`, color: 'rgba(111,207,151,0.1)',     border: 'rgba(111,207,151,0.3)',     text: '#6FCF97' },
              ].map(item => (
                <div key={item.label} style={{ background: item.color, border: `1px solid ${item.border}`, borderRadius: 2, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'Barlow Condensed', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{item.label}</span>
                  <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700, color: item.text }}>{item.value}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
