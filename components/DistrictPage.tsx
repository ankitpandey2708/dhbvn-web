import OutageDashboardLoader from '@/components/OutageDashboardLoader';
import { SITE_URL } from '@/lib/dhbvn-config';
import { District, FARIDABAD_ID, slugFor } from '@/lib/district-slug';

interface DistrictPageProps {
  district: District;
}

export default function DistrictPage({ district }: DistrictPageProps) {
  const isFaridabad = district.id === FARIDABAD_ID;
  const canonical = isFaridabad ? `${SITE_URL}/` : `${SITE_URL}/${slugFor(district.name)}`;

  const datasetSchema = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `${district.name} Power Outage Live Feed`,
    description: `Active feeder outages in ${district.name}, Haryana — affected areas, start times, and expected restoration. Sourced from DHBVN, refreshed every 5 minutes.`,
    keywords: `${district.name} power outage, ${district.name} electricity outage, power cut ${district.name}, DHBVN ${district.name}`,
    temporal: 'Real-time, updated every 5 minutes',
    spatialCoverage: `${district.name}, Haryana, India`,
    url: canonical,
    publisher: {
      '@type': 'Organization',
      name: 'DHBVN Outage Tracker',
      url: SITE_URL,
    },
  };

  const breadcrumbItems = isFaridabad
    ? [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` }]
    : [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: district.name, item: canonical },
      ];

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <h1 className="sr-only">
        {district.name} Power Outages — Live DHBVN Updates
      </h1>

      <OutageDashboardLoader initialDistrictId={String(district.id)} />
    </>
  );
}
