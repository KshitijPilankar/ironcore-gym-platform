import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { savePaymentToDb, saveMemberToDb } from '@/lib/db';
import { sendWelcomeWhatsAppMessage } from '@/lib/whatsapp';

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
            const planName = notes.planName || (amount >= 1900 ? 'Smart Athlete Pass' : 'Standard Gym Plan');
            const contact = notes.memberPhone || paymentEntity.contact || '';
            const memberName = notes.memberName || (memberId && memberId !== 'guest_member' && memberId !== 'member_direct' ? memberId : '') || paymentEntity.email || 'Athlete Member';

            console.log(`[Payment Captured Webhook] ID: ${paymentId}, Amount: ₹${amount}, Member: ${memberName} (${contact})`);

            const now = new Date();
            const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            await savePaymentToDb({
                id: `pay_${Date.now()}`,
                paymentId,
                orderId: orderId || '',
                amount,
                planName,
                memberPhone: contact,
                memberName,
                date: now.toISOString().split('T')[0],
                time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: 'Captured',
            });

            if (contact) {
                await saveMemberToDb({
                    id: `mem_${contact.replace(/[^0-9]/g, '')}`,
                    name: memberName,
                    phone: contact,
                    plan: planName,
                    dueDate,
                    streakDays: 1,
                    status: 'Paid',
                });

                // Automated WhatsApp Welcome message
                sendWelcomeWhatsAppMessage({
                    phone: contact,
                    name: memberName,
                    plan: planName,
                    amount,
                    dueDate,
                }).catch(() => {});
            }
        }

        return NextResponse.json({ status: 'ok' });
    } catch (error: any) {
        console.error('[Webhook Error]:', error);
        return NextResponse.json({ error: error.message || 'Webhook processing failed' }, { status: 500 });
    }
}
