import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database/db';
import { outageHistory } from '@/lib/database/schema';
import { eq, or, and, ilike, sql, desc, asc, SQL } from 'drizzle-orm';

const CACHE_HEADERS = {
  'Cache-Control': 's-maxage=300, stale-while-revalidate=60',
  'Vary': 'accept',
} as const;

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 50;

/** Detect if a pg error is "relation does not exist" (table missing). */
function isTableMissingError(err: unknown): boolean {
  if (err instanceof Error) {
    // Postgres error code 42P01 = undefined_table
    return err.message.includes('42P01') || err.message.toLowerCase().includes('does not exist');
  }
  return false;
}

export async function GET(request: NextRequest) {
  if (!db) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const districtId = Number(searchParams.get('district'));
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(searchParams.get('pageSize')) || DEFAULT_PAGE_SIZE));
  const search = (searchParams.get('search') || '').trim();
  const sortField = searchParams.get('sort') || 'start_time';
  const sortOrder = searchParams.get('order') === 'asc' ? 'asc' : 'desc';

  if (!districtId || districtId < 1 || districtId > 12) {
    return NextResponse.json({ error: 'Invalid district parameter' }, { status: 400 });
  }

  const conditions: SQL[] = [eq(outageHistory.districtId, districtId)];

  if (search) {
    conditions.push(
      or(
        ilike(outageHistory.feeder, `%${search}%`),
        ilike(outageHistory.reason, `%${search}%`),
      )!
    );
  }

  const whereClause = and(...conditions);

  // Sort column mapping
  const sortColumns: Record<string, SQL<any>> = {
    feeder: sql`${outageHistory.feeder}`,
    start_time: sql`${outageHistory.startTime}`,
    restoration_time: sql`${outageHistory.restorationTime}`,
    reason: sql`${outageHistory.reason}`,
    created_at: sql`${outageHistory.createdAt}`,
  };
  const sortColumn = sortColumns[sortField] ?? sql`${outageHistory.createdAt}`;
  const orderFn = sortOrder === 'asc' ? asc : desc;

  try {
    const [countResult, rows] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` })
        .from(outageHistory)
        .where(whereClause),
      db.select()
        .from(outageHistory)
        .where(whereClause)
        .orderBy(orderFn(sortColumn))
        .limit(pageSize)
        .offset((page - 1) * pageSize),
    ]);

    const total = countResult[0]?.count ?? 0;
    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json(
      { rows, total, page, pageSize, totalPages },
      { headers: CACHE_HEADERS }
    );
  } catch (error) {
    console.error('History query failed:', error);

    // If the table doesn't exist, return a clear message so the admin knows to run db:push
    if (isTableMissingError(error)) {
      return NextResponse.json(
        { error: 'History table not found. Run `npm run db:push` to create it.' },
        { status: 503 },
      );
    }

    // Return a safe error with detail in development, generic in production
    const detail = process.env.NODE_ENV === 'development'
      ? (error instanceof Error ? error.message : String(error))
      : undefined;

    return NextResponse.json(
      { error: 'Failed to query history', detail },
      { status: 500 },
    );
  }
}
