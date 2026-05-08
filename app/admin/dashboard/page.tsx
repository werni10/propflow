'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';

interface VerifItem {
  id: string;
  user_id: string;
  user_type: string;
  status: string;
  created_at: string;
  users: { name: string; email: string; role: string; avatar_url: string | null } | null;
}
interface PayoutItem {
  id: string;
  decorator_id: string;
  amount: number;
  period_start: string;
  period_end: string;
  status: string;
  decorator: { users: { name: string; email: string } | null } | null;
}
interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

type Tab = 'verification' | 'payouts' | 'users';

export default function AdminDashboard() {
  const router = useRouter();
  const [token, setToken]       = useState<string | null>(null);
  const [verifs, setVerifs]     = useState<VerifItem[]>([]);
  const [payouts, setPayouts]   = useState<PayoutItem[]>([]);
  const [users, setUsers]       = useState<UserItem[]>([]);
  const [tab, setTab]           = useState<Tab>('verification');
  const [loading, setLoading]   = useState(true);
  const [generating, setGenerating] = useState(false);
  const [genMsg, setGenMsg]     = useState('');

  useEffect(() => {
    getSupabase().auth.getSession().then(({ data }) => {
      const t = data.session?.access_token ?? null;
      setToken(t);
      if (!t) { router.push('/auth/login'); return; }
      loadAll(t);
    });
  }, []);

  async function loadAll(t: string) {
    setLoading(true);
    const headers = { 'Authorization': `Bearer ${t}` };
    try {
      const [v, p, u] = await Promise.all([
        fetch('/api/admin/verification', { headers }).then(r => r.json()),
        fetch('/api/admin/payouts', { headers }).then(r => r.json()),
        fetch('/api/admin/users', { headers }).then(r => r.json()),
      ]);
      setVerifs(Array.isArray(v) ? v : []);
      setPayouts(Array.isArray(p) ? p : []);
      setUsers(Array.isArray(u) ? u : []);
    } catch {}
    setLoading(false);
  }

  async function approve(id: string, userId: string, approved: boolean) {
    if (!token) return;
    await fetch('/api/admin/verification', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ verification_id: id, user_id: userId, approved, reviewed_by: 'admin' }),
    });
    setVerifs(v => v.filter(x => x.id !== id));
  }

  async function updatePayoutStatus(id: string, status: string) {
    if (!token) return;
    await fetch('/api/admin/payouts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ id, status }),
    });
    setPayouts(p => p.map(x => x.id === id ? { ...x, status } : x));
  }

  async function generatePayouts() {
    if (!token) return;
    setGenerating(true); setGenMsg('');
    const res = await fetch('/api/admin/payouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ generate_batch: true }),
    });
    const data = await res.json();
    if (res.ok) {
      setGenMsg(data.created > 0 ? `Created ${data.created} payouts.` : data.message || 'Done.');
      if (token) loadAll(token);
    } else {
      setGenMsg(data.error || 'Failed.');
    }
    setGenerating(false);
  }

  async function banUser(userId: string) {
    if (!token || !confirm('Ban this user?')) return;
    await getSupabase().from('users').update({ status: 'banned' }).eq('id', userId);
    setUsers(u => u.map(x => x.id === userId ? { ...x, status: 'banned' } : x));
  }

  const statusColor = (s: string) =>
    s === 'completed' ? '#4CAF50' : s === 'processing' ? 'var(--gold)' : s === 'pending' ? 'var(--text-sub)' : '#EB5757';

  const TABS: { key: Tab; label: string; count: number }[] = [
    { key: 'verification', label: 'Verification Queue', count: verifs.length },
    { key: 'payouts', label: 'Payouts', count: payouts.filter(p => p.status === 'pending').length },
    { key: 'users', label: 'Users', count: users.length },
  ];

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
        <p style={{ fontFamily: 'Barlow', fontSize: 14, color: 'var(--text-sub)', marginBottom: 40 }}>Manage verifications, payouts, and users.</p>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 48 }}>
          {[
            ['Pending Verifications', verifs.length, verifs.length > 0 ? 'var(--gold)' : 'var(--text-sub)'],
            ['Pending Payouts', payouts.filter(p => p.status === 'pending').length, 'var(--text-sub)'],
            ['Total DHS in Payouts', `${payouts.reduce((s, p) => s + p.amount, 0).toLocaleString()}`, 'var(--gold)'],
            ['Total Users', users.length, 'var(--text-sub)'],
          ].map(([l, v, c]) => (
            <div key={String(l)} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 2, padding: '20px 24px' }}>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>{l}</div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700, color: String(c) }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 32 }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: '12px 24px', fontFamily: 'Barlow Condensed', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', color: tab === t.key ? 'var(--gold)' : 'var(--text-muted)', borderBottom: tab === t.key ? '2px solid var(--gold)' : '2px solid transparent', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: 8 }}>
              {t.label}
              {t.count > 0 && (
                <span style={{ background: tab === t.key ? 'var(--gold)' : 'var(--bg-elevated)', color: tab === t.key ? 'var(--bg-void)' : 'var(--text-muted)', fontFamily: 'Barlow Condensed', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10 }}>
                  {t.count}
                </span>
              )}
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
                      <span className="tag">{v.users?.role || v.user_type}</span>
                      <span style={{ fontFamily: 'Barlow', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{v.users?.name || 'Unknown'}</span>
                      <span style={{ fontFamily: 'Barlow', fontSize: 12, color: 'var(--text-muted)' }}>{v.users?.email}</span>
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
        ) : tab === 'payouts' ? (
          <div>
            {/* Generate payouts action */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 2, padding: '20px 24px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'Barlow Condensed', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text)', fontWeight: 600, marginBottom: 4 }}>Generate Monthly Payouts</div>
                <div style={{ fontFamily: 'Barlow', fontSize: 13, color: 'var(--text-muted)' }}>Auto-calculate 97% cut from completed bookings this month.</div>
                {genMsg && <div style={{ fontFamily: 'Barlow', fontSize: 13, color: 'var(--gold)', marginTop: 6 }}>{genMsg}</div>}
              </div>
              <button onClick={generatePayouts} disabled={generating} className="btn-gold" style={{ padding: '10px 24px', fontSize: 12, borderRadius: 2, border: 'none', cursor: generating ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
                {generating ? 'Generating...' : 'Generate Payouts'}
              </button>
            </div>

            {payouts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 2 }}>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, color: 'var(--text-sub)' }}>No payouts yet.</div>
              </div>
            ) : (
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
                      {['Decorator', 'Period', 'Amount', 'Status', 'Action'].map(h => (
                        <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map((p, i) => (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ fontFamily: 'Barlow', fontSize: 13, color: 'var(--text)', fontWeight: 600 }}>{p.decorator?.users?.name || '—'}</div>
                          <div style={{ fontFamily: 'Barlow', fontSize: 11, color: 'var(--text-muted)' }}>{p.decorator?.users?.email || p.decorator_id}</div>
                        </td>
                        <td style={{ padding: '14px 20px', fontFamily: 'Barlow Condensed', fontSize: 12, color: 'var(--text-muted)' }}>{p.period_start} → {p.period_end}</td>
                        <td style={{ padding: '14px 20px', fontFamily: 'Barlow Condensed', fontSize: 16, fontWeight: 700, color: 'var(--gold)' }}>{p.amount.toLocaleString()} DHS</td>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{ fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: statusColor(p.status), border: `1px solid ${statusColor(p.status)}`, padding: '3px 10px', borderRadius: 1 }}>{p.status}</span>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          {p.status === 'pending' && (
                            <button onClick={() => updatePayoutStatus(p.id, 'completed')} style={{ padding: '5px 14px', fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'rgba(45,97,74,0.2)', border: '1px solid rgba(45,97,74,0.5)', color: '#6FCF97', borderRadius: 2, cursor: 'pointer' }}>
                              Mark Paid
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          /* Users tab */
          users.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 2 }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, color: 'var(--text-sub)' }}>No users yet.</div>
            </div>
          ) : (
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 2, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
                    {['Name', 'Email', 'Role', 'Status', 'Joined', 'Action'].map(h => (
                      <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                      <td style={{ padding: '12px 20px', fontFamily: 'Barlow', fontSize: 13, color: 'var(--text)', fontWeight: 600 }}>{u.name}</td>
                      <td style={{ padding: '12px 20px', fontFamily: 'Barlow', fontSize: 12, color: 'var(--text-muted)' }}>{u.email}</td>
                      <td style={{ padding: '12px 20px' }}><span className="tag">{u.role}</span></td>
                      <td style={{ padding: '12px 20px' }}>
                        <span style={{ fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: u.status === 'verified' ? '#6FCF97' : u.status === 'banned' ? '#EB5757' : 'var(--text-muted)', border: `1px solid ${u.status === 'verified' ? 'rgba(45,97,74,0.5)' : u.status === 'banned' ? 'rgba(155,58,58,0.4)' : 'var(--border)'}`, padding: '3px 10px', borderRadius: 1 }}>
                          {u.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 20px', fontFamily: 'Barlow Condensed', fontSize: 11, color: 'var(--text-muted)' }}>
                        {new Date(u.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '12px 20px' }}>
                        {u.status !== 'banned' && (
                          <button onClick={() => banUser(u.id)} style={{ padding: '5px 12px', fontFamily: 'Barlow Condensed', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'rgba(155,58,58,0.15)', border: '1px solid rgba(155,58,58,0.4)', color: '#EB5757', borderRadius: 2, cursor: 'pointer' }}>
                            Ban
                          </button>
                        )}
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
