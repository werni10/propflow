'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/client';
import { getSupabase } from '@/lib/supabase';
import { User } from '@/lib/types';

type Message = {
  id: string;
  booking_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  sender?: { name: string; avatar_url?: string };
};

type BookingInfo = {
  id: string;
  renter_id: string;
  decorator_id: string;
  items?: { title: string };
};

function formatTime(d: string) {
  const date = new Date(d);
  const today = new Date();
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) +
    ' ' + date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function getInitial(name?: string) {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
}

export default function MessagesPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const bottomRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    init();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [id]);

  async function init() {
    const u = await getCurrentUser();
    if (!u) { router.push('/auth/login'); return; }
    setUser(u);

    const { data: session } = await getSupabase().auth.getSession();
    const tok = session?.session?.access_token || null;
    setToken(tok);

    const [bookingRes, msgsRes] = await Promise.all([
      fetch(`/api/bookings?id=${id}`),
      tok ? fetch(`/api/messages?bookingId=${id}`, { headers: { Authorization: `Bearer ${tok}` } }) : Promise.resolve(null),
    ]);

    const bookingData = await bookingRes.json();
    setBooking(bookingData?.id ? bookingData : null);

    if (msgsRes) {
      const msgsData = await msgsRes.json();
      if (Array.isArray(msgsData)) setMessages(msgsData);
    }

    setLoading(false);

    // Poll every 5 seconds
    intervalRef.current = setInterval(() => pollMessages(tok), 5000);
  }

  async function pollMessages(tok: string | null) {
    if (!tok || !id) return;
    try {
      const res = await fetch(`/api/messages?bookingId=${id}`, {
        headers: { Authorization: `Bearer ${tok}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) setMessages(data);
    } catch {}
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !input.trim() || sending) return;
    const body = input.trim();
    setInput('');
    setSending(true);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ booking_id: id, body }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, data]);
      }
    } catch {}
    setSending(false);
  }

  if (loading || !user) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontFamily: 'Barlow Condensed', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: 13 }}>
        Loading...
      </div>
    );
  }

  if (!booking) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: 'var(--text-sub)' }}>Booking not found.</div>
        <Link href="/bookings" style={{ fontFamily: 'Barlow Condensed', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', textDecoration: 'none' }}>← My Bookings</Link>
      </div>
    );
  }

  const propTitle = (booking as any).items?.title || 'Booking';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>

      {/* NAV */}
      <nav style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-void)', height: 56, display: 'flex', alignItems: 'center', padding: '0 32px', gap: 16, flexShrink: 0 }}>
        <Link href="/" style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 700, color: 'var(--gold)', textDecoration: 'none' }}>
          PropFlow
        </Link>
        <span style={{ color: 'var(--border)' }}>/</span>
        <Link href="/bookings" style={{ fontFamily: 'Barlow Condensed', fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'none' }}>
          My Bookings
        </Link>
        <span style={{ color: 'var(--border)' }}>/</span>
        <Link href={`/bookings/${id}`} style={{ fontFamily: 'Barlow Condensed', fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.08em', textDecoration: 'none', textTransform: 'uppercase' }}>
          {id.slice(0, 8).toUpperCase()}
        </Link>
        <span style={{ color: 'var(--border)' }}>/</span>
        <span style={{ fontFamily: 'Barlow Condensed', fontSize: 12, color: 'var(--gold)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Messages</span>
      </nav>

      {/* CHAT CONTAINER */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: 760, width: '100%', margin: '0 auto', padding: '0 24px', boxSizing: 'border-box' }}>

        {/* Header */}
        <div style={{ padding: '32px 0 20px' }}>
          <Link
            href={`/bookings/${id}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'Barlow Condensed', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: 20 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Booking Details
          </Link>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 32, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
            Conversation
          </h1>
          <p style={{ fontFamily: 'Barlow', fontSize: 13, color: 'var(--text-sub)', margin: 0 }}>
            {propTitle}
          </p>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', marginBottom: 0 }} />

        {/* Messages area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 0', display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0 }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontFamily: 'Barlow', fontSize: 14, lineHeight: 1.7 }}>
              <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.4 }}>💬</div>
              <div>No messages yet.</div>
              <div style={{ fontSize: 12, fontFamily: 'Barlow Condensed', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 6, color: 'var(--text-muted)', opacity: 0.7 }}>
                Start the conversation.
              </div>
            </div>
          ) : (
            messages.map(msg => {
              const isOwn = msg.sender_id === user.id;
              const senderName = msg.sender?.name || 'Unknown';
              const initial = getInitial(senderName);

              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: isOwn ? 'row-reverse' : 'row',
                    alignItems: 'flex-end',
                    gap: 10,
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: isOwn ? 'rgba(212,168,50,0.2)' : 'var(--bg-elevated)',
                    border: isOwn ? '1px solid rgba(212,168,50,0.4)' : '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'Playfair Display, serif',
                    fontSize: 13,
                    fontWeight: 700,
                    color: isOwn ? 'var(--gold)' : 'var(--text-sub)',
                    flexShrink: 0,
                  }}>
                    {initial}
                  </div>

                  {/* Bubble */}
                  <div style={{ maxWidth: '68%' }}>
                    {!isOwn && (
                      <div style={{ fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4, paddingLeft: 2 }}>
                        {senderName}
                      </div>
                    )}
                    <div style={{
                      padding: '10px 14px',
                      borderRadius: 2,
                      background: isOwn ? 'rgba(212,168,50,0.15)' : 'var(--bg-surface)',
                      border: isOwn ? '1px solid rgba(212,168,50,0.3)' : '1px solid var(--border)',
                      fontFamily: 'Barlow, sans-serif',
                      fontSize: 14,
                      lineHeight: 1.65,
                      color: 'var(--text)',
                      wordBreak: 'break-word',
                    }}>
                      {msg.body}
                    </div>
                    <div style={{
                      fontFamily: 'Barlow Condensed',
                      fontSize: 10,
                      color: 'var(--text-muted)',
                      marginTop: 4,
                      paddingLeft: 2,
                      paddingRight: 2,
                      textAlign: isOwn ? 'right' : 'left',
                      letterSpacing: '0.06em',
                    }}>
                      {formatTime(msg.created_at)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div style={{ borderTop: '1px solid var(--border)', padding: '16px 0 24px', flexShrink: 0 }}>
          <form onSubmit={handleSend} style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e as any);
                }
              }}
              placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
              rows={1}
              className="input-dark"
              style={{
                flex: 1,
                padding: '11px 14px',
                borderRadius: 2,
                fontSize: 14,
                fontFamily: 'Barlow, sans-serif',
                resize: 'none',
                lineHeight: 1.5,
                minHeight: 44,
                maxHeight: 120,
                overflowY: 'auto',
              }}
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="btn-gold"
              style={{
                padding: '11px 22px',
                borderRadius: 2,
                fontSize: 12,
                border: 'none',
                cursor: (sending || !input.trim()) ? 'not-allowed' : 'pointer',
                opacity: (sending || !input.trim()) ? 0.5 : 1,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {sending ? 'Sending…' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
