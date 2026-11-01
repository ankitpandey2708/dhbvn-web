'use client';

import dynamic from 'next/dynamic';
import { OutageLoadingSkeleton } from '@/components/ui/skeleton';

const OutageDashboard = dynamic(
  () => import('@/components/OutageDashboard'),
  { loading: () => <OutageLoadingSkeleton /> }
);

interface OutageDashboardLoaderProps {
  initialDistrictId?: string;
}

export default function OutageDashboardLoader({ initialDistrictId }: OutageDashboardLoaderProps = {}) {
  return <OutageDashboard initialDistrictId={initialDistrictId} />;
}
