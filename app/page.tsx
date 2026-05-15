'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Item } from '@/lib/types';

const PropsMap = dynamic(() => import('@/components/map/PropsMap'), { ssr: false });

const CATEGORIES = ['Furniture', 'Lighting', 'Decor', 'Props', 'Textiles', 'Other'];
const LOCATIONS  = ['Casablanca', 'Fes', 'Marrakech', 'Tangier', 'Rabat'];
const ERAS       = ['1920s', '1940s', '1960s', '1970s', '1980s', 'Modern', 'Contemporary'];

// Each category gets a distinct background color swatch
const CAT_COLORS: Record<string, string> = {
  Furniture: '#E8E3DA', Lighting: '#DDE4E0', Decor: '#E4DDE8',
  Props: '#E8E1D8', Textiles: '#DFE4E2', Other: '#E3E3E3',
};

export default function Home() {
  const [items, setItems]       = useState<Item[]>([]);
  const [loading, setLoading]   = useState(true);
  const [mapView, setMapView]   = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [heroSearch, setHeroSearch]   = useState('');
  const [heroLocation, setHeroLocation] = useState('');
  const [filters, setFilters]   = useState({
    category: '', location: '', minPrice: '', maxPrice: '',
    search: '', era: '', instantBook: false,
  });
  const catalogueRef = useRef<HTMLDivElement>(null);
  const debounceRef  = useRef<ReturnType<typeof setTimeout>|null>(null);

  useEffect(() => { fetchItems(); }, [filters]);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
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

  function handleHeroSearch(e: React.FormEvent) {
    e.preventDefault();
    setFilters(f => ({ ...f, search: heroSearch, location: heroLocation }));
    catalogueRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  function pick(key: string, val: string) {
    setFilters(f => ({ ...f, [key]: f[key as keyof typeof f] === val ? '' : val }));
    catalogueRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  const hasFilters = !!(filters.category || filters.location || filters.era || filters.instantBook || filters.search);

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh' }}>

      {/* ── NAV ─────────────────────────────────────── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px',
        background: scrolled ? 'rgba(255,255,255,0.96)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: `1px solid ${scrolled ? '#E8E4DC' : 'transparent'}`,
        transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontFamily: "'Cormorant', serif", fontStyle: 'italic', fontWeight: 400, fontSize: 22, color: '#0A0908', letterSpacing: '-0.01em' }}>
            PropFlow
          </span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
          <a href="#catalogue" style={{ fontFamily: "'Outfit',sans-serif", fontSize: 13, fontWeight: 400, color: '#5C5750', textDecoration: 'none', letterSpacing: '0.01em' }}
            onMouseEnter={e=>(e.currentTarget.style.color='#0A0908')} onMouseLeave={e=>(e.currentTarget.style.color='#5C5750')}>Browse</a>
          <Link href="/auth/login" style={{ fontFamily: "'Outfit',sans-serif", fontSize: 13, fontWeight: 400, color: '#5C5750', textDecoration: 'none' }}
            onMouseEnter={e=>(e.currentTarget.style.color='#0A0908')} onMouseLeave={e=>(e.currentTarget.style.color='#5C5750')}>Sign in</Link>
          <Link href="/auth/signup" style={{ fontFamily: "'Outfit',sans-serif", fontSize: 12, fontWeight: 500, color: '#FFFFFF', background: '#0A0908', padding: '9px 22px', textDecoration: 'none', letterSpacing: '0.04em', transition: 'background 0.15s ease' }}
            onMouseEnter={e=>(e.currentTarget.style.background='#2A2520')} onMouseLeave={e=>(e.currentTarget.style.background='#0A0908')}>
            Get started
          </Link>
        </div>
      </header>

      {/* ── HERO — search-first ──────────────────────── */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '80px 40px 60px',
        background: '#FAFAF8',
        borderBottom: '1px solid #E8E4DC',
        position: 'relative',
        textAlign: 'center',
      }}>
        {/* Corner metadata */}
        <div style={{ position: 'absolute', bottom: 36, left: 40, display: 'flex', gap: 24 }}>
          {['200+ Props', '5 Cities', '50+ Decorators'].map(s => (
            <span key={s} style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, fontWeight: 300, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#9C9589' }}>{s}</span>
          ))}
        </div>
        <div style={{ position: 'absolute', bottom: 36, right: 40 }}>
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#9C9589' }}>Est. 2025 · Morocco</span>
        </div>

        {/* Eyebrow */}
        <p className="fade-up" style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9C9589', marginBottom: 28 }}>
          The Cinema Prop Catalogue
        </p>

        {/* Headline */}
        <h1 className="fade-up d1" style={{
          fontFamily: "'Cormorant', serif", fontWeight: 300,
          fontSize: 'clamp(56px, 8vw, 112px)',
          lineHeight: 0.94, letterSpacing: '-0.03em',
          color: '#0A0908', marginBottom: 8,
        }}>
          Every scene
        </h1>
        <h1 className="fade-up d2" style={{
          fontFamily: "'Cormorant', serif", fontStyle: 'italic', fontWeight: 300,
          fontSize: 'clamp(56px, 8vw, 112px)',
          lineHeight: 0.94, letterSpacing: '-0.03em',
          color: '#C9971C', marginBottom: 52,
        }}>
          tells a story.
        </h1>

        {/* Search card — Giggster-inspired */}
        <form onSubmit={handleHeroSearch} className="fade-up d3" style={{
          width: '100%', maxWidth: 720,
          background: '#FFFFFF',
          border: '1px solid #E8E4DC',
          display: 'flex', alignItems: 'stretch',
          boxShadow: '0 4px 32px rgba(10,9,8,0.06)',
        }}>
          {/* What */}
          <div style={{ flex: 1, padding: '18px 24px', borderRight: '1px solid #E8E4DC', display: 'flex', flexDirection: 'column', gap: 4, textAlign: 'left' }}>
            <label style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9C9589' }}>What</label>
            <input
              type="text" placeholder="Furniture, lanterns, rugs…"
              value={heroSearch} onChange={e => setHeroSearch(e.target.value)}
              style={{ background: 'none', border: 'none', outline: 'none', fontFamily: "'Outfit',sans-serif", fontSize: 15, fontWeight: 300, color: '#0A0908' }}
            />
          </div>
          {/* Where */}
          <div style={{ width: 180, padding: '18px 24px', borderRight: '1px solid #E8E4DC', display: 'flex', flexDirection: 'column', gap: 4, textAlign: 'left' }}>
            <label style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9C9589' }}>Where</label>
            <select value={heroLocation} onChange={e => setHeroLocation(e.target.value)}
              style={{ background: 'none', border: 'none', outline: 'none', fontFamily: "'Outfit',sans-serif", fontSize: 15, fontWeight: 300, color: heroLocation ? '#0A0908' : '#9C9589', cursor: 'pointer', appearance: 'none' as const }}>
              <option value="">Any city</option>
              {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          {/* Search button */}
          <button type="submit" style={{
            padding: '0 28px', background: '#0A0908', color: '#FFF',
            border: 'none', cursor: 'pointer',
            fontFamily: "'Outfit',sans-serif", fontSize: 12, fontWeight: 500, letterSpacing: '0.06em',
            transition: 'background 0.15s ease',
          }}
            onMouseEnter={e=>(e.currentTarget.style.background='#2A2520')}
            onMouseLeave={e=>(e.currentTarget.style.background='#0A0908')}>
            Search
          </button>
        </form>

        {/* Quick category links */}
        <div className="fade-up d4" style={{ display: 'flex', gap: 8, marginTop: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => { pick('category', c); }} style={{
              fontFamily: "'Outfit',sans-serif", fontSize: 12, fontWeight: 400,
              color: '#5C5750', background: 'transparent', border: '1px solid #E8E4DC',
              padding: '6px 16px', cursor: 'pointer', transition: 'all 0.15s ease', letterSpacing: '0.02em',
            }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='#0A0908'; e.currentTarget.style.color='#0A0908';}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='#E8E4DC'; e.currentTarget.style.color='#5C5750';}}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* ── CATALOGUE ───────────────────────────────── */}
      <div ref={catalogueRef} id="catalogue" />

      {/* Active filters + count bar */}
      <div style={{ padding: '20px 40px', borderBottom: '1px solid #E8E4DC', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', background: '#FFF', position: 'sticky', top: 60, zIndex: 100 }}>
        {/* Inline filters */}
        <select value={filters.location} onChange={e => setFilters(f=>({...f,location:e.target.value}))}
          style={{ fontFamily: "'Outfit',sans-serif", fontSize: 12, color: '#5C5750', background: 'none', border: '1px solid #E8E4DC', padding: '6px 12px', cursor: 'pointer', outline: 'none' }}>
          <option value="">All cities</option>
          {LOCATIONS.map(l=><option key={l} value={l}>{l}</option>)}
        </select>

        <select value={filters.category} onChange={e => setFilters(f=>({...f,category:e.target.value}))}
          style={{ fontFamily: "'Outfit',sans-serif", fontSize: 12, color: '#5C5750', background: 'none', border: '1px solid #E8E4DC', padding: '6px 12px', cursor: 'pointer', outline: 'none' }}>
          <option value="">All categories</option>
          {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
        </select>

        <select value={filters.era} onChange={e => setFilters(f=>({...f,era:e.target.value}))}
          style={{ fontFamily: "'Outfit',sans-serif", fontSize: 12, color: '#5C5750', background: 'none', border: '1px solid #E8E4DC', padding: '6px 12px', cursor: 'pointer', outline: 'none' }}>
          <option value="">Any era</option>
          {ERAS.map(e=><option key={e} value={e}>{e}</option>)}
        </select>

        <button onClick={() => setFilters(f=>({...f,instantBook:!f.instantBook}))} style={{
          fontFamily: "'Outfit',sans-serif", fontSize: 12, fontWeight: 400, letterSpacing: '0.02em',
          padding: '6px 14px', cursor: 'pointer', transition: 'all 0.15s ease',
          background: filters.instantBook ? '#C9971C' : 'transparent',
          color: filters.instantBook ? '#FFF' : '#5C5750',
          border: `1px solid ${filters.instantBook ? '#C9971C' : '#E8E4DC'}`,
        }}>
          ⚡ Instant
        </button>

        <button onClick={() => setMapView(v=>!v)} style={{
          fontFamily: "'Outfit',sans-serif", fontSize: 12, padding: '6px 14px', cursor: 'pointer',
          background: mapView ? '#0A0908' : 'transparent',
          color: mapView ? '#FFF' : '#5C5750',
          border: `1px solid ${mapView ? '#0A0908' : '#E8E4DC'}`,
          transition: 'all 0.15s ease',
        }}>
          ◎ Map
        </button>

        {hasFilters && (
          <button onClick={() => setFilters({ category:'',location:'',minPrice:'',maxPrice:'',search:'',era:'',instantBook:false })}
            style={{ fontFamily:"'Outfit',sans-serif", fontSize: 12, color:'#9C9589', background:'none', border:'none', cursor:'pointer', padding:'6px 4px' }}>
            × Clear
          </button>
        )}

        <span style={{ marginLeft: 'auto', fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9C9589' }}>
          {!loading ? `${items.length} props` : '—'}
        </span>
      </div>

      {/* Results */}
      <div style={{ padding: '0 40px 80px', background: '#FFF' }}>
        {loading ? (
          <div style={{ padding: '80px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 200, height: 1, background: '#E8E4DC', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, background: '#0A0908', animation: 'scan 1.2s cubic-bezier(0.16,1,0.3,1) infinite' }} />
              <style>{`@keyframes scan{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}`}</style>
            </div>
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#9C9589' }}>
              Loading catalogue
            </span>
          </div>
        ) : items.length === 0 ? (
          <div style={{ padding: '120px 0', textAlign: 'center' }}>
            <p style={{ fontFamily: "'Cormorant',serif", fontStyle: 'italic', fontWeight: 300, fontSize: 52, color: '#C8C3BB', marginBottom: 24 }}>Nothing found.</p>
            <button onClick={() => setFilters({ category:'',location:'',minPrice:'',maxPrice:'',search:'',era:'',instantBook:false })}
              style={{ fontFamily:"'Outfit',sans-serif", fontSize: 12, fontWeight: 500, color:'#0A0908', background:'none', border:'1px solid #E8E4DC', padding:'10px 24px', cursor:'pointer', letterSpacing:'0.04em' }}>
              Clear filters
            </button>
          </div>
        ) : mapView ? (
          <div style={{ paddingTop: 40 }}><PropsMap items={items} /></div>
        ) : (
          <>
            {/* Gallery grid — LOEWE/The Row inspired */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1px',
              background: '#E8E4DC',
              border: '1px solid #E8E4DC',
              marginTop: 1,
            }}>
              {items.map((item, idx) => (
                <Link key={item.id} href={`/items/${item.id}`}
                  style={{
                    textDecoration: 'none', display: 'block',
                    background: '#FFF',
                    // Featured: every 4th is full-width
                    gridColumn: idx % 7 === 0 ? 'span 3' : idx % 7 === 1 ? 'span 2' : 'span 1',
                  }}>
                  <div style={{ cursor: 'pointer', overflow: 'hidden', position: 'relative' }}>
                    {/* Image */}
                    <div style={{
                      aspectRatio: idx % 7 === 0 ? '21/9' : idx % 7 === 1 ? '16/9' : '4/3',
                      background: '#F2EFE8', overflow: 'hidden', position: 'relative',
                    }}>
                      {item.photos?.length > 0 ? (
                        <img src={item.photos[0]} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.6s cubic-bezier(0.16,1,0.3,1)' }}
                          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
                          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F2EFE8' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C8C3BB" strokeWidth="1"><rect x="3" y="3" width="18" height="18"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        </div>
                      )}
                      {item.instant_book && (
                        <span style={{ position: 'absolute', top: 14, left: 14, background: '#C9971C', color: '#FFF', fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: '0.1em', padding: '4px 8px' }}>
                          INSTANT
                        </span>
                      )}
                    </div>

                    {/* Info row */}
                    <div style={{ padding: idx % 7 === 0 ? '20px 28px' : '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: '#C8C3BB', letterSpacing: '0.1em' }}>
                            P·{String(idx + 1).padStart(3, '0')}
                          </span>
                          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: '#9C9589', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                            {item.category}
                          </span>
                        </div>
                        <h3 style={{ fontFamily: "'Cormorant',serif", fontSize: idx % 7 === 0 ? 22 : 17, fontWeight: 400, color: '#0A0908', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                          {item.title}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: '#9C9589', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{item.location}</span>
                          <span style={{ width: 3, height: 3, borderRadius: '50%', background: item.condition === 'Excellent' ? '#5A9A6E' : item.condition === 'Good' ? '#C9971C' : '#C07040', flexShrink: 0 }} />
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 16 }}>
                        <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 17, fontWeight: 500, color: '#0A0908', lineHeight: 1 }}>
                          {item.price_per_day}
                        </div>
                        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: '#9C9589', letterSpacing: '0.1em', marginTop: 3 }}>DHS/DAY</div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── HOW IT WORKS ────────────────────────────── */}
      <section style={{ background: '#0A0908', padding: '96px 40px', borderTop: '1px solid #1A1814' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 64, paddingBottom: 40, borderBottom: '1px solid #1F1C18' }}>
            <div>
              <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#504A40', marginBottom: 16 }}>How it works</p>
              <h2 style={{ fontFamily: "'Cormorant',serif", fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(36px,4vw,56px)', color: '#F2EBD8', lineHeight: 1, letterSpacing: '-0.02em' }}>
                Simple.<br/>Professional.
              </h2>
            </div>
            <Link href="/auth/signup?role=renter" style={{ fontFamily: "'Outfit',sans-serif", fontSize: 12, fontWeight: 500, color: '#F2EBD8', border: '1px solid #3A3228', padding: '13px 28px', textDecoration: 'none', letterSpacing: '0.04em', transition: 'all 0.15s ease' }}
              onMouseEnter={e=>{e.currentTarget.style.background='#F2EBD8';e.currentTarget.style.color='#0A0908';}}
              onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#F2EBD8';}}>
              Browse props →
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 48 }}>
            {[
              { n: '01', title: 'Browse', body: 'Search hundreds of curated props across Morocco. Filter by era, category, city, or style.' },
              { n: '02', title: 'Book', body: 'Contact the decorator directly. Confirm dates and pricing. Instant Book available on select props.' },
              { n: '03', title: 'Create', body: "Collect your props on the agreed date. Return after the shoot. Build your production's reputation." },
            ].map((s,i) => (
              <div key={s.n}>
                <div style={{ fontFamily: "'Cormorant',serif", fontWeight: 300, fontSize: 52, color: '#2A2520', lineHeight: 1, marginBottom: 28 }}>{s.n}</div>
                <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 16, fontWeight: 500, color: '#F2EBD8', marginBottom: 12, letterSpacing: '-0.01em' }}>{s.title}</h3>
                <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: 14, fontWeight: 300, color: '#504A40', lineHeight: 1.75 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DECORATOR CTA ───────────────────────────── */}
      <section style={{ padding: '80px 40px', borderTop: '1px solid #E8E4DC', borderBottom: '1px solid #E8E4DC', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
        <div>
          <h3 style={{ fontFamily: "'Cormorant',serif", fontStyle: 'italic', fontWeight: 300, fontSize: 40, color: '#0A0908', marginBottom: 8, letterSpacing: '-0.02em' }}>
            Are you a set decorator?
          </h3>
          <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: 15, fontWeight: 300, color: '#5C5750' }}>
            Monetize your prop inventory. Join Morocco's film community.
          </p>
        </div>
        <Link href="/auth/signup?role=decorator" style={{ fontFamily: "'Outfit',sans-serif", fontSize: 12, fontWeight: 500, color: '#FFF', background: '#0A0908', padding: '14px 36px', textDecoration: 'none', letterSpacing: '0.04em', flexShrink: 0, transition: 'background 0.15s ease' }}
          onMouseEnter={e=>(e.currentTarget.style.background='#2A2520')} onMouseLeave={e=>(e.currentTarget.style.background='#0A0908')}>
          Start listing your props
        </Link>
      </section>

      {/* ── FOOTER ──────────────────────────────────── */}
      <footer style={{ background: '#0A0908', padding: '64px 40px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, paddingBottom: 48, borderBottom: '1px solid #1F1C18' }}>
          <div>
            <div style={{ fontFamily: "'Cormorant',serif", fontStyle: 'italic', fontWeight: 400, fontSize: 30, color: '#C9971C', marginBottom: 16 }}>PropFlow</div>
            <p style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 300, fontSize: 13, color: '#504A40', lineHeight: 1.75, maxWidth: 240 }}>
              Morocco's first marketplace for cinema prop rentals. Every scene deserves the right prop.
            </p>
          </div>
          {[
            { title: 'Platform', links: [['Browse Props', '/'], ['List Props', '/items/new'], ['Sign Up', '/auth/signup'], ['Sign In', '/auth/login']] },
            { title: 'Cities', links: LOCATIONS.map(l => [l, `/?location=${l}`] as [string,string]) },
            { title: 'Account', links: [['Dashboard', '/decorators/dashboard'], ['Bookings', '/bookings'], ['Earnings', '/decorators/earnings'], ['Admin', '/admin/dashboard']] },
          ].map(col => (
            <div key={col.title}>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#3A3228', marginBottom: 20 }}>{col.title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {col.links.map(([label, href]) => (
                  <Link key={label} href={href} style={{ fontFamily: "'Outfit',sans-serif", fontSize: 13, fontWeight: 300, color: '#504A40', textDecoration: 'none', transition: 'color 0.15s ease' }}
                    onMouseEnter={e=>(e.currentTarget.style.color='#F2EBD8')} onMouseLeave={e=>(e.currentTarget.style.color='#504A40')}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ paddingTop: 24, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#3A3228' }}>© 2025 PropFlow</span>
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#3A3228' }}>Cinema Prop Rental · Morocco</span>
        </div>
      </footer>
    </div>
  );
}
