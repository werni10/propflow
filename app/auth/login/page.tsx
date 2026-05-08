'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn, signInWithGoogle } from '@/lib/auth/client';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const isNewUser = searchParams.get('verified') === 'false';

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { user, error: err } = await signIn(email, password);
      if (err) { setError(err); setLoading(false); return; }
      if (!user) { setError('Login failed — check your email and password.'); setLoading(false); return; }
      router.push(user.role === 'decorator' ? '/decorators/dashboard' : '/');
    } catch (err) {
      setError(String(err));
      setLoading(false);
    }
  }

  async function handleGoogle() {
    try { setLoading(true); await signInWithGoogle(); }
    catch (err) { setError(String(err)); setLoading(false); }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-void)', display: 'flex' }}>
      {/* Left panel — decorative */}
      <div style={{ flex: 1, background: 'var(--bg-surface)', borderRight: '1px solid var(--border)', display: 'none', position: 'relative', overflow: 'hidden' }} className="lg-panel">
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 60% at 40% 60%, rgba(212,168,50,0.1) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 48, fontWeight: 700, color: 'var(--gold)', lineHeight: 1.1, textAlign: 'center' }}>
            Every scene<br/><em style={{ fontStyle: 'italic', color: 'var(--text)' }}>tells a story.</em>
          </div>
          <div style={{ marginTop: 32, width: 60, height: 1, background: 'var(--border-gold)' }} />
          <p style={{ marginTop: 32, fontFamily: 'Barlow', fontSize: 15, color: 'var(--text-sub)', textAlign: 'center', lineHeight: 1.7, maxWidth: 320 }}>
            PropFlow connects Morocco's finest set decorators with filmmakers who demand excellence.
          </p>
        </div>
        {/* Film strip */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 24, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {Array.from({length: 30}).map((_, i) => <div key={i} style={{ flex: 1, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 8, height: '50%', border: '1px solid var(--border)', borderRadius: 1, background: 'var(--bg-elevated)' }} /></div>)}
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{ flex: 1, maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 48px' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 48 }}>
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 700, color: 'var(--gold)' }}>PropFlow</span>
        </Link>

        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 32, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Welcome back.</h1>
        <p style={{ fontFamily: 'Barlow', fontSize: 14, color: 'var(--text-sub)', marginBottom: 32 }}>Sign in to your account to continue.</p>

        {isNewUser && (
          <div style={{ background: 'rgba(45,97,74,0.15)', border: '1px solid rgba(45,97,74,0.4)', color: '#6FCF97', padding: '12px 16px', borderRadius: 2, fontSize: 13, fontFamily: 'Barlow', marginBottom: 20, lineHeight: 1.5 }}>
            Account created. Check your email to verify before signing in.
          </div>
        )}

        <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontFamily: 'Barlow Condensed', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="input-dark" placeholder="you@example.com" style={{ width: '100%', padding: '12px 16px', borderRadius: 2, fontSize: 14 }} />
          </div>
          <div>
            <label style={{ display: 'block', fontFamily: 'Barlow Condensed', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="input-dark" placeholder="••••••••" style={{ width: '100%', padding: '12px 16px', borderRadius: 2, fontSize: 14 }} />
          </div>

          {error && <div style={{ background: 'rgba(155,58,58,0.15)', border: '1px solid rgba(155,58,58,0.4)', color: '#EB5757', padding: '10px 14px', borderRadius: 2, fontSize: 13 }}>{error}</div>}

          <button type="submit" disabled={loading} className="btn-gold" style={{ padding: '14px', borderRadius: 2, fontSize: 13, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4 }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '24px 0' }}>
          <div className="divider-gold" style={{ flex: 1 }} />
          <span style={{ fontFamily: 'Barlow Condensed', fontSize: 11, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>or</span>
          <div className="divider-gold" style={{ flex: 1 }} />
        </div>

        <button onClick={handleGoogle} disabled={loading} className="btn-ghost" style={{ padding: '13px', borderRadius: 2, fontSize: 13, cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <svg width="16" height="16" viewBox="0 0 24 24"><path fill="var(--gold)" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="var(--gold-dim)" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="var(--gold)" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="var(--gold-dim)" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continue with Google
        </button>

        <p style={{ textAlign: 'center', fontFamily: 'Barlow', fontSize: 13, color: 'var(--text-muted)', marginTop: 28 }}>
          No account?{' '}
          <Link href="/auth/signup" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Create one →</Link>
        </p>
      </div>

      <style>{`.lg-panel { @media (min-width: 1024px) { display: flex; } }`}</style>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--bg-void)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontFamily: 'Barlow Condensed', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: 13 }}>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
