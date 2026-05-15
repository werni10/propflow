import { getSupabase } from '@/lib/supabase';
import { validateAuth } from '@/lib/auth/validate';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const userId = await validateAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sb = getSupabase();

    // ── parallel fetches ────────────────────────────────────────────────────
    const [
      { data: bookings, error: bErr },
      { data: users, error: uErr },
      { data: items, error: iErr },
      { data: decorators, error: dErr },
    ] = await Promise.all([
      sb.from('bookings').select('id, status, total_price, item_id, created_at'),
      sb.from('users').select('id, role'),
      sb.from('items').select('id'),
      sb.from('decorators').select('id, average_rating, total_listings'),
    ]);

    if (bErr) return NextResponse.json({ error: bErr.message }, { status: 400 });
    if (uErr) return NextResponse.json({ error: uErr.message }, { status: 400 });
    if (iErr) return NextResponse.json({ error: iErr.message }, { status: 400 });
    if (dErr) return NextResponse.json({ error: dErr.message }, { status: 400 });

    const allBookings   = bookings   ?? [];
    const allUsers      = users      ?? [];
    const allItems      = items      ?? [];
    const allDecorators = decorators ?? [];

    // ── booking stats ───────────────────────────────────────────────────────
    const totalBookings     = allBookings.length;
    const confirmedBookings = allBookings.filter(b => b.status === 'confirmed').length;
    const completedBookings = allBookings.filter(b => b.status === 'completed').length;
    const totalGMV          = allBookings
      .filter(b => b.status === 'completed')
      .reduce((s, b) => s + (b.total_price ?? 0), 0);
    const totalRevenue = totalGMV * 0.03;

    // ── user stats ──────────────────────────────────────────────────────────
    const totalUsers      = allUsers.length;
    const totalDecorators = allUsers.filter(u => u.role === 'decorator').length;
    const totalFilmmakers = allUsers.filter(u => u.role === 'renter').length;

    // ── item stats ──────────────────────────────────────────────────────────
    const totalItems = allItems.length;

    // ── avg rating ──────────────────────────────────────────────────────────
    const ratings = allDecorators
      .map(d => d.average_rating ?? 0)
      .filter(r => r > 0);
    const avgRating = ratings.length
      ? Math.round((ratings.reduce((s, r) => s + r, 0) / ratings.length) * 10) / 10
      : 0;

    // ── bookings by month (last 6) ──────────────────────────────────────────
    const now = new Date();
    const months: { month: string; count: number; gmv: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
      const y = d.getFullYear();
      const m = d.getMonth(); // 0-indexed
      const inMonth = allBookings.filter(b => {
        const bd = new Date(b.created_at);
        return bd.getFullYear() === y && bd.getMonth() === m;
      });
      const gmv = inMonth
        .filter(b => b.status === 'completed')
        .reduce((s, b) => s + (b.total_price ?? 0), 0);
      months.push({ month: label, count: inMonth.length, gmv });
    }

    // ── top items (by booking count) ────────────────────────────────────────
    const itemBookingMap: Record<string, { booking_count: number; total_revenue: number }> = {};
    for (const b of allBookings) {
      if (!b.item_id) continue;
      if (!itemBookingMap[b.item_id]) {
        itemBookingMap[b.item_id] = { booking_count: 0, total_revenue: 0 };
      }
      itemBookingMap[b.item_id].booking_count += 1;
      if (b.status === 'completed') {
        itemBookingMap[b.item_id].total_revenue += b.total_price ?? 0;
      }
    }

    const topItemIds = Object.entries(itemBookingMap)
      .sort((a, b) => b[1].booking_count - a[1].booking_count)
      .slice(0, 5)
      .map(([id]) => id);

    let topItems: { id: string; title: string; booking_count: number; total_revenue: number }[] = [];
    if (topItemIds.length > 0) {
      const { data: itemRows } = await sb
        .from('items')
        .select('id, title')
        .in('id', topItemIds);
      if (itemRows) {
        topItems = itemRows.map(r => ({
          id: r.id,
          title: r.title,
          ...itemBookingMap[r.id],
        })).sort((a, b) => b.booking_count - a.booking_count);
      }
    }

    // ── top decorators (by rating) ──────────────────────────────────────────
    const topDecRaw = allDecorators
      .sort((a, b) => (b.average_rating ?? 0) - (a.average_rating ?? 0))
      .slice(0, 5);

    const topDecIds = topDecRaw.map(d => d.id);
    const { data: decUsers } = topDecIds.length > 0
      ? await sb.from('users').select('id, name').in('id', topDecIds)
      : { data: [] };

    const nameMap: Record<string, string> = {};
    for (const u of decUsers ?? []) nameMap[u.id] = u.name ?? 'Unknown';

    const topDecorators = topDecRaw.map(d => ({
      id: d.id,
      name: nameMap[d.id] ?? 'Unknown',
      total_listings: d.total_listings ?? 0,
      average_rating: d.average_rating ?? 0,
    }));

    return NextResponse.json({
      totalBookings,
      confirmedBookings,
      completedBookings,
      totalGMV,
      totalRevenue,
      totalUsers,
      totalDecorators,
      totalFilmmakers,
      totalItems,
      avgRating,
      bookingsByMonth: months,
      topItems,
      topDecorators,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
