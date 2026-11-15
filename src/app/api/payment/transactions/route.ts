import { NextResponse } from 'next/server';
import { getPayments } from '@/lib/payment-store';

export async function GET() {
    try {
        const transactions = getPayments();
        return NextResponse.json({ success: true, transactions });
    } catch (err: any) {
        console.error('[Get Payments Error]:', err);
        return NextResponse.json({ error: err.message || 'Failed to retrieve payments' }, { status: 500 });
    }
}
