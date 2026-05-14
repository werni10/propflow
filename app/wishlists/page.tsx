'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/client';
import { getSupabase } from '@/lib/supabase';
import { User } from '@/lib/types';

type Wishlist = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  share_token: string | null;
  created_at: string;
  updated_at: string;
  wishlist_items: { count: number }[];
};

const LOADING_STATE = (
  <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontFamily: 'Barlow Condensed', letterSpacing: '0.15em', textTransform: 'uppercase' as const, fontSize: 13 }}>
    Loading...
  </div>
);

export default function WishlistsPage() {
  const router = useRouter();
  const [user, setUser]           = useState<User | null>(null);
  const [boards, setBoards]       = useState<Wishlist[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [formName, setFormName]   = useState('');
  const [formDesc, setFormDesc]   = useState('');
  const [creating, setCreating]   = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError]         = useState('');

  useEffect(() => { checkAuth(); }, []);

  async function checkAuth() {
    const u = await getCurrentUser();
    if (!u) { router.push('/auth/login'); return; }
    setUser(u);
    await fetchBoards(u.id);
    setLoading(false);
  }

  async function fetchBoards(userId: string) {
    try {
      const { data: { session } } = await getSupabase().auth.getSession();
      const res = await fetch(`/api/wishlists?userId=${userId}`, {
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
      });
      const data = await res.json();
      setBoards(Array.isArray(data) ? data : []);
    } catch {
      setBoards([]);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim() || !user) return;
    setCreating(true);
    setError('');
    try {
      const { data: { session } } = await getSupabase().auth.getSession();
      const res = await fetch('/api/wishlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ name: formName, description: formDesc, user_id: user.id, is_public: false }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Failed to create board'); return; }
      setBoards(prev => [{ ...data, wishlist_items: [] }, ...prev]);
      setFormName('');
      setFormDesc('');
      setShowForm(false);
    } catch (err) {
      setError(String(err));
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this board and all saved props? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      const { data: { session } } = await getSupabase().auth.getSession();
      await fetch(`/api/wishlists?id=${id}`, {
        method: 'DELETE',
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
      });
      setBoards(prev => prev.filter(b => b.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) return LOADING_STATE;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>

      {/* NAV */}
      <nav style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-void)', height: 56, display: 'flex', alignItems: 'center', padding: '0 32px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/" style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 700, color: 'var(--gold)', textDecoration: 'none' }}>
            PropFlow
          </Link>
          <span style={{ color: 'var(--border)' }}>/</span>
          <span style={{ fontFamily: 'Barlow Condensed', fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Production Boards
          </span>
        </div>
        {user && (
          <span style={{ fontFamily: 'Barlow', fontSize: 13, color: 'var(--text-sub)' }}>
            {user.name}
          </span>
        )}
      </nav>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '48px 24px' }}>

        {/* Page header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 40, gap: 16, flexWrap: 'wrap' as const }}>
          <div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 40, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
              My Production Boards
            </h1>
            <p style={{ fontFamily: 'Barlow', fontSize: 14, color: 'var(--text-sub)' }}>
              {boards.length} board{boards.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            className="btn-gold"
            onClick={() => setShowForm(v => !v)}
            style={{ padding: '12px 24px', fontSize: 13, borderRadius: 2, cursor: 'pointer', border: 'none', marginTop: 8, flexShrink: 0 }}
          >
            {showForm ? '✕ Cancel' : '+ New Board'}
          </button>
        </div>

        <div className="divider-gold" style={{ marginBottom: 36 }} />

        {/* Inline create form */}
        {showForm && (
          <form onSubmit={handleCreate} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-gold)', borderRadius: 2, padding: '28px 32px', marginBottom: 32 }}>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 500, color: 'var(--text)', marginBottom: 20 }}>
              New Production Board
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 14 }}>
              <div>
                <label style={{ fontFamily: 'Barlow Condensed', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Board Name *
                </label>
                <input
                  type="text"
                  className="input-dark"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Period Drama S2, Desert Scene"
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 2, fontSize: 14 }}
                />
              </div>
              <div>
                <label style={{ fontFamily: 'Barlow Condensed', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Description
                </label>
                <input
                  type="text"
                  className="input-dark"
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  placeholder="Optional notes about this board"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 2, fontSize: 14 }}
                />
              </div>
              {error && (
                <p style={{ fontFamily: 'Barlow', fontSize: 13, color: '#C95C5C' }}>{error}</p>
              )}
              <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                <button
                  type="submit"
                  className="btn-gold"
                  disabled={creating || !formName.trim()}
                  style={{ padding: '11px 28px', fontSize: 13, borderRadius: 2, cursor: 'pointer', border: 'none' }}
                >
                  {creating ? 'Creating...' : 'Create Board'}
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => { setShowForm(false); setFormName(''); setFormDesc(''); setError(''); }}
                  style={{ padding: '11px 22px', fontSize: 13, borderRadius: 2, cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Board grid */}
        {boards.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 2 }}>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: 'var(--text-sub)', marginBottom: 12 }}>
              No boards yet.
            </div>
            <p style={{ fontFamily: 'Barlow', fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>
              Save props to create your first production board.
            </p>
            <button
              className="btn-gold"
              onClick={() => setShowForm(true)}
              style={{ padding: '12px 28px', borderRadius: 2, fontSize: 13, border: 'none', cursor: 'pointer', display: 'inline-block' }}
            >
              + New Board
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {boards.map(board => {
              const count = board.wishlist_items?.[0]?.count ?? 0;
              return (
                <div key={board.id} className="card-dark" style={{ borderRadius: 2, padding: '24px', display: 'flex', flexDirection: 'column' as const, gap: 12, position: 'relative' as const }}>
                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(board.id)}
                    disabled={deletingId === board.id}
                    title="Delete board"
                    style={{
                      position: 'absolute' as const,
                      top: 14,
                      right: 14,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      padding: 4,
                      lineHeight: 1,
                      fontSize: 14,
                      opacity: deletingId === board.id ? 0.4 : 1,
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#C95C5C')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4h6v2" />
                    </svg>
                  </button>

                  {/* Card body — clickable */}
                  <Link href={`/wishlists/${board.id}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column' as const, gap: 10, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, paddingRight: 24 }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 500, color: 'var(--text)', lineHeight: 1.3 }}>
                          {board.name}
                        </h3>
                      </div>
                    </div>

                    {board.description && (
                      <p style={{ fontFamily: 'Barlow', fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.5, margin: 0 }}>
                        {board.description}
                      </p>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      <span style={{
                        fontFamily: 'Barlow Condensed',
                        fontSize: 11,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase' as const,
                        color: 'var(--text-muted)',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        borderRadius: 2,
                        padding: '2px 8px',
                      }}>
                        {count} prop{count !== 1 ? 's' : ''}
                      </span>

                      {board.is_public && (
                        <span className="tag">
                          Public
                        </span>
                      )}
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
