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
  const [items, setItems]       = useState<Item[]>([]);
  const [loading, setLoading]   = useState(true);
  const [mapView, setMapView]   = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'category'|'location'|'era'|null>(null);
  const [filters, setFilters]   = useState({
    category: '', location: '', minPrice: '', maxPrice: '',
    search: '', era: '', instantBook: false,
  });
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>|null>(null);

  useEffect(() => { fetchItems(); }, [filters]);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  async function fetchItems() {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (filters.category)    p.append('category', filters.category);
      if (filters.location)    p.append('location', filters.location);
      if (filters.minPrice)    p.append('minPrice', filters.minPrice);
      if (filters.maxPrice)    p.append('maxPrice', filters.maxPrice);
      if (filters.search)      p.append('search', filters.search);
      if (filters.era)         p.append('era', filters.era);
      if (filters.instantBook) p.append('instantBook', 'true');
      const r = await fetch(`/api/items?${p}`);
      const d = await r.json();
      setItems(Array.isArray(d) ? d : []);
    } catch { setItems([]); }
    finally { setLoading(false); }
  }

  function onSearch(v: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setFilters(f => ({ ...f, search: v })), 380);
  }

  function pick(key: string, val: string) {
    setFilters(f => ({ ...f, [key]: f[key as keyof typeof f] === val ? '' : val }));
  }

  const hasFilters = !!(filters.category || filters.location || filters.era || filters.instantBook || filters.search || filters.minPrice || filters.maxPrice);

  const pillBase: React.CSSProperties = {
    display: 'inline-block',
    padding: '6px 16px',
    fontFamily: "'Outfit', sans-serif",
    fontSize: 12,
    fontWeight: 400,
    letterSpacing: '0.04em',
    cursor: 'pointer',
    border: '1px solid var(--line)',
    background: 'transparent',
    color: 'var(--ink-mid)',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap' as const,
  };

  const pillActive: React.CSSProperties = {
    ...pillBase,
    background: 'var(--ink)',
    color: 'var(--bg)',
    border: '1px solid var(--ink)',
  };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* ──────────────── NAV ──────────────── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px',
        background: scrolled ? 'rgba(255,255,255,0.94)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--line)' : '1px solid transparent',
        transition: 'all 0.35s var(--ease)',
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{
            fontFamily: "'Cormorant', Georgia, serif",
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 24,
            color: 'var(--ink)',
            letterSpacing: '-0.01em',
          }}>
            PropFlow
          </span>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
          {[
            { label: 'Browse', href: '#catalogue' },
            { label: 'Decorators', href: '/decorators/dashboard' },
          ].map(({ label, href }) => (
            <Link key={label} href={href} style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 13,
              fontWeight: 400,
              color: 'var(--ink-mid)',
              textDecoration: 'none',
              letterSpacing: '0.02em',
              transition: 'color 0.15s ease',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-mid)')}
            >
              {label}
            </Link>
          ))}
          <Link href="/auth/login" style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 13,
            fontWeight: 400,
            color: 'var(--ink-mid)',
            textDecoration: 'none',
            letterSpacing: '0.02em',
            transition: 'color 0.15s ease',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-mid)')}
          >
            Sign in
          </Link>
          <Link href="/auth/signup" className="btn-dark" style={{
            padding: '9px 22px',
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: '0.06em',
            textDecoration: 'none',
          }}>
            Get started
          </Link>
        </nav>
      </header>

      {/* ──────────────── HERO ──────────────── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '0 48px 64px',
        position: 'relative',
        borderBottom: '1px solid var(--line)',
        overflow: 'hidden',
      }}>
        {/* Background grid lines — architectural */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          {[20, 45, 70].map(pct => (
            <div key={pct} style={{
              position: 'absolute', top: 0, bottom: 0,
              left: `${pct}%`, width: 1,
              background: 'var(--line)', opacity: 0.5,
            }} />
          ))}
        </div>

        {/* Top-right corner meta */}
        <div className="fade-in d1" style={{
          position: 'absolute', top: 80, right: 48,
          display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6,
        }}>
          <span className="label">Morocco · Est. 2025</span>
          <span className="label">Cinema Prop Marketplace</span>
        </div>

        {/* Main headline */}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1000 }}>
          <p className="label fade-up d1" style={{ marginBottom: 32 }}>
            No. 001 — The Prop Catalogue
          </p>

          <h1 className="fade-up d2" style={{
            fontFamily: "'Cormorant', Georgia, serif",
            fontWeight: 300,
            fontSize: 'clamp(72px, 10vw, 148px)',
            lineHeight: 0.92,
            letterSpacing: '-0.03em',
            color: 'var(--ink)',
            marginBottom: 0,
          }}>
            Every scene
          </h1>
          <h1 className="fade-up d3" style={{
            fontFamily: "'Cormorant', Georgia, serif",
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 'clamp(72px, 10vw, 148px)',
            lineHeight: 0.92,
            letterSpacing: '-0.03em',
            color: 'var(--gold)',
            marginBottom: 48,
          }}>
            tells a story.
          </h1>

          <div className="fade-up d4" style={{
            display: 'flex', alignItems: 'center', gap: 40,
          }}>
            <p style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 300,
              fontSize: 16,
              color: 'var(--ink-mid)',
              lineHeight: 1.7,
              maxWidth: 380,
            }}>
              Morocco's first marketplace for cinema props. Hundreds of pieces, five cities, one platform.
            </p>

            <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
              <Link href="/auth/signup?role=renter" className="btn-dark" style={{
                padding: '14px 32px', fontSize: 12, fontWeight: 500,
                letterSpacing: '0.06em', textDecoration: 'none',
              }}>
                Browse props
              </Link>
              <Link href="/auth/signup?role=decorator" className="btn-outline" style={{
                padding: '14px 32px', fontSize: 12, fontWeight: 500,
                letterSpacing: '0.06em', textDecoration: 'none',
              }}>
                List your props
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom stats bar */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          borderTop: '1px solid var(--line)',
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        }}>
          {[
            { n: `${!loading ? items.length : '—'}`, l: 'Props listed' },
            { n: '5', l: 'Moroccan cities' },
            { n: '50+', l: 'Decorators' },
            { n: 'Free', l: 'To browse' },
          ].map((s, i) => (
            <div key={i} style={{
              padding: '24px 40px',
              borderRight: i < 3 ? '1px solid var(--line)' : 'none',
              display: 'flex', flexDirection: 'column', gap: 6,
            }}>
              <span style={{
                fontFamily: "'Cormorant', serif", fontWeight: 300,
                fontSize: 40, lineHeight: 1, color: 'var(--ink)',
              }}>{s.n}</span>
              <span className="label">{s.l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ──────────────── CATALOGUE ──────────────── */}
      <section id="catalogue" style={{ paddingTop: 64 }}>

        {/* Search + filters */}
        <div style={{
          padding: '0 48px 32px',
          borderBottom: '1px solid var(--line)',
        }}>
          {/* Search */}
          <div style={{ position: 'relative', marginBottom: 28 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink-ghost)" strokeWidth="1.5" strokeLinecap="round" style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              ref={searchRef}
              type="text"
              placeholder="Search props by name, style, or era…"
              defaultValue={filters.search}
              onChange={e => onSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 0 12px 28px',
                fontFamily: "'Outfit', sans-serif",
                fontSize: 18,
                fontWeight: 300,
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid var(--line)',
                outline: 'none',
                color: 'var(--ink)',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={e => (e.target.style.borderBottomColor = 'var(--ink)')}
              onBlur={e => (e.target.style.borderBottomColor = 'var(--line)')}
            />
          </div>

          {/* Filter pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <span className="label" style={{ marginRight: 8 }}>Filter</span>

            {CATEGORIES.map(c => (
              <button key={c} onClick={() => pick('category', c)}
                style={filters.category === c ? pillActive : pillBase}
                onMouseEnter={e => { if (filters.category !== c) { (e.currentTarget as HTMLElement).style.borderColor = 'var(--ink-mid)'; (e.currentTarget as HTMLElement).style.color = 'var(--ink)'; }}}
                onMouseLeave={e => { if (filters.category !== c) { (e.currentTarget as HTMLElement).style.borderColor = 'var(--line)'; (e.currentTarget as HTMLElement).style.color = 'var(--ink-mid)'; }}}
              >{c}</button>
            ))}

            <div style={{ width: 1, height: 20, background: 'var(--line)', margin: '0 4px' }} />

            {LOCATIONS.map(l => (
              <button key={l} onClick={() => pick('location', l)}
                style={filters.location === l ? pillActive : pillBase}
                onMouseEnter={e => { if (filters.location !== l) { (e.currentTarget as HTMLElement).style.borderColor = 'var(--ink-mid)'; (e.currentTarget as HTMLElement).style.color = 'var(--ink)'; }}}
                onMouseLeave={e => { if (filters.location !== l) { (e.currentTarget as HTMLElement).style.borderColor = 'var(--line)'; (e.currentTarget as HTMLElement).style.color = 'var(--ink-mid)'; }}}
              >{l}</button>
            ))}

            <div style={{ width: 1, height: 20, background: 'var(--line)', margin: '0 4px' }} />

            <button
              onClick={() => setFilters(f => ({...f, instantBook: !f.instantBook}))}
              style={filters.instantBook ? { ...pillActive, background: 'var(--gold)', borderColor: 'var(--gold)' } : pillBase}
            >
              ⚡ Instant Book
            </button>

            <button
              onClick={() => setMapView(v => !v)}
              style={mapView ? pillActive : pillBase}
            >
              ◎ Map
            </button>

            {hasFilters && (
              <button onClick={() => { setFilters({ category: '', location: '', minPrice: '', maxPrice: '', search: '', era: '', instantBook: false }); if (searchRef.current) searchRef.current.value = ''; }}
                style={{ ...pillBase, color: 'var(--ink-ghost)', border: 'none', padding: '6px 8px' }}>
                × Clear
              </button>
            )}

            <span style={{
              marginLeft: 'auto',
              fontFamily: "'Outfit', sans-serif",
              fontSize: 13,
              color: 'var(--ink-soft)',
              fontWeight: 300,
            }}>
              {!loading && `${items.length} ${items.length === 1 ? 'prop' : 'props'}`}
            </span>
          </div>
        </div>

        {/* Results */}
        <div style={{ padding: '0 48px 96px' }}>
          {loading ? (
            <div style={{ padding: '80px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
              <div style={{
                width: 240, height: 1,
                background: 'var(--line)',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'var(--ink)',
                  animation: 'scan 1.4s var(--ease) infinite',
                }} />
                <style>{`@keyframes scan { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }`}</style>
              </div>
              <span className="label">Loading catalogue</span>
            </div>
          ) : items.length === 0 ? (
            <div style={{ padding: '120px 0', textAlign: 'center' }}>
              <p style={{ fontFamily: "'Cormorant', serif", fontStyle: 'italic', fontSize: 52, fontWeight: 300, color: 'var(--ink-soft)', marginBottom: 16 }}>Nothing found.</p>
              <button onClick={() => setFilters({ category: '', location: '', minPrice: '', maxPrice: '', search: '', era: '', instantBook: false })} className="btn-outline" style={{ padding: '10px 24px', fontSize: 12, cursor: 'pointer', marginTop: 8 }}>Clear filters</button>
            </div>
          ) : mapView ? (
            <div style={{ paddingTop: 40 }}><PropsMap items={items} /></div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1px',
              background: 'var(--line)',
              border: '1px solid var(--line)',
              marginTop: 1,
            }}>
              {items.map((item, idx) => (
                <Link
                  key={item.id}
                  href={`/items/${item.id}`}
                  style={{ textDecoration: 'none', display: 'block', background: 'var(--bg)', gridColumn: idx % 9 === 0 ? 'span 2' : 'span 1' }}
                >
                  <div className="prop-card">
                    {/* Image */}
                    <div className="prop-image" style={{ aspectRatio: idx % 9 === 0 ? '16/9' : '4/3', background: 'var(--bg-warm)' }}>
                      {item.photos?.length > 0 ? (
                        <img src={item.photos[0]} alt={item.title} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-soft)' }}>
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--line-mid)" strokeWidth="1"><rect x="3" y="3" width="18" height="18"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        </div>
                      )}
                      {item.instant_book && (
                        <div style={{ position: 'absolute', top: 12, left: 12 }}>
                          <span style={{ background: 'var(--gold)', color: 'white', fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 500, padding: '3px 8px', letterSpacing: '0.06em' }}>
                            INSTANT
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ padding: '16px 20px 20px', borderTop: '1px solid var(--line)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                        <span className="prop-num">P·{String(idx + 1).padStart(3, '0')}</span>
                        <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>
                          {item.price_per_day} <span style={{ fontSize: 11, fontWeight: 300, color: 'var(--ink-soft)' }}>DHS</span>
                        </span>
                      </div>
                      <h3 style={{
                        fontFamily: "'Cormorant', Georgia, serif",
                        fontSize: 18, fontWeight: 400,
                        color: 'var(--ink)', lineHeight: 1.2,
                        marginBottom: 8, letterSpacing: '-0.01em',
                      }}>
                        {item.title}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span className="label" style={{ fontSize: 9 }}>{item.location}</span>
                        <span style={{ width: 3, height: 3, borderRadius: '50%', flexShrink: 0, background: item.condition === 'Excellent' ? '#4CAF50' : item.condition === 'Good' ? 'var(--gold)' : '#E69B3A' }} />
                        <span className="label" style={{ fontSize: 9 }}>{item.condition}</span>
                      </div>
                      {item.tags && item.tags.length > 0 && (
                        <div style={{ marginTop: 10, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {item.tags.slice(0, 2).map((t: string) => (
                            <span key={t} className="tag" style={{ fontSize: 9 }}>{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ──────────────── HOW IT WORKS ──────────────── */}
      <section style={{ borderTop: '1px solid var(--line)', background: 'var(--bg-soft)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', borderBottom: '1px solid var(--line)' }}>
          <div style={{ padding: '64px 48px', borderRight: '1px solid var(--line)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span className="label" style={{ marginBottom: 20 }}>How it works</span>
            <h2 style={{ fontFamily: "'Cormorant', serif", fontStyle: 'italic', fontWeight: 300, fontSize: 44, lineHeight: 1, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
              Simple.<br/>Professional.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {[
              { n: '01', title: 'Browse', body: 'Search props by category, city, era, or style. Filter by instant availability.' },
              { n: '02', title: 'Book', body: 'Contact the decorator. Confirm dates and pricing. Instant Book on select props.' },
              { n: '03', title: 'Create', body: 'Collect your props. Return after the shoot. Build your production's reputation.' },
            ].map((s, i) => (
              <div key={s.n} style={{
                padding: '64px 40px',
                borderRight: i < 2 ? '1px solid var(--line)' : 'none',
              }}>
                <div style={{ fontFamily: "'Cormorant', serif", fontSize: 48, fontWeight: 300, color: 'var(--line-mid)', lineHeight: 1, marginBottom: 24 }}>{s.n}</div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 500, color: 'var(--ink)', marginBottom: 12 }}>{s.title}</h3>
                <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 300, color: 'var(--ink-mid)', lineHeight: 1.7 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA band */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '40px 48px',
          borderBottom: '1px solid var(--line)',
        }}>
          <div>
            <h3 style={{ fontFamily: "'Cormorant', serif", fontStyle: 'italic', fontWeight: 300, fontSize: 32, color: 'var(--ink)', marginBottom: 4 }}>
              Are you a set decorator?
            </h3>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 300, color: 'var(--ink-mid)' }}>
              Monetize your prop inventory. Join Morocco's film community.
            </p>
          </div>
          <Link href="/auth/signup?role=decorator" className="btn-dark" style={{
            padding: '14px 36px', fontSize: 12, fontWeight: 500, letterSpacing: '0.06em', textDecoration: 'none', flexShrink: 0,
          }}>
            Start listing
          </Link>
        </div>
      </section>

      {/* ──────────────── FOOTER ──────────────── */}
      <footer style={{ background: 'var(--bg-accent)', color: '#F2EBD8' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
          gap: 0,
          borderBottom: '1px solid #2A2520',
        }}>
          <div style={{ padding: '56px 48px', borderRight: '1px solid #2A2520' }}>
            <div style={{ fontFamily: "'Cormorant', serif", fontStyle: 'italic', fontWeight: 400, fontSize: 32, color: '#C8A420', marginBottom: 16 }}>PropFlow</div>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300, fontSize: 13, color: '#6B6358', lineHeight: 1.7, maxWidth: 240 }}>
              Morocco's first marketplace for cinema prop rentals. Every scene deserves the right prop.
            </p>
          </div>
          {[
            { title: 'Platform', links: [['Browse Props', '/'], ['List Props', '/items/new'], ['Sign Up', '/auth/signup'], ['Sign In', '/auth/login']] },
            { title: 'Cities', links: LOCATIONS.map(l => [l, `/?location=${l}`]) },
            { title: 'Account', links: [['Dashboard', '/decorators/dashboard'], ['Bookings', '/bookings'], ['Earnings', '/decorators/earnings'], ['Admin', '/admin/dashboard']] },
          ].map((col, i) => (
            <div key={col.title} style={{ padding: '56px 40px', borderRight: i < 2 ? '1px solid #2A2520' : 'none' }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#504A40', marginBottom: 20 }}>{col.title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {col.links.map(([label, href]) => (
                  <Link key={label} href={href} style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 300, color: '#6B6358', textDecoration: 'none', transition: 'color 0.15s ease' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#F2EBD8')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#6B6358')}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: '0.14em', color: '#504A40', textTransform: 'uppercase' }}>
            © 2025 PropFlow
          </span>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: '0.14em', color: '#504A40', textTransform: 'uppercase' }}>
            Cinema Prop Rental · Morocco
          </span>
        </div>
      </footer>
    </div>
  );
}
