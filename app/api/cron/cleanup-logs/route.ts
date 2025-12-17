import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        await sql`TRUNCATE TABLE "public"."telegram_logs" RESTART IDENTITY;`;

        return NextResponse.json({ success: true, message: 'Logs truncated successfully' });
    } catch (error) {
        console.error('Failed to cleanup logs:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic';
