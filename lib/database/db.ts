import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import * as schema from './schema';

/** Lazily-initialized database handle. Returns null if POSTGRES_URL is not set. */
function createDb() {
  if (!process.env.POSTGRES_URL) {
    return null;
  }
  return drizzle(sql, { schema });
}

export const db = createDb();

