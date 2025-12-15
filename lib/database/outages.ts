// Outage snapshot tracking for change detection

import { sql } from '@vercel/postgres';
import { createHash } from 'crypto';

export interface OutageSnapshot {
  id: number;
  district_id: number;
  outage_hash: string;
  area: string;
  feeder: string;
  start_time: Date;
  restoration_time: Date;
  reason: string;
  first_seen: Date;
  last_seen: Date;
  is_resolved: boolean;
}

export interface DHBVNData {
  area: string;
  feeder: string;
  start_time: string;
  restoration_time: string;
  reason: string;
}

export interface OutageChanges {
  new: DHBVNData[];
  resolved: OutageSnapshot[];
  ongoing: OutageSnapshot[];
}

// Generate unique hash for an outage
export function generateOutageHash(outage: DHBVNData): string {
  const hashString = `${outage.area}|${outage.feeder}|${outage.start_time}`;
  return createHash('md5').update(hashString).digest('hex');
}

// Parse DHBVN date string to ISO format
function parseDHBVNDate(dateStr: string): Date {
  // Format: "16-Apr-2025 10:24:00"
  try {
    const [datePart, timePart] = dateStr.split(' ');
    const [day, month, year] = datePart.split('-');
    const monthMap: { [key: string]: string } = {
      Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
      Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
    };
    const isoDate = `${year}-${monthMap[month]}-${day.padStart(2, '0')}T${timePart}`;
    return new Date(isoDate);
  } catch (error) {
    console.error('Error parsing date:', dateStr, error);
    return new Date();
  }
}

// Get all active outages for a district
export async function getActiveOutages(districtId: number): Promise<OutageSnapshot[]> {
  const result = await sql`
    SELECT * FROM outage_snapshots
    WHERE district_id = ${districtId} AND is_resolved = false
    ORDER BY start_time DESC
  `;

  return result.rows as OutageSnapshot[];
}

// Save new outage to database
async function saveOutage(districtId: number, outage: DHBVNData): Promise<void> {
  const hash = generateOutageHash(outage);
  const startTime = parseDHBVNDate(outage.start_time);
  const restorationTime = parseDHBVNDate(outage.restoration_time);

  await sql`
    INSERT INTO outage_snapshots (
      district_id, outage_hash, area, feeder,
      start_time, restoration_time, reason
    )
    VALUES (
      ${districtId}, ${hash}, ${outage.area}, ${outage.feeder},
      ${startTime.toISOString()}, ${restorationTime.toISOString()}, ${outage.reason}
    )
    ON CONFLICT (district_id, outage_hash)
    DO UPDATE SET
      last_seen = NOW()
  `;
}

// Mark outages as resolved
async function markResolved(hashes: string[]): Promise<OutageSnapshot[]> {
  if (hashes.length === 0) return [];

  // Use parameterized query for array parameter
  const result = await sql.query(
    `UPDATE outage_snapshots
     SET is_resolved = true, last_seen = NOW()
     WHERE outage_hash = ANY($1) AND is_resolved = false
     RETURNING *`,
    [hashes]
  );

  return result.rows as OutageSnapshot[];
}

// Detect changes in outages
export async function detectOutageChanges(
  districtId: number,
  currentOutages: DHBVNData[]
): Promise<OutageChanges> {
  // Get existing active outages from database
  const existingOutages = await getActiveOutages(districtId);

  // Create hash sets for comparison
  const currentHashes = new Set(currentOutages.map(generateOutageHash));
  const existingHashes = new Set(existingOutages.map(o => o.outage_hash));

  // Find new outages (in current but not in existing)
  const newOutages = currentOutages.filter(
    outage => !existingHashes.has(generateOutageHash(outage))
  );

  // Find resolved outages (in existing but not in current)
  const resolvedHashes = Array.from(existingHashes).filter(
    hash => !currentHashes.has(hash)
  );
  const resolvedOutages = await markResolved(resolvedHashes);

  // Find ongoing outages (in both)
  const ongoingOutages = existingOutages.filter(
    outage => currentHashes.has(outage.outage_hash)
  );

  // Save new outages to database
  for (const outage of newOutages) {
    await saveOutage(districtId, outage);
  }

  // Update last_seen for ongoing outages
  for (const outage of ongoingOutages) {
    await sql`
      UPDATE outage_snapshots
      SET last_seen = NOW()
      WHERE outage_hash = ${outage.outage_hash}
    `;
  }

  return {
    new: newOutages,
    resolved: resolvedOutages,
    ongoing: ongoingOutages,
  };
}

// Clean up old resolved outages (optional maintenance task)
export async function cleanupOldOutages(daysOld: number = 30): Promise<number> {
  const result = await sql`
    DELETE FROM outage_snapshots
    WHERE is_resolved = true
    AND last_seen < NOW() - INTERVAL '${daysOld} days'
  `;

  return result.rowCount ?? 0;
}

// Get outage statistics
export async function getOutageStats(districtId?: number) {
  if (districtId) {
    const result = await sql`
      SELECT
        COUNT(*) FILTER (WHERE is_resolved = false) as active_count,
        COUNT(*) FILTER (WHERE is_resolved = true) as resolved_count,
        COUNT(DISTINCT district_id) as affected_districts
      FROM outage_snapshots
      WHERE district_id = ${districtId}
    `;
    return result.rows[0];
  } else {
    const result = await sql`
      SELECT
        COUNT(*) FILTER (WHERE is_resolved = false) as active_count,
        COUNT(*) FILTER (WHERE is_resolved = true) as resolved_count,
        COUNT(DISTINCT district_id) as affected_districts
      FROM outage_snapshots
    `;
    return result.rows[0];
  }
}
