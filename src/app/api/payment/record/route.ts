import { NextResponse } from 'next/server';
import { savePaymentToDb, saveMemberToDb } from '@/lib/db';
import { PaymentTransaction } from '@/lib/payment-store';
import { sendWelcomeWhatsAppMessage } from '@/lib/whatsapp';

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
            status: status || 'Captured',
        };

        await savePaymentToDb(tx);

        // If member details are present, sync member status to Paid for 30 days & dispatch welcome message
        if (memberPhone && memberName) {
            const next30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            await saveMemberToDb({
                id: `mem_${memberPhone.replace(/[^0-9]/g, '')}`,
                name: memberName,
                phone: memberPhone,
                plan: planName || 'Smart Athlete Pass',
                dueDate: next30Days,
                streakDays: 1,
                status: 'Paid',
            });

            // Trigger WhatsApp confirmation in background
            sendWelcomeWhatsAppMessage({
                phone: memberPhone,
                name: memberName,
                plan: planName || 'Smart Athlete Pass',
                amount: Number(amount) || 0,
                dueDate: next30Days,
            }).catch(() => {});
        }

        return NextResponse.json({ success: true, transaction: tx });
    } catch (err: any) {
        console.error('[Record Payment Error]:', err);
        return NextResponse.json({ error: err.message || 'Failed to record payment' }, { status: 500 });
    }
}
