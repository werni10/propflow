'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/client';
import { User, Item } from '@/lib/types';

type BookingStatus = 'payment_pending' | 'confirmed' | 'cancelled' | 'completed';
type Tab = 'upcoming' | 'past' | 'all';

type BookingWithItem = {
  id: string;
  item_id: string;
  renter_id: string;
  decorator_id: string;
  start_date: string;
  end_date: string;
  quantity: number;
  total_price: number;
  status: BookingStatus;
  created_at: string;
  items?: Item;
};

const STATUS_LABELS: Record<BookingStatus, string> = {
  payment_pending: 'Payment Pending',
  confirmed:       'Confirmed',
  cancelled:       'Cancelled',
  completed:       'Completed',
};

const STATUS_COLORS: Record<BookingStatus, { bg: string; color: string; border: string }> = {
  payment_pending: { bg: 'rgba(44,40,32,0.6)',  color: 'var(--text-muted)', border: 'var(--border)' },
  confirmed:       { bg: 'rgba(107,82,32,0.25)', color: 'var(--gold)',       border: 'var(--border-gold)' },
  cancelled:       { bg: 'rgba(155,58,58,0.2)',  color: '#C95C5C',           border: '#7A3030' },
  completed:       { bg: 'rgba(45,97,74,0.2)',   color: '#4CAF82',           border: '#2D614A' },
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function isUpcoming(b: BookingWithItem) {
  return b.status !== 'cancelled' && new Date(b.end_date) >= new Date();
}

function isPast(b: BookingWithItem) {
  return b.status === 'completed' || b.status === 'cancelled' || new Date(b.end_date) < new Date();
}

const LOADING_STATE = (
  <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontFamily: 'Barlow Condensed', letterSpacing: '0.15em', textTransform: 'uppercase' as const, fontSize: 13 }}>
    Loading...
  </div>
);

