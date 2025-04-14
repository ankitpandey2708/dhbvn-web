import { NextResponse } from 'next/server';
import { parseStringPromise } from 'xml2js';
import { format, isAfter } from 'date-fns';

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
        DT?: string[];
      }>;
    }];
  };
}

const DHBVN_API_URL = 'https://chs.dhbvn.org.in/api/AppsavyServices/GetRelationalDataA';

// Check for required environment variables
const requiredEnvVars = {
  DHBVN_FORM_ID: process.env.DHBVN_FORM_ID,
  DHBVN_LOGIN: process.env.DHBVN_LOGIN,
  DHBVN_SOURCE_TYPE: process.env.DHBVN_SOURCE_TYPE,
  DHBVN_VERSION: process.env.DHBVN_VERSION,
  DHBVN_TOKEN: process.env.DHBVN_TOKEN,
  DHBVN_ROLE_ID: process.env.DHBVN_ROLE_ID,
};

// Validate environment variables
const missingEnvVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}
  
  const headers = {
  'formid': process.env.DHBVN_FORM_ID!,
  'appsavylogin': process.env.DHBVN_LOGIN!,
  'sourcetype': process.env.DHBVN_SOURCE_TYPE!,
  'version': process.env.DHBVN_VERSION!,
  'token': process.env.DHBVN_TOKEN!,
  'ROLEID': process.env.DHBVN_ROLE_ID!,
    'Content-Type': 'application/json'
  };

  const payload = {
    "inputxml": "PD94bWwgdmVyc2lvbj0iMS4wIj8+PFJlcXVlc3QgVkVSU0lPTj0iMiIgTEFOR1VBR0VfSUQ9IjEiIExPQ0FUSU9OPSIiPjxDb21wYW55IENvbXBhbnlfSWQ9IjkzIiAvPjxQcm9qZWN0IFByb2plY3RfSWQ9IjMwNCIgLz48VXNlciBVc2VyX0lkPSJBbm9ueW1vdXMiIC8+PElVVkxvZ2luIElVVkxvZ2luX0lkPSJBbm9ueW1vdXMiIC8+PFJPTEUgUk9MRV9JRD0iMTU5NSIgLz48RXZlbnQgQ29udHJvbF9JZD0iMTMwNDA0IiAvPjxDaGlsZCBDb250cm9sX0lkPSIxMjU2ODEiIFJlcG9ydD0iSFRNTCIgQUNfSUQ9IjE2Mzk0NCI+PFBhcmVudCBDb250cm9sX0lkPSIxMzA0MDIiIFZhbHVlPSIxMCIgRGF0YV9Gb3JtX0lkPSIiLz48L0NoaWxkPjwvUmVxdWVzdD4=",
    "DocVersion": "1"
  };

export async function GET() {
  try {
    console.log('=== DHBVN API Debug Logs ===');
    console.log('Current time:', new Date().toISOString());
    
    console.log('Fetching DHBVN data...');
    
    // Make the API request
    const response = await fetch(DHBVN_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
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

    console.log('Parsing XML response...');
    
    // Parse XML to JSON
    const result = await parseStringPromise(xmlData) as DHBVNResponse;
    
    if (!result?.RESULT?.RESULTS?.[0]?.Rowset) {
      console.error('Invalid XML structure:', result);
      throw new Error('Invalid response structure from DHBVN API');
    }
    
    console.log('Total rows received from API:', result.RESULT.RESULTS[0].Rowset.length);
    
    // Process the data
    const now = new Date();
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
          const [datePart, timePart] = item.restoration_time.split(' ');
          if (!datePart || !timePart) {
            console.log('Invalid date format:', item.restoration_time);
            return false;
          }
          
          const [day, month, year] = datePart.split('-');
          const dateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')} ${timePart}`;
          const restorationDate = new Date(dateStr);
          
          console.log('Date comparison for item:', {
            area: item.area,
            feeder: item.feeder,
            originalTime: item.restoration_time,
            parsedDate: dateStr,
            restorationDateISO: restorationDate.toISOString(),
            nowISO: now.toISOString(),
            isAfter: isAfter(restorationDate, now)
          });
          
          return isAfter(restorationDate, now);
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

    console.log('=== Final Results ===');
    console.log('Total rows after filtering:', data.length);
    console.log('Filtered data:', JSON.stringify(data, null, 2));
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching DHBVN data:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 