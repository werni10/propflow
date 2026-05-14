'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/client';
import { getSupabase } from '@/lib/supabase';

type Wishlist = {
  id: string;
  name: string;
  wishlist_items: { count: number }[];
};

type Props = {
  itemId: string;
};

export default function SaveToBoard({ itemId }: Props) {
  const router       = useRouter();
  const [user, setUser]             = useState<{ id: string } | null>(null);
  const [saved, setSaved]           = useState(false);
  const [open, setOpen]             = useState(false);
  const [boards, setBoards]         = useState<Wishlist[]>([]);
  const [loadingBoards, setLoadingBoards] = useState(false);
  const [savingId, setSavingId]     = useState<string | null>(null);
  const [showNew, setShowNew]       = useState(false);
  const [newName, setNewName]       = useState('');
  const [creating, setCreating]     = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getCurrentUser().then(u => setUser(u ? { id: u.id } : null));
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setShowNew(false);
        setNewName('');
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  async function handleClick() {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (open) {
      setOpen(false);
      setShowNew(false);
      setNewName('');
      return;
    }
    setOpen(true);
    setLoadingBoards(true);
    try {
      const { data: { session } } = await getSupabase().auth.getSession();
      const res = await fetch(`/api/wishlists?userId=${user.id}`, {
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
      });
      const data = await res.json();
      setBoards(Array.isArray(data) ? data : []);
    } finally {
      setLoadingBoards(false);
    }
  }

  async function handleSaveToBoard(boardId: string) {
    if (!user) return;
    setSavingId(boardId);
    try {
      const { data: { session } } = await getSupabase().auth.getSession();
      const res = await fetch('/api/wishlists/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ wishlist_id: boardId, item_id: itemId }),
      });
      if (res.ok || res.status === 409) {
        setSaved(true);
        setOpen(false);
      }
    } finally {
      setSavingId(null);
    }
  }

  async function handleCreateAndSave() {
    if (!newName.trim() || !user) return;
    setCreating(true);
    try {
      const { data: { session } } = await getSupabase().auth.getSession();
      const createRes = await fetch('/api/wishlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ name: newName.trim(), user_id: user.id, is_public: false }),
      });
      const newBoard = await createRes.json();
      if (!createRes.ok) return;

      const saveRes = await fetch('/api/wishlists/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ wishlist_id: newBoard.id, item_id: itemId }),
      });
      if (saveRes.ok) {
        setSaved(true);
        setOpen(false);
        setShowNew(false);
        setNewName('');
      }
    } finally {
      setCreating(false);
    }
  }

  const btnStyle: React.CSSProperties = {
    display:        'inline-flex',
    alignItems:     'center',
    gap:            5,
    padding:        '8px 16px',
    fontSize:       12,
    fontFamily:     'Barlow Condensed, sans-serif',
    fontWeight:     600,
    letterSpacing:  '0.08em',
    textTransform:  'uppercase',
    cursor:         'pointer',
    borderRadius:   2,
    transition:     'all 0.18s',
    background:     'transparent',
    border:         saved ? '1px solid var(--border-gold)' : '1px solid var(--border)',
    color:          saved ? 'var(--gold)' : 'var(--text-muted)',
  };

  const dropdownStyle: React.CSSProperties = {
    position:   'absolute',
    top:        'calc(100% + 6px)',
    left:       0,
    minWidth:   220,
    background: 'var(--bg-surface)',
    border:     '1px solid var(--border)',
    borderRadius: 2,
    boxShadow:  '0 8px 32px rgba(0,0,0,0.6)',
    zIndex:     200,
    overflow:   'hidden',
  };

  const dropItemStyle: React.CSSProperties = {
    display:        'block',
    width:          '100%',
    padding:        '10px 16px',
    fontFamily:     'Barlow Condensed, sans-serif',
    fontSize:       13,
    letterSpacing:  '0.05em',
    color:          'var(--text-sub)',
    background:     'none',
    border:         'none',
    textAlign:      'left',
    cursor:         'pointer',
    transition:     'background 0.12s, color 0.12s',
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        style={btnStyle}
        onClick={handleClick}
        onMouseEnter={e => {
          if (!saved) {
            e.currentTarget.style.color = 'var(--gold)';
            e.currentTarget.style.borderColor = 'var(--border-gold)';
          }
        }}
        onMouseLeave={e => {
          if (!saved) {
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.borderColor = 'var(--border)';
          }
        }}
      >
        <span style={{ fontSize: 13 }}>{saved ? '♥' : '♡'}</span>
        {saved ? 'Saved' : 'Save'}
      </button>

      {open && (
        <div style={dropdownStyle}>
          <div style={{ padding: '10px 16px 8px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Save to board
            </span>
          </div>

          {loadingBoards ? (
            <div style={{ padding: '14px 16px', fontFamily: 'Barlow Condensed', fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
              Loading...
            </div>
          ) : (
            <>
              {boards.length === 0 && !showNew && (
                <div style={{ padding: '12px 16px', fontFamily: 'Barlow', fontSize: 12, color: 'var(--text-muted)' }}>
                  No boards yet.
                </div>
              )}

              {boards.map(board => (
                <button
                  key={board.id}
                  style={dropItemStyle}
                  disabled={!!savingId}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--bg-elevated)';
                    e.currentTarget.style.color = 'var(--text)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'none';
                    e.currentTarget.style.color = 'var(--text-sub)';
                  }}
                  onClick={() => handleSaveToBoard(board.id)}
                >
                  {savingId === board.id ? '...' : board.name}
                </button>
              ))}

              <div style={{ borderTop: '1px solid var(--border)' }}>
                {!showNew ? (
                  <button
                    style={{ ...dropItemStyle, color: 'var(--gold)' }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'var(--bg-elevated)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'none';
                    }}
                    onClick={() => setShowNew(true)}
                  >
                    + Create new board
                  </button>
                ) : (
                  <div style={{ padding: '10px 12px', display: 'flex', gap: 6 }}>
                    <input
                      autoFocus
                      type="text"
                      className="input-dark"
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleCreateAndSave(); if (e.key === 'Escape') { setShowNew(false); setNewName(''); } }}
                      placeholder="Board name"
                      style={{ flex: 1, padding: '6px 10px', fontSize: 12, borderRadius: 2 }}
                    />
                    <button
                      className="btn-gold"
                      onClick={handleCreateAndSave}
                      disabled={creating || !newName.trim()}
                      style={{ padding: '6px 12px', fontSize: 11, borderRadius: 2, cursor: 'pointer', border: 'none', flexShrink: 0 }}
                    >
                      {creating ? '...' : 'Add'}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
