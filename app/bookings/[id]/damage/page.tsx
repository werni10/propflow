'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/client';
import { getSupabase } from '@/lib/supabase';
import { User } from '@/lib/types';

type BookingInfo = {
  id: string;
  renter_id: string;
  decorator_id: string;
  status: string;
  items?: { title: string };
};

type DamageReport = {
  id: string;
  description: string;
  severity: 'minor' | 'moderate' | 'severe';
  status: 'open' | 'reviewing' | 'resolved';
  photos: string[];
  created_at: string;
  reporter?: { name: string; avatar_url?: string };
};

const SEVERITIES: { key: 'minor' | 'moderate' | 'severe'; label: string; sub: string; color: string; bg: string; border: string }[] = [
  { key: 'minor',    label: 'Minor',    sub: 'Cosmetic only',    color: '#D4A832', bg: 'rgba(212,168,50,0.08)',  border: 'rgba(212,168,50,0.3)' },
  { key: 'moderate', label: 'Moderate', sub: 'Functional issue', color: '#E07B39', bg: 'rgba(224,123,57,0.08)',  border: 'rgba(224,123,57,0.3)' },
  { key: 'severe',   label: 'Severe',   sub: 'Broken / lost',    color: '#C95C5C', bg: 'rgba(155,58,58,0.1)',   border: 'rgba(155,58,58,0.4)' },
];

const STATUS_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  open:       { label: 'Open',       color: '#D4A832', bg: 'rgba(212,168,50,0.12)' },
  reviewing:  { label: 'Reviewing',  color: '#E07B39', bg: 'rgba(224,123,57,0.12)' },
  resolved:   { label: 'Resolved',   color: '#5CAE7C', bg: 'rgba(92,174,124,0.12)' },
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'Barlow Condensed, sans-serif',
  fontSize: 11,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  marginBottom: 8,
};

