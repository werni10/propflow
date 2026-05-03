import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, getSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { booking_id, amount, user_id, user_email } = body;

    // Create payment record
    const { data: paymentData, error: paymentError } = await supabase
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
