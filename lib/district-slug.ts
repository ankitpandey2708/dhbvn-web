import { DISTRICTS } from './district';

export interface District {
  id: number;
  name: string;
}

export const FARIDABAD_ID = 10;

export function slugFor(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, '-');
}

const SLUG_TO_DISTRICT = new Map<string, District>(
  DISTRICTS.map(d => [slugFor(d.name), { id: d.id, name: d.name }])
);

export function districtFromSlug(slug: string): District | null {
  return SLUG_TO_DISTRICT.get(slug.toLowerCase()) ?? null;
}

export function districtFromId(id: number): District | null {
  const d = DISTRICTS.find(d => d.id === id);
  return d ? { id: d.id, name: d.name } : null;
}

export const NON_FARIDABAD_SLUGS: string[] = DISTRICTS
  .filter(d => d.id !== FARIDABAD_ID)
  .map(d => slugFor(d.name));

export function routeForDistrictId(id: number): string {
  if (id === FARIDABAD_ID) return '/';
  const d = districtFromId(id);
  return d ? `/${slugFor(d.name)}` : '/';
}