export default function DamageReportPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingInfo | null>(null);
  const [reports, setReports] = useState<DamageReport[]>([]);
  const [loading, setLoading] = useState(true);

  const [severity, setSeverity] = useState<'minor' | 'moderate' | 'severe'>('minor');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { init(); }, [id]);

  async function init() {
    const u = await getCurrentUser();
    if (!u) { router.push('/auth/login'); return; }
    setUser(u);

    const { data: session } = await getSupabase().auth.getSession();
    const tok = session?.session?.access_token || null;
    setToken(tok);

    const bookingRes = await fetch(`/api/bookings?id=${id}`);
    const bookingData = await bookingRes.json();

    if (!bookingData?.id) { setLoading(false); return; }
    setBooking(bookingData);

    if (tok) {
      const repRes = await fetch(`/api/damage-reports?bookingId=${id}`, {
        headers: { Authorization: `Bearer ${tok}` },
      });
      if (repRes.ok) {
        const repData = await repRes.json();
        if (Array.isArray(repData)) setReports(repData);
      }
    }

    setLoading(false);
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length || !token) return;
    setUploading(true);
    const uploaded: string[] = [];

    for (const file of files) {
      try {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        const data = await res.json();
        if (data.url) uploaded.push(data.url);
      } catch {}
    }

    setPhotos(prev => [...prev, ...uploaded]);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !description.trim()) return;
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/damage-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ booking_id: id, description: description.trim(), photos, severity }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to submit'); return; }
      setDone(true);
      setReports(prev => [data, ...prev]);
    } catch (err) {
      setError(String(err));
    } finally {
      setSubmitting(false);
    }
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

  if (booking.status !== 'completed') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: 'var(--text-sub)' }}>Not available.</div>
        <div style={{ fontFamily: 'Barlow', fontSize: 14, color: 'var(--text-muted)' }}>Damage reports can only be filed for completed bookings.</div>
        <Link href={`/bookings/${id}`} style={{ fontFamily: 'Barlow Condensed', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', textDecoration: 'none' }}>← Booking Details</Link>
      </div>
    );
  }

  const propTitle = booking.items?.title || 'Prop';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>

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
        <span style={{ fontFamily: 'Barlow Condensed', fontSize: 12, color: 'var(--gold)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Damage</span>
      </nav>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '48px 24px' }}>

        {/* Back link */}
        <Link
          href={`/bookings/${id}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'Barlow Condensed', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: 36 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Booking Details
        </Link>

        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 36, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
          Report Damage
        </h1>
        <p style={{ fontFamily: 'Barlow', fontSize: 14, color: 'var(--text-sub)', marginBottom: 28 }}>
          For: <strong style={{ color: 'var(--gold)' }}>{propTitle}</strong>
        </p>

        {/* Warning banner */}
        <div style={{ background: 'rgba(155,58,58,0.1)', border: '1px solid rgba(155,58,58,0.3)', borderRadius: 2, padding: '14px 18px', marginBottom: 32, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C95C5C" strokeWidth="1.5" style={{ flexShrink: 0, marginTop: 2 }}>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <p style={{ fontFamily: 'Barlow', fontSize: 13, color: '#C95C5C', lineHeight: 1.6, margin: 0 }}>
            Only submit if the prop was returned in worse condition than described. False reports may result in account suspension.
          </p>
        </div>

        {/* Success state */}
        {done ? (
          <div style={{ background: 'rgba(92,174,124,0.08)', border: '1px solid rgba(92,174,124,0.3)', borderRadius: 2, padding: '24px', textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>✓</div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#5CAE7C', marginBottom: 8 }}>Report Submitted</div>
            <div style={{ fontFamily: 'Barlow', fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.6 }}>
              Admin will review within 48 hours.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28, marginBottom: 40 }}>

            {/* Severity selector */}
            <div>
              <label style={labelStyle}>Severity *</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                {SEVERITIES.map(s => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setSeverity(s.key)}
                    style={{
                      padding: '14px 12px',
                      borderRadius: 2,
                      border: severity === s.key ? `1px solid ${s.border}` : '1px solid var(--border)',
                      background: severity === s.key ? s.bg : 'var(--bg-surface)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{
                      fontFamily: 'Barlow Condensed',
                      fontSize: 13,
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: severity === s.key ? s.color : 'var(--text-sub)',
                      marginBottom: 4,
                    }}>
                      {s.label}
                    </div>
                    <div style={{
                      fontFamily: 'Barlow',
                      fontSize: 11,
                      color: severity === s.key ? s.color : 'var(--text-muted)',
                      opacity: 0.85,
                    }}>
                      {s.sub}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={labelStyle}>Description *</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
                rows={5}
                className="input-dark"
                style={{ width: '100%', padding: '12px 16px', borderRadius: 2, fontSize: 14, fontFamily: 'Barlow, sans-serif', resize: 'vertical', lineHeight: 1.7, boxSizing: 'border-box' }}
                placeholder="Describe the damage in detail — what broke, where, how it differs from the original condition..."
              />
            </div>

            {/* Photo upload */}
            <div>
              <label style={labelStyle}>Photos (optional)</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: photos.length ? 12 : 0 }}>
                {photos.map((url, i) => (
                  <div key={i} style={{ position: 'relative', width: 80, height: 80, borderRadius: 2, overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0 }}>
                    <img src={url} alt={`damage-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
                      style={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: 'rgba(0,0,0,0.7)',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: 12,
                        lineHeight: 1,
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="btn-ghost"
                style={{ padding: '10px 20px', borderRadius: 2, fontSize: 12, cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.6 : 1 }}
              >
                {uploading ? 'Uploading…' : '+ Add Photos'}
              </button>
            </div>

            {error && (
              <div style={{ background: 'rgba(155,58,58,0.15)', border: '1px solid rgba(155,58,58,0.4)', color: '#EB5757', padding: '12px 16px', borderRadius: 2, fontSize: 13, fontFamily: 'Barlow' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="submit"
                disabled={submitting || !description.trim()}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: 2,
                  fontSize: 12,
                  fontFamily: 'Barlow Condensed',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  cursor: (submitting || !description.trim()) ? 'not-allowed' : 'pointer',
                  background: 'rgba(155,58,58,0.15)',
                  color: '#C95C5C',
                  border: '1px solid rgba(155,58,58,0.4)',
                  opacity: (submitting || !description.trim()) ? 0.5 : 1,
                  transition: 'all 0.2s',
                }}
              >
                {submitting ? 'Submitting…' : '⚠ Submit Report'}
              </button>
              <Link
                href={`/bookings/${id}`}
                className="btn-ghost"
                style={{ padding: '14px 24px', borderRadius: 2, fontSize: 12, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
              >
                Cancel
              </Link>
            </div>
          </form>
        )}

        {/* Existing reports */}
        {reports.length > 0 && (
          <div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 32, marginBottom: 20 }}>
              <span style={{ fontFamily: 'Barlow Condensed', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Filed Reports ({reports.length})
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {reports.map(report => {
                const sev = SEVERITIES.find(s => s.key === report.severity)!;
                const badge = STATUS_BADGE[report.status] || STATUS_BADGE.open;

                return (
                  <div key={report.id} className="card-dark" style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: 2 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {/* Severity badge */}
                        <span style={{ fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: sev.color, background: sev.bg, border: `1px solid ${sev.border}`, padding: '3px 8px', borderRadius: 2 }}>
                          {sev.label}
                        </span>
                        {/* Status badge */}
                        <span style={{ fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: badge.color, background: badge.bg, padding: '3px 8px', borderRadius: 2 }}>
                          {badge.label}
                        </span>
                      </div>
                      <span style={{ fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                        {formatDate(report.created_at)}
                      </span>
                    </div>

                    {report.reporter?.name && (
                      <div style={{ fontFamily: 'Barlow Condensed', fontSize: 11, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
                        Reported by: <span style={{ color: 'var(--text-sub)' }}>{report.reporter.name}</span>
                      </div>
                    )}

                    <p style={{ fontFamily: 'Barlow', fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.65, margin: 0, marginBottom: report.photos?.length ? 12 : 0 }}>
                      {report.description}
                    </p>

                    {report.photos?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                        {report.photos.map((url, i) => (
                          <div key={i} style={{ width: 64, height: 64, borderRadius: 2, overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0 }}>
                            <img src={url} alt={`photo-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
