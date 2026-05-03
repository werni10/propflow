'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface VerificationRequest {
  id: string;
  user_id: string;
  user_type: string;
  status: string;
  created_at: string;
}

interface Payout {
  id: string;
  decorator_id: string;
  amount: number;
  period_start: string;
  period_end: string;
  status: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'verification' | 'payouts'>('verification');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [verRes, payRes] = await Promise.all([
        fetch('/api/admin/verification'),
        fetch('/api/admin/payouts'),
      ]);

      const verData = await verRes.json();
      const payData = await payRes.json();

      setVerifications(Array.isArray(verData) ? verData : []);
      setPayouts(Array.isArray(payData) ? payData : []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(verificationId: string, userId: string) {
    try {
      const res = await fetch('/api/admin/verification', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verification_id: verificationId,
          user_id: userId,
          approved: true,
          reviewed_by: 'admin-user-id', // TODO: Get actual admin user ID
        }),
      });

      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Failed to approve:', err);
    }
  }

  async function handleReject(verificationId: string, userId: string) {
    try {
      const res = await fetch('/api/admin/verification', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verification_id: verificationId,
          user_id: userId,
          approved: false,
          reviewed_by: 'admin-user-id',
        }),
      });

      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Failed to reject:', err);
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-orange-600">
            PropFlow
          </Link>
          <span className="text-sm text-gray-600">Admin Dashboard</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Admin Controls</h1>

        <div className="flex gap-4 mb-8 border-b">
          <button
            onClick={() => setActiveTab('verification')}
            className={`px-4 py-2 font-semibold ${
              activeTab === 'verification'
                ? 'text-orange-600 border-b-2 border-orange-600'
                : 'text-gray-600'
            }`}
          >
            Verification Queue ({verifications.length})
          </button>
          <button
            onClick={() => setActiveTab('payouts')}
            className={`px-4 py-2 font-semibold ${
              activeTab === 'payouts'
                ? 'text-orange-600 border-b-2 border-orange-600'
                : 'text-gray-600'
            }`}
          >
            Monthly Payouts ({payouts.length})
          </button>
        </div>

        {activeTab === 'verification' && (
          <div className="space-y-4">
            {verifications.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-600">
                No pending verifications
              </div>
            ) : (
              verifications.map((ver) => (
                <div key={ver.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-gray-600">User ID</p>
                      <p className="font-semibold">{ver.user_id}</p>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">
                      {ver.user_type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">Requested: {new Date(ver.created_at).toLocaleDateString()}</p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleApprove(ver.id, ver.user_id)}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(ver.id, ver.user_id)}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'payouts' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {payouts.length === 0 ? (
              <div className="p-8 text-center text-gray-600">No payouts generated yet</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Decorator ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Period</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((payout) => (
                    <tr key={payout.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm">{payout.decorator_id}</td>
                      <td className="px-6 py-4 text-sm font-semibold">{payout.amount} DHS</td>
                      <td className="px-6 py-4 text-sm">
                        {payout.period_start} to {payout.period_end}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded text-sm ${
                            payout.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : payout.status === 'processing'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {payout.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
