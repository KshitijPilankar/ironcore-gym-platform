import { NextResponse } from 'next/server';
import { getPaymentsFromDb } from '@/lib/db';

export async function GET() {
    try {
        const transactions = await getPaymentsFromDb();
        return NextResponse.json({ success: true, transactions });
    } catch (err: any) {
        console.error('[Get Transactions Error]:', err);
        return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
    }
}
