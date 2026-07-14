import type { Metadata } from 'next';
import HistoryTable from '@/components/HistoryTable';
import { SITE_URL } from '@/lib/dhbvn-config';
import { districtFromId, FARIDABAD_ID } from '@/lib/district-slug';

export const metadata: Metadata = {
  title: 'Faridabad Outage History — DHBVN',
  description:
    'Historical power outage records for Faridabad district — feeders, areas, reasons, and restoration times collected from DHBVN.',
  alternates: { canonical: `${SITE_URL}/history` },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/history`,
    title: 'Faridabad Outage History — DHBVN',
    description: 'Historical power outage records for Faridabad district.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Faridabad Outage History — DHBVN',
    description: 'Historical power outage records for Faridabad, Haryana.',
  },
};

export default function HistoryHome() {
  const district = districtFromId(FARIDABAD_ID)!;
  return <HistoryTable districtId={district.id} districtName={district.name} />;
}
