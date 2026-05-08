'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/client';
import { User, Item } from '@/lib/types';

type BookingStatus = 'payment_pending' | 'confirmed' | 'active' | 'cancelled' | 'completed';

type BookingDetail = {
  id: string;
  item_id: string;
  renter_id: string;
  decorator_id: string;
  start_date: string;
  end_date: string;
  quantity: number;
  total_price: number;
  status: BookingStatus;
  payment_id?: string;
  created_at: string;
  items?: Item & { decorators?: { id: string; name: string; email: string } };
  decorators?: { id: string; name: string; email: string };
};

// ─── Status timeline steps ───────────────────────────────────────────────────

const TIMELINE_STEPS: { key: BookingStatus; label: string }[] = [
  { key: 'payment_pending', label: 'Payment Pending' },
  { key: 'confirmed',       label: 'Confirmed'       },
  { key: 'active',          label: 'Active'          },
  { key: 'completed',       label: 'Completed'       },
];

const TIMELINE_ORDER: Record<BookingStatus, number> = {
  payment_pending: 0,
  confirmed:       1,
  active:          2,
  completed:       3,
  cancelled:      -1,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function calcDays(start: string, end: string) {
  return Math.max(1, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000));
}

const LOADING_STATE = (
  <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontFamily: 'Barlow Condensed', letterSpacing: '0.15em', textTransform: 'uppercase' as const, fontSize: 13 }}>
    Loading...
  </div>
);

// ─── Component ───────────────────────────────────────────────────────────────

