import { getSupabase } from '@/lib/supabase';
import { validateAuth } from '@/lib/auth/validate';
import {
  sendBookingRequestEmail,
  sendBookingConfirmedEmail,
  sendBookingCancelledEmail,
} from '@/lib/email';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const id = searchParams.get('id');

    if (id) {
      const { data, error } = await getSupabase()
        .from('bookings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json(data);
    }

    if (userId) {
      const { data, error } = await getSupabase()
        .from('bookings')
        .select('*, items:item_id(*), decorators:decorator_id(*)')
        .or(`renter_id.eq.${userId},decorator_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'userId required' }, { status: 400 });
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
    const {
      item_id,
      renter_id,
      decorator_id,
      start_date,
      end_date,
      quantity,
      total_price,
    } = body;

    // Fetch item to check instant_book and discount fields
    const { data: itemData, error: itemError } = await getSupabase()
      .from('items')
      .select('instant_book, weekly_discount, monthly_discount, price_per_day')
      .eq('id', item_id)
      .single();

    if (itemError) return NextResponse.json({ error: itemError.message }, { status: 400 });

    // Determine booking status
    const bookingStatus = itemData?.instant_book === true ? 'confirmed' : 'payment_pending';

    // Calculate discount
    const days = Math.ceil(
      (new Date(end_date).getTime() - new Date(start_date).getTime()) / 86400000
    );
    let finalPrice = total_price;
    if (days >= 30 && (itemData?.monthly_discount ?? 0) > 0) {
      finalPrice = total_price * (1 - (itemData.monthly_discount as number) / 100);
    } else if (days >= 7 && (itemData?.weekly_discount ?? 0) > 0) {
      finalPrice = total_price * (1 - (itemData.weekly_discount as number) / 100);
    }

    const { data, error } = await getSupabase()
      .from('bookings')
      .insert([
        {
          item_id,
          renter_id,
          decorator_id,
          start_date,
          end_date,
          quantity,
          total_price: Math.round(finalPrice * 100) / 100,
          status: bookingStatus,
        },
      ])
      .select();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // Send email notifications (fire-and-forget, wrapped in try/catch)
    try {
      const supabase = getSupabase();

      // Fetch renter + decorator user records
      const [{ data: renterUser }, { data: decoratorUser }, { data: itemRecord }] = await Promise.all([
        supabase.from('users').select('email, name').eq('id', renter_id).single(),
        supabase.from('users').select('email, name').eq('id', decorator_id).single(),
        supabase.from('items').select('title').eq('id', item_id).single(),
      ]);

      const propTitle = itemRecord?.title ?? 'Unknown Prop';
      const renterName = renterUser?.name ?? 'Renter';
      const decoratorName = decoratorUser?.name ?? 'Decorator';

      // Always notify decorator of the new request
      if (decoratorUser?.email) {
        await sendBookingRequestEmail(decoratorUser.email, {
          decoratorName,
          renterName,
          propTitle,
          startDate: start_date,
          endDate: end_date,
          totalPrice: data[0].total_price,
          bookingId: data[0].id,
        });
      }

      // If instant book, also confirm to renter immediately
      if (itemData?.instant_book && renterUser?.email) {
        await sendBookingConfirmedEmail(renterUser.email, {
          renterName,
          propTitle,
          startDate: start_date,
          endDate: end_date,
          totalPrice: data[0].total_price,
          bookingId: data[0].id,
          decoratorName,
        });
      }
    } catch {
      // Email failure must never break the API response
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await validateAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status } = body;

    // Fetch full booking details before updating (we need renter/decorator IDs)
    const { data: bookingFull } = await getSupabase()
      .from('bookings')
      .select('renter_id, decorator_id, item_id, start_date, end_date, total_price')
      .eq('id', id)
      .single();

    const { data, error } = await getSupabase()
      .from('bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // Send status-change email notifications (fire-and-forget)
    if (bookingFull && (status === 'confirmed' || status === 'cancelled')) {
      try {
        const supabase = getSupabase();
        const [{ data: renterUser }, { data: decoratorUser }, { data: itemRecord }] = await Promise.all([
          supabase.from('users').select('email, name').eq('id', bookingFull.renter_id).single(),
          supabase.from('users').select('email, name').eq('id', bookingFull.decorator_id).single(),
          supabase.from('items').select('title').eq('id', bookingFull.item_id).single(),
        ]);

        const propTitle = itemRecord?.title ?? 'Unknown Prop';
        const renterName = renterUser?.name ?? 'Renter';
        const decoratorName = decoratorUser?.name ?? 'Decorator';

        if (status === 'confirmed') {
          if (renterUser?.email) {
            await sendBookingConfirmedEmail(renterUser.email, {
              renterName,
              propTitle,
              startDate: bookingFull.start_date,
              endDate: bookingFull.end_date,
              totalPrice: bookingFull.total_price,
              bookingId: id,
              decoratorName,
            });
          }
        } else if (status === 'cancelled') {
          const emailData = {
            propTitle,
            startDate: bookingFull.start_date,
            endDate: bookingFull.end_date,
            bookingId: id,
          };
          await Promise.all([
            renterUser?.email
              ? sendBookingCancelledEmail(renterUser.email, { recipientName: renterName, ...emailData })
              : Promise.resolve(),
            decoratorUser?.email
              ? sendBookingCancelledEmail(decoratorUser.email, { recipientName: decoratorName, ...emailData })
              : Promise.resolve(),
          ]);
        }
      } catch {
        // Email failure must never break the API response
      }
    }

    return NextResponse.json(data[0]);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
