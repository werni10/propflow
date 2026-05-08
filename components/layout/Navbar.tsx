'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCurrentUser, signOut } from '@/lib/auth/client';
import { User } from '@/lib/types';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    getCurrentUser().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleSignOut() {
    await signOut();
    setUser(null);
    setDropdownOpen(false);
    router.push('/');
  }

  const navStyle: React.CSSProperties = {
    height: '64px',
    background: 'var(--bg-surface)',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  };

  const logoLinkStyle: React.CSSProperties = {
    textDecoration: 'none',
    display: 'flex',
    flexDirection: 'column',
    lineHeight: 1,
    gap: '1px',
  };

  const logoWordStyle: React.CSSProperties = {
    fontFamily: "'Playfair Display', serif",
    fontWeight: 700,
    fontSize: '1.25rem',
    color: 'var(--gold)',
    letterSpacing: '0.02em',
  };

  const logoSubStyle: React.CSSProperties = {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 500,
    fontSize: '0.6rem',
    letterSpacing: '0.2em',
    textTransform: 'uppercase' as const,
    color: 'var(--text-muted)',
  };

  const navLinksStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '28px',
  };

  const navLinkStyle: React.CSSProperties = {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 600,
    fontSize: '0.875rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: 'var(--text-sub)',
    textDecoration: 'none',
    transition: 'color 0.15s',
  };

  const btnGoldStyle: React.CSSProperties = {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    fontSize: '0.8rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    background: 'linear-gradient(135deg, var(--gold-dim) 0%, var(--gold) 100%)',
    color: '#080708',
    textDecoration: 'none',
    padding: '8px 20px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  const avatarButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'none',
    border: '1px solid var(--border)',
    color: 'var(--text)',
    cursor: 'pointer',
    padding: '6px 14px 6px 8px',
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 600,
    fontSize: '0.875rem',
    letterSpacing: '0.06em',
    transition: 'border-color 0.15s',
  };

  const avatarCircleStyle: React.CSSProperties = {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--gold-dim) 0%, var(--gold) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    fontSize: '0.75rem',
    color: '#080708',
    overflow: 'hidden',
    flexShrink: 0,
  };

  const dropdownStyle: React.CSSProperties = {
    position: 'absolute' as const,
    top: 'calc(100% + 8px)',
    right: 0,
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    minWidth: '180px',
    boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
    zIndex: 200,
  };

  const dropdownItemStyle: React.CSSProperties = {
    display: 'block',
    padding: '12px 20px',
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 600,
    fontSize: '0.85rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: 'var(--text-sub)',
    textDecoration: 'none',
    background: 'none',
    border: 'none',
    width: '100%',
    textAlign: 'left' as const,
    cursor: 'pointer',
    transition: 'color 0.15s, background 0.15s',
  };

  const dropdownDividerStyle: React.CSSProperties = {
    height: '1px',
    background: 'var(--border)',
    margin: '4px 0',
  };

  const signOutItemStyle: React.CSSProperties = {
    ...dropdownItemStyle,
    color: 'var(--text-muted)',
  };

  // Placeholder nav while loading
  if (loading) {
    return (
      <nav style={navStyle}>
        <Link href="/" style={logoLinkStyle}>
          <span style={logoWordStyle}>PropFlow</span>
          <span style={logoSubStyle}>Morocco</span>
        </Link>
        <div style={{ width: '160px', height: '20px', background: 'var(--bg-elevated)', borderRadius: '2px' }} />
      </nav>
    );
  }

  const initials = user?.name
    ? user.name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : '?';

  return (
    <nav style={navStyle}>
      {/* Logo */}
      <Link href="/" style={logoLinkStyle}>
        <span style={logoWordStyle}>PropFlow</span>
        <span style={logoSubStyle}>Morocco</span>
      </Link>

      {/* Right side */}
      <div style={navLinksStyle}>
        {!user ? (
          // Logged out state
          <>
            <Link
              href="/auth/login"
              style={navLinkStyle}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = 'var(--text)')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'var(--text-sub)')}
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              style={btnGoldStyle}
              onMouseEnter={(e) => {
                const el = e.target as HTMLElement;
                el.style.background = 'linear-gradient(135deg, var(--gold) 0%, var(--gold-bright) 100%)';
                el.style.boxShadow = '0 4px 24px rgba(212,168,50,0.3)';
              }}
              onMouseLeave={(e) => {
                const el = e.target as HTMLElement;
                el.style.background = 'linear-gradient(135deg, var(--gold-dim) 0%, var(--gold) 100%)';
                el.style.boxShadow = 'none';
              }}
            >
              Get Started
            </Link>
          </>
        ) : user.role === 'renter' ? (
          // Renter nav
          <>
            <Link
              href="/items"
              style={navLinkStyle}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = 'var(--text)')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'var(--text-sub)')}
            >
              Browse Props
            </Link>
            <Link
              href="/bookings"
              style={navLinkStyle}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = 'var(--text)')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'var(--text-sub)')}
            >
              My Bookings
            </Link>
            {/* Avatar dropdown */}
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                style={avatarButtonStyle}
                onClick={() => setDropdownOpen((v) => !v)}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border-gold)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border)')}
              >
                <span style={avatarCircleStyle}>
                  {user.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatar_url} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    initials
                  )}
                </span>
                {user.name.split(' ')[0]}
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ marginLeft: '2px', opacity: 0.6 }}>
                  <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {dropdownOpen && (
                <div style={dropdownStyle}>
                  <Link
                    href="/account"
                    style={dropdownItemStyle}
                    onClick={() => setDropdownOpen(false)}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.color = 'var(--text)';
                      (e.target as HTMLElement).style.background = 'var(--bg-elevated)';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.color = 'var(--text-sub)';
                      (e.target as HTMLElement).style.background = 'none';
                    }}
                  >
                    Account
                  </Link>
                  <div style={dropdownDividerStyle} />
                  <button
                    style={signOutItemStyle}
                    onClick={handleSignOut}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.color = 'var(--text)';
                      (e.target as HTMLElement).style.background = 'var(--bg-elevated)';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.color = 'var(--text-muted)';
                      (e.target as HTMLElement).style.background = 'none';
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          // Decorator nav
          <>
            <Link
              href="/decorators/dashboard"
              style={navLinkStyle}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = 'var(--text)')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'var(--text-sub)')}
            >
              Dashboard
            </Link>
            <Link
              href="/decorators/bookings"
              style={navLinkStyle}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = 'var(--text)')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'var(--text-sub)')}
            >
              My Bookings
            </Link>
            {/* Avatar dropdown */}
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                style={avatarButtonStyle}
                onClick={() => setDropdownOpen((v) => !v)}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border-gold)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border)')}
              >
                <span style={avatarCircleStyle}>
                  {user.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatar_url} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    initials
                  )}
                </span>
                {user.name.split(' ')[0]}
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ marginLeft: '2px', opacity: 0.6 }}>
                  <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {dropdownOpen && (
                <div style={dropdownStyle}>
                  <Link
                    href="/decorators/profile"
                    style={dropdownItemStyle}
                    onClick={() => setDropdownOpen(false)}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.color = 'var(--text)';
                      (e.target as HTMLElement).style.background = 'var(--bg-elevated)';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.color = 'var(--text-sub)';
                      (e.target as HTMLElement).style.background = 'none';
                    }}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/decorators/earnings"
                    style={dropdownItemStyle}
                    onClick={() => setDropdownOpen(false)}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.color = 'var(--text)';
                      (e.target as HTMLElement).style.background = 'var(--bg-elevated)';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.color = 'var(--text-sub)';
                      (e.target as HTMLElement).style.background = 'none';
                    }}
                  >
                    Earnings
                  </Link>
                  <div style={dropdownDividerStyle} />
                  <button
                    style={signOutItemStyle}
                    onClick={handleSignOut}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.color = 'var(--text)';
                      (e.target as HTMLElement).style.background = 'var(--bg-elevated)';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.color = 'var(--text-muted)';
                      (e.target as HTMLElement).style.background = 'none';
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
