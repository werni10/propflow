import { getSupabase } from '@/lib/supabase';
import { validateAuth } from '@/lib/auth/validate';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/availability?itemId=xxx — returns blocked date ranges
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json({ error: 'itemId required' }, { status: 400 });
    }

    // Get confirmed bookings for this item
    const { data: bookings } = await getSupabase()
      .from('bookings')
      .select('start_date, end_date')
      .eq('item_id', itemId)
      .in('status', ['confirmed', 'completed']);

    // Get manual availability blocks
    const { data: blocks } = await getSupabase()
      .from('availability_blocks')
      .select('start_date, end_date, reason')
      .eq('item_id', itemId);

    const bookedRanges = (bookings || []).map((b: any) => ({
      start: b.start_date,
      end: b.end_date,
      reason: 'booking',
    }));

    const blockRanges = (blocks || []).map((b: any) => ({
      start: b.start_date,
      end: b.end_date,
      reason: b.reason,
    }));

    return NextResponse.json({ blocked: [...bookedRanges, ...blockRanges] });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// POST /api/availability — add manual block
export async function POST(request: NextRequest) {
  try {
    const userId = await validateAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { item_id, start_date, end_date, reason = 'manual' } = body;

    if (!item_id || !start_date || !end_date) {
      return NextResponse.json({ error: 'item_id, start_date, end_date required' }, { status: 400 });
    }

    // Verify item belongs to this user
    const { data: item } = await getSupabase()
      .from('items')
      .select('decorator_id')
      .eq('id', item_id)
      .single();

    if (!item || item.decorator_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await getSupabase()
      .from('availability_blocks')
      .insert([{ item_id, start_date, end_date, reason }])
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
