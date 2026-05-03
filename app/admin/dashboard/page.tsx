'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface VerifItem { id: string; user_id: string; user_type: string; status: string; created_at: string; }
interface PayoutItem { id: string; decorator_id: string; amount: number; period_start: string; period_end: string; status: string; }

export default function AdminDashboard() {
  const [verifs, setVerifs]   = useState<VerifItem[]>([]);
  const [payouts, setPayouts] = useState<PayoutItem[]>([]);
  const [tab, setTab]         = useState<'verification'|'payouts'>('verification');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/verification').then(r => r.json()),
      fetch('/api/admin/payouts').then(r => r.json()),
    ]).then(([v, p]) => {
      setVerifs(Array.isArray(v) ? v : []);
      setPayouts(Array.isArray(p) ? p : []);
    }).finally(() => setLoading(false));
  }, []);

  async function approve(id: string, userId: string, approved: boolean) {
    await fetch('/api/admin/verification', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ verification_id: id, user_id: userId, approved, reviewed_by: 'admin' }) });
    setVerifs(v => v.filter(x => x.id !== id));
  }

  const statusColor = (s: string) => s === 'completed' ? '#4CAF50' : s === 'processing' ? 'var(--gold)' : s === 'pending' ? 'var(--text-sub)' : 'var(--red)';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* NAV */}
      <nav style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-void)', height: 56, display: 'flex', alignItems: 'center', padding: '0 32px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <Link href="/" style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 700, color: 'var(--gold)', textDecoration: 'none' }}>PropFlow</Link>
          <span style={{ fontFamily: 'Barlow Condensed', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', borderLeft: '1px solid var(--border)', paddingLeft: 32 }}>Admin Console</span>
        </div>
        <div className="tag">Sami / Anas</div>
      </nav>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 32px' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 40, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Admin Console</h1>
        <p style={{ fontFamily: 'Barlow', fontSize: 14, color: 'var(--text-sub)', marginBottom: 40 }}>Manage verifications, payouts, and platform health.</p>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 48 }}>
          {[
            ['Pending Verifications', verifs.length, verifs.length > 0 ? 'var(--gold)' : 'var(--text-sub)'],
            ['Pending Payouts', payouts.filter(p => p.status === 'pending').length, 'var(--text-sub)'],
            ['Total Payouts', `${payouts.reduce((s, p) => s + p.amount, 0).toLocaleString()} DHS`, 'var(--gold)'],
          ].map(([l, v, c]) => (
            <div key={String(l)} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 2, padding: '24px 28px' }}>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>{l}</div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 32, fontWeight: 700, color: String(c) }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 32 }}>
          {(['verification', 'payouts'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '12px 24px', fontFamily: 'Barlow Condensed', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', color: tab === t ? 'var(--gold)' : 'var(--text-muted)', borderBottom: tab === t ? '2px solid var(--gold)' : '2px solid transparent', transition: 'color 0.2s' }}>
              {t === 'verification' ? `Verification Queue (${verifs.length})` : `Payouts (${payouts.length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)', fontFamily: 'Barlow Condensed', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: 13 }}>Loading...</div>
        ) : tab === 'verification' ? (
          verifs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 2 }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, color: 'var(--text-sub)', marginBottom: 8 }}>Queue is clear.</div>
              <p style={{ fontFamily: 'Barlow', fontSize: 14, color: 'var(--text-muted)' }}>No pending verifications.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {verifs.map(v => (
                <div key={v.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 2, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 6 }}>
                      <span className="tag">{v.user_type}</span>
                      <span style={{ fontFamily: 'Barlow', fontSize: 13, color: 'var(--text-muted)' }}>{v.user_id}</span>
                    </div>
                    <div style={{ fontFamily: 'Barlow Condensed', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Requested: {new Date(v.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => approve(v.id, v.user_id, true)} style={{ padding: '8px 20px', fontFamily: 'Barlow Condensed', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'rgba(45,97,74,0.2)', border: '1px solid rgba(45,97,74,0.5)', color: '#6FCF97', borderRadius: 2, cursor: 'pointer', fontWeight: 600 }}>
                      ✓ Approve
                    </button>
                    <button onClick={() => approve(v.id, v.user_id, false)} style={{ padding: '8px 20px', fontFamily: 'Barlow Condensed', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'rgba(155,58,58,0.15)', border: '1px solid rgba(155,58,58,0.4)', color: '#EB5757', borderRadius: 2, cursor: 'pointer', fontWeight: 600 }}>
                      ✕ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          payouts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 2 }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, color: 'var(--text-sub)' }}>No payouts yet.</div>
            </div>
          ) : (
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 2, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
                    {['Decorator', 'Period', 'Amount', 'Status'].map(h => (
                      <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p, i) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                      <td style={{ padding: '14px 20px', fontFamily: 'Barlow', fontSize: 13, color: 'var(--text-sub)' }}>{p.decorator_id}</td>
                      <td style={{ padding: '14px 20px', fontFamily: 'Barlow Condensed', fontSize: 12, color: 'var(--text-muted)' }}>{p.period_start} → {p.period_end}</td>
                      <td style={{ padding: '14px 20px', fontFamily: 'Barlow Condensed', fontSize: 16, fontWeight: 700, color: 'var(--gold)' }}>{p.amount.toLocaleString()} DHS</td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: statusColor(p.status), border: `1px solid ${statusColor(p.status)}`, padding: '3px 10px', borderRadius: 1, opacity: 0.85 }}>{p.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}
