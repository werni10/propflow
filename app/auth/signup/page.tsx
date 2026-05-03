'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUp, signInWithGoogle } from '@/lib/auth/client';

export default function SignUp() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]         = useState('');
  const [role, setRole]         = useState<'decorator' | 'renter'>('renter');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    const { error: err } = await signUp(email, password, name, role);
    if (err) setError(err);
    else router.push('/auth/login?verified=false');
    setLoading(false);
  }

  async function handleGoogle() {
    try { setLoading(true); await signInWithGoogle(); }
    catch (err) { setError(String(err)); setLoading(false); }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-void)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 40 }}>
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 700, color: 'var(--gold)' }}>PropFlow</span>
        </Link>

        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 32, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Join PropFlow.</h1>
        <p style={{ fontFamily: 'Barlow', fontSize: 14, color: 'var(--text-sub)', marginBottom: 32 }}>Morocco's cinema prop marketplace.</p>

        {/* Role selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 28 }}>
          {(['renter', 'decorator'] as const).map(r => (
            <button key={r} type="button" onClick={() => setRole(r)} style={{
              padding: '16px 12px',
              border: `1px solid ${role === r ? 'var(--gold)' : 'var(--border)'}`,
              background: role === r ? 'rgba(212,168,50,0.07)' : 'var(--bg-surface)',
              borderRadius: 2,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s',
            }}>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: role === r ? 'var(--gold)' : 'var(--text-muted)', marginBottom: 4 }}>
                {r === 'renter' ? '🎬 Filmmaker' : '🎭 Decorator'}
              </div>
              <div style={{ fontFamily: 'Barlow', fontSize: 12, color: role === r ? 'var(--text-sub)' : 'var(--text-muted)' }}>
                {r === 'renter' ? 'Search & rent props' : 'List & earn'}
              </div>
            </button>
          ))}
        </div>

        <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontFamily: 'Barlow Condensed', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Full Name</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} className="input-dark" placeholder="Your name" style={{ width: '100%', padding: '12px 16px', borderRadius: 2, fontSize: 14 }} />
          </div>
          <div>
            <label style={{ display: 'block', fontFamily: 'Barlow Condensed', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="input-dark" placeholder="you@example.com" style={{ width: '100%', padding: '12px 16px', borderRadius: 2, fontSize: 14 }} />
          </div>
          <div>
            <label style={{ display: 'block', fontFamily: 'Barlow Condensed', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="input-dark" placeholder="Min. 8 characters" style={{ width: '100%', padding: '12px 16px', borderRadius: 2, fontSize: 14 }} />
          </div>

          {error && <div style={{ background: 'rgba(155,58,58,0.15)', border: '1px solid rgba(155,58,58,0.4)', color: '#EB5757', padding: '10px 14px', borderRadius: 2, fontSize: 13 }}>{error}</div>}

          <button type="submit" disabled={loading} className="btn-gold" style={{ padding: '14px', borderRadius: 2, fontSize: 13, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4 }}>
            {loading ? 'Creating account...' : `Create ${role === 'decorator' ? 'Decorator' : 'Filmmaker'} Account`}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '24px 0' }}>
          <div className="divider-gold" style={{ flex: 1 }} />
          <span style={{ fontFamily: 'Barlow Condensed', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>or</span>
          <div className="divider-gold" style={{ flex: 1 }} />
        </div>

        <button onClick={handleGoogle} disabled={loading} className="btn-ghost" style={{ padding: '13px', borderRadius: 2, fontSize: 13, cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <svg width="16" height="16" viewBox="0 0 24 24"><path fill="var(--gold)" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="var(--gold-dim)" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="var(--gold)" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="var(--gold-dim)" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continue with Google
        </button>

        <p style={{ textAlign: 'center', fontFamily: 'Barlow', fontSize: 13, color: 'var(--text-muted)', marginTop: 28 }}>
          Already have an account?{' '}
          <Link href="/auth/login" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Sign in →</Link>
        </p>
      </div>
    </div>
  );
}
