import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/dhbvn-config';
import { NON_FARIDABAD_SLUGS } from '@/lib/district-slug';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    ...NON_FARIDABAD_SLUGS.map((slug) => ({
      url: `${SITE_URL}/${slug}`,
      lastModified: now,
      changeFrequency: 'hourly' as const,
      priority: 0.8,
    })),
  ];
}
