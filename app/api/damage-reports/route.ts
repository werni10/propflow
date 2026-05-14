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
      .from('damage_reports')
      .select('*, reporter:reporter_id(name, avatar_url)')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: false });

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
    const { booking_id, description, photos, severity } = body;

    if (!booking_id || !description?.trim()) {
      return NextResponse.json({ error: 'booking_id and description required' }, { status: 400 });
    }

    // Verify user is part of booking
    const { data: booking } = await getSupabase()
      .from('bookings')
      .select('renter_id, decorator_id, status')
      .eq('id', booking_id)
      .single();

    if (!booking || (booking.renter_id !== userId && booking.decorator_id !== userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (booking.status !== 'completed') {
      return NextResponse.json({ error: 'Can only report damage on completed bookings' }, { status: 400 });
    }

    const { data, error } = await getSupabase()
      .from('damage_reports')
      .insert([{
        booking_id,
        reporter_id: userId,
        description: description.trim(),
        photos: photos || [],
        severity: severity || 'minor',
        status: 'open',
      }])
      .select('*, reporter:reporter_id(name, avatar_url)')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
