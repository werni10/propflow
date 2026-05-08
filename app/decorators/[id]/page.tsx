'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Decorator, Item } from '@/lib/types';

function StarRating({ rating }: { rating: number }) {
  const full  = Math.floor(rating);
  const half  = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span style={{ color: 'var(--gold)', fontSize: 18, letterSpacing: 2 }}>
      {'★'.repeat(full)}
      {half ? '½' : ''}
      {'☆'.repeat(empty)}
    </span>
  );
}

export default function DecoratorPublicProfile() {
  const params = useParams<{ id: string }>();
  const [decorator, setDecorator] = useState<Decorator | null>(null);
  const [items, setItems]         = useState<Item[]>([]);
  const [loading, setLoading]     = useState(true);
  const [notFound, setNotFound]   = useState(false);

  useEffect(() => {
    if (params?.id) load(params.id);
  }, [params?.id]);

  async function load(id: string) {
    try {
      const [decRes, itemsRes] = await Promise.all([
        fetch(`/api/decorators?id=${id}`),
        fetch(`/api/items?decoratorId=${id}`),
      ]);

      if (!decRes.ok) { setNotFound(true); setLoading(false); return; }

      const decData   = await decRes.json();
      const itemsData = await itemsRes.json();

      if (decData?.error) { setNotFound(true); setLoading(false); return; }

      setDecorator(decData);
      setItems(Array.isArray(itemsData) ? itemsData : []);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontFamily: 'Barlow Condensed', letterSpacing: '0.15em', textTransform: 'uppercase', fontSize: 13 }}>
        Loading...
      </div>
    );
  }

  if (notFound || !decorator) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 32, color: 'var(--text-sub)' }}>Decorator not found</div>
        <Link href="/" style={{ fontFamily: 'Barlow Condensed', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', textDecoration: 'none' }}>← Back to PropFlow</Link>
      </div>
    );
  }

  const displayName = (decorator as Decorator & { users?: { name?: string } }).users?.name ?? decorator.name;
  const rating      = decorator.average_rating ?? 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>

      {/* NAV */}
      <nav style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-void)', height: 56, display: 'flex', alignItems: 'center', padding: '0 32px', justifyContent: 'space-between' }}>
        <Link href="/" style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 700, color: 'var(--gold)', textDecoration: 'none' }}>PropFlow</Link>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link href="/auth/login" style={{ fontFamily: 'Barlow Condensed', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', textDecoration: 'none' }}>Sign In</Link>
          <span style={{ color: 'var(--border)', fontSize: 12 }}>|</span>
          <Link href="/auth/signup" className="btn-gold" style={{ padding: '7px 18px', fontSize: 11, borderRadius: 2, textDecoration: 'none', display: 'inline-block' }}>Get Started</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '56px 32px' }}>

        {/* PROFILE HEADER */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 40, fontWeight: 700, color: 'var(--text)', marginBottom: 16, lineHeight: 1.1 }}>
            {displayName}
          </h1>

          {decorator.bio && (
            <p style={{ fontFamily: 'Barlow', fontSize: 15, color: 'var(--text-sub)', maxWidth: 680, lineHeight: 1.7, marginBottom: 24 }}>
              {decorator.bio}
            </p>
          )}

          {/* STATS ROW */}
          <div style={{ display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap' }}>

            {/* Listings count */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{ fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Listings</span>
              <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>{decorator.total_listings ?? items.length}</span>
            </div>

            <div style={{ width: 1, height: 36, background: 'var(--border)' }} />

            {/* Rating */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Rating</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <StarRating rating={rating} />
                <span style={{ fontFamily: 'Barlow Condensed', fontSize: 16, fontWeight: 700, color: 'var(--gold)' }}>{rating > 0 ? rating.toFixed(1) : '—'}</span>
              </div>
            </div>

            {/* Verified badge */}
            {decorator.portfolio_verified && (
              <>
                <div style={{ width: 1, height: 36, background: 'var(--border)' }} />
                <span className="tag" style={{ border: '1px solid var(--gold)', color: 'var(--gold)', padding: '5px 12px', fontSize: '0.7rem' }}>
                  ✓ Verified Portfolio
                </span>
              </>
            )}
          </div>
        </div>

        {/* GOLD DIVIDER */}
        <div className="divider-gold" style={{ marginBottom: 40 }} />

        {/* PROPS SECTION */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
            Props by {displayName}
          </h2>
          <p style={{ fontFamily: 'Barlow Condensed', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            {items.length} prop{items.length !== 1 ? 's' : ''} available for rent
          </p>
        </div>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 2 }}>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: 'var(--text-sub)', marginBottom: 12 }}>No props listed yet</div>
            <p style={{ fontFamily: 'Barlow', fontSize: 14, color: 'var(--text-muted)' }}>This decorator hasn't added any props yet.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {items.map(item => (
              <Link key={item.id} href={`/items/${item.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                <div className="card-dark" style={{ borderRadius: 2, overflow: 'hidden', cursor: 'pointer' }}>
                  <div style={{ aspectRatio: '4/3', background: 'var(--bg-elevated)', position: 'relative', overflow: 'hidden' }}>
                    {item.photos?.length > 0 ? (
                      <img
                        src={item.photos[0]}
                        alt={item.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                        onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.04)')}
                        onMouseOut={e  => (e.currentTarget.style.transform = 'scale(1)')}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1">
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Barlow Condensed', letterSpacing: '0.1em', textTransform: 'uppercase' }}>No Image</span>
                      </div>
                    )}
                    <div style={{ position: 'absolute', top: 10, left: 10 }}>
                      <span className="tag" style={{ background: 'rgba(8,7,8,0.85)' }}>{item.category}</span>
                    </div>
                  </div>
                  <div style={{ padding: '16px 18px 18px' }}>
                    <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 500, color: 'var(--text)', marginBottom: 8, lineHeight: 1.3 }}>{item.title}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'Barlow Condensed', fontSize: 20, fontWeight: 700, color: 'var(--gold)', letterSpacing: '-0.01em' }}>
                        {item.price_per_day} <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)' }}>DHS/day</span>
                      </span>
                      <span style={{ fontFamily: 'Barlow Condensed', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{item.location}</span>
                    </div>
                    <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: item.condition === 'Excellent' ? '#4CAF50' : item.condition === 'Good' ? 'var(--gold)' : '#FF9800' }} />
                      <span style={{ fontFamily: 'Barlow Condensed', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{item.condition}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-void)', padding: '32px 24px', textAlign: 'center', marginTop: 80 }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, color: 'var(--gold)', marginBottom: 8 }}>PropFlow</div>
        <p style={{ fontFamily: 'Barlow Condensed', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Cinema Prop Rental · Morocco · 2025</p>
      </footer>
    </div>
  );
}
