'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Item, Decorator } from '@/lib/types';

export default function ItemDetail() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [item, setItem]           = useState<(Item & { decorators?: Partial<Decorator> }) | null>(null);
  const [loading, setLoading]     = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate]     = useState('');
  const [quantity, setQuantity]   = useState(1);
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => { fetchItem(); }, [id]);

  async function fetchItem() {
    try {
      const res = await fetch(`/api/items?id=${id}`);
      setItem(await res.json());
    } catch {}
    finally { setLoading(false); }
  }

  if (loading) return <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontFamily: 'Barlow Condensed', letterSpacing: '0.15em', textTransform: 'uppercase', fontSize: 13 }}>Loading...</div>;
  if (!item)   return <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-sub)', fontFamily: 'Playfair Display, serif', fontSize: 24 }}>Prop not found.</div>;

  const days = startDate && endDate ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000) : 0;
  const baseTotal = days * item.price_per_day * quantity;

  // Determine applicable discount
  const applicableDiscount =
    days >= 30 && (item.monthly_discount ?? 0) > 0
      ? { label: `30+ day discount`, pct: item.monthly_discount as number }
      : days >= 7 && (item.weekly_discount ?? 0) > 0
      ? { label: `7+ day discount`, pct: item.weekly_discount as number }
      : null;

  const total = applicableDiscount
    ? baseTotal * (1 - applicableDiscount.pct / 100)
    : baseTotal;

  // WhatsApp number: prefer item-level, fall back to decorator-level
  const whatsappRaw =
    (item as Item & { whatsapp_number?: string }).whatsapp_number ||
    (item.decorators as (typeof item.decorators & { whatsapp_number?: string }) | undefined)?.whatsapp_number;
  const whatsappHref = whatsappRaw
    ? `https://wa.me/${whatsappRaw.replace(/\s+/g, '').replace('+', '')}`
    : null;

  // Top Decorator threshold
  const decorator = item.decorators as (Partial<Decorator> & { average_rating?: number; total_listings?: number }) | undefined;
  const isTopDecorator = (decorator?.average_rating ?? 0) >= 4.8 && (decorator?.total_listings ?? 0) >= 5;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* NAV */}
      <nav style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-void)', height: 56, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16 }}>
        <Link href="/" style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 700, color: 'var(--gold)', textDecoration: 'none' }}>PropFlow</Link>
        <span style={{ color: 'var(--border)' }}>/</span>
        <span style={{ fontFamily: 'Barlow Condensed', fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{item.category}</span>
        <span style={{ color: 'var(--border)' }}>/</span>
        <span style={{ fontFamily: 'Barlow', fontSize: 13, color: 'var(--text-sub)' }}>{item.title}</span>
      </nav>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 48 }}>
        {/* LEFT */}
        <div>
          {/* Main photo */}
          <div style={{ aspectRatio: '16/10', background: 'var(--bg-surface)', borderRadius: 2, overflow: 'hidden', border: '1px solid var(--border)', marginBottom: 12, position: 'relative' }}>
            {item.photos?.length > 0 ? (
              <img src={item.photos[activePhoto]} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <span style={{ fontFamily: 'Barlow Condensed', fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>No Image Available</span>
              </div>
            )}
            <div style={{ position: 'absolute', top: 14, left: 14 }}>
              <span className="tag" style={{ background: 'rgba(8,7,8,0.85)' }}>{item.category}</span>
            </div>
          </div>
          {/* Thumbnails */}
          {item.photos?.length > 1 && (
            <div style={{ display: 'flex', gap: 8 }}>
              {item.photos.map((p, i) => (
                <button key={i} onClick={() => setActivePhoto(i)} style={{ width: 72, height: 48, border: `1px solid ${i === activePhoto ? 'var(--gold)' : 'var(--border)'}`, borderRadius: 2, overflow: 'hidden', cursor: 'pointer', padding: 0, background: 'none', flexShrink: 0 }}>
                  <img src={p} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}

          {/* Details */}
          <div style={{ marginTop: 40 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap', marginBottom: 16 }}>
              <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 36, fontWeight: 700, color: 'var(--text)', lineHeight: 1.2, margin: 0, flex: '1 1 auto' }}>{item.title}</h1>
              {item.instant_book && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--gold)', color: '#1a1207', fontFamily: 'Barlow Condensed', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 2, whiteSpace: 'nowrap', flexShrink: 0, alignSelf: 'center' }}>
                  ⚡ Instant Book
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
              <span className="tag">{item.condition}</span>
              <span className="tag">{item.location}</span>
              {item.deposit_required && <span className="tag">Deposit Required</span>}
            </div>

            <div className="divider-gold" style={{ marginBottom: 24 }} />

            <p style={{ fontFamily: 'Barlow', fontSize: 15, color: 'var(--text-sub)', lineHeight: 1.8, marginBottom: 32 }}>{item.description || 'No description provided.'}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, border: '1px solid var(--border)', borderRadius: 2, overflow: 'hidden' }}>
              {[
                ['Category', item.category],
                ['Condition', item.condition],
                ['Location', item.location],
                ['Deposit', item.deposit_required ? `${item.deposit_amount} DHS` : 'None'],
              ].map(([k, v]) => (
                <div key={k} style={{ padding: '16px 20px', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>{k}</div>
                  <div style={{ fontFamily: 'Barlow', fontSize: 15, color: 'var(--text)' }}>{v}</div>
                </div>
              ))}
            </div>

            {item.decorators && (
              <div style={{ marginTop: 32, padding: '20px 24px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 2 }}>
                <div style={{ fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Set Decorator</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: 'var(--text)' }}>{item.decorators.name || 'Unknown'}</span>
                  {isTopDecorator && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--gold)', color: '#1a1207', fontFamily: 'Barlow Condensed', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 2 }}>
                      ⭐ Top Decorator
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — Booking Card */}
        <div style={{ position: 'sticky', top: 24, height: 'fit-content' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-gold)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)', padding: '20px 24px' }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 36, fontWeight: 700, color: 'var(--gold)' }}>{item.price_per_day}</div>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 2 }}>DHS per day</div>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, marginBottom: 16, border: '1px solid var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ padding: '12px 14px', background: 'var(--bg-elevated)' }}>
                  <label style={{ display: 'block', fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>Check-in</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input-dark" style={{ border: 'none', background: 'transparent', color: 'var(--text)', fontSize: 13, width: '100%', padding: 0 }} />
                </div>
                <div style={{ padding: '12px 14px', background: 'var(--bg-elevated)', borderLeft: '1px solid var(--border)' }}>
                  <label style={{ display: 'block', fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>Check-out</label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input-dark" style={{ border: 'none', background: 'transparent', color: 'var(--text)', fontSize: 13, width: '100%', padding: 0 }} />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Quantity</label>
                <input type="number" min="1" value={quantity} onChange={e => setQuantity(parseInt(e.target.value)||1)} className="input-dark" style={{ width: '100%', padding: '10px 14px', borderRadius: 2, fontSize: 14 }} />
              </div>

              {days > 0 && (
                <div style={{ background: 'var(--bg-elevated)', borderRadius: 2, padding: '16px', marginBottom: 20 }}>
                  {/* Base price row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                    <span style={{ fontFamily: 'Barlow', fontSize: 13, color: 'var(--text-sub)' }}>{days} day{days > 1 ? 's' : ''} × {quantity} item{quantity > 1 ? 's' : ''}</span>
                    <span style={{ fontFamily: 'Barlow Condensed', fontSize: 14, fontWeight: 600, color: applicableDiscount ? 'var(--text-muted)' : 'var(--text)', textDecoration: applicableDiscount ? 'line-through' : undefined }}>{baseTotal.toLocaleString()} DHS</span>
                  </div>
                  {/* Discount row */}
                  {applicableDiscount && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px solid var(--border)' }}>
                      <span style={{ fontFamily: 'Barlow', fontSize: 13, color: '#4caf50' }}>{applicableDiscount.label}: -{applicableDiscount.pct}%</span>
                      <span style={{ fontFamily: 'Barlow Condensed', fontSize: 14, fontWeight: 600, color: '#4caf50' }}>-{Math.round(baseTotal * applicableDiscount.pct / 100).toLocaleString()} DHS</span>
                    </div>
                  )}
                  {/* Deposit row */}
                  {item.deposit_required && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px solid var(--border)' }}>
                      <span style={{ fontFamily: 'Barlow', fontSize: 13, color: 'var(--text-sub)' }}>Deposit</span>
                      <span style={{ fontFamily: 'Barlow Condensed', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{item.deposit_amount} DHS</span>
                    </div>
                  )}
                  <div style={{ borderTop: '1px solid var(--border-gold)', marginTop: 8, paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'Barlow Condensed', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)' }}>Total</span>
                    <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: 'var(--gold)', fontWeight: 700 }}>{Math.round((total + (item.deposit_required ? item.deposit_amount || 0 : 0)) * 100 / 100).toLocaleString()} DHS</span>
                  </div>
                </div>
              )}

              <button
                onClick={() => { if(startDate && endDate) router.push(`/bookings/new?itemId=${id}&startDate=${startDate}&endDate=${endDate}&quantity=${quantity}`); }}
                disabled={!startDate || !endDate}
                className="btn-gold"
                style={{ width: '100%', padding: '14px', borderRadius: 2, fontSize: 13, border: 'none', cursor: (!startDate || !endDate) ? 'not-allowed' : 'pointer' }}
              >
                {!startDate || !endDate ? 'Select Dates to Book' : item.instant_book ? '⚡ Book Instantly' : 'Book This Prop'}
              </button>

              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'block', width: '100%', marginTop: 10, padding: '12px 14px', textAlign: 'center', fontFamily: 'Barlow Condensed', fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#25D366', border: '1px solid #25D366', borderRadius: 2, background: 'transparent', textDecoration: 'none', boxSizing: 'border-box' }}
                >
                  💬 Contact on WhatsApp
                </a>
              )}

              <p style={{ textAlign: 'center', fontFamily: 'Barlow', fontSize: 11, color: 'var(--text-muted)', marginTop: 12 }}>{item.instant_book ? 'Booking confirmed immediately' : 'No charge until confirmed'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
