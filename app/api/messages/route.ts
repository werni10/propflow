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
    const bookingId = searchParams.get('bookingId');
    if (!bookingId) return NextResponse.json({ error: 'bookingId required' }, { status: 400 });

    // Verify user is part of this booking
    const { data: booking } = await getSupabase()
      .from('bookings')
      .select('renter_id, decorator_id')
      .eq('id', bookingId)
      .single();

    if (!booking || (booking.renter_id !== userId && booking.decorator_id !== userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await getSupabase()
      .from('messages')
      .select('*, sender:sender_id(name, avatar_url)')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // Mark unread messages as read
    await getSupabase()
      .from('messages')
      .update({ read: true })
      .eq('booking_id', bookingId)
      .neq('sender_id', userId);

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
    const { booking_id, body: messageBody } = body;

    if (!booking_id || !messageBody?.trim()) {
      return NextResponse.json({ error: 'booking_id and body required' }, { status: 400 });
    }

    // Verify user is part of booking
    const { data: booking } = await getSupabase()
      .from('bookings')
      .select('renter_id, decorator_id')
      .eq('id', booking_id)
      .single();

    if (!booking || (booking.renter_id !== userId && booking.decorator_id !== userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await getSupabase()
      .from('messages')
      .insert([{ booking_id, sender_id: userId, body: messageBody.trim() }])
      .select('*, sender:sender_id(name, avatar_url)')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
