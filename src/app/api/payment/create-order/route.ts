import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

function getRazorpayClient() {
    const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
        throw new Error('Razorpay credentials are not configured on server');
    }

    return new Razorpay({ key_id, key_secret });
}

export async function POST(req: Request) {
    try {
        const { amount, memberId, planName } = await req.json();

        // String me se comma (,) ya symbols hatakar clean number nikalna
        const parsedAmount = typeof amount === 'string'
            ? parseFloat(amount.replace(/,/g, '').trim())
            : Number(amount);

        if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
            return NextResponse.json({ error: 'Invalid payment amount' }, { status: 400 });
        }

        const razorpay = getRazorpayClient();

        const options = {
            amount: Math.round(parsedAmount * 100), // paise me convert (e.g. ₹1499 -> 149900 paise)
            currency: 'INR',
            receipt: `rcpt_${Date.now()}`,
            notes: {
                memberId: memberId || 'guest_member',
                planName: planName || 'Gym Membership',
            },
        };

        const order = await razorpay.orders.create(options);
        return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency });
    } catch (err: any) {
        console.error('[Create Order Error]:', err);
        return NextResponse.json({ error: err.error?.description || err.message || 'Order creation failed' }, { status: 500 });
    }
}