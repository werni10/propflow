'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/client';
import { getSupabase } from '@/lib/supabase';
import { User } from '@/lib/types';

export default function DecoratorProfile() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    avatar_url: '',
    bio: '',
    whatsapp_number: '',
  });

  useEffect(() => {
    getCurrentUser().then(async u => {
      if (!u || u.role !== 'decorator') { router.push('/auth/login'); return; }
      setUser(u);
      setForm(f => ({ ...f, name: u.name || '', phone: u.phone || '', avatar_url: u.avatar_url || '' }));

      const { data: dec } = await getSupabase()
        .from('decorators')
        .select('bio, whatsapp_number')
        .eq('id', u.id)
        .single();

      if (dec) {
        setForm(f => ({
          ...f,
          bio: dec.bio || '',
          whatsapp_number: (dec as any).whatsapp_number || '',
        }));
      }
    });
  }, []);

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setLoading(true); setError(''); setSaved(false);
    try {
      const [userRes, decRes] = await Promise.all([
        getSupabase()
          .from('users')
          .update({ name: form.name, phone: form.phone, avatar_url: form.avatar_url, updated_at: new Date().toISOString() })
          .eq('id', user.id),
        getSupabase()
          .from('decorators')
          .update({ bio: form.bio, whatsapp_number: form.whatsapp_number } as any)
          .eq('id', user.id),
      ]);

      if (userRes.error) { setError(userRes.error.message); return; }
      if (decRes.error) { setError(decRes.error.message); return; }

      setSaved(true);
      setUser({ ...user, name: form.name, phone: form.phone, avatar_url: form.avatar_url });
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  const labelStyle = {
    display: 'block' as const,
    fontFamily: 'Barlow Condensed, sans-serif',
    fontSize: 11,
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: 'var(--text-muted)',
    marginBottom: 8,
  };
  const inputStyle = { width: '100%', padding: '12px 16px', borderRadius: 2, fontSize: 14, fontFamily: 'Barlow, sans-serif' };

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontFamily: 'Barlow Condensed', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: 13 }}>
        Loading...
      </div>
    );
  }

  const initials = user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <nav style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-void)', height: 64, display: 'flex', alignItems: 'center', padding: '0 32px', gap: 16, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/" style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 700, color: 'var(--gold)', textDecoration: 'none' }}>PropFlow</Link>
          <span style={{ color: 'var(--border)' }}>/</span>
          <Link href="/decorators/dashboard" style={{ fontFamily: 'Barlow Condensed', fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Dashboard</Link>
          <span style={{ color: 'var(--border)' }}>/</span>
          <span style={{ fontFamily: 'Barlow Condensed', fontSize: 12, color: 'var(--gold)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>My Profile</span>
        </div>
        <Link href={`/decorators/${user.id}`} style={{ fontFamily: 'Barlow Condensed', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', textDecoration: 'none', border: '1px solid var(--border)', padding: '6px 14px', borderRadius: 2 }}>
          View Public Profile →
        </Link>
      </nav>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px' }}>
        {/* Avatar preview */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 40 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--bg-elevated)', border: '2px solid var(--border-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
            {form.avatar_url ? (
              <img src={form.avatar_url} alt={form.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700, color: 'var(--gold)' }}>{initials}</span>
            )}
          </div>
          <div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{form.name || user.name}</h1>
            <span className="tag">Decorator</span>
          </div>
        </div>

        <div className="divider-gold" style={{ marginBottom: 36 }} />

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Personal info */}
          <div style={{ fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>Personal Info</div>

          <div>
            <label style={labelStyle}>Full Name *</label>
            <input type="text" required value={form.name} onChange={e => set('name', e.target.value)} className="input-dark" style={inputStyle} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <label style={labelStyle}>Phone</label>
              <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} className="input-dark" style={inputStyle} placeholder="+212 6 XX XX XX XX" />
            </div>
            <div>
              <label style={labelStyle}>WhatsApp Number</label>
              <input type="tel" value={form.whatsapp_number} onChange={e => set('whatsapp_number', e.target.value)} className="input-dark" style={inputStyle} placeholder="+212 6 XX XX XX XX" />
              <div style={{ fontFamily: 'Barlow', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Shown as contact button on your listings</div>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Avatar URL</label>
            <input type="url" value={form.avatar_url} onChange={e => set('avatar_url', e.target.value)} className="input-dark" style={inputStyle} placeholder="https://..." />
          </div>

          {/* Public profile */}
          <div style={{ fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', paddingBottom: 8, borderBottom: '1px solid var(--border)', marginTop: 8 }}>Public Profile</div>

          <div>
            <label style={labelStyle}>Bio</label>
            <textarea
              value={form.bio}
              onChange={e => set('bio', e.target.value)}
              rows={5}
              className="input-dark"
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7 }}
              placeholder="Describe your experience, specialties, notable productions you've worked on..."
            />
            <div style={{ fontFamily: 'Barlow', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{form.bio.length}/500 characters</div>
          </div>

          {error && (
            <div style={{ background: 'rgba(155,58,58,0.15)', border: '1px solid rgba(155,58,58,0.4)', color: '#EB5757', padding: '12px 16px', borderRadius: 2, fontSize: 13, fontFamily: 'Barlow' }}>
              {error}
            </div>
          )}

          {saved && (
            <div style={{ background: 'rgba(45,97,74,0.15)', border: '1px solid rgba(45,97,74,0.4)', color: '#6FCF97', padding: '12px 16px', borderRadius: 2, fontSize: 13, fontFamily: 'Barlow' }}>
              Profile saved.
            </div>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="submit" disabled={loading} className="btn-gold" style={{ flex: 1, padding: '13px', borderRadius: 2, fontSize: 13, border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
            <Link href="/decorators/dashboard" className="btn-ghost" style={{ padding: '13px 24px', borderRadius: 2, fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
