import { NextResponse } from 'next/server';
import { addPayment, PaymentTransaction } from '@/lib/payment-store';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { paymentId, orderId, amount, planName, memberPhone, memberName, date, time, status } = body;

        if (!paymentId) {
            return NextResponse.json({ error: 'paymentId is required' }, { status: 400 });
        }

        const tx: PaymentTransaction = {
            id: `pay_${Date.now()}`,
            paymentId,
            orderId: orderId || '',
            amount: Number(amount) || 0,
            planName: planName || 'Gym Membership',
            memberPhone: memberPhone || '',
            memberName: memberName || '',
            date: date || new Date().toISOString().split('T')[0],
            time: time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: status === 'Captured' ? 'Captured' : 'Captured',
        };

        addPayment(tx);

        return NextResponse.json({ success: true, transaction: tx });
    } catch (err: any) {
        console.error('[Record Payment Error]:', err);
        return NextResponse.json({ error: err.message || 'Failed to record payment' }, { status: 500 });
    }
}
