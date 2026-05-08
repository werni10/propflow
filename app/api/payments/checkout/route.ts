import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { validateAuth } from '@/lib/auth/validate';

export async function POST(request: NextRequest) {
  try {
    const userId = await validateAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { booking_id, amount, user_id, user_email } = body;

    // Create payment record
    const { data: paymentData, error: paymentError } = await getSupabase()
      .from('payments')
      .insert([
        {
          booking_id,
          amount,
          platform: 'YouCanPay',
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (paymentError) {
      return NextResponse.json({ error: paymentError.message }, { status: 400 });
    }

    // TODO: Integrate YouCanPay API
    // For now, return mock checkout data
    const checkoutUrl = `https://youcanpay.com/pay?amount=${amount}&reference=${paymentData.id}`;

    return NextResponse.json({
      payment_id: paymentData.id,
      checkout_url: checkoutUrl,
      amount,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
