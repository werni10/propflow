'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/client';
import { getSupabase } from '@/lib/supabase';
import { User } from '@/lib/types';

const CATEGORIES = ['Furniture', 'Lighting', 'Decor', 'Props', 'Textiles', 'Other'];
const LOCATIONS  = ['Casablanca', 'Fes', 'Marrakech', 'Tangier', 'Rabat'];
const CONDITIONS = ['Excellent', 'Good', 'Fair'] as const;

export default function NewItem() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [user, setUser]         = useState<User | null>(null);
  const [loading, setLoading]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError]       = useState('');
  const [photos, setPhotos]     = useState<string[]>([]);
  const [form, setForm] = useState({
    title: '', description: '', category: 'Furniture',
    price_per_day: '', condition: 'Good', location: 'Casablanca',
    deposit_required: false, deposit_amount: '',
  });

  useEffect(() => {
    getCurrentUser().then(u => {
      if (!u || u.role !== 'decorator') { router.push('/auth/login'); return; }
      setUser(u);
    });
  }, []);

  function set(k: string, v: string | boolean) { setForm(f => ({ ...f, [k]: v })); }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const { data: session } = await getSupabase().auth.getSession();
      const token = session?.session?.access_token;
      const uploaded: string[] = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: fd,
        });
        const data = await res.json();
        if (res.ok && data.url) uploaded.push(data.url);
      }
      setPhotos(prev => [...prev, ...uploaded]);
    } catch (err) {
      setError('Photo upload failed: ' + String(err));
    } finally {
      setUploading(false);
    }
  }

  function removePhoto(url: string) {
    setPhotos(prev => prev.filter(p => p !== url));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setLoading(true); setError('');
    try {
      const { data: session } = await getSupabase().auth.getSession();
      const token = session?.session?.access_token;

      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          decorator_id: user.id,
          ...form,
          price_per_day: parseFloat(form.price_per_day),
          deposit_amount: form.deposit_required ? parseFloat(form.deposit_amount) : null,
          photos,
          availability_dates: {},
        }),
      });
      const data = await res.json();
      if (res.ok) router.push('/decorators/dashboard');
      else setError(data.error || 'Failed to create listing');
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = { width: '100%', padding: '12px 16px', borderRadius: 2, fontSize: 14, fontFamily: 'Barlow, sans-serif' };
  const labelStyle = { display: 'block' as const, fontFamily: 'Barlow Condensed, sans-serif', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'var(--text-muted)', marginBottom: 8 };

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontFamily: 'Barlow Condensed', letterSpacing: '0.15em', textTransform: 'uppercase', fontSize: 13 }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <nav style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-void)', height: 56, display: 'flex', alignItems: 'center', padding: '0 32px', gap: 16 }}>
        <Link href="/" style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 700, color: 'var(--gold)', textDecoration: 'none' }}>PropFlow</Link>
        <span style={{ color: 'var(--border)' }}>/</span>
        <Link href="/decorators/dashboard" style={{ fontFamily: 'Barlow Condensed', fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Dashboard</Link>
        <span style={{ color: 'var(--border)' }}>/</span>
        <span style={{ fontFamily: 'Barlow Condensed', fontSize: 12, color: 'var(--gold)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>New Prop</span>
      </nav>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 40, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>List a New Prop</h1>
        <p style={{ fontFamily: 'Barlow', fontSize: 14, color: 'var(--text-sub)', marginBottom: 40 }}>Listing as <strong style={{ color: 'var(--gold)' }}>{user.name}</strong></p>

        <div className="divider-gold" style={{ marginBottom: 40 }} />

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* Photo Upload */}
          <div>
            <label style={labelStyle}>Photos</label>
            <div
              onClick={() => fileRef.current?.click()}
              style={{ border: '2px dashed var(--border)', borderRadius: 2, padding: '32px 20px', textAlign: 'center', cursor: 'pointer', background: 'var(--bg-surface)', transition: 'border-color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <input ref={fileRef} type="file" accept="image/*" multiple onChange={handlePhotoUpload} style={{ display: 'none' }} />
              {uploading ? (
                <div style={{ fontFamily: 'Barlow Condensed', fontSize: 12, color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Uploading...</div>
              ) : (
                <>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" style={{ marginBottom: 10 }}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  <div style={{ fontFamily: 'Barlow Condensed', fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Click to upload photos</div>
                  <div style={{ fontFamily: 'Barlow', fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>JPEG, PNG, WebP — multiple files allowed</div>
                </>
              )}
            </div>
            {photos.length > 0 && (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
                {photos.map((url, i) => (
                  <div key={url} style={{ position: 'relative', width: 80, height: 80, borderRadius: 2, overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <img src={url} alt={`Photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => removePhoto(url)}
                      style={{ position: 'absolute', top: 3, right: 3, background: 'rgba(8,7,8,0.8)', border: 'none', borderRadius: '50%', width: 18, height: 18, cursor: 'pointer', color: '#EB5757', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label style={labelStyle}>Prop Title *</label>
            <input type="text" required value={form.title} onChange={e => set('title', e.target.value)} className="input-dark" style={inputStyle} placeholder="e.g., Vintage Moroccan Table" />
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4} className="input-dark" style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7 }} placeholder="Describe the prop — dimensions, era, material, any notable details..." />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <label style={labelStyle}>Category *</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} className="input-dark" style={{ ...inputStyle, cursor: 'pointer' }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Condition *</label>
              <select value={form.condition} onChange={e => set('condition', e.target.value)} className="input-dark" style={{ ...inputStyle, cursor: 'pointer' }}>
                {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <label style={labelStyle}>Price per Day (DHS) *</label>
              <input type="number" required min="0" step="0.01" value={form.price_per_day} onChange={e => set('price_per_day', e.target.value)} className="input-dark" style={inputStyle} placeholder="0.00" />
            </div>
            <div>
              <label style={labelStyle}>Location *</label>
              <select value={form.location} onChange={e => set('location', e.target.value)} className="input-dark" style={{ ...inputStyle, cursor: 'pointer' }}>
                {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 2, padding: '20px 24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', marginBottom: form.deposit_required ? 20 : 0 }}>
              <input type="checkbox" checked={form.deposit_required} onChange={e => set('deposit_required', e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--gold)', cursor: 'pointer' }} />
              <div>
                <div style={{ fontFamily: 'Barlow Condensed', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text)', fontWeight: 600 }}>Require Deposit</div>
                <div style={{ fontFamily: 'Barlow', fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Collect a security deposit from renters</div>
              </div>
            </label>
            {form.deposit_required && (
              <div>
                <label style={labelStyle}>Deposit Amount (DHS)</label>
                <input type="number" min="0" step="0.01" value={form.deposit_amount} onChange={e => set('deposit_amount', e.target.value)} className="input-dark" style={inputStyle} placeholder="0.00" />
              </div>
            )}
          </div>

          {error && (
            <div style={{ background: 'rgba(155,58,58,0.15)', border: '1px solid rgba(155,58,58,0.4)', color: '#EB5757', padding: '12px 16px', borderRadius: 2, fontSize: 13, fontFamily: 'Barlow' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
            <button type="submit" disabled={loading || uploading} className="btn-gold" style={{ flex: 1, padding: '14px', borderRadius: 2, fontSize: 13, border: 'none', cursor: (loading || uploading) ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Publishing...' : 'Publish Prop'}
            </button>
            <button type="button" onClick={() => router.back()} className="btn-ghost" style={{ padding: '14px 24px', borderRadius: 2, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
