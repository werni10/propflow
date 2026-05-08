import { getSupabase } from '@/lib/supabase';
import { validateAuth } from '@/lib/auth/validate';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const userId = await validateAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // optional filter

    let query = getSupabase()
      .from('payouts')
      .select('*, decorator:decorator_id(id, users:id(name, email))')
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await validateAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { generate_batch, decorator_id, amount, period_start, period_end } = body;

    // Batch mode: auto-calculate payouts from completed bookings this month
    if (generate_batch) {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

      // Get all completed bookings in period
      const { data: bookings, error: bookingsError } = await getSupabase()
        .from('bookings')
        .select('decorator_id, total_price')
        .eq('status', 'completed')
        .gte('updated_at', start)
        .lte('updated_at', end);

      if (bookingsError) return NextResponse.json({ error: bookingsError.message }, { status: 400 });

      // Group by decorator, apply 97% cut (3% commission)
      const byDecorator: Record<string, number> = {};
      for (const b of (bookings || [])) {
        if (!byDecorator[b.decorator_id]) byDecorator[b.decorator_id] = 0;
        byDecorator[b.decorator_id] += b.total_price * 0.97;
      }

      const inserts = Object.entries(byDecorator).map(([did, amt]) => ({
        decorator_id: did,
        amount: Math.round(amt * 100) / 100,
        period_start: start,
        period_end: end,
        status: 'pending',
      }));

      if (inserts.length === 0) {
        return NextResponse.json({ message: 'No completed bookings this month', created: 0 });
      }

      const { data, error } = await getSupabase().from('payouts').insert(inserts).select();
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ created: data.length, payouts: data }, { status: 201 });
    }

    // Single payout
    const { data, error } = await getSupabase()
      .from('payouts')
      .insert([{ decorator_id, amount, period_start, period_end, status: 'pending' }])
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// Update payout status (mark as processing/completed)
export async function PUT(request: NextRequest) {
  try {
    const userId = await validateAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status } = body;

    const { data, error } = await getSupabase()
      .from('payouts')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
