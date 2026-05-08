import { getSupabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { payment_id, status, transaction_ref } = body;

    // Verify webhook signature (TODO: implement with YouCanPay)

    // Update payment status
    const { data: paymentData, error: paymentError } = await getSupabase()
      .from('payments')
      .update({
        status: status === 'success' ? 'completed' : 'failed',
        transaction_ref,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment_id)
      .select()
      .single();

    if (paymentError) {
      return NextResponse.json({ error: paymentError.message }, { status: 400 });
    }

    // Update booking status if payment successful
    if (status === 'success') {
      const { data: payment } = await getSupabase()
        .from('payments')
        .select('booking_id')
        .eq('id', payment_id)
        .single();

      if (payment && payment.booking_id) {
        await getSupabase()
          .from('bookings')
          .update({ status: 'confirmed', updated_at: new Date().toISOString() })
          .eq('id', payment.booking_id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
