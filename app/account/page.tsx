'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/client';
import { getSupabase } from '@/lib/supabase';
import { User } from '@/lib/types';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', avatar_url: '' });

  useEffect(() => {
    getCurrentUser().then(u => {
      if (!u) { router.push('/auth/login'); return; }
      setUser(u);
      setForm({ name: u.name || '', phone: u.phone || '', avatar_url: u.avatar_url || '' });
    });
  }, []);

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setLoading(true); setError(''); setSaved(false);
    try {
      const { error: err } = await getSupabase()
        .from('users')
        .update({ name: form.name, phone: form.phone, avatar_url: form.avatar_url, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      if (err) { setError(err.message); return; }
      setSaved(true);
      setUser({ ...user, ...form });
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    await getSupabase().auth.signOut();
    router.push('/');
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
      <nav style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-void)', height: 64, display: 'flex', alignItems: 'center', padding: '0 32px', gap: 16 }}>
        <Link href="/" style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 700, color: 'var(--gold)', textDecoration: 'none' }}>PropFlow</Link>
        <span style={{ color: 'var(--border)' }}>/</span>
        <span style={{ fontFamily: 'Barlow Condensed', fontSize: 12, color: 'var(--gold)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Account</span>
      </nav>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '48px 24px' }}>
        {/* Profile header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 40 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--bg-elevated)', border: '2px solid var(--border-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, color: 'var(--gold)' }}>{initials}</span>
            )}
          </div>
          <div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{user.name}</h1>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className="tag">{user.role}</span>
              <span className="tag" style={{ borderColor: user.status === 'verified' ? 'rgba(45,97,74,0.5)' : 'var(--border)', color: user.status === 'verified' ? '#6FCF97' : 'var(--text-muted)' }}>
                {user.status === 'verified' ? '✓ Verified' : user.status}
              </span>
            </div>
          </div>
        </div>

        <div className="divider-gold" style={{ marginBottom: 32 }} />

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <label style={labelStyle}>Full Name *</label>
            <input type="text" required value={form.name} onChange={e => set('name', e.target.value)} className="input-dark" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" disabled value={user.email} className="input-dark" style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} />
            <div style={{ fontFamily: 'Barlow', fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>Email cannot be changed here.</div>
          </div>

          <div>
            <label style={labelStyle}>Phone</label>
            <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} className="input-dark" style={inputStyle} placeholder="+212 6 XX XX XX XX" />
          </div>

          <div>
            <label style={labelStyle}>Avatar URL</label>
            <input type="url" value={form.avatar_url} onChange={e => set('avatar_url', e.target.value)} className="input-dark" style={inputStyle} placeholder="https://..." />
          </div>

          {error && (
            <div style={{ background: 'rgba(155,58,58,0.15)', border: '1px solid rgba(155,58,58,0.4)', color: '#EB5757', padding: '12px 16px', borderRadius: 2, fontSize: 13, fontFamily: 'Barlow' }}>
              {error}
            </div>
          )}

          {saved && (
            <div style={{ background: 'rgba(45,97,74,0.15)', border: '1px solid rgba(45,97,74,0.4)', color: '#6FCF97', padding: '12px 16px', borderRadius: 2, fontSize: 13, fontFamily: 'Barlow' }}>
              Profile saved successfully.
            </div>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="submit" disabled={loading} className="btn-gold" style={{ flex: 1, padding: '13px', borderRadius: 2, fontSize: 13, border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        {/* Danger zone */}
        <div style={{ marginTop: 48, padding: '24px', background: 'var(--bg-surface)', border: '1px solid rgba(155,58,58,0.2)', borderRadius: 2 }}>
          <div style={{ fontFamily: 'Barlow Condensed', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>Account Actions</div>
          <button onClick={handleSignOut} className="btn-ghost" style={{ padding: '10px 20px', fontSize: 12, borderRadius: 2, cursor: 'pointer', color: '#EB5757', borderColor: 'rgba(155,58,58,0.4)' }}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
