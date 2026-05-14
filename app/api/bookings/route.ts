import { getSupabase } from '@/lib/supabase';
import { validateAuth } from '@/lib/auth/validate';
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

    const { data, error } = await getSupabase()
      .from('bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data[0]);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
