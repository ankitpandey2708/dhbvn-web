import { parseStringPromise } from 'xml2js';

export interface DHBVNData {
    area: string;
    feeder: string;
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

export async function fetchDHBVNOutages(district: string): Promise<DHBVNData[]> {
    const headers = {
        'formid': process.env.DHBVN_FORM_ID!,
        'appsavylogin': process.env.DHBVN_LOGIN!,
        'sourcetype': process.env.DHBVN_SOURCE_TYPE!,
        'version': process.env.DHBVN_VERSION!,
        'token': process.env.DHBVN_TOKEN!,
        'ROLEID': process.env.DHBVN_ROLE_ID!,
        'Content-Type': 'application/json'
    };

    try {
        const payload = generatePayload(district);

        const response = await fetch(DHBVN_API_URL, {
            method: 'POST',
            headers: {
                ...headers,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
            },
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
            // Return empty array instead of throwing if the structure is just empty/different but valid XML
            // But adhering to original logic:
            throw new Error('Invalid response structure from DHBVN API');
        }

        const rowset = result.RESULT.RESULTS[0].Rowset || [];
        const now = new Date();

        return rowset
            .filter(row => {
                return row.AREA?.[0] &&
                    row.FEEDER?.[0] &&
                    row.START_TIME?.[0] &&
                    row.EXPECTED_RESTORATION_TIME?.[0];
            })
            .map(row => ({
                area: row.AREA![0],
                feeder: row.FEEDER![0],
                start_time: row.START_TIME![0],
                restoration_time: row.EXPECTED_RESTORATION_TIME![0],
                reason: (row.ADDRESS?.[0] || '').trim()
            }))
            .filter(item => {
                if (!item.restoration_time) return false;
                try {
                    const [day, monthStr, year, time] = item.restoration_time.split(/[-\s]/);
                    const [hour, minute, second] = time.split(':');
                    const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(monthStr);

                    // Create a UTC Date object treating the components as IST, then adjust to UTC
                    const dateAsIST = new Date(Date.UTC(Number(year), monthIndex, Number(day), Number(hour), Number(minute), Number(second)));
                    const istOffsetMs = 330 * 60 * 1000; // 5 hours 30 minutes in milliseconds
                    const restorationDateUTC = new Date(dateAsIST.getTime() - istOffsetMs);

                    return restorationDateUTC > now;
                } catch (error) {
                    return false;
                }
            })
            .sort((a, b) => {
                const areaCompare = a.area.localeCompare(b.area);
                if (areaCompare !== 0) return areaCompare;
                return a.feeder.localeCompare(b.feeder);
            });

    } catch (error) {
        console.error('Error in fetchDHBVNOutages:', error);
        // Rethrow to let caller handle
        throw error;
    }
}
