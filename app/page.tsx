import type { Metadata } from 'next';
import DistrictPage from '@/components/DistrictPage';
import { SITE_URL } from '@/lib/dhbvn-config';
import { districtFromId, FARIDABAD_ID } from '@/lib/district-slug';

export const metadata: Metadata = {
  title: 'Faridabad Power Outage Tracker — Live DHBVN Updates',
  description:
    'Real-time power outage info for Faridabad: affected feeders, areas, start times, expected restoration. Live data from DHBVN, updated every 5 minutes.',
  alternates: { canonical: `${SITE_URL}/` },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/`,
    title: 'Faridabad Power Outage Tracker — Live DHBVN Updates',
    description:
      'Real-time power outage info for Faridabad: affected feeders, areas, start times, expected restoration. Live data from DHBVN, updated every 5 minutes.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Faridabad Power Outage Tracker — Live DHBVN Updates',
    description: 'Real-time power outage updates for Faridabad, Haryana.',
  },
};

export default function Home() {
  const district = districtFromId(FARIDABAD_ID)!;
  return <DistrictPage district={district} />;
}
