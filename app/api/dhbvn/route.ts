import { NextResponse } from 'next/server';
import { parseStringPromise } from 'xml2js';

// remove server side cache
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

interface DHBVNData {
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

const requiredEnvVars = {
  DHBVN_FORM_ID: process.env.DHBVN_FORM_ID,
  DHBVN_LOGIN: process.env.DHBVN_LOGIN,
  DHBVN_SOURCE_TYPE: process.env.DHBVN_SOURCE_TYPE,
  DHBVN_VERSION: process.env.DHBVN_VERSION,
  DHBVN_TOKEN: process.env.DHBVN_TOKEN,
  DHBVN_ROLE_ID: process.env.DHBVN_ROLE_ID,
};

const headers = {
  'formid': process.env.DHBVN_FORM_ID!,
  'appsavylogin': process.env.DHBVN_LOGIN!,
  'sourcetype': process.env.DHBVN_SOURCE_TYPE!,
  'version': process.env.DHBVN_VERSION!,
  'token': process.env.DHBVN_TOKEN!,
  'ROLEID': process.env.DHBVN_ROLE_ID!,
  'Content-Type': 'application/json'
};

// Helper function to generate the payload with a specific district value
function generatePayload(districtValue: string = "10") {
  const xmlTemplate = `<?xml version="1.0"?><Request VERSION="2" LANGUAGE_ID="1" LOCATION=""><Company Company_Id="93" /><Project Project_Id="304" /><User User_Id="Anonymous" /><IUVLogin IUVLogin_Id="Anonymous" /><ROLE ROLE_ID="1595" /><Event Control_Id="130404" /><Child Control_Id="125681" Report="HTML" AC_ID="163944"><Parent Control_Id="130402" Value="${districtValue}" Data_Form_Id=""/></Child></Request>`;
  const encodedXml = Buffer.from(xmlTemplate).toString('base64');

  return {
    "inputxml": encodedXml,
    "DocVersion": "1"
  };
}

export async function GET(request: Request) {
  try {
    // Extract district value from query params, default to "10" (Faridabad)
    const { searchParams } = new URL(request.url);
    const district = searchParams.get('district') || '10';

    const missingEnvVars = Object.entries(requiredEnvVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingEnvVars.length > 0) {
      return NextResponse.json({
        error: `Missing required environment variables: ${missingEnvVars.join(', ')}`
      }, { status: 500 });
    }

    const now = new Date();

    // Generate payload with the selected district
    const payload = generatePayload(district);

    // Make the API request
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
      const errorText = await response.text();
      console.error('DHBVN API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`DHBVN API error: ${response.status} ${response.statusText}`);
    }

    const xmlData = await response.text();
    
    if (!xmlData) {
      throw new Error('Empty response from DHBVN API');
    }

    
    // Parse XML to JSON
    const result = await parseStringPromise(xmlData) as DHBVNResponse;
    
    if (!result?.RESULT?.RESULTS?.[0]?.Rowset) {
      console.error('Invalid XML structure:', result);
      throw new Error('Invalid response structure from DHBVN API');
    }
    
    console.log('Total rows received from API:', result.RESULT.RESULTS[0].Rowset.length);
    
    const data: DHBVNData[] = result.RESULT.RESULTS[0].Rowset
      .filter(row => {
        // Check if all required fields are present
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
      // Filter out past restoration times and entries without restoration time
      .filter(item => {
        if (!item.restoration_time) {
          console.log('Skipping item without restoration time:', item);
          return false;
        }
        try {
          // Split the date string into components
          const [day, monthStr, year, time] = item.restoration_time.split(/[-\s]/);
          const [hour, minute, second] = time.split(':');
          const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(monthStr);

          // Create a UTC Date object treating the components as IST, then adjust to UTC
          const dateAsIST = new Date(Date.UTC(Number(year), monthIndex, Number(day), Number(hour), Number(minute), Number(second)));
          const istOffsetMs = 330 * 60 * 1000; // 5 hours 30 minutes in milliseconds
          const restorationDateUTC = new Date(dateAsIST.getTime() - istOffsetMs);

          console.log('Date comparison for item:', {
            area: item.area,
            feeder: item.feeder,
            originalTime: item.restoration_time,
            restorationDateISO: restorationDateUTC.toISOString(),
            nowISO: now.toISOString(),
            isAfter: restorationDateUTC > now
          });

          return restorationDateUTC > now;
        } catch (error) {
          console.warn('Error parsing date:', {
            restoration_time: item.restoration_time,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          return false;
        }
      })
      // Sort by area and feeder
      .sort((a, b) => {
        const areaCompare = a.area.localeCompare(b.area);
        if (areaCompare !== 0) return areaCompare;
        return a.feeder.localeCompare(b.feeder);
      });

    
    // Remove browser side cache
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      }
    });
  } catch (error) {
    console.error('Error fetching DHBVN data:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
