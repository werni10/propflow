'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/client';
import { getSupabase } from '@/lib/supabase';
import { User, Item } from '@/lib/types';

type WishlistItem = {
  id: string;
  wishlist_id: string;
  item_id: string;
  notes: string | null;
  added_at: string;
  item: Item;
};

type WishlistDetail = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  share_token: string | null;
  created_at: string;
  updated_at: string;
  wishlist_items: WishlistItem[];
};

const LOADING_STATE = (
  <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontFamily: 'Barlow Condensed', letterSpacing: '0.15em', textTransform: 'uppercase' as const, fontSize: 13 }}>
    Loading...
  </div>
);

export default function WishlistDetailPage() {
  const router       = useRouter();
  const params       = useParams();
  const searchParams = useSearchParams();
  const boardId      = params.id as string;
  const tokenParam   = searchParams.get('token');

  const [user, setUser]           = useState<User | null>(null);
  const [board, setBoard]         = useState<WishlistDetail | null>(null);
  const [loading, setLoading]     = useState(true);
  const [isOwner, setIsOwner]     = useState(false);
  const [notFound, setNotFound]   = useState(false);
  const [toast, setToast]         = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [togglingShare, setTogglingShare] = useState(false);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2800);
  }

  const fetchBoard = useCallback(async (accessToken?: string) => {
    try {
      const url    = tokenParam
        ? `/api/wishlists?token=${tokenParam}`
        : `/api/wishlists?id=${boardId}`;
      const headers: Record<string, string> = {};
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      const res  = await fetch(url, { headers });
      const data = await res.json();
      if (!res.ok) { setNotFound(true); return; }
      setBoard(data);
      return data as WishlistDetail;
    } catch {
      setNotFound(true);
    }
  }, [boardId, tokenParam]);

  useEffect(() => {
    async function init() {
      const u = await getCurrentUser();
      setUser(u);

      const { data: { session } } = await getSupabase().auth.getSession();
      const token = session?.access_token;

      const fetched = await fetchBoard(token ?? undefined);

      if (fetched) {
        if (u && fetched.user_id === u.id) {
          setIsOwner(true);
        } else if (!fetched.is_public && !tokenParam) {
          // Not owner and not public — redirect to login
          if (!u) { router.push('/auth/login'); return; }
          setNotFound(true);
          return;
        }
      } else if (!tokenParam) {
        if (!u) { router.push('/auth/login'); return; }
      }

      setLoading(false);
    }
    init();
  }, [boardId, tokenParam, fetchBoard, router]);

  async function handleToggleShare() {
    if (!board || !isOwner) return;
    setTogglingShare(true);
    try {
      const { data: { session } } = await getSupabase().auth.getSession();
      const newPublic = !board.is_public;

      const res  = await fetch('/api/wishlists', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ id: board.id, is_public: newPublic }),
      });
      const data = await res.json();
      if (!res.ok) { showToast('Failed to update sharing'); return; }

      setBoard(prev => prev ? { ...prev, is_public: data.is_public, share_token: data.share_token } : prev);

      if (newPublic && data.share_token) {
        const shareUrl = `${window.location.origin}/wishlists/${board.id}?token=${data.share_token}`;
        await navigator.clipboard.writeText(shareUrl).catch(() => {});
        showToast('Board made public — link copied!');
      } else {
        showToast('Board is now private.');
      }
    } finally {
      setTogglingShare(false);
    }
  }

  async function handleCopyLink() {
    if (!board?.share_token) return;
    const shareUrl = `${window.location.origin}/wishlists/${board.id}?token=${board.share_token}`;
    await navigator.clipboard.writeText(shareUrl).catch(() => {});
    showToast('Link copied!');
  }

  async function handleRemove(wishlistItemId: string, itemId: string) {
    if (!board) return;
    setRemovingId(wishlistItemId);
    try {
      const { data: { session } } = await getSupabase().auth.getSession();
      await fetch(`/api/wishlists/items?wishlist_id=${board.id}&item_id=${itemId}`, {
        method: 'DELETE',
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
      });
      setBoard(prev => prev
        ? { ...prev, wishlist_items: prev.wishlist_items.filter(wi => wi.id !== wishlistItemId) }
        : prev
      );
    } finally {
      setRemovingId(null);
    }
  }

  if (loading) return LOADING_STATE;

  if (notFound) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 32, color: 'var(--text-sub)' }}>Board not found</div>
        <p style={{ fontFamily: 'Barlow', fontSize: 14, color: 'var(--text-muted)' }}>This board may be private or deleted.</p>
        <Link href="/wishlists" style={{ fontFamily: 'Barlow Condensed', fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', textDecoration: 'none' }}>
          ← My Boards
        </Link>
      </div>
    );
  }

  if (!board) return null;

  const items = board.wishlist_items ?? [];
  const isPublicView = !!tokenParam && !isOwner;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed' as const,
          top: 24,
          right: 24,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-gold)',
          color: 'var(--gold)',
          fontFamily: 'Barlow Condensed',
          fontSize: 13,
          letterSpacing: '0.08em',
          padding: '12px 20px',
          borderRadius: 2,
          zIndex: 9999,
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          animation: 'fadeIn 0.2s ease',
        }}>
          {toast}
        </div>
      )}

      {/* NAV */}
      <nav style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-void)', height: 56, display: 'flex', alignItems: 'center', padding: '0 32px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/" style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 700, color: 'var(--gold)', textDecoration: 'none' }}>
            PropFlow
          </Link>
          <span style={{ color: 'var(--border)' }}>/</span>
          <span style={{ fontFamily: 'Barlow Condensed', fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {isPublicView ? 'Production Board' : 'My Boards'}
          </span>
        </div>
        {user && !isPublicView && (
          <span style={{ fontFamily: 'Barlow', fontSize: 13, color: 'var(--text-sub)' }}>
            {user.name}
          </span>
        )}
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>

        {/* Back link */}
        <div style={{ marginBottom: 32 }}>
          {isPublicView ? (
            <Link href="/" style={{ fontFamily: 'Barlow Condensed', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', textDecoration: 'none' }}>
              ← View on PropFlow
            </Link>
          ) : (
            <Link href="/wishlists" style={{ fontFamily: 'Barlow Condensed', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', textDecoration: 'none' }}>
              ← My Boards
            </Link>
          )}
        </div>

        {/* Board header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12, gap: 20, flexWrap: 'wrap' as const }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' as const, marginBottom: 8 }}>
              <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 38, fontWeight: 700, color: 'var(--text)', lineHeight: 1.2, margin: 0 }}>
                {board.name}
              </h1>
              {board.is_public && (
                <span className="tag">Public</span>
              )}
            </div>
            {board.description && (
              <p style={{ fontFamily: 'Barlow', fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.6, margin: 0 }}>
                {board.description}
              </p>
            )}
            <p style={{ fontFamily: 'Barlow Condensed', fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.06em', marginTop: 8 }}>
              {items.length} prop{items.length !== 1 ? 's' : ''} saved
            </p>
          </div>

          {/* Share controls — owner only */}
          {isOwner && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
              {board.is_public && board.share_token && (
                <button
                  className="btn-ghost"
                  onClick={handleCopyLink}
                  style={{ padding: '10px 18px', fontSize: 12, borderRadius: 2, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M8 17H5a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v3"/>
                    <rect x="9" y="11" width="13" height="13" rx="2"/>
                  </svg>
                  Copy Link
                </button>
              )}
              <button
                className={board.is_public ? 'btn-ghost' : 'btn-gold'}
                onClick={handleToggleShare}
                disabled={togglingShare}
                style={{ padding: '10px 20px', fontSize: 12, borderRadius: 2, cursor: 'pointer', border: board.is_public ? '1px solid var(--border-gold)' : 'none', display: 'flex', alignItems: 'center', gap: 7 }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
                {togglingShare ? '...' : board.is_public ? 'Make Private' : 'Share Board'}
              </button>
            </div>
          )}
        </div>

        <div className="divider-gold" style={{ marginBottom: 40 }} />

        {/* Props grid */}
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 2 }}>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, color: 'var(--text-sub)', marginBottom: 12 }}>
              No props saved to this board yet.
            </div>
            {isOwner && (
              <p style={{ fontFamily: 'Barlow', fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>
                Browse props and click the save button to add them here.
              </p>
            )}
            {isOwner && (
              <Link
                href="/"
                className="btn-gold"
                style={{ padding: '12px 28px', borderRadius: 2, fontSize: 13, textDecoration: 'none', display: 'inline-block' }}
              >
                Browse Props →
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {items.map(wi => {
              const item = wi.item;
              if (!item) return null;
              return (
                <div key={wi.id} style={{ position: 'relative' as const }}>
                  <Link href={`/items/${item.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                    <div className="card-dark" style={{ borderRadius: 2, overflow: 'hidden', cursor: 'pointer' }}>
                      <div style={{ aspectRatio: '4/3', background: 'var(--bg-elevated)', position: 'relative', overflow: 'hidden' }}>
                        {item.photos?.length > 0 ? (
                          <img
                            src={item.photos[0]}
                            alt={item.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                            onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.04)')}
                            onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
                          />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' as const, gap: 8 }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1">
                              <rect x="3" y="3" width="18" height="18" rx="2"/>
                              <circle cx="8.5" cy="8.5" r="1.5"/>
                              <polyline points="21 15 16 10 5 21"/>
                            </svg>
                          </div>
                        )}
                        <div style={{ position: 'absolute', top: 10, left: 10 }}>
                          <span className="tag" style={{ background: 'rgba(8,7,8,0.85)' }}>{item.category}</span>
                        </div>
                        {item.instant_book && (
                          <div style={{ position: 'absolute', top: 10, right: 10 }}>
                            <span style={{ fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gold)', background: 'rgba(8,7,8,0.85)', border: '1px solid var(--gold)', padding: '2px 7px', borderRadius: 2 }}>
                              ⚡ Instant
                            </span>
                          </div>
                        )}
                      </div>
                      <div style={{ padding: '16px 18px 18px' }}>
                        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 500, color: 'var(--text)', marginBottom: 8, lineHeight: 1.3 }}>
                          {item.title}
                        </h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontFamily: 'Barlow Condensed', fontSize: 20, fontWeight: 700, color: 'var(--gold)', letterSpacing: '-0.01em' }}>
                            {item.price_per_day} <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)' }}>DHS/day</span>
                          </span>
                          <span style={{ fontFamily: 'Barlow Condensed', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>
                            {item.location}
                          </span>
                        </div>
                        <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: item.condition === 'Excellent' ? '#4CAF50' : item.condition === 'Good' ? 'var(--gold)' : '#FF9800' }} />
                          <span style={{ fontFamily: 'Barlow Condensed', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>
                            {item.condition}
                          </span>
                        </div>
                        {item.tags && item.tags.length > 0 && (
                          <div style={{ marginTop: 8, display: 'flex', gap: 5, flexWrap: 'wrap' as const }}>
                            {item.tags.slice(0, 2).map((tag: string) => (
                              <span key={tag} className="tag" style={{ fontSize: 10, padding: '2px 8px' }}>{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>

                  {/* Notes */}
                  {wi.notes && (
                    <p style={{
                      fontFamily: 'Barlow',
                      fontSize: 12,
                      fontStyle: 'italic',
                      color: 'var(--text-muted)',
                      margin: '6px 4px 0',
                      lineHeight: 1.4,
                    }}>
                      {wi.notes}
                    </p>
                  )}

                  {/* Remove button — owner only */}
                  {isOwner && (
                    <button
                      onClick={() => handleRemove(wi.id, wi.item_id)}
                      disabled={removingId === wi.id}
                      style={{
                        position: 'absolute' as const,
                        top: 10,
                        right: 10,
                        zIndex: 10,
                        background: 'rgba(8,7,8,0.85)',
                        border: '1px solid var(--border)',
                        borderRadius: 2,
                        color: 'var(--text-muted)',
                        fontFamily: 'Barlow Condensed',
                        fontSize: 10,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase' as const,
                        padding: '3px 9px',
                        cursor: 'pointer',
                        opacity: removingId === wi.id ? 0.4 : 1,
                        transition: 'color 0.15s, border-color 0.15s',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.color = '#C95C5C';
                        e.currentTarget.style.borderColor = '#7A3030';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.color = 'var(--text-muted)';
                        e.currentTarget.style.borderColor = 'var(--border)';
                      }}
                    >
                      {removingId === wi.id ? '...' : 'Remove'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
