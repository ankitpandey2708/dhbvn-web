import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import DistrictPage from '@/components/DistrictPage';
import { SITE_URL } from '@/lib/dhbvn-config';
import {
  districtFromSlug,
  FARIDABAD_ID,
  NON_FARIDABAD_SLUGS,
  slugFor,
} from '@/lib/district-slug';

export const dynamicParams = false;

interface RouteParams {
  params: Promise<{ district: string }>;
}

export function generateStaticParams() {
  // Include 'faridabad' so the redirect branch is reachable at build time.
  return [...NON_FARIDABAD_SLUGS, 'faridabad'].map((district) => ({ district }));
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { district: slug } = await params;
  const district = districtFromSlug(slug);
  if (!district || district.id === FARIDABAD_ID) {
    return {};
  }
  const canonical = `${SITE_URL}/${slugFor(district.name)}`;
  const title = `${district.name} Power Outage Tracker — Live DHBVN Updates`;
  const description = `Real-time power outage info for ${district.name}: affected feeders, areas, start times, expected restoration. Live data from DHBVN, updated every 5 minutes.`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      url: canonical,
      title,
      description,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: `Real-time power outage updates for ${district.name}, Haryana.`,
    },
  };
}

export default async function DistrictRoute({ params }: RouteParams) {
  const { district: slug } = await params;
  const district = districtFromSlug(slug);
  if (!district) {
    notFound();
  }
  if (district.id === FARIDABAD_ID) {
    redirect('/');
  }
  return <DistrictPage district={district} />;
}
