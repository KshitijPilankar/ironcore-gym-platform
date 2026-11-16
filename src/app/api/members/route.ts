import { NextResponse } from 'next/server';
import { getMembersFromDb, saveMemberToDb, deleteMemberFromDb } from '@/lib/db';

export async function GET() {
    try {
        const members = await getMembersFromDb();
        return NextResponse.json({ success: true, members });
    } catch (err: any) {
        console.error('[Get Members Error]:', err);
        return NextResponse.json({ error: err.message || 'Failed to fetch members' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        if (!body.name || !body.phone) {
            return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
        }

        const saved = await saveMemberToDb(body);
        return NextResponse.json({ success: true, member: saved });
    } catch (err: any) {
        console.error('[Save Member Error]:', err);
        return NextResponse.json({ error: err.message || 'Failed to save member' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Member id is required' }, { status: 400 });
        }

        await deleteMemberFromDb(id);
        return NextResponse.json({ success: true, message: 'Member deleted' });
    } catch (err: any) {
        console.error('[Delete Member Error]:', err);
        return NextResponse.json({ error: err.message || 'Failed to delete member' }, { status: 500 });
    }
}