export default function BookingDetailPage() {
  const router              = useRouter();
  const { id }              = useParams<{ id: string }>();
  const [user, setUser]     = useState<User | null>(null);
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  useEffect(() => { checkAuth(); }, [id]);

  async function checkAuth() {
    const u = await getCurrentUser();
    if (!u) { router.push('/auth/login'); return; }
    setUser(u);
    try {
      const res  = await fetch(`/api/bookings?id=${id}`);
      const data = await res.json();
      setBooking(data?.id ? data : null);
    } catch {}
    setLoading(false);
  }

  async function handleCancel() {
    if (!booking || cancelling) return;
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    setCancelling(true);
    setCancelError('');
    try {
      const res = await fetch('/api/bookings', {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ id: booking.id, status: 'cancelled' }),
      });
      if (!res.ok) throw new Error('Failed to cancel booking');
      setBooking(prev => prev ? { ...prev, status: 'cancelled' } : prev);
    } catch (err) {
      setCancelError(String(err));
    } finally {
      setCancelling(false);
    }
  }

  if (loading) return LOADING_STATE;
  if (!booking) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: 'var(--text-sub)' }}>Booking not found.</div>
        <Link href="/bookings" style={{ fontFamily: 'Barlow Condensed', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', textDecoration: 'none' }}>← My Bookings</Link>
      </div>
    );
  }

  const item      = booking.items;
  const decorator = booking.decorators || booking.items?.decorators;
  const days      = calcDays(booking.start_date, booking.end_date);
  const rentalCost  = days * (item?.price_per_day || 0) * booking.quantity;
  const depositCost = item?.deposit_required ? (item.deposit_amount || 0) : 0;
  const currentStep = TIMELINE_ORDER[booking.status] ?? -1;
  const isCancelled = booking.status === 'cancelled';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>

      {/* NAV */}
      <nav style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-void)', height: 56, display: 'flex', alignItems: 'center', padding: '0 32px', gap: 16 }}>
        <Link href="/" style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 700, color: 'var(--gold)', textDecoration: 'none' }}>
          PropFlow
        </Link>
        <span style={{ color: 'var(--border)' }}>/</span>
        <Link href="/bookings" style={{ fontFamily: 'Barlow Condensed', fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'none' }}>
          My Bookings
        </Link>
        <span style={{ color: 'var(--border)' }}>/</span>
        <span style={{ fontFamily: 'Barlow Condensed', fontSize: 12, color: 'var(--text-sub)', letterSpacing: '0.08em' }}>
          {booking.id.slice(0, 8).toUpperCase()}
        </span>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>

        {/* Back link */}
        <Link
          href="/bookings"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'Barlow Condensed', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: 36 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          My Bookings
        </Link>

        {/* Cancelled banner */}
        {isCancelled && (
          <div style={{ background: 'rgba(155,58,58,0.12)', border: '1px solid #7A3030', borderRadius: 2, padding: '14px 20px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C95C5C" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            <span style={{ fontFamily: 'Barlow Condensed', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C95C5C' }}>
              This booking has been cancelled
            </span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32, alignItems: 'start' }}>

          {/* ── LEFT COLUMN ── */}
          <div>

            {/* Prop info */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 2, overflow: 'hidden', marginBottom: 24 }}>
              <div style={{ padding: '14px 20px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Prop</span>
              </div>
              <div style={{ padding: '20px', display: 'flex', gap: 20, alignItems: 'center' }}>
                {/* Photo */}
                <div style={{ width: 120, height: 80, background: 'var(--bg-elevated)', borderRadius: 2, overflow: 'hidden', flexShrink: 0, border: '1px solid var(--border)' }}>
                  {item?.photos?.length ? (
                    <img src={item.photos[0]} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </div>
                  )}
                </div>
                {/* Details */}
                <div>
                  <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 600, color: 'var(--text)', marginBottom: 8, lineHeight: 1.3 }}>
                    {item?.title || 'Unknown Prop'}
                  </h1>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
                    {item?.category && (
                      <span className="tag" style={{ background: 'transparent' }}>{item.category}</span>
                    )}
                    {item?.location && (
                      <span className="tag" style={{ background: 'transparent' }}>{item.location}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Booking details */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 2, overflow: 'hidden', marginBottom: 24 }}>
              <div style={{ padding: '14px 20px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Booking Details</span>
              </div>
              {/* Dates row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '1px solid var(--border)' }}>
                {[
                  ['Check-in',    formatDate(booking.start_date)],
                  ['Check-out',   formatDate(booking.end_date)],
                  ['Duration',    `${days} day${days !== 1 ? 's' : ''}`],
                ].map(([k, v]) => (
                  <div key={k} style={{ padding: '18px 20px', borderRight: '1px solid var(--border)' }}>
                    <div style={{ fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>{k}</div>
                    <div style={{ fontFamily: 'Barlow Condensed', fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{v}</div>
                  </div>
                ))}
              </div>
              {/* Price breakdown */}
              <div style={{ padding: '18px 20px' }}>
                <div style={{ fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 14 }}>Price Breakdown</div>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 0 }}>
                  {[
                    [`${item?.price_per_day?.toLocaleString() || '—'} DHS/day × ${days} day${days !== 1 ? 's' : ''} × ${booking.quantity} item${booking.quantity !== 1 ? 's' : ''}`, `${rentalCost.toLocaleString()} DHS`],
                    ...(item?.deposit_required ? [['Security Deposit', `${depositCost.toLocaleString()} DHS`]] : []),
                  ].map(([l, v], i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontFamily: 'Barlow', fontSize: 13, color: 'var(--text-sub)' }}>{l}</span>
                      <span style={{ fontFamily: 'Barlow Condensed', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14 }}>
                    <span style={{ fontFamily: 'Barlow Condensed', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)' }}>Total Paid</span>
                    <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, color: 'var(--gold)' }}>
                      {booking.total_price.toLocaleString()} <span style={{ fontSize: 13, fontWeight: 400, fontFamily: 'Barlow Condensed', color: 'var(--text-muted)' }}>DHS</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status timeline */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 2, overflow: 'hidden', marginBottom: 24 }}>
              <div style={{ padding: '14px 20px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  {isCancelled ? 'Status — Cancelled' : 'Booking Status'}
                </span>
              </div>
              <div style={{ padding: '28px 24px' }}>
                {isCancelled ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(155,58,58,0.2)', border: '2px solid #7A3030', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C95C5C" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontFamily: 'Barlow Condensed', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C95C5C' }}>Cancelled</div>
                      <div style={{ fontFamily: 'Barlow', fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>This booking was cancelled.</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                    {TIMELINE_STEPS.map((step, i) => {
                      const stepIdx  = TIMELINE_ORDER[step.key];
                      const isDone   = stepIdx < currentStep;
                      const isCurrent = stepIdx === currentStep;
                      const isFuture  = stepIdx > currentStep;

                      return (
                        <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: i < TIMELINE_STEPS.length - 1 ? 1 : 'unset' as any }}>
                          {/* Step node */}
                          <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width:      isCurrent ? 40 : 32,
                              height:     isCurrent ? 40 : 32,
                              borderRadius: '50%',
                              flexShrink: 0,
                              display:    'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: isDone    ? 'rgba(107,82,32,0.3)' :
                                          isCurrent ? 'linear-gradient(135deg, var(--gold-dim), var(--gold))' :
                                                      'var(--bg-elevated)',
                              border:     isDone    ? '2px solid var(--border-gold)' :
                                          isCurrent ? '2px solid var(--gold)' :
                                                      '2px solid var(--border)',
                              boxShadow:  isCurrent ? '0 0 16px rgba(212,168,50,0.35)' : 'none',
                              transition: 'all 0.2s',
                            }}>
                              {isDone ? (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2.5">
                                  <polyline points="20 6 9 17 4 12"/>
                                </svg>
                              ) : isCurrent ? (
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--bg-void)' }} />
                              ) : (
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--border)' }} />
                              )}
                            </div>
                            <div style={{ textAlign: 'center' as const }}>
                              <div style={{
                                fontFamily:    'Barlow Condensed',
                                fontSize:      isCurrent ? 12 : 10,
                                fontWeight:    isCurrent ? 700 : 400,
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase' as const,
                                color:         isDone    ? 'var(--gold-dim)' :
                                               isCurrent ? 'var(--gold)' :
                                                           'var(--text-muted)',
                                whiteSpace:    'nowrap' as const,
                              }}>
                                {step.label}
                              </div>
                            </div>
                          </div>

                          {/* Connector line */}
                          {i < TIMELINE_STEPS.length - 1 && (
                            <div style={{
                              flex:       1,
                              height:     2,
                              marginBottom: 28,
                              marginLeft: 6,
                              marginRight: 6,
                              background: isDone
                                ? 'linear-gradient(to right, var(--border-gold), var(--border-gold))'
                                : 'var(--border)',
                              borderRadius: 1,
                            }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Decorator info */}
            {decorator && (
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Set Decorator</span>
                </div>
                <div style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--bg-elevated)', border: '1px solid var(--border-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Playfair Display, serif', fontSize: 18, color: 'var(--gold)', fontWeight: 700, flexShrink: 0 }}>
                      {decorator.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: 'var(--text)', marginBottom: 2 }}>
                        {decorator.name}
                      </div>
                      <div style={{ fontFamily: 'Barlow', fontSize: 12, color: 'var(--text-muted)' }}>
                        {decorator.email}
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/decorators/${booking.decorator_id}`}
                    className="btn-ghost"
                    style={{ padding: '9px 18px', borderRadius: 2, fontSize: 11, textDecoration: 'none', display: 'inline-block', whiteSpace: 'nowrap' as const }}
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN — Actions ── */}
          <div style={{ position: 'sticky', top: 24 }}>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-gold)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)', padding: '18px 20px' }}>
                <div style={{ fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>Booking Total</div>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 36, fontWeight: 700, color: 'var(--gold)' }}>
                  {booking.total_price.toLocaleString()}
                </div>
                <div style={{ fontFamily: 'Barlow Condensed', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>DHS</div>
              </div>

              <div style={{ padding: '20px' }}>
                {/* Booking ref */}
                <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>Booking Ref</div>
                  <div style={{ fontFamily: 'Barlow Condensed', fontSize: 14, fontWeight: 600, color: 'var(--text-sub)', letterSpacing: '0.08em' }}>
                    {booking.id.slice(0, 8).toUpperCase()}
                  </div>
                </div>

                {/* Actions based on status */}
                {booking.status === 'payment_pending' && (
                  <div>
                    <div style={{ fontFamily: 'Barlow', fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
                      Your booking is waiting for payment to be completed.
                    </div>
                    <Link
                      href={`/bookings/new?itemId=${booking.item_id}&startDate=${booking.start_date}&endDate=${booking.end_date}&quantity=${booking.quantity}`}
                      className="btn-gold"
                      style={{ display: 'block', width: '100%', padding: '13px', borderRadius: 2, fontSize: 12, textDecoration: 'none', textAlign: 'center' as const, boxSizing: 'border-box' as const }}
                    >
                      Complete Payment →
                    </Link>
                  </div>
                )}

                {booking.status === 'confirmed' && (
                  <div>
                    <div style={{ fontFamily: 'Barlow', fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
                      Your booking is confirmed. You may cancel if your plans change.
                    </div>
                    {cancelError && (
                      <div style={{ fontFamily: 'Barlow', fontSize: 12, color: '#C95C5C', marginBottom: 12, padding: '8px 12px', background: 'rgba(155,58,58,0.1)', borderRadius: 2, border: '1px solid #7A3030' }}>
                        {cancelError}
                      </div>
                    )}
                    <button
                      onClick={handleCancel}
                      disabled={cancelling}
                      style={{
                        display:       'block',
                        width:         '100%',
                        padding:       '13px',
                        borderRadius:  2,
                        fontSize:      12,
                        fontFamily:    'Barlow Condensed',
                        fontWeight:    700,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase' as const,
                        cursor:        cancelling ? 'not-allowed' : 'pointer',
                        background:    'rgba(155,58,58,0.1)',
                        color:         '#C95C5C',
                        border:        '1px solid #7A3030',
                        transition:    'all 0.2s',
                        opacity:       cancelling ? 0.5 : 1,
                      }}
                    >
                      {cancelling ? 'Cancelling...' : 'Cancel Booking'}
                    </button>
                  </div>
                )}

                {booking.status === 'completed' && (
                  <div>
                    <div style={{ fontFamily: 'Barlow', fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
                      Booking complete. Share your experience with a review.
                    </div>
                    <Link
                      href={`/bookings/${booking.id}/review`}
                      className="btn-gold"
                      style={{ display: 'block', width: '100%', padding: '13px', borderRadius: 2, fontSize: 12, textDecoration: 'none', textAlign: 'center' as const, boxSizing: 'border-box' as const }}
                    >
                      Leave a Review →
                    </Link>
                  </div>
                )}

                {(booking.status === 'active') && (
                  <div style={{ fontFamily: 'Barlow', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    Your booking is currently active. Enjoy your props!
                  </div>
                )}

                {isCancelled && (
                  <div>
                    <div style={{ fontFamily: 'Barlow', fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
                      This booking was cancelled. Browse available props to make a new booking.
                    </div>
                    <Link
                      href="/"
                      className="btn-ghost"
                      style={{ display: 'block', width: '100%', padding: '13px', borderRadius: 2, fontSize: 12, textDecoration: 'none', textAlign: 'center' as const, boxSizing: 'border-box' as const }}
                    >
                      Browse Props →
                    </Link>
                  </div>
                )}

                {/* Placed on date */}
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Placed on</div>
                  <div style={{ fontFamily: 'Barlow', fontSize: 12, color: 'var(--text-sub)' }}>
                    {formatDate(booking.created_at)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
