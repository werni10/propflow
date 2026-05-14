'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Item } from '@/lib/types';

const PropsMap = dynamic(() => import('@/components/map/PropsMap'), { ssr: false });

const CATEGORIES = ['Furniture', 'Lighting', 'Decor', 'Props', 'Textiles', 'Other'];
const LOCATIONS  = ['Casablanca', 'Fes', 'Marrakech', 'Tangier', 'Rabat'];
const ERAS       = ['1920s', '1940s', '1960s', '1970s', '1980s', 'Modern', 'Contemporary'];

export default function Home() {
  const [items, setItems]     = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapView, setMapView] = useState(false);
  const [filters, setFilters] = useState({
    category: '', location: '', minPrice: '', maxPrice: '',
    search: '', era: '', instantBook: false,
  });

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { fetchItems(); }, [filters]);

  async function fetchItems() {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (filters.category) p.append('category', filters.category);
      if (filters.location) p.append('location', filters.location);
      if (filters.minPrice) p.append('minPrice', filters.minPrice);
      if (filters.maxPrice) p.append('maxPrice', filters.maxPrice);
      if (filters.search)   p.append('search', filters.search);
      if (filters.era)      p.append('era', filters.era);
      if (filters.instantBook) p.append('instantBook', 'true');
      const res = await fetch(`/api/items?${p}`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch { setItems([]); }
    finally { setLoading(false); }
  }

  function handleSearchChange(value: string) {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setFilters(f => ({ ...f, search: value }));
    }, 400);
  }

  const hasActiveFilters = filters.category || filters.location || filters.minPrice || filters.maxPrice || filters.search || filters.era || filters.instantBook;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>

      {/* NAV */}
      <nav style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-void)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 700, color: 'var(--gold)' }}>PropFlow</span>
              <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 10, letterSpacing: '0.2em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Morocco</span>
            </div>
          </Link>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Link href="/auth/login" style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-sub)', textDecoration: 'none' }}>Sign in</Link>
            <Link href="/auth/signup" className="btn-gold" style={{ padding: '8px 20px', fontSize: 12, borderRadius: 2, display: 'inline-block', textDecoration: 'none' }}>Get Started</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: 'relative', borderBottom: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 80% at 50% 120%, rgba(212,168,50,0.07) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(to right, transparent, var(--border-gold), transparent)' }} />

        {/* film strip accents */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 32, display: 'flex', flexDirection: 'column', gap: 0, overflow: 'hidden', opacity: 0.15 }}>
          {Array.from({length: 20}).map((_, i) => (
            <div key={i} style={{ flex: 1, borderBottom: '1px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 14, height: '60%', border: '1px solid var(--gold)', borderRadius: 2 }} />
            </div>
          ))}
        </div>
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 32, display: 'flex', flexDirection: 'column', gap: 0, overflow: 'hidden', opacity: 0.15 }}>
          {Array.from({length: 20}).map((_, i) => (
            <div key={i} style={{ flex: 1, borderBottom: '1px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 14, height: '60%', border: '1px solid var(--gold)', borderRadius: 2 }} />
            </div>
          ))}
        </div>

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 64px', textAlign: 'center', position: 'relative' }}>
          <div className="tag" style={{ display: 'inline-block', marginBottom: 24 }}>Cinema · Set Design · Morocco</div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(40px, 6vw, 76px)', fontWeight: 700, lineHeight: 1.1, color: 'var(--text)', marginBottom: 20 }}>
            The Stage is Set.<br/>
            <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Find Your Props.</em>
          </h1>
          <p style={{ fontFamily: 'Barlow, sans-serif', fontSize: 17, color: 'var(--text-sub)', maxWidth: 540, margin: '0 auto 40px', fontWeight: 300, lineHeight: 1.7 }}>
            Morocco's first marketplace connecting professional set decorators with filmmakers. Every prop, every scene, every story.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth/signup?role=renter" className="btn-gold" style={{ padding: '14px 32px', fontSize: 13, borderRadius: 2, textDecoration: 'none', display: 'inline-block' }}>Find Props</Link>
            <Link href="/auth/signup?role=decorator" className="btn-ghost" style={{ padding: '14px 32px', fontSize: 13, borderRadius: 2, textDecoration: 'none', display: 'inline-block' }}>List Your Props</Link>
          </div>
        </div>
      </section>

      {/* FILTERS */}
      <section style={{ background: 'var(--bg-void)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '16px 24px', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: 'Barlow Condensed', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginRight: 4 }}>Filter</span>

          {/* Search — first in bar, debounced */}
          <input
            key="search"
            type="text"
            placeholder="Search props..."
            defaultValue={filters.search}
            onChange={e => handleSearchChange(e.target.value)}
            className="input-dark"
            style={{ width: 180, padding: '8px 12px', borderRadius: 2, fontSize: 13 }}
          />

          <select key="cat" value={filters.category} onChange={e => setFilters(f => ({...f, category: e.target.value}))} className="input-dark" style={{ padding: '8px 12px', borderRadius: 2, fontSize: 13, cursor: 'pointer' }}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select key="loc" value={filters.location} onChange={e => setFilters(f => ({...f, location: e.target.value}))} className="input-dark" style={{ padding: '8px 12px', borderRadius: 2, fontSize: 13, cursor: 'pointer' }}>
            <option value="">All Cities</option>
            {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>

          {/* Era filter */}
          <select key="era" value={filters.era} onChange={e => setFilters(f => ({...f, era: e.target.value}))} className="input-dark" style={{ padding: '8px 12px', borderRadius: 2, fontSize: 13, cursor: 'pointer' }}>
            <option value="">Era</option>
            {ERAS.map(era => <option key={era} value={era}>{era}</option>)}
          </select>

          <input key="min" type="number" placeholder="Min DHS" value={filters.minPrice} onChange={e => setFilters(f => ({...f, minPrice: e.target.value}))} className="input-dark" style={{ width: 110, padding: '8px 12px', borderRadius: 2, fontSize: 13 }} />
          <input key="max" type="number" placeholder="Max DHS" value={filters.maxPrice} onChange={e => setFilters(f => ({...f, maxPrice: e.target.value}))} className="input-dark" style={{ width: 110, padding: '8px 12px', borderRadius: 2, fontSize: 13 }} />

          {/* Instant Book toggle */}
          <button
            key="instantBook"
            onClick={() => setFilters(f => ({...f, instantBook: !f.instantBook}))}
            style={{
              padding: '8px 14px',
              borderRadius: 2,
              fontSize: 12,
              fontFamily: 'Barlow Condensed, sans-serif',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              background: filters.instantBook ? 'transparent' : 'var(--bg-elevated)',
              border: filters.instantBook ? '1px solid var(--gold)' : '1px solid var(--border)',
              color: filters.instantBook ? 'var(--gold)' : 'var(--text-muted)',
              transition: 'border-color 0.2s, color 0.2s',
            }}
          >
            ⚡ Instant Book
          </button>

          {/* Map View toggle */}
          <button
            key="mapView"
            onClick={() => setMapView(v => !v)}
            style={{
              padding: '8px 14px',
              borderRadius: 2,
              fontSize: 12,
              fontFamily: 'Barlow Condensed, sans-serif',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              background: mapView ? 'transparent' : 'var(--bg-elevated)',
              border: mapView ? '1px solid var(--gold)' : '1px solid var(--border)',
              color: mapView ? 'var(--gold)' : 'var(--text-muted)',
              transition: 'border-color 0.2s, color 0.2s',
            }}
          >
            ◎ Map View
          </button>

          {hasActiveFilters && (
            <button onClick={() => setFilters({ category: '', location: '', minPrice: '', maxPrice: '', search: '', era: '', instantBook: false })} style={{ fontFamily: 'Barlow Condensed', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>✕ Clear</button>
          )}
        </div>
      </section>

      {/* GRID / MAP */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)', fontFamily: 'Barlow Condensed', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: 13 }}>Loading scenes...</div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: 'var(--text-sub)', marginBottom: 12 }}>No props found</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Try adjusting your filters</p>
          </div>
        ) : mapView ? (
          <PropsMap items={items} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {items.map(item => (
              <Link key={item.id} href={`/items/${item.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                <div className="card-dark" style={{ borderRadius: 2, overflow: 'hidden', cursor: 'pointer' }}>
                  <div style={{ aspectRatio: '4/3', background: 'var(--bg-elevated)', position: 'relative', overflow: 'hidden' }}>
                    {item.photos?.length > 0 ? (
                      <img src={item.photos[0]} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }} onMouseOver={e => (e.currentTarget.style.transform='scale(1.04)')} onMouseOut={e => (e.currentTarget.style.transform='scale(1)')} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Barlow Condensed', letterSpacing: '0.1em', textTransform: 'uppercase' }}>No Image</span>
                      </div>
                    )}
                    <div style={{ position: 'absolute', top: 10, left: 10 }}>
                      <span className="tag" style={{ background: 'rgba(8,7,8,0.85)' }}>{item.category}</span>
                    </div>
                    {item.instant_book && (
                      <div style={{ position: 'absolute', top: 10, right: 10 }}>
                        <span style={{ fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gold)', background: 'rgba(8,7,8,0.85)', border: '1px solid var(--gold)', padding: '2px 7px', borderRadius: 2 }}>⚡ Instant</span>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '16px 18px 18px' }}>
                    <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 500, color: 'var(--text)', marginBottom: 8, lineHeight: 1.3 }}>{item.title}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'Barlow Condensed', fontSize: 20, fontWeight: 700, color: 'var(--gold)', letterSpacing: '-0.01em' }}>{item.price_per_day} <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)' }}>DHS/day</span></span>
                      <span style={{ fontFamily: 'Barlow Condensed', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{item.location}</span>
                    </div>
                    <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: item.condition === 'Excellent' ? '#4CAF50' : item.condition === 'Good' ? 'var(--gold)' : '#FF9800' }} />
                      <span style={{ fontFamily: 'Barlow Condensed', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{item.condition}</span>
                    </div>
                    {item.tags && item.tags.length > 0 && (
                      <div style={{ marginTop: 8, display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        {item.tags.slice(0, 2).map((tag: string) => (
                          <span key={tag} className="tag" style={{ fontSize: 10, padding: '2px 8px' }}>{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-void)', padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, color: 'var(--gold)', marginBottom: 8 }}>PropFlow</div>
        <p style={{ fontFamily: 'Barlow Condensed', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Cinema Prop Rental · Morocco · 2025</p>
      </footer>
    </div>
  );
}
