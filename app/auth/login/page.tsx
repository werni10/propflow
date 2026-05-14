'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn, signInWithGoogle } from '@/lib/auth/client';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const isNewUser = searchParams.get('verified') === 'false';

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { user, error: err } = await signIn(email, password);
      if (err) { setError(err); setLoading(false); return; }
      if (!user) { setError('Login failed — check your email and password.'); setLoading(false); return; }
      if (user.role === 'admin') router.push('/admin/dashboard');
      else if (user.role === 'decorator') router.push('/decorators/dashboard');
      else router.push('/');
    } catch (err) { setError(String(err)); setLoading(false); }
  }

  async function handleGoogle() {
    try { setLoading(true); await signInWithGoogle(); }
    catch (err) { setError(String(err)); setLoading(false); }
  }

  const inputStyle: React.CSSProperties = {
    background: 'transparent', border: 'none',
    borderBottom: '1px solid #E8E4DC', outline: 'none',
    width: '100%', padding: '10px 0',
    fontFamily: "'Outfit', sans-serif", fontWeight: 300,
    fontSize: 16, color: '#0A0908',
    transition: 'border-color 0.2s ease',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontFamily: "'DM Mono', monospace",
    fontSize: 9, fontWeight: 300,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: '#9C9589',
    marginBottom: 10,
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>

      {/* LEFT — dark editorial panel */}
      <div style={{
        background: '#0D0C10',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '56px 64px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Film strip */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 20, color: '#2A2730', opacity: 0.7 }} className="film-strip">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="film-strip-cell" style={{ flex: 1 }}>
              <div className="film-strip-hole" />
            </div>
          ))}
        </div>

        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontFamily: "'Cormorant', Georgia, serif", fontStyle: 'italic', fontWeight: 400, fontSize: 22, color: '#8C7F68', letterSpacing: '-0.01em' }}>
            PropFlow
          </span>
        </Link>

        <div>
          <div style={{ fontFamily: "'Cormorant', serif", fontWeight: 300, fontStyle: 'italic', fontSize: 'clamp(48px, 5.5vw, 80px)', lineHeight: 0.95, letterSpacing: '-0.02em', marginBottom: 40 }}>
            <span style={{ color: '#F2EBD8' }}>Cinema</span><br/>
            <span style={{ color: '#C8A420' }}>lives in</span><br/>
            <span style={{ color: '#F2EBD8' }}>the props.</span>
          </div>
          <div style={{ width: 48, height: 1, background: '#2A2730', marginBottom: 28 }} />
          <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300, fontSize: 13, color: '#504A40', lineHeight: 1.75, maxWidth: 260 }}>
            Every object placed in a frame carries the weight of a world. Morocco's props, your story.
          </p>
        </div>

        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '0.2em', color: '#3A3228', textTransform: 'uppercase' }}>
          PROP.MA / EST. 2025
        </span>
      </div>

      {/* RIGHT — form */}
      <div style={{ background: '#FFFFFF', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px 72px' }}>
        <div style={{ maxWidth: 400 }}>
          <div style={{ marginBottom: 52 }}>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9C9589', marginBottom: 18 }}>Sign in</p>
            <h1 style={{ fontFamily: "'Cormorant', serif", fontStyle: 'italic', fontWeight: 300, fontSize: 44, lineHeight: 1, letterSpacing: '-0.02em', color: '#0A0908' }}>
              Welcome back.
            </h1>
          </div>

          {isNewUser && (
            <div style={{ borderLeft: '2px solid #C9971C', paddingLeft: 16, marginBottom: 32, fontFamily: "'Outfit', sans-serif", fontWeight: 300, fontSize: 13, color: '#5C5750', lineHeight: 1.6 }}>
              Account created. Verify your email before signing in.
            </div>
          )}

          <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle}
                onFocus={e => (e.target.style.borderBottomColor = '#0A0908')}
                onBlur={e => (e.target.style.borderBottomColor = '#E8E4DC')}
              />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle}
                onFocus={e => (e.target.style.borderBottomColor = '#0A0908')}
                onBlur={e => (e.target.style.borderBottomColor = '#E8E4DC')}
              />
            </div>

            {error && (
              <div style={{ borderLeft: '2px solid #8B2020', paddingLeft: 14, fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 300, color: '#8B2020', lineHeight: 1.5 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-dark" style={{ padding: '15px', fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1, width: '100%', justifyContent: 'center' }}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '32px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#E8E4DC' }} />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '0.14em', color: '#9C9589', textTransform: 'uppercase' }}>or</span>
            <div style={{ flex: 1, height: 1, background: '#E8E4DC' }} />
          </div>

          <button onClick={handleGoogle} disabled={loading} className="btn-outline" style={{ width: '100%', padding: '13px', fontSize: 12, fontWeight: 500, letterSpacing: '0.06em', cursor: 'pointer', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="15" height="15" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>

          <p style={{ textAlign: 'center', fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 300, color: '#9C9589', marginTop: 32 }}>
            No account?{' '}
            <Link href="/auth/signup" style={{ color: '#0A0908', fontWeight: 400 }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: '0.16em', color: '#9C9589', textTransform: 'uppercase' }}>Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
