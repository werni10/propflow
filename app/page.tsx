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
  const [scrolled, setScrolled] = useState(false);
  const [filters, setFilters] = useState({
    category: '', location: '', minPrice: '', maxPrice: '',
    search: '', era: '', instantBook: false,
  });
  const [mounted, setMounted] = useState(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { fetchItems(); }, [filters]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
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

  function setLocation(loc: string) {
    setFilters(f => ({ ...f, location: f.location === loc ? '' : loc }));
  }

  const hasActiveFilters = filters.category || filters.location || filters.minPrice || filters.maxPrice || filters.search || filters.era || filters.instantBook;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ink)' }}>

      {/* ── NAV ────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px',
        borderBottom: scrolled ? '1px solid var(--rule)' : '1px solid transparent',
        background: scrolled ? 'rgba(253,252,249,0.97)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        transition: 'all 0.4s cubic-bezier(0.25, 0, 0, 1)',
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 22,
            fontWeight: 300,
            fontStyle: 'italic',
            color: 'var(--gold)',
            letterSpacing: '0.01em',
          }}>PropFlow</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <Link href="/auth/login" style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--warm)',
            textDecoration: 'none',
            transition: 'color 0.25s cubic-bezier(0.25,0,0,1)',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--cream)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--warm)')}
          >
            Sign In
          </Link>
          <Link href="/auth/signup" style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--cream)',
            textDecoration: 'none',
            transition: 'color 0.25s cubic-bezier(0.25,0,0,1)',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--cream)')}
          >
            List a Prop →
          </Link>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '60fr 40fr',
        borderBottom: '1px solid var(--rule)',
        overflow: 'hidden',
      }}>

        {/* Left column */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '120px 80px 80px 80px',
          borderRight: '1px solid var(--rule)',
          position: 'relative',
        }}>

          {/* Eyebrow */}
          <div className="animate-fade-up" style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: 10,
            fontWeight: 300,
            letterSpacing: '0.22em',
            color: 'var(--cool)',
            textTransform: 'uppercase',
            marginBottom: 40,
          }}>
            PROP.MA&nbsp;&nbsp;/&nbsp;&nbsp;MOROCCO&nbsp;&nbsp;/&nbsp;&nbsp;EST. 2025
          </div>

          {/* Headline */}
          <h1 className="animate-fade-up delay-1" style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(64px, 8vw, 120px)',
            fontWeight: 300,
            fontStyle: 'normal',
            lineHeight: 0.95,
            color: 'var(--cream)',
            letterSpacing: '-0.02em',
            marginBottom: 0,
          }}>
            Every prop
          </h1>
          <h1 className="animate-fade-up delay-2" style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(64px, 8vw, 120px)',
            fontWeight: 300,
            fontStyle: 'italic',
            lineHeight: 0.95,
            color: 'var(--gold)',
            letterSpacing: '-0.02em',
            marginBottom: 48,
          }}>
            tells a story.
          </h1>

          {/* Body copy */}
          <p className="animate-fade-up delay-3" style={{
            fontFamily: 'Barlow, sans-serif',
            fontWeight: 300,
            fontSize: 15,
            color: 'var(--warm)',
            maxWidth: 360,
            lineHeight: 1.8,
            marginBottom: 56,
          }}>
            Morocco's first marketplace for cinema props. From Casablanca medinas to Marrakech riads — find the exact piece your scene demands.
          </p>

          {/* CTAs */}
          <div className="animate-fade-up delay-4" style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            <Link href="#catalogue" style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--cream)',
              textDecoration: 'none',
              transition: 'color 0.25s cubic-bezier(0.25,0,0,1)',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--cream)')}
            >
              Browse Props →
            </Link>
            <span style={{ fontFamily: 'Barlow Condensed', fontSize: 12, color: 'var(--cool)', margin: '0 20px' }}>·</span>
            <Link href="/auth/signup?role=decorator" style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--warm)',
              textDecoration: 'none',
              transition: 'color 0.25s cubic-bezier(0.25,0,0,1)',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--cream)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--warm)')}
            >
              List Your Props
            </Link>
          </div>
        </div>

        {/* Right column — stats */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '120px 56px 80px 56px',
          position: 'relative',
        }}>
          {[
            { num: items.length > 0 ? `${items.length}+` : '200+', label: 'PROPS AVAILABLE' },
            { num: '50+',  label: 'DECORATORS' },
            { num: '5',    label: 'MOROCCAN CITIES' },
          ].map((stat, i) => (
            <div key={i}>
              {i > 0 && <div className="rule" style={{ margin: '0' }} />}
              <div style={{ padding: '40px 0' }}>
                <div className={`animate-fade-up delay-${i + 1}`} style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: 'clamp(40px, 5vw, 72px)',
                  fontWeight: 300,
                  color: 'var(--cream)',
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                  marginBottom: 12,
                }}>
                  {stat.num}
                </div>
                <div style={{
                  fontFamily: 'DM Mono, monospace',
                  fontSize: 10,
                  fontWeight: 300,
                  letterSpacing: '0.2em',
                  color: 'var(--cool)',
                  textTransform: 'uppercase',
                }}>
                  {stat.label}
                </div>
              </div>
            </div>
          ))}

          {/* Film strip decoration */}
          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', width: 28, color: 'var(--rule)', opacity: 0.6 }} className="film-strip">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="film-strip-cell" style={{ height: 28 }}>
                  <div className="film-strip-hole" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SEARCH LINE ──────────────────────────────────── */}
      <div id="catalogue" style={{
        borderBottom: '1px solid var(--rule)',
        background: 'var(--void)',
        position: 'sticky',
        top: 56,
        zIndex: 90,
      }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 80px' }}>

          {/* Search input */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--cool)" strokeWidth="1.5" style={{ position: 'absolute', left: 0, pointerEvents: 'none', flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              ref={searchRef}
              type="text"
              placeholder="Search by title, style, era..."
              defaultValue={filters.search}
              onChange={e => handleSearchChange(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid var(--rule-warm)',
                outline: 'none',
                width: '100%',
                padding: '20px 0 20px 28px',
                fontFamily: 'Barlow, sans-serif',
                fontWeight: 300,
                fontSize: 15,
                color: 'var(--cream)',
                transition: 'border-color 0.25s cubic-bezier(0.25,0,0,1)',
              }}
              onFocus={e => (e.target.style.borderBottomColor = 'var(--gold)')}
              onBlur={e => (e.target.style.borderBottomColor = 'var(--rule-warm)')}
            />
          </div>

          {/* Filter pills */}
          <div style={{
            display: 'flex',
            gap: 0,
            alignItems: 'center',
            overflowX: 'auto',
            padding: '14px 0',
            scrollbarWidth: 'none',
          }}>
            {/* Location pills */}
            {['All', ...LOCATIONS].map(loc => {
              const active = loc === 'All' ? !filters.location : filters.location === loc;
              return (
                <button
                  key={loc}
                  onClick={() => loc === 'All' ? setFilters(f => ({...f, location: ''})) : setLocation(loc)}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: active ? '2px solid var(--gold)' : '2px solid transparent',
                    cursor: 'pointer',
                    fontFamily: 'Barlow Condensed, sans-serif',
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: active ? 'var(--gold)' : 'var(--cool)',
                    padding: '4px 16px 6px',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.25s cubic-bezier(0.25,0,0,1)',
                    marginRight: 4,
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--warm)'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'var(--cool)'; }}
                >
                  {loc}
                </button>
              );
            })}

            {/* Separator */}
            <div style={{ width: 1, height: 16, background: 'var(--rule)', margin: '0 8px', flexShrink: 0 }} />

            {/* Category pills */}
            {CATEGORIES.map(cat => {
              const active = filters.category === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: active ? '2px solid var(--gold)' : '2px solid transparent',
                    cursor: 'pointer',
                    fontFamily: 'Barlow Condensed, sans-serif',
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: active ? 'var(--gold)' : 'var(--cool)',
                    padding: '4px 16px 6px',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.25s cubic-bezier(0.25,0,0,1)',
                    marginRight: 4,
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--warm)'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'var(--cool)'; }}
                >
                  {cat}
                </button>
              );
            })}

            {/* Separator */}
            <div style={{ width: 1, height: 16, background: 'var(--rule)', margin: '0 8px', flexShrink: 0 }} />

            {/* Special toggles */}
            <button
              onClick={() => setFilters(f => ({...f, instantBook: !f.instantBook}))}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: filters.instantBook ? '2px solid var(--gold)' : '2px solid transparent',
                cursor: 'pointer',
                fontFamily: 'Barlow Condensed, sans-serif',
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: filters.instantBook ? 'var(--gold)' : 'var(--cool)',
                padding: '4px 16px 6px',
                whiteSpace: 'nowrap',
                transition: 'all 0.25s cubic-bezier(0.25,0,0,1)',
                marginRight: 4,
              }}
            >
              ⚡ Instant Book
            </button>

            <button
              onClick={() => setMapView(v => !v)}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: mapView ? '2px solid var(--gold)' : '2px solid transparent',
                cursor: 'pointer',
                fontFamily: 'Barlow Condensed, sans-serif',
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: mapView ? 'var(--gold)' : 'var(--cool)',
                padding: '4px 16px 6px',
                whiteSpace: 'nowrap',
                transition: 'all 0.25s cubic-bezier(0.25,0,0,1)',
              }}
            >
              ◎ Map
            </button>

            {hasActiveFilters && (
              <>
                <div style={{ width: 1, height: 16, background: 'var(--rule)', margin: '0 8px', flexShrink: 0 }} />
                <button
                  onClick={() => {
                    setFilters({ category: '', location: '', minPrice: '', maxPrice: '', search: '', era: '', instantBook: false });
                    if (searchRef.current) searchRef.current.value = '';
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'DM Mono, monospace',
                    fontSize: 10,
                    fontWeight: 300,
                    letterSpacing: '0.1em',
                    color: 'var(--cool)',
                    padding: '4px 8px 6px',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--warm)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--cool)')}
                >
                  ✕ clear
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── RESULTS ──────────────────────────────────────── */}
      <section style={{ maxWidth: 1440, margin: '0 auto', padding: '56px 80px 120px' }}>

        {/* Results header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: 40,
          paddingBottom: 32,
          borderBottom: '1px solid var(--rule)',
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            {!loading && (
              <>
                <span style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: 48,
                  fontWeight: 300,
                  fontStyle: 'italic',
                  color: 'var(--cream)',
                  lineHeight: 1,
                }}>
                  {items.length}
                </span>
                <span style={{
                  fontFamily: 'DM Mono, monospace',
                  fontSize: 11,
                  fontWeight: 300,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: 'var(--cool)',
                }}>
                  {items.length === 1 ? 'result' : 'results'}
                </span>
              </>
            )}
          </div>

          {/* Active filter chips */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {filters.category && (
              <button
                onClick={() => setFilters(f => ({...f, category: ''}))}
                style={{
                  background: 'none',
                  border: '1px solid var(--rule-warm)',
                  cursor: 'pointer',
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--warm)',
                  padding: '5px 10px',
                  transition: 'all 0.2s',
                }}
              >
                {filters.category} ✕
              </button>
            )}
            {filters.location && (
              <button
                onClick={() => setFilters(f => ({...f, location: ''}))}
                style={{
                  background: 'none',
                  border: '1px solid var(--rule-warm)',
                  cursor: 'pointer',
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--warm)',
                  padding: '5px 10px',
                  transition: 'all 0.2s',
                }}
              >
                {filters.location} ✕
              </button>
            )}
            {filters.era && (
              <button
                onClick={() => setFilters(f => ({...f, era: ''}))}
                style={{
                  background: 'none',
                  border: '1px solid var(--rule-warm)',
                  cursor: 'pointer',
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--warm)',
                  padding: '5px 10px',
                }}
              >
                {filters.era} ✕
              </button>
            )}
          </div>
        </div>

        {/* Grid / Map / Loading / Empty */}
        {loading ? (
          <div style={{ padding: '100px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <span style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: 12,
              fontWeight: 300,
              letterSpacing: '0.15em',
              color: 'var(--cool)',
              textTransform: 'lowercase',
            }}>
              — scanning catalogue —
            </span>
            <div style={{ position: 'relative', width: 200, height: 1, background: 'var(--rule)' }}>
              <div style={{
                position: 'absolute',
                top: 0, left: 0, height: '100%',
                background: 'var(--gold)',
                animation: 'scanLine 1.5s ease infinite',
              }} />
            </div>
            <style>{`@keyframes scanLine { 0% { width: 0; } 50% { width: 100%; } 100% { width: 0; left: auto; right: 0; } }`}</style>
          </div>
        ) : items.length === 0 ? (
          <div style={{ padding: '120px 0', textAlign: 'center' }}>
            <div style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 56,
              fontWeight: 300,
              fontStyle: 'italic',
              color: 'var(--warm)',
              marginBottom: 20,
            }}>
              Nothing matched.
            </div>
            <p style={{
              fontFamily: 'Barlow, sans-serif',
              fontWeight: 300,
              fontSize: 14,
              color: 'var(--cool)',
              marginBottom: 36,
            }}>
              Adjust your filters or clear the search.
            </p>
            <button
              onClick={() => setFilters({ category: '', location: '', minPrice: '', maxPrice: '', search: '', era: '', instantBook: false })}
              className="btn-line"
              style={{ padding: '12px 32px', cursor: 'pointer' }}
            >
              Clear All Filters
            </button>
          </div>
        ) : mapView ? (
          <PropsMap items={items} />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '40px 32px',
          }}>
            {items.map((item, idx) => {
              const isFeatured = (idx + 1) % 7 === 0;
              const catalogNum = `P·${String(idx + 1).padStart(3, '0')}`;
              return (
                <Link
                  key={item.id}
                  href={`/items/${item.id}`}
                  style={{
                    textDecoration: 'none',
                    display: 'block',
                    gridColumn: isFeatured ? 'span 2' : 'span 1',
                    animation: `fadeUp 0.6s cubic-bezier(0.25,0,0,1) ${Math.min(idx * 0.04, 0.3)}s both`,
                  }}
                >
                  <div className="prop-card">
                    {/* Image */}
                    <div
                      className="prop-image"
                      style={{
                        aspectRatio: isFeatured ? '16/9' : '4/3',
                        background: 'var(--surface)',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      {item.photos?.length > 0 ? (
                        <img src={item.photos[0]} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'var(--surface)',
                        }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--rule-warm)" strokeWidth="1">
                            <rect x="3" y="3" width="18" height="18"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                          </svg>
                        </div>
                      )}

                      {/* Instant book badge */}
                      {item.instant_book && (
                        <div style={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          fontFamily: 'DM Mono, monospace',
                          fontSize: 9,
                          fontWeight: 300,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          color: 'var(--gold)',
                          background: 'rgba(247,245,240,0.92)',
                          padding: '4px 8px',
                        }}>
                          ⚡ instant
                        </div>
                      )}
                    </div>

                    {/* Rule */}
                    <div style={{ height: 1, background: 'var(--rule)' }} />

                    {/* Info */}
                    <div style={{ paddingTop: 14, paddingBottom: 4 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        {/* Left: catalog number + title */}
                        <div style={{ flex: 1, paddingRight: 16 }}>
                          <div className="prop-num" style={{ marginBottom: 4 }}>{catalogNum}</div>
                          <div style={{
                            fontFamily: 'Playfair Display, serif',
                            fontSize: 14,
                            fontWeight: 400,
                            color: 'var(--cream)',
                            lineHeight: 1.35,
                            letterSpacing: '-0.01em',
                          }}>
                            {item.title}
                          </div>
                        </div>
                        {/* Right: price */}
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <span style={{
                            fontFamily: 'Barlow Condensed, sans-serif',
                            fontSize: 18,
                            fontWeight: 700,
                            color: 'var(--gold)',
                            letterSpacing: '-0.01em',
                            lineHeight: 1,
                          }}>
                            {item.price_per_day}
                          </span>
                          <span style={{
                            fontFamily: 'DM Mono, monospace',
                            fontSize: 10,
                            fontWeight: 300,
                            color: 'var(--cool)',
                            marginLeft: 4,
                          }}>
                            /day
                          </span>
                        </div>
                      </div>

                      {/* Location + condition */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{
                          fontFamily: 'DM Mono, monospace',
                          fontSize: 10,
                          fontWeight: 300,
                          color: 'var(--cool)',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                        }}>
                          {item.location}
                        </span>
                        <div style={{
                          width: 5,
                          height: 5,
                          background: item.condition === 'Excellent'
                            ? '#4A7C5A'
                            : item.condition === 'Good'
                              ? 'var(--gold-lo)'
                              : 'var(--cool)',
                          flexShrink: 0,
                        }} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer>
        <div style={{ height: 1, background: 'var(--rule)' }} />

        <div style={{
          maxWidth: 1440,
          margin: '0 auto',
          padding: '72px 80px 40px',
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr',
          gap: 64,
        }}>
          {/* Left: brand */}
          <div>
            <div style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 40,
              fontWeight: 300,
              fontStyle: 'italic',
              color: 'var(--cream)',
              lineHeight: 1,
              marginBottom: 20,
            }}>
              PropFlow
            </div>
            <p style={{
              fontFamily: 'Barlow, sans-serif',
              fontWeight: 300,
              fontSize: 13,
              color: 'var(--cool)',
              lineHeight: 1.75,
              maxWidth: 240,
              marginBottom: 32,
            }}>
              Morocco's first marketplace for cinema props. Every scene tells a story.
            </p>
            <div style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: 10,
              fontWeight: 300,
              color: 'var(--cool)',
              letterSpacing: '0.12em',
            }}>
              © 2025 PropFlow
            </div>
          </div>

          {/* Center: links */}
          <div>
            <div style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--cool)',
              marginBottom: 24,
            }}>
              Navigate
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
              {[
                ['Browse Props', '/'],
                ['How It Works', '/'],
                ['Sign Up', '/auth/signup'],
                ['Sign In', '/auth/login'],
                ['List Props', '/items/new'],
                ['Dashboard', '/decorators/dashboard'],
              ].map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  style={{
                    fontFamily: 'Barlow Condensed, sans-serif',
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--cool)',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--cream)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--cool)')}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right: cities */}
          <div>
            <div style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--cool)',
              marginBottom: 24,
            }}>
              Cities
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {LOCATIONS.map(loc => (
                <button
                  key={loc}
                  onClick={() => setLocation(loc)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'DM Mono, monospace',
                    fontSize: 11,
                    fontWeight: 300,
                    letterSpacing: '0.08em',
                    color: filters.location === loc ? 'var(--gold)' : 'var(--cool)',
                    textAlign: 'left',
                    padding: 0,
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--warm)')}
                  onMouseLeave={e => (e.currentTarget.style.color = filters.location === loc ? 'var(--gold)' : 'var(--cool)')}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: 'var(--rule)' }} />

        <div style={{
          maxWidth: 1440,
          margin: '0 auto',
          padding: '20px 80px',
          display: 'flex',
          justifyContent: 'center',
        }}>
          <span style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: 10,
            fontWeight: 300,
            letterSpacing: '0.18em',
            color: 'var(--cool)',
            textTransform: 'uppercase',
          }}>
            PropFlow · Cinema Prop Rental · Morocco · 2025
          </span>
        </div>
      </footer>
    </div>
  );
}
