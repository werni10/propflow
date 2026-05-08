'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/client';
import { Booking, Item, User } from '@/lib/types';

type BookingStatus = Booking['status'];

type BookingWithRelations = Omit<Booking, 'status'> & {
  status: BookingStatus;
  items?: Item;
  renters?: { name?: string; email?: string };
};

type Tab = 'payment_pending' | 'confirmed' | 'past';

const TAB_LABELS: Record<Tab, string> = {
  payment_pending: 'Pending',
  confirmed:       'Confirmed',
  past:            'Past',
};

function statusBelongsToTab(status: BookingStatus, tab: Tab): boolean {
  if (tab === 'payment_pending') return status === 'payment_pending';
  if (tab === 'confirmed')       return status === 'confirmed';
  return status === 'cancelled' || status === 'completed';
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    payment_pending: { label: 'Payment Pending', color: '#D4A832', bg: 'rgba(212,168,50,0.1)' },
    pending:         { label: 'Pending',          color: '#D4A832', bg: 'rgba(212,168,50,0.1)' },
    confirmed:       { label: 'Active',           color: '#4CAF50', bg: 'rgba(76,175,80,0.1)'  },
    completed:       { label: 'Completed',        color: '#6B5F4A', bg: 'rgba(107,95,74,0.1)'  },
    cancelled:       { label: 'Cancelled',        color: '#9B3A3A', bg: 'rgba(155,58,58,0.1)'  },
  };
  const s = map[status] ?? { label: status, color: 'var(--text-muted)', bg: 'transparent' };
  return (
    <span style={{
      fontFamily: 'Barlow Condensed', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
      padding: '4px 10px', border: `1px solid ${s.color}`, color: s.color, background: s.bg, borderRadius: 2,
    }}>
      {s.label}
    </span>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function DecoratorBookings() {
  const router = useRouter();
  const [user, setUser]       = useState<User | null>(null);
  const [bookings, setBookings] = useState<BookingWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState<Tab>('payment_pending');
  const [acting, setActing]   = useState<string | null>(null); // booking id being actioned

  useEffect(() => { checkAuth(); }, []);

  async function checkAuth() {
    const u = await getCurrentUser();
    if (!u || u.role !== 'decorator') { router.push('/auth/login'); return; }
    setUser(u);
    await loadBookings(u.id);
  }

  async function loadBookings(userId: string) {
    try {
      const res  = await fetch(`/api/bookings?userId=${userId}`);
      const data = await res.json();
      // Only keep bookings where current user is the decorator
      const asDecorator: BookingWithRelations[] = Array.isArray(data)
        ? data.filter((b: BookingWithRelations) => b.decorator_id === userId)
        : [];
      setBookings(asDecorator);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }

  async function updateBookingStatus(id: string, status: 'confirmed' | 'cancelled') {
    setActing(id);
    try {
      await fetch('/api/bookings', {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ id, status }),
      });
      if (user) await loadBookings(user.id);
    } finally {
      setActing(null);
    }
  }

  const visibleBookings = bookings.filter(b => statusBelongsToTab(b.status, tab));

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontFamily: 'Barlow Condensed', letterSpacing: '0.15em', textTransform: 'uppercase', fontSize: 13 }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>

      {/* NAV */}
      <nav style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-void)', height: 56, display: 'flex', alignItems: 'center', padding: '0 32px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <Link href="/" style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 700, color: 'var(--gold)', textDecoration: 'none' }}>PropFlow</Link>
          <span style={{ fontFamily: 'Barlow Condensed', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', borderLeft: '1px solid var(--border)', paddingLeft: 32 }}>Decorator Studio</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link href="/decorators/dashboard" style={{ fontFamily: 'Barlow Condensed', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-sub)', textDecoration: 'none' }}>My Props</Link>
          <span style={{ fontFamily: 'Barlow', fontSize: 13, color: 'var(--text-muted)' }}>{user?.name}</span>
        </div>
      </nav>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '48px 32px' }}>

        {/* PAGE HEADER */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 40, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Booking Requests</h1>
          <p style={{ fontFamily: 'Barlow', fontSize: 14, color: 'var(--text-sub)' }}>
            {bookings.length} total booking{bookings.length !== 1 ? 's' : ''} across all statuses
          </p>
        </div>

        {/* TAB BAR */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 32 }}>
          {(Object.keys(TAB_LABELS) as Tab[]).map(t => {
            const count = bookings.filter(b => statusBelongsToTab(b.status, t)).length;
            const active = t === tab;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  fontFamily: 'Barlow Condensed', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase',
                  padding: '12px 24px', background: 'none', border: 'none', cursor: 'pointer',
                  color: active ? 'var(--gold)' : 'var(--text-muted)',
                  borderBottom: active ? '2px solid var(--gold)' : '2px solid transparent',
                  marginBottom: -1, transition: 'color 0.2s',
                }}
              >
                {TAB_LABELS[t]}
                {count > 0 && (
                  <span style={{
                    marginLeft: 8, fontFamily: 'Barlow Condensed', fontSize: 11,
                    background: active ? 'rgba(212,168,50,0.15)' : 'var(--bg-elevated)',
                    color: active ? 'var(--gold)' : 'var(--text-muted)',
                    padding: '2px 7px', borderRadius: 10,
                  }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* BOOKING CARDS */}
        {visibleBookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '72px 0', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 2 }}>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, color: 'var(--text-sub)', marginBottom: 10 }}>
              No {TAB_LABELS[tab].toLowerCase()} bookings
            </div>
            <p style={{ fontFamily: 'Barlow', fontSize: 14, color: 'var(--text-muted)' }}>
              {tab === 'payment_pending' && 'New booking requests will appear here.'}
              {tab === 'confirmed'      && 'Accepted bookings will appear here.'}
              {tab === 'past'           && 'Completed and cancelled bookings will appear here.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {visibleBookings.map(booking => {
              const isPending = booking.status === 'payment_pending';
              const isActing  = acting === booking.id;
              const propTitle = booking.items?.title ?? 'Unknown Prop';
              const propPhoto = booking.items?.photos?.[0];
              const renterName = booking.renters?.name ?? 'Renter';

              return (
                <div key={booking.id} className="card-dark" style={{ borderRadius: 2, padding: '0', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', gap: 0 }}>

                    {/* PROP THUMBNAIL */}
                    <div style={{ width: 120, flexShrink: 0, background: 'var(--bg-elevated)', position: 'relative' }}>
                      {propPhoto ? (
                        <img src={propPhoto} alt={propTitle} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', minHeight: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* BOOKING INFO */}
                    <div style={{ flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>

                      {/* Top row: title + status */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                        <div>
                          <div style={{ fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Prop</div>
                          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, fontWeight: 500, color: 'var(--text)', lineHeight: 1.2 }}>{propTitle}</div>
                        </div>
                        <StatusBadge status={booking.status} />
                      </div>

                      {/* Renter + dates row */}
                      <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
                        <div>
                          <div style={{ fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 3 }}>Renter</div>
                          <div style={{ fontFamily: 'Barlow', fontSize: 14, color: 'var(--text-sub)' }}>{renterName}</div>
                        </div>
                        <div>
                          <div style={{ fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 3 }}>Dates</div>
                          <div style={{ fontFamily: 'Barlow Condensed', fontSize: 14, color: 'var(--text-sub)', letterSpacing: '0.04em' }}>
                            {formatDate(booking.start_date)} — {formatDate(booking.end_date)}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 3 }}>Total</div>
                          <div style={{ fontFamily: 'Barlow Condensed', fontSize: 18, fontWeight: 700, color: 'var(--gold)', letterSpacing: '-0.01em' }}>
                            {booking.total_price.toLocaleString()} <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-muted)' }}>DHS</span>
                          </div>
                        </div>
                      </div>

                      {/* ACTION BUTTONS for pending */}
                      {isPending && (
                        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                          <button
                            disabled={isActing}
                            onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                            style={{
                              fontFamily: 'Barlow Condensed', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
                              padding: '8px 20px', borderRadius: 2, cursor: isActing ? 'not-allowed' : 'pointer',
                              background: isActing ? 'rgba(45,97,74,0.4)' : 'rgba(45,97,74,0.8)',
                              color: '#86efac', border: '1px solid rgba(76,175,80,0.4)',
                              transition: 'all 0.2s', opacity: isActing ? 0.6 : 1,
                            }}
                          >
                            {isActing ? 'Processing...' : '✓ Accept'}
                          </button>
                          <button
                            disabled={isActing}
                            onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                            style={{
                              fontFamily: 'Barlow Condensed', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
                              padding: '8px 20px', borderRadius: 2, cursor: isActing ? 'not-allowed' : 'pointer',
                              background: isActing ? 'rgba(155,58,58,0.3)' : 'rgba(155,58,58,0.6)',
                              color: '#fca5a5', border: '1px solid rgba(155,58,58,0.5)',
                              transition: 'all 0.2s', opacity: isActing ? 0.6 : 1,
                            }}
                          >
                            ✕ Decline
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
