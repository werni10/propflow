'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/client';
import { User, Booking } from '@/lib/types';

export default function LeaveReview() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [booking, setBooking] = useState<Booking & { items?: any; decorators?: any } | null>(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    getCurrentUser().then(u => {
      if (!u) { router.push('/auth/login'); return; }
      setUser(u);
    });
  }, []);

  useEffect(() => {
    if (!bookingId) return;
    fetch(`/api/bookings?id=${bookingId}`)
      .then(r => r.json())
      .then(d => setBooking(d))
      .catch(() => {});
  }, [bookingId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !booking || rating === 0) return;
    setLoading(true); setError('');

    try {
      const { data: session } = await (await import('@/lib/supabase')).getSupabase().auth.getSession();
      const token = session?.session?.access_token;

      const reviewedId = user.id === booking.renter_id ? booking.decorator_id : booking.renter_id;

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ booking_id: bookingId, reviewed_id: reviewedId, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to submit'); return; }
      setDone(true);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  const labelStyle = {
    display: 'block' as const,
    fontFamily: 'Barlow Condensed, sans-serif',
    fontSize: 11,
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: 'var(--text-muted)',
    marginBottom: 8,
  };

  if (!user || !booking) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontFamily: 'Barlow Condensed', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: 13 }}>
        Loading...
      </div>
    );
  }

  if (done) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>★</div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 32, color: 'var(--gold)', marginBottom: 12 }}>Review Submitted</h1>
          <p style={{ fontFamily: 'Barlow', fontSize: 14, color: 'var(--text-sub)', marginBottom: 28 }}>Thank you for your feedback.</p>
          <Link href="/bookings" className="btn-gold" style={{ padding: '12px 28px', fontSize: 13, borderRadius: 2, textDecoration: 'none', display: 'inline-block' }}>Back to Bookings</Link>
        </div>
      </div>
    );
  }

  const propTitle = booking.items?.title || 'Prop';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <nav style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-void)', height: 64, display: 'flex', alignItems: 'center', padding: '0 32px', gap: 16 }}>
        <Link href="/" style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 700, color: 'var(--gold)', textDecoration: 'none' }}>PropFlow</Link>
        <span style={{ color: 'var(--border)' }}>/</span>
        <Link href="/bookings" style={{ fontFamily: 'Barlow Condensed', fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Bookings</Link>
        <span style={{ color: 'var(--border)' }}>/</span>
        <span style={{ fontFamily: 'Barlow Condensed', fontSize: 12, color: 'var(--gold)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Review</span>
      </nav>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 36, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Leave a Review</h1>
        <p style={{ fontFamily: 'Barlow', fontSize: 14, color: 'var(--text-sub)', marginBottom: 32 }}>
          For: <strong style={{ color: 'var(--gold)' }}>{propTitle}</strong>
        </p>

        <div className="divider-gold" style={{ marginBottom: 32 }} />

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* Star Rating */}
          <div>
            <label style={labelStyle}>Your Rating *</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 36,
                    color: star <= (hover || rating) ? 'var(--gold)' : 'var(--border)',
                    transition: 'color 0.15s',
                    padding: '0 2px',
                  }}
                >
                  ★
                </button>
              ))}
            </div>
            {rating > 0 && (
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: 12, color: 'var(--text-muted)', marginTop: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
              </div>
            )}
          </div>

          {/* Comment */}
          <div>
            <label style={labelStyle}>Comment (optional)</label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={5}
              className="input-dark"
              style={{ width: '100%', padding: '12px 16px', borderRadius: 2, fontSize: 14, fontFamily: 'Barlow, sans-serif', resize: 'vertical', lineHeight: 1.7 }}
              placeholder="Describe your experience — condition of the prop, communication, pickup/return..."
            />
          </div>

          {error && (
            <div style={{ background: 'rgba(155,58,58,0.15)', border: '1px solid rgba(155,58,58,0.4)', color: '#EB5757', padding: '12px 16px', borderRadius: 2, fontSize: 13, fontFamily: 'Barlow' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="submit"
              disabled={loading || rating === 0}
              className="btn-gold"
              style={{ flex: 1, padding: '14px', borderRadius: 2, fontSize: 13, border: 'none', cursor: (loading || rating === 0) ? 'not-allowed' : 'pointer', opacity: rating === 0 ? 0.5 : 1 }}
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
            <Link href={`/bookings/${bookingId}`} className="btn-ghost" style={{ padding: '14px 24px', borderRadius: 2, fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
