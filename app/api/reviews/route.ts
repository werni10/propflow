import { getSupabase } from '@/lib/supabase';
import { validateAuth } from '@/lib/auth/validate';
import { sendReviewReceivedEmail } from '@/lib/email';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const decoratorId = searchParams.get('decoratorId');
    const reviewedId = searchParams.get('reviewedId');
    const bookingId = searchParams.get('bookingId');

    let query = getSupabase()
      .from('reviews')
      .select('*, reviewer:reviewer_id(name, avatar_url)')
      .order('created_at', { ascending: false });

    if (decoratorId) query = query.eq('reviewed_id', decoratorId);
    if (reviewedId) query = query.eq('reviewed_id', reviewedId);
    if (bookingId) query = query.eq('booking_id', bookingId);

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
    const { booking_id, reviewed_id, rating, comment } = body;

    if (!booking_id || !reviewed_id || !rating) {
      return NextResponse.json({ error: 'booking_id, reviewed_id, and rating required' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be 1–5' }, { status: 400 });
    }

    // Check booking exists and reviewer is part of it
    const { data: booking, error: bookingError } = await getSupabase()
      .from('bookings')
      .select('id, renter_id, decorator_id, status')
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.renter_id !== userId && booking.decorator_id !== userId) {
      return NextResponse.json({ error: 'Not part of this booking' }, { status: 403 });
    }

    if (booking.status !== 'completed') {
      return NextResponse.json({ error: 'Can only review completed bookings' }, { status: 400 });
    }

    // Check not already reviewed
    const { data: existing } = await getSupabase()
      .from('reviews')
      .select('id')
      .eq('booking_id', booking_id)
      .eq('reviewer_id', userId)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Already reviewed this booking' }, { status: 400 });
    }

    const { data, error } = await getSupabase()
      .from('reviews')
      .insert([{ booking_id, reviewer_id: userId, reviewed_id, rating, comment }])
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // Update decorator average_rating
    const { data: allReviews } = await getSupabase()
      .from('reviews')
      .select('rating')
      .eq('reviewed_id', reviewed_id);

    if (allReviews && allReviews.length > 0) {
      const avg = allReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / allReviews.length;
      await getSupabase()
        .from('decorators')
        .update({ average_rating: Math.round(avg * 10) / 10 })
        .eq('id', reviewed_id);
    }

    // Send review notification email (fire-and-forget)
    try {
      const supabase = getSupabase();
      const [{ data: reviewer }, { data: reviewedUser }, { data: bookingWithItem }] = await Promise.all([
        supabase.from('users').select('name').eq('id', userId).single(),
        supabase.from('users').select('email, name').eq('id', reviewed_id).single(),
        supabase.from('bookings').select('item_id').eq('id', booking_id).single(),
      ]);

      let propTitle = 'Unknown Prop';
      if (bookingWithItem?.item_id) {
        const { data: itemRecord } = await supabase
          .from('items')
          .select('title')
          .eq('id', bookingWithItem.item_id)
          .single();
        if (itemRecord?.title) propTitle = itemRecord.title;
      }

      if (reviewedUser?.email) {
        await sendReviewReceivedEmail(reviewedUser.email, {
          recipientName: reviewedUser.name ?? 'there',
          reviewerName: reviewer?.name ?? 'Someone',
          rating,
          comment: comment ?? '',
          propTitle,
        });
      }
    } catch {
      // Email failure must never break the API response
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
