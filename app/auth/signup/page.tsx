'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUp, signInWithGoogle } from '@/lib/auth/client';

export default function SignUp() {
  const router = useRouter();
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]       = useState('');
  const [role, setRole]       = useState<'decorator' | 'renter'>('renter');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

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
    letterSpacing: '0.22em', textTransform: 'uppercase',
    color: '#9C9589', marginBottom: 10,
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>

      {/* LEFT — dark editorial */}
      <div style={{
        background: '#0D0C10', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', padding: '56px 64px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 20, color: '#2A2730', opacity: 0.7 }} className="film-strip">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="film-strip-cell" style={{ flex: 1 }}>
              <div className="film-strip-hole" />
            </div>
          ))}
        </div>

        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontFamily: "'Cormorant', serif", fontStyle: 'italic', fontWeight: 400, fontSize: 22, color: '#8C7F68' }}>PropFlow</span>
        </Link>

        <div>
          <div style={{ fontFamily: "'Cormorant', serif", fontWeight: 300, fontStyle: 'italic', fontSize: 'clamp(48px, 5.5vw, 80px)', lineHeight: 0.95, letterSpacing: '-0.02em', marginBottom: 40 }}>
            <span style={{ color: '#F2EBD8' }}>Join the</span><br/>
            <span style={{ color: '#C8A420' }}>catalogue.</span>
          </div>
          <div style={{ width: 48, height: 1, background: '#2A2730', marginBottom: 28 }} />
          <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300, fontSize: 13, color: '#504A40', lineHeight: 1.75, maxWidth: 260 }}>
            Morocco's decorators and filmmakers. One platform. Every prop you need, every scene you imagine.
          </p>
        </div>

        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '0.2em', color: '#3A3228', textTransform: 'uppercase' }}>PROP.MA / EST. 2025</span>
      </div>

      {/* RIGHT — form */}
      <div style={{ background: '#FFFFFF', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px 72px', overflowY: 'auto' }}>
        <div style={{ maxWidth: 400 }}>
          <div style={{ marginBottom: 48 }}>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9C9589', marginBottom: 18 }}>Create account</p>
            <h1 style={{ fontFamily: "'Cormorant', serif", fontStyle: 'italic', fontWeight: 300, fontSize: 44, lineHeight: 1, letterSpacing: '-0.02em', color: '#0A0908' }}>
              Get started.
            </h1>
          </div>

          {/* Role */}
          <div style={{ marginBottom: 40 }}>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9C9589', marginBottom: 18 }}>
              I am a
            </p>
            <div style={{ display: 'flex', gap: 0 }}>
              {[
                { val: 'renter', label: 'Filmmaker', desc: 'I need props for shoots' },
                { val: 'decorator', label: 'Set Decorator', desc: 'I want to list props' },
              ].map(opt => (
                <button key={opt.val} type="button" onClick={() => setRole(opt.val as any)} style={{
                  flex: 1, padding: '20px 16px', background: role === opt.val ? '#0A0908' : 'transparent',
                  border: `1px solid ${role === opt.val ? '#0A0908' : '#E8E4DC'}`,
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.2s ease',
                  marginRight: opt.val === 'renter' ? -1 : 0,
                }}>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 500, color: role === opt.val ? '#FFF' : '#0A0908', marginBottom: 4 }}>
                    {opt.label}
                  </div>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 300, color: role === opt.val ? 'rgba(255,255,255,0.55)' : '#9C9589' }}>
                    {opt.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <div>
              <label style={labelStyle}>Full name</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={inputStyle}
                onFocus={e => (e.target.style.borderBottomColor = '#0A0908')}
                onBlur={e => (e.target.style.borderBottomColor = '#E8E4DC')}
              />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle}
                onFocus={e => (e.target.style.borderBottomColor = '#0A0908')}
                onBlur={e => (e.target.style.borderBottomColor = '#E8E4DC')}
              />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" style={inputStyle}
                onFocus={e => (e.target.style.borderBottomColor = '#0A0908')}
                onBlur={e => (e.target.style.borderBottomColor = '#E8E4DC')}
              />
            </div>

            {error && (
              <div style={{ borderLeft: '2px solid #8B2020', paddingLeft: 14, fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 300, color: '#8B2020', lineHeight: 1.5 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-dark" style={{ padding: '15px', fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1, width: '100%', justifyContent: 'center', marginTop: 8 }}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '28px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#E8E4DC' }} />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '0.14em', color: '#9C9589', textTransform: 'uppercase' }}>or</span>
            <div style={{ flex: 1, height: 1, background: '#E8E4DC' }} />
          </div>

          <button onClick={handleGoogle} disabled={loading} className="btn-outline" style={{ width: '100%', padding: '13px', fontSize: 12, fontWeight: 500, letterSpacing: '0.06em', cursor: 'pointer', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="15" height="15" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>

          <p style={{ textAlign: 'center', fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 300, color: '#9C9589', marginTop: 28 }}>
            Already have an account?{' '}
            <Link href="/auth/login" style={{ color: '#0A0908', fontWeight: 400 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
