import { parseStringPromise } from 'xml2js';
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
    RESULT: {
        $: { EVENT_CONTROL: string };
        RESULTS: [{
            $: {
                CHILDCONTROLID: string;
                AC_ID: string;
                SECCONTROLID: string;
            };
            Rowset: Array<{
                FEEDER?: string[];
                AREA?: string[];
                START_TIME?: string[];
                EXPECTED_RESTORATION_TIME?: string[];
                ADDRESS?: string[];
            }>;
        }];
    };
}

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

    const result = await parseStringPromise(xmlData) as DHBVNResponse;

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
 */
export async function fetchAllDHBVNRawRows(district: string): Promise<DHBVNData[]> {
    try {
        return await fetchAllRawRows(district);
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        throw new Error(`fetchAllDHBVNRawRows failed for district "${district}": ${msg}`);
    }
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
