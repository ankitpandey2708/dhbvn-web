import { XMLParser } from 'fast-xml-parser';
import { DHBVN_CONFIG } from './dhbvn-config';
import { normalizeFeederName, isOutageExpired } from './utils';

export interface DHBVNData {
    feeder: string;
    areas: string[];
    start_time: string;
    restoration_time: string;
    reason: string;
}

interface DHBVNResponse {
    RESULT?: {
        RESULTS?: Array<{
            Rowset?: Array<{
                FEEDER?: string[];
                AREA?: string[];
                START_TIME?: string[];
                EXPECTED_RESTORATION_TIME?: string[];
                ADDRESS?: string[];
            }>;
        }>;
    };
}

// fast-xml-parser instead of xml2js: same fields, several times less CPU.
// Repeated XML tags must be forced to arrays (this parser emits a single
// object when a tag appears once).
const xmlParser = new XMLParser({
    ignoreAttributes: true,
    isArray: (name: string) =>
        [
            'RESULTS',
            'Rowset',
            'FEEDER',
            'AREA',
            'START_TIME',
            'EXPECTED_RESTORATION_TIME',
            'ADDRESS',
        ].includes(name),
});

// https://chs.dhbvn.org.in/UI/Form?FormId=11996
const DHBVN_API_URL = 'https://chs.dhbvn.org.in/api/AppsavyServices/GetRelationalDataA';

function generatePayload(districtValue: string = "10") {
    const xmlTemplate = `<?xml version="1.0"?><Request VERSION="2" LANGUAGE_ID="1" LOCATION=""><Company Company_Id="93" /><Project Project_Id="304" /><User User_Id="Anonymous" /><IUVLogin IUVLogin_Id="Anonymous" /><ROLE ROLE_ID="1595" /><Event Control_Id="130404" /><Child Control_Id="125681" Report="HTML" AC_ID="163944"><Parent Control_Id="130402" Value="${districtValue}" Data_Form_Id=""/></Child></Request>`;
    const encodedXml = Buffer.from(xmlTemplate).toString('base64');

    return {
        "inputxml": encodedXml,
        "DocVersion": "1"
    };
}

interface CacheEntry {
    at: number;
    rows: DHBVNData[];
}

// Per-instance short-TTL cache of raw row results, keyed by district:
// bursts of users polling the same district within seconds (Faridabad is the
// default for everyone) share one DHBVN fetch + XML parse instead of
// paying it per request. Entries are reused read-only — consumers never
// mutate these row objects, so sharing them is safe.
const rawRowsCache = new Map<string, CacheEntry>();
const RAW_CACHE_TTL_MS = 60 * 1000;

/**
 * Shared helper: fetch DHBVN XML, parse, extract all raw rows.
 * No filtering, no grouping — just raw DHBVNData[] from every valid row.
 */
async function fetchAllRawRows(district: string): Promise<DHBVNData[]> {
    const headers = {
        'formid': DHBVN_CONFIG.FORM_ID,
        'appsavylogin': DHBVN_CONFIG.LOGIN,
        'sourcetype': DHBVN_CONFIG.SOURCE_TYPE,
        'version': DHBVN_CONFIG.VERSION,
        'token': DHBVN_CONFIG.TOKEN,
        'ROLEID': DHBVN_CONFIG.ROLE_ID,
        'Content-Type': 'application/json'
    };

    const payload = generatePayload(district);

    const response = await fetch(DHBVN_API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        cache: 'no-store',
        next: { revalidate: 0 }
    });

    if (!response.ok) {
        throw new Error(`DHBVN API error: ${response.status} ${response.statusText}`);
    }

    const xmlData = await response.text();

    if (!xmlData) {
        throw new Error('Empty response from DHBVN API');
    }

    const result = xmlParser.parse(xmlData) as DHBVNResponse;

    if (!result?.RESULT?.RESULTS?.[0]) {
        console.error('Invalid XML structure:', JSON.stringify(result).substring(0, 200));
        throw new Error('Invalid response structure from DHBVN API');
    }

    const rowset = result.RESULT.RESULTS[0].Rowset || [];
    const rows: DHBVNData[] = [];

    for (const row of rowset) {
        const feeder = row.FEEDER?.[0] ? normalizeFeederName(row.FEEDER[0]) : undefined;
        const area = (row.AREA?.[0] || '').trim();
        const start_time = row.START_TIME?.[0];
        const restoration_time = row.EXPECTED_RESTORATION_TIME?.[0];
        const reason = (row.ADDRESS?.[0] || '').trim();

        if (!feeder || !start_time || !restoration_time) continue;

        rows.push({ feeder, areas: [area], start_time, restoration_time, reason });
    }

    return rows;
}

/**
 * Returns ALL raw outage rows from DHBVN XML — including expired ones.
 * Used for history DB ingestion. No filtering, no grouping.
 * 60s per-instance cache + in-flight dedupe across concurrent callers.
 */
const inFlightFetches = new Map<string, Promise<DHBVNData[]>>();

export async function fetchAllDHBVNRawRows(district: string): Promise<DHBVNData[]> {
    const key = String(district);
    const cached = rawRowsCache.get(key);
    if (cached && Date.now() - cached.at < RAW_CACHE_TTL_MS) {
        return cached.rows;
    }

    const pending = inFlightFetches.get(key);
    if (pending) return pending;

    const promise = fetchAllRawRows(key)
        .then(rows => {
            rawRowsCache.set(key, { at: Date.now(), rows });
            inFlightFetches.delete(key);
            return rows;
        })
        .catch(error => {
            // Drop the in-flight entry so the next caller retries immediately.
            inFlightFetches.delete(key);
            const msg = error instanceof Error ? error.message : String(error);
            throw new Error(`fetchAllDHBVNRawRows failed for district "${key}": ${msg}`);
        });
    inFlightFetches.set(key, promise);
    return promise;
}

/**
 * Pure function: filter raw rows to only active outages, group by feeder, sort.
 * Shared by fetchDHBVNOutages() and the API route (avoids code duplication).
 */
export function filterActiveOutages(rows: DHBVNData[]): DHBVNData[] {
    const feederMap = new Map<string, DHBVNData>();

    for (const row of rows) {
        // skip expired outages (restoration time is in the past)
        if (isOutageExpired(row.restoration_time)) continue;

        const existing = feederMap.get(row.feeder);
        if (existing) {
            // immutable update: don't mutate the existing object's array
            if (!existing.areas.includes(row.areas[0])) {
                existing.areas = [...existing.areas, row.areas[0]];
            }
        } else {
            feederMap.set(row.feeder, { ...row, areas: [...row.areas] });
        }
    }

    return Array.from(feederMap.values()).sort((a, b) => a.feeder.localeCompare(b.feeder));
}

/**
 * Returns only ACTIVE outage rows, grouped by feeder, sorted alphabetically.
 * This is the primary function consumed by non-route callers (MCP server, Telegram bot).
 */
export async function fetchDHBVNOutages(district: string): Promise<DHBVNData[]> {
    try {
        const allRows = await fetchAllDHBVNRawRows(district);
        return filterActiveOutages(allRows);
    } catch (error) {
        console.error('Error in fetchDHBVNOutages:', error);
        throw error;
    }
}
