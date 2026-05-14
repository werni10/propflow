'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, signOut } from '@/lib/auth/client';
import { Item, User, Decorator } from '@/lib/types';

export default function DecoratorDashboard() {
  const router = useRouter();
  const [user, setUser]           = useState<User | null>(null);
  const [decorator, setDecorator] = useState<Decorator | null>(null);
  const [items, setItems]         = useState<Item[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => { checkAuth(); }, []);

  async function checkAuth() {
    const u = await getCurrentUser();
    if (!u || u.role !== 'decorator') { router.push('/auth/login'); return; }
    setUser(u);
    const [itemsRes, decoratorRes] = await Promise.all([
      fetch(`/api/items?decoratorId=${u.id}`),
      fetch(`/api/decorators?id=${u.id}`),
    ]);
    const itemsData = await itemsRes.json();
    const decoratorData = await decoratorRes.json();
    setItems(Array.isArray(itemsData) ? itemsData : []);
    if (decoratorData && !decoratorData.error) setDecorator(decoratorData as Decorator);
    setLoading(false);
  }

  async function handleSignOut() { await signOut(); router.push('/'); }

  if (loading) return <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontFamily: 'Barlow Condensed', letterSpacing: '0.15em', textTransform: 'uppercase', fontSize: 13 }}>Loading...</div>;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* NAV */}
      <nav style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-void)', height: 56, display: 'flex', alignItems: 'center', padding: '0 32px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <Link href="/" style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 700, color: 'var(--gold)', textDecoration: 'none' }}>PropFlow</Link>
          <span style={{ fontFamily: 'Barlow Condensed', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', borderLeft: '1px solid var(--border)', paddingLeft: 32 }}>Decorator Studio</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontFamily: 'Barlow', fontSize: 13, color: 'var(--text-sub)' }}>{user?.name}</span>
          <button onClick={handleSignOut} style={{ fontFamily: 'Barlow Condensed', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>Sign Out</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 32px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 8 }}>
              <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 40, fontWeight: 700, color: 'var(--text)', margin: 0 }}>My Props</h1>
              {decorator && (decorator.average_rating ?? 0) >= 4.8 && (decorator.total_listings ?? 0) >= 5 && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--gold)', color: '#1a1207', fontFamily: 'Barlow Condensed', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 2 }}>
                  ⭐ Top Decorator
                </span>
              )}
            </div>
            <p style={{ fontFamily: 'Barlow', fontSize: 14, color: 'var(--text-sub)' }}>{items.length} listing{items.length !== 1 ? 's' : ''} in your catalogue</p>
          </div>
          <Link href="/items/new" className="btn-gold" style={{ padding: '12px 28px', borderRadius: 2, fontSize: 13, textDecoration: 'none', display: 'inline-block' }}>
            + Add New Prop
          </Link>
        </div>

        <div className="divider-gold" style={{ marginBottom: 40 }} />

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
          {[
            ['Active Listings', items.length, ''],
            ['Status', user?.status === 'verified' ? 'Verified' : 'Pending', user?.status === 'verified' ? '✓' : '⏳'],
            ['Subscription', 'Active', '✓'],
          ].map(([label, value, badge]) => (
            <div key={String(label)} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 2, padding: '24px 28px' }}>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>{label}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 32, fontWeight: 700, color: 'var(--text)' }}>{value}</span>
                {badge && <span style={{ fontFamily: 'Barlow Condensed', fontSize: 11, color: 'var(--gold)', letterSpacing: '0.08em' }}>{badge}</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Instant Book tip */}
        {items.length > 0 && items.every(item => !item.instant_book) && (
          <p style={{ fontFamily: 'Barlow', fontSize: 12, color: 'var(--text-muted)', marginBottom: 40, paddingLeft: 4 }}>
            💡 Enable Instant Book to get 40% more bookings — edit any listing to turn it on.
          </p>
        )}
        {!(items.length > 0 && items.every(item => !item.instant_book)) && (
          <div style={{ marginBottom: 40 }} />
        )}

        {/* Items */}
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 2 }}>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: 'var(--text-sub)', marginBottom: 12 }}>No props listed yet.</div>
            <p style={{ fontFamily: 'Barlow', fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>Your catalogue is empty. Add your first prop to start earning.</p>
            <Link href="/items/new" className="btn-gold" style={{ padding: '12px 28px', borderRadius: 2, fontSize: 13, textDecoration: 'none', display: 'inline-block' }}>List First Prop</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {items.map(item => (
              <div key={item.id} className="card-dark" style={{ borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ aspectRatio: '4/3', background: 'var(--bg-elevated)', position: 'relative' }}>
                  {item.photos?.length > 0 ? (
                    <img src={item.photos[0]} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    </div>
                  )}
                  <div style={{ position: 'absolute', top: 10, left: 10 }}>
                    <span className="tag" style={{ background: 'rgba(8,7,8,0.85)' }}>{item.category}</span>
                  </div>
                </div>
                <div style={{ padding: '16px 18px' }}>
                  <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 500, color: 'var(--text)', marginBottom: 8, lineHeight: 1.3 }}>{item.title}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <span style={{ fontFamily: 'Barlow Condensed', fontSize: 18, fontWeight: 700, color: 'var(--gold)' }}>{item.price_per_day} <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>DHS/day</span></span>
                    <span style={{ fontFamily: 'Barlow Condensed', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{item.location}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <Link href={`/items/${item.id}`} style={{ textAlign: 'center', padding: '8px', fontFamily: 'Barlow Condensed', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-sub)', border: '1px solid var(--border)', borderRadius: 2, textDecoration: 'none' }}>View</Link>
                    <button style={{ padding: '8px', fontFamily: 'Barlow Condensed', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', border: '1px solid var(--border-gold)', borderRadius: 2, background: 'none', cursor: 'pointer' }}>Edit</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
