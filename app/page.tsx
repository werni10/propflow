'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Item } from '@/lib/types';

const PropsMap = dynamic(() => import('@/components/map/PropsMap'), { ssr: false });

const CATEGORIES = ['Furniture', 'Lighting', 'Decor', 'Props', 'Textiles', 'Other'];
const LOCATIONS  = ['Casablanca', 'Fes', 'Marrakech', 'Tangier', 'Rabat'];
const ERAS       = ['1920s', '1940s', '1960s', '1970s', '1980s', 'Modern', 'Contemporary'];

const CATEGORY_ICONS: Record<string, string> = {
  Furniture: '🪑', Lighting: '💡', Decor: '🎭', Props: '🎬', Textiles: '🧵', Other: '✦'
};

export default function Home() {
  const [items, setItems]     = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapView, setMapView] = useState(false);
  const [filters, setFilters] = useState({
    category: '', location: '', minPrice: '', maxPrice: '',
    search: '', era: '', instantBook: false,
  });
  const [mounted, setMounted] = useState(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { fetchItems(); }, [filters]);

  async function fetchItems() {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (filters.category)   p.append('category', filters.category);
      if (filters.location)   p.append('location', filters.location);
      if (filters.minPrice)   p.append('minPrice', filters.minPrice);
      if (filters.maxPrice)   p.append('maxPrice', filters.maxPrice);
      if (filters.search)     p.append('search', filters.search);
      if (filters.era)        p.append('era', filters.era);
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

  function setCategory(cat: string) {
    setFilters(f => ({ ...f, category: f.category === cat ? '' : cat }));
  }

  const hasActiveFilters = filters.category || filters.location || filters.minPrice || filters.maxPrice || filters.search || filters.era || filters.instantBook;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>

      {/* ── NAV ────────────────────────────────────── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--border)', background: 'rgba(6,5,6,0.92)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontFamily: 'Cormorant Garamond, Playfair Display, serif', fontSize: 26, fontWeight: 400, fontStyle: 'italic', color: 'var(--gold)', letterSpacing: '-0.01em' }}>PropFlow</span>
            <span style={{ fontFamily: 'Barlow Condensed', fontSize: 9, letterSpacing: '0.28em', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Morocco</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/auth/login" style={{ fontFamily: 'Barlow Condensed', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', textDecoration: 'none', padding: '8px 16px', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              Sign In
            </Link>
            <Link href="/auth/signup" className="btn-gold" style={{ padding: '9px 22px', fontSize: 11, borderRadius: 1, display: 'inline-block', textDecoration: 'none' }}>
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────── */}
      <section style={{ position: 'relative', minHeight: '88vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderBottom: '1px solid var(--border)' }}>

        {/* Background glow */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 110%, rgba(201,162,39,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(to right, transparent 0%, var(--border-gold) 30%, var(--gold-dim) 50%, var(--border-gold) 70%, transparent 100%)' }} />

        {/* Film strips */}
        {[0, 1].map(side => (
          <div key={side} style={{ position: 'absolute', [side === 0 ? 'left' : 'right']: 0, top: 0, bottom: 0, width: 28, color: 'var(--gold)', opacity: 0.08 }} className="film-strip">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="film-strip-cell">
                <div className="film-strip-hole" />
              </div>
            ))}
          </div>
        ))}

        {/* Content */}
        <div style={{ textAlign: 'center', maxWidth: 900, padding: '0 48px', position: 'relative' }}>

          <div className={`eyebrow animate-fade-up`} style={{ marginBottom: 32 }}>
            Cinema · Set Design · Morocco
          </div>

          <h1 className="animate-fade-up delay-1" style={{
            fontFamily: 'Cormorant Garamond, Playfair Display, serif',
            fontSize: 'clamp(52px, 8vw, 108px)',
            fontWeight: 300,
            lineHeight: 1.0,
            color: 'var(--text)',
            letterSpacing: '-0.02em',
            marginBottom: 8,
          }}>
            Every scene
          </h1>
          <h1 className="animate-fade-up delay-2" style={{
            fontFamily: 'Cormorant Garamond, Playfair Display, serif',
            fontSize: 'clamp(52px, 8vw, 108px)',
            fontWeight: 300,
            fontStyle: 'italic',
            lineHeight: 1.0,
            color: 'var(--gold)',
            letterSpacing: '-0.02em',
            marginBottom: 40,
          }}>
            tells a story.
          </h1>

          <p className="animate-fade-up delay-3" style={{
            fontFamily: 'Barlow',
            fontSize: 16,
            color: 'var(--text-sub)',
            maxWidth: 480,
            margin: '0 auto 48px',
            fontWeight: 300,
            lineHeight: 1.8,
            letterSpacing: '0.01em',
          }}>
            Morocco's first marketplace connecting professional set decorators with filmmakers who demand excellence.
          </p>

          <div className="animate-fade-up delay-4" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth/signup?role=renter" className="btn-gold" style={{ padding: '15px 40px', fontSize: 12, borderRadius: 1, textDecoration: 'none', display: 'inline-block', letterSpacing: '0.12em' }}>
              Find Props
            </Link>
            <Link href="/auth/signup?role=decorator" className="btn-ghost" style={{ padding: '15px 40px', fontSize: 12, borderRadius: 1, textDecoration: 'none', display: 'inline-block', letterSpacing: '0.12em' }}>
              List Your Props
            </Link>
          </div>

          {/* Scroll indicator */}
          <div style={{ position: 'absolute', bottom: -80, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: 0.3 }}>
            <div style={{ width: 1, height: 48, background: 'linear-gradient(to bottom, var(--gold), transparent)' }} />
          </div>
        </div>
      </section>

      {/* ── STATS ──────────────────────────────────── */}
      <section style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-void)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 32px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {[
            { num: items.length || '200+', label: 'Props Available', sub: 'Across Morocco' },
            { num: '5', label: 'Major Cities', sub: 'Casablanca to Fes' },
            { num: '∞', label: 'Creative Possibilities', sub: 'Every production' },
          ].map((stat, i) => (
            <div key={i} style={{
              padding: '48px 40px',
              borderRight: i < 2 ? '1px solid var(--border)' : 'none',
              textAlign: 'center',
            }}>
              <div className="stat-number">{stat.num}</div>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-sub)', marginTop: 12 }}>{stat.label}</div>
              <div style={{ fontFamily: 'Barlow', fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{stat.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORY TILES ─────────────────────────── */}
      <section style={{ borderBottom: '1px solid var(--border)', padding: '64px 0' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ marginBottom: 40, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 12 }}>Browse by Category</div>
              <h2 style={{ fontFamily: 'Cormorant Garamond, Playfair Display, serif', fontSize: 'clamp(28px, 3vw, 44px)', fontWeight: 300, fontStyle: 'italic', color: 'var(--text)' }}>
                What does your scene need?
              </h2>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 2 }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  background: filters.category === cat ? 'rgba(201,162,39,0.08)' : 'var(--bg-surface)',
                  border: `1px solid ${filters.category === cat ? 'var(--border-gold)' : 'var(--border)'}`,
                  padding: '28px 16px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 12,
                }}
                onMouseEnter={e => { if (filters.category !== cat) { e.currentTarget.style.borderColor = 'var(--border-gold)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}}
                onMouseLeave={e => { if (filters.category !== cat) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-surface)'; }}}
              >
                <span style={{ fontSize: 22, lineHeight: 1 }}>{CATEGORY_ICONS[cat]}</span>
                <span style={{ fontFamily: 'Barlow Condensed', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: filters.category === cat ? 'var(--gold)' : 'var(--text-muted)' }}>{cat}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── FILTERS BAR ────────────────────────────── */}
      <div style={{ background: 'rgba(6,5,6,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 64, zIndex: 90 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '14px 32px', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>

          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 280 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              ref={searchRef}
              type="text"
              placeholder="Search props..."
              defaultValue={filters.search}
              onChange={e => handleSearchChange(e.target.value)}
              className="input-dark"
              style={{ width: '100%', padding: '8px 12px 8px 34px', borderRadius: 1, fontSize: 13 }}
            />
          </div>

          <select value={filters.location} onChange={e => setFilters(f => ({...f, location: e.target.value}))} className="input-dark" style={{ padding: '8px 12px', borderRadius: 1, fontSize: 12, cursor: 'pointer', fontFamily: 'Barlow Condensed', letterSpacing: '0.06em' }}>
            <option value="">All Cities</option>
            {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>

          <select value={filters.era} onChange={e => setFilters(f => ({...f, era: e.target.value}))} className="input-dark" style={{ padding: '8px 12px', borderRadius: 1, fontSize: 12, cursor: 'pointer', fontFamily: 'Barlow Condensed', letterSpacing: '0.06em' }}>
            <option value="">Any Era</option>
            {ERAS.map(era => <option key={era} value={era}>{era}</option>)}
          </select>

          <input type="number" placeholder="Min DHS" value={filters.minPrice} onChange={e => setFilters(f => ({...f, minPrice: e.target.value}))} className="input-dark" style={{ width: 100, padding: '8px 12px', borderRadius: 1, fontSize: 12 }} />
          <input type="number" placeholder="Max DHS" value={filters.maxPrice} onChange={e => setFilters(f => ({...f, maxPrice: e.target.value}))} className="input-dark" style={{ width: 100, padding: '8px 12px', borderRadius: 1, fontSize: 12 }} />

          {[
            { key: 'instantBook', label: '⚡ Instant', active: filters.instantBook, toggle: () => setFilters(f => ({...f, instantBook: !f.instantBook})) },
            { key: 'mapView', label: '◎ Map', active: mapView, toggle: () => setMapView(v => !v) },
          ].map(btn => (
            <button key={btn.key} onClick={btn.toggle} style={{ padding: '8px 14px', borderRadius: 1, fontSize: 11, fontFamily: 'Barlow Condensed', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', background: btn.active ? 'rgba(201,162,39,0.08)' : 'transparent', border: `1px solid ${btn.active ? 'var(--gold)' : 'var(--border)'}`, color: btn.active ? 'var(--gold)' : 'var(--text-muted)', transition: 'all 0.2s' }}>
              {btn.label}
            </button>
          ))}

          {hasActiveFilters && (
            <button onClick={() => { setFilters({ category: '', location: '', minPrice: '', maxPrice: '', search: '', era: '', instantBook: false }); if (searchRef.current) searchRef.current.value = ''; }} style={{ fontFamily: 'Barlow Condensed', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 6px', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {/* ── RESULTS HEADER ─────────────────────────── */}
      <section style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 32px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            {!loading && (
              <>
                <span style={{ fontFamily: 'Cormorant Garamond, Playfair Display, serif', fontSize: 32, fontWeight: 300, fontStyle: 'italic', color: 'var(--text)' }}>
                  {items.length}
                </span>
                <span style={{ fontFamily: 'Barlow Condensed', fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginLeft: 12 }}>
                  {items.length === 1 ? 'prop found' : 'props found'}
                </span>
              </>
            )}
          </div>
          {filters.category && (
            <span style={{ fontFamily: 'Barlow Condensed', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)' }}>
              {filters.category}
            </span>
          )}
        </div>
      </section>

      {/* ── GRID / MAP ─────────────────────────────── */}
      <section style={{ maxWidth: 1400, margin: '0 auto', padding: '0 32px 80px' }}>
        {loading ? (
          <div style={{ padding: '80px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 32, height: 32, border: '1px solid var(--border-gold)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <span style={{ fontFamily: 'Barlow Condensed', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Loading scenes…
            </span>
          </div>
        ) : items.length === 0 ? (
          <div style={{ padding: '100px 0', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Cormorant Garamond, Playfair Display, serif', fontSize: 40, fontWeight: 300, fontStyle: 'italic', color: 'var(--text-muted)', marginBottom: 16 }}>
              No props found.
            </div>
            <p style={{ fontFamily: 'Barlow', fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>
              Try adjusting your filters or search.
            </p>
            <button onClick={() => { setFilters({ category: '', location: '', minPrice: '', maxPrice: '', search: '', era: '', instantBook: false }); }} className="btn-ghost" style={{ padding: '10px 28px', fontSize: 12, borderRadius: 1, cursor: 'pointer' }}>
              Clear Filters
            </button>
          </div>
        ) : mapView ? (
          <PropsMap items={items} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 1 }}>
            {items.map((item, idx) => (
              <Link key={item.id} href={`/items/${item.id}`} style={{ textDecoration: 'none', display: 'block', animation: `fadeUp 0.5s var(--ease-out-expo) ${Math.min(idx * 0.04, 0.3)}s both` }}>
                <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}</style>
                <div className="prop-card">

                  {/* Image */}
                  <div className="prop-image" style={{ aspectRatio: '3/2', background: 'var(--bg-elevated)' }}>
                    {item.photos?.length > 0 ? (
                      <img src={item.photos[0]} alt={item.title} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10, background: 'var(--bg-elevated)' }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--border-gold)" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'Barlow Condensed', letterSpacing: '0.14em', textTransform: 'uppercase' }}>No Image</span>
                      </div>
                    )}
                    <div className="prop-overlay" />

                    {/* Badges */}
                    <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
                      <span className="tag" style={{ background: 'rgba(6,5,6,0.85)', fontSize: '0.6rem' }}>{item.category}</span>
                    </div>
                    {item.instant_book && (
                      <div style={{ position: 'absolute', top: 12, right: 12 }}>
                        <span style={{ fontFamily: 'Barlow Condensed', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', background: 'rgba(6,5,6,0.9)', border: '1px solid var(--border-gold)', padding: '3px 8px' }}>⚡ Instant</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ padding: '18px 20px 20px', borderTop: '1px solid var(--border)' }}>
                    <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 15, fontWeight: 500, color: 'var(--text)', marginBottom: 10, lineHeight: 1.35, letterSpacing: '-0.01em' }}>
                      {item.title}
                    </h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <div>
                        <span style={{ fontFamily: 'Barlow Condensed', fontSize: 22, fontWeight: 700, color: 'var(--gold)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                          {item.price_per_day}
                        </span>
                        <span style={{ fontFamily: 'Barlow Condensed', fontSize: 11, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 4 }}>DHS/day</span>
                      </div>
                      <span style={{ fontFamily: 'Barlow Condensed', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        {item.location}
                      </span>
                    </div>

                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: item.condition === 'Excellent' ? '#4CAF50' : item.condition === 'Good' ? 'var(--gold)' : '#FF9800', flexShrink: 0 }} />
                        <span style={{ fontFamily: 'Barlow Condensed', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{item.condition}</span>
                      </div>
                      {item.era && (
                        <span style={{ fontFamily: 'Barlow Condensed', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{item.era}</span>
                      )}
                    </div>

                    {item.tags && item.tags.length > 0 && (
                      <div style={{ marginTop: 10, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {item.tags.slice(0, 2).map((tag: string) => (
                          <span key={tag} className="tag" style={{ fontSize: '0.58rem', padding: '2px 7px', opacity: 0.7 }}>{tag}</span>
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

      {/* ── HOW IT WORKS ───────────────────────────── */}
      {!loading && items.length > 0 && (
        <section style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-void)', padding: '80px 0' }}>
          <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 32px' }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <div className="eyebrow" style={{ marginBottom: 16 }}>How PropFlow Works</div>
              <h2 style={{ fontFamily: 'Cormorant Garamond, Playfair Display, serif', fontSize: 'clamp(28px, 3vw, 44px)', fontWeight: 300, fontStyle: 'italic', color: 'var(--text)' }}>
                Simple. Professional. Cinematic.
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
              {[
                { num: '01', title: 'Browse', desc: 'Search hundreds of curated props across Morocco\'s cities. Filter by era, category, style, and city.' },
                { num: '02', title: 'Book', desc: 'Contact the decorator directly, agree on dates, and confirm your booking. Instant Book available on select props.' },
                { num: '03', title: 'Create', desc: 'Collect your props on the agreed date. Return them after the shoot. Leave a review to build trust.' },
              ].map(step => (
                <div key={step.num} style={{ padding: '48px 40px', borderRight: step.num !== '03' ? '1px solid var(--border)' : 'none', background: 'var(--bg-surface)' }}>
                  <div style={{ fontFamily: 'Cormorant Garamond, Playfair Display, serif', fontSize: 56, fontWeight: 300, color: 'var(--border-gold)', lineHeight: 1, marginBottom: 24 }}>{step.num}</div>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 500, color: 'var(--text)', marginBottom: 12 }}>{step.title}</div>
                  <p style={{ fontFamily: 'Barlow', fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, fontWeight: 300 }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FOOTER ─────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-void)', padding: '56px 0 32px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 48 }}>
            <div>
              <div style={{ fontFamily: 'Cormorant Garamond, Playfair Display, serif', fontSize: 28, fontWeight: 300, fontStyle: 'italic', color: 'var(--gold)', marginBottom: 12 }}>PropFlow</div>
              <p style={{ fontFamily: 'Barlow', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 260, fontWeight: 300 }}>
                Morocco's first marketplace for cinema prop rentals. Connecting set decorators with filmmakers since 2025.
              </p>
            </div>
            {[
              { title: 'Filmmakers', links: [['Browse Props', '/'], ['How It Works', '/'], ['Sign Up', '/auth/signup?role=renter']] },
              { title: 'Decorators', links: [['List Props', '/items/new'], ['Dashboard', '/decorators/dashboard'], ['Earnings', '/decorators/earnings']] },
              { title: 'Cities', links: LOCATIONS.map(l => [l, `/?location=${l}`]) },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16 }}>{col.title}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {col.links.map(([label, href]) => (
                    <Link key={label} href={href} style={{ fontFamily: 'Barlow', fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s', fontWeight: 300 }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="divider-thin" style={{ marginBottom: 28 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              © 2025 PropFlow · Cinema Prop Rental · Morocco
            </span>
            <span style={{ fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Built for Moroccan Cinema
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
