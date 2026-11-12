import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const rawBody = await req.text();
        const signature = req.headers.get('x-razorpay-signature');

        if (!signature) {
            return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
        }

        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        if (!webhookSecret) {
            console.error('[Webhook Error]: RAZORPAY_WEBHOOK_SECRET is not configured');
            return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
        }

        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(rawBody)
            .digest('hex');

        const sigBuf = Buffer.from(signature);
        const expBuf = Buffer.from(expectedSignature);

        if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
            return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
        }

        const event = JSON.parse(rawBody);

        if (event.event === 'payment.captured' || event.event === 'order.paid') {
            const paymentEntity = event.payload.payment.entity;
            const orderId = paymentEntity.order_id;
            const paymentId = paymentEntity.id;
            const amount = paymentEntity.amount / 100;
            const notes = paymentEntity.notes || {};
            const memberId = notes.memberId;

            console.log(`[Payment Success] Member: ${memberId}, Amount: ₹${amount}, Payment ID: ${paymentId}`);

            // Yahan par status update logic execute hota hai
        }

        return NextResponse.json({ status: 'ok' });
    } catch (error) {
        console.error('[Webhook Error]:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}