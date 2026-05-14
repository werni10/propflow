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
      if (user.role === 'admin') router.push('/admin/dashboard');
      else if (user.role === 'decorator') router.push('/decorators/dashboard');
      else router.push('/');
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
    <div style={{ minHeight: '100vh', background: 'var(--ink)', display: 'grid', gridTemplateColumns: '1fr 1fr', color: 'var(--cream)' }}>

      {/* ── LEFT PANEL — editorial ────────────────────── */}
      <div style={{
        background: '#0D0C10',
        borderRight: '1px solid #2A2730',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '64px 72px',
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* Film strip — left edge */}
        <div style={{
          position: 'absolute',
          left: 0, top: 0, bottom: 0,
          width: 24,
          display: 'flex',
          flexDirection: 'column',
          color: '#3A3228',
          opacity: 0.8,
        }} className="film-strip">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="film-strip-cell" style={{ flex: 1 }}>
              <div className="film-strip-hole" />
            </div>
          ))}
        </div>

        {/* Top: logo */}
        <Link href="/" style={{ textDecoration: 'none', paddingLeft: 8 }}>
          <span style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 20,
            fontWeight: 300,
            fontStyle: 'italic',
            color: '#8C7F68',
            letterSpacing: '0.01em',
          }}>
            PropFlow
          </span>
        </Link>

        {/* Middle: the big statement */}
        <div style={{ paddingLeft: 8 }}>
          <div style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(52px, 6vw, 88px)',
            fontWeight: 300,
            fontStyle: 'italic',
            color: '#F2EBD8',
            lineHeight: 0.95,
            letterSpacing: '-0.02em',
            marginBottom: 48,
          }}>
            Cinema<br/>
            <span style={{ color: '#C8A420' }}>lives in</span><br/>
            the props.
          </div>

          <div style={{ height: 1, background: '#2A2730', marginBottom: 32, maxWidth: 80 }} />

          <p style={{
            fontFamily: 'Barlow, sans-serif',
            fontWeight: 300,
            fontSize: 13,
            color: '#504A40',
            lineHeight: 1.8,
            maxWidth: 280,
          }}>
            Every object placed in a frame carries the weight of a world. Morocco's props, your story.
          </p>
        </div>

        {/* Bottom: metadata */}
        <div style={{
          fontFamily: 'DM Mono, monospace',
          fontSize: 10,
          fontWeight: 300,
          letterSpacing: '0.15em',
          color: '#504A40',
          textTransform: 'uppercase',
          paddingLeft: 8,
        }}>
          PROP.MA / EST. 2025
        </div>
      </div>

      {/* ── RIGHT PANEL — form ────────────────────────── */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px 72px',
        background: 'var(--ink)',
      }}>
        {/* Heading */}
        <div style={{ marginBottom: 56 }}>
          <div style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: 9,
            fontWeight: 300,
            letterSpacing: '0.22em',
            color: 'var(--cool)',
            textTransform: 'uppercase',
            marginBottom: 20,
          }}>
            SIGN IN
          </div>
          <div style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 40,
            fontWeight: 300,
            fontStyle: 'italic',
            color: 'var(--cream)',
            lineHeight: 1.05,
            letterSpacing: '-0.01em',
          }}>
            Welcome back.
          </div>
        </div>

        {/* Verified notice */}
        {isNewUser && (
          <div style={{
            borderLeft: '2px solid var(--gold-lo)',
            paddingLeft: 16,
            marginBottom: 36,
            fontFamily: 'Barlow, sans-serif',
            fontWeight: 300,
            fontSize: 13,
            color: 'var(--warm)',
            lineHeight: 1.6,
          }}>
            Account created. Check your email to verify before signing in.
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>

          <div>
            <label style={{
              display: 'block',
              fontFamily: 'DM Mono, monospace',
              fontSize: 9,
              fontWeight: 300,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--cool)',
              marginBottom: 12,
            }}>
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid var(--rule-warm)',
                outline: 'none',
                width: '100%',
                padding: '8px 0',
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

          <div>
            <label style={{
              display: 'block',
              fontFamily: 'DM Mono, monospace',
              fontSize: 9,
              fontWeight: 300,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--cool)',
              marginBottom: 12,
            }}>
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid var(--rule-warm)',
                outline: 'none',
                width: '100%',
                padding: '8px 0',
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

          {error && (
            <div style={{
              borderLeft: '2px solid var(--red)',
              paddingLeft: 16,
              fontFamily: 'Barlow, sans-serif',
              fontWeight: 300,
              fontSize: 13,
              color: '#C06060',
              lineHeight: 1.5,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ padding: '16px', width: '100%', fontSize: 12, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '28px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--rule)' }} />
          <span style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: 9,
            fontWeight: 300,
            letterSpacing: '0.18em',
            color: 'var(--cool)',
            textTransform: 'uppercase',
          }}>
            or
          </span>
          <div style={{ flex: 1, height: 1, background: 'var(--rule)' }} />
        </div>

        {/* Google */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="btn-line"
          style={{
            padding: '14px',
            width: '100%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            fontSize: 11,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" opacity="0.6" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" opacity="0.6" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <p style={{
          fontFamily: 'Barlow, sans-serif',
          fontWeight: 300,
          fontSize: 13,
          color: 'var(--cool)',
          marginTop: 32,
          textAlign: 'center',
        }}>
          No account?{' '}
          <Link
            href="/auth/signup"
            style={{
              color: 'var(--warm)',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--cream)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--warm)')}
          >
            Create one →
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        background: 'var(--ink)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'DM Mono, monospace',
        fontSize: 11,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        color: 'var(--cool)',
      }}>
        — loading —
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