export default function BookingsPage() {
  const router = useRouter();
  const [user, setUser]         = useState<User | null>(null);
  const [bookings, setBookings] = useState<BookingWithItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState<Tab>('upcoming');

  useEffect(() => { checkAuth(); }, []);

  async function checkAuth() {
    const u = await getCurrentUser();
    if (!u) { router.push('/auth/login'); return; }
    setUser(u);
    try {
      const res  = await fetch(`/api/bookings?userId=${u.id}`);
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch {}
    setLoading(false);
  }

  if (loading) return LOADING_STATE;

  const filtered = bookings.filter(b =>
    tab === 'all'      ? true :
    tab === 'upcoming' ? isUpcoming(b) :
                         isPast(b)
  );

  const tabs: { key: Tab; label: string }[] = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'past',     label: 'Past'     },
    { key: 'all',      label: 'All'      },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>

      {/* NAV */}
      <nav style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-void)', height: 56, display: 'flex', alignItems: 'center', padding: '0 32px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/" style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 700, color: 'var(--gold)', textDecoration: 'none' }}>
            PropFlow
          </Link>
          <span style={{ color: 'var(--border)' }}>/</span>
          <span style={{ fontFamily: 'Barlow Condensed', fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            My Bookings
          </span>
        </div>
        {user && (
          <span style={{ fontFamily: 'Barlow', fontSize: 13, color: 'var(--text-sub)' }}>
            {user.name}
          </span>
        )}
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>

        {/* Page header */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 40, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
            My Bookings
          </h1>
          <p style={{ fontFamily: 'Barlow', fontSize: 14, color: 'var(--text-sub)' }}>
            {bookings.length} booking{bookings.length !== 1 ? 's' : ''} in total
          </p>
        </div>

        <div className="divider-gold" style={{ marginBottom: 36 }} />

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 32, borderBottom: '1px solid var(--border)' }}>
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                background:    'none',
                border:        'none',
                borderBottom:  tab === t.key ? '2px solid var(--gold)' : '2px solid transparent',
                padding:       '10px 24px',
                cursor:        'pointer',
                fontFamily:    'Barlow Condensed',
                fontSize:      13,
                fontWeight:    tab === t.key ? 700 : 400,
                letterSpacing: '0.1em',
                textTransform: 'uppercase' as const,
                color:         tab === t.key ? 'var(--gold)' : 'var(--text-muted)',
                marginBottom:  -1,
                transition:    'color 0.15s',
              }}
            >
              {t.label}
              <span style={{
                marginLeft:    8,
                fontFamily:    'Barlow Condensed',
                fontSize:      10,
                background:    tab === t.key ? 'rgba(107,82,32,0.3)' : 'var(--bg-elevated)',
                color:         tab === t.key ? 'var(--gold)' : 'var(--text-muted)',
                border:        `1px solid ${tab === t.key ? 'var(--border-gold)' : 'var(--border)'}`,
                borderRadius:  2,
                padding:       '1px 6px',
                verticalAlign: 'middle',
              }}>
                {tabs.find(x => x.key === t.key) &&
                  bookings.filter(b =>
                    t.key === 'all'      ? true :
                    t.key === 'upcoming' ? isUpcoming(b) :
                                           isPast(b)
                  ).length
                }
              </span>
            </button>
          ))}
        </div>

        {/* Booking list */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 2 }}>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: 'var(--text-sub)', marginBottom: 12 }}>
              No bookings yet.
            </div>
            <p style={{ fontFamily: 'Barlow', fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>
              {tab === 'upcoming' ? "You have no upcoming bookings." :
               tab === 'past'     ? "No past bookings found."       :
                                    "You haven't made any bookings."}
            </p>
            <Link
              href="/"
              className="btn-gold"
              style={{ padding: '12px 28px', borderRadius: 2, fontSize: 13, textDecoration: 'none', display: 'inline-block' }}
            >
              Browse Props →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(booking => {
              const item   = booking.items;
              const sc     = STATUS_COLORS[booking.status] || STATUS_COLORS.payment_pending;
              return (
                <Link
                  key={booking.id}
                  href={`/bookings/${booking.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div
                    className="card-dark"
                    style={{ borderRadius: 2, overflow: 'hidden', display: 'flex', alignItems: 'stretch' }}
                  >
                    {/* Thumbnail */}
                    <div style={{ width: 120, flexShrink: 0, background: 'var(--bg-elevated)', position: 'relative' }}>
                      {item?.photos?.length ? (
                        <img
                          src={item.photos[0]}
                          alt={item.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', minHeight: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 500, color: 'var(--text)', marginBottom: 6, lineHeight: 1.3 }}>
                          {item?.title || 'Unknown Prop'}
                        </h3>
                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' as const, alignItems: 'center' }}>
                          <span style={{ fontFamily: 'Barlow Condensed', fontSize: 12, color: 'var(--text-sub)', letterSpacing: '0.06em' }}>
                            {formatDate(booking.start_date)} → {formatDate(booking.end_date)}
                          </span>
                          {item?.location && (
                            <span style={{ fontFamily: 'Barlow Condensed', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>
                              {item.location}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Price + status */}
                      <div style={{ textAlign: 'right' as const, flexShrink: 0 }}>
                        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 700, color: 'var(--gold)', marginBottom: 8 }}>
                          {booking.total_price.toLocaleString()} <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)', fontFamily: 'Barlow Condensed' }}>DHS</span>
                        </div>
                        <span style={{
                          display:       'inline-block',
                          fontFamily:    'Barlow Condensed',
                          fontSize:      10,
                          fontWeight:    700,
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase' as const,
                          padding:       '3px 10px',
                          borderRadius:  2,
                          background:    sc.bg,
                          color:         sc.color,
                          border:        `1px solid ${sc.border}`,
                        }}>
                          {STATUS_LABELS[booking.status]}
                        </span>
                      </div>
                    </div>

                    {/* Chevron */}
                    <div style={{ display: 'flex', alignItems: 'center', padding: '0 18px', color: 'var(--text-muted)' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
