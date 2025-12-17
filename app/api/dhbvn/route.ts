import { NextResponse } from 'next/server';
import { fetchDHBVNOutages } from '@/lib/dhbvn-api';

// remove server side cache
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

const requiredEnvVars = {
  DHBVN_FORM_ID: process.env.DHBVN_FORM_ID,
  DHBVN_LOGIN: process.env.DHBVN_LOGIN,
  DHBVN_SOURCE_TYPE: process.env.DHBVN_SOURCE_TYPE,
  DHBVN_VERSION: process.env.DHBVN_VERSION,
  DHBVN_TOKEN: process.env.DHBVN_TOKEN,
  DHBVN_ROLE_ID: process.env.DHBVN_ROLE_ID,
};

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

    const data = await fetchDHBVNOutages(district);

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
