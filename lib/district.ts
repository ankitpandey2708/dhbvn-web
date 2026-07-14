// ── District configuration — single source of truth ──
// Loaded from public/data/districts.json (manually maintained)

import districtConfig from '../public/data/districts.json';

interface District {
  id: number;
  name: string;
  circles?: string[] | null;
}

/** All districts with their IDs and names */
export const DISTRICTS: District[] = districtConfig.districts;

/** Pre-computed select options (shared by page.tsx and DistrictSelect.tsx) */
export const DISTRICT_OPTIONS = DISTRICTS
  .map(d => ({ value: d.id.toString(), label: d.name }))
  .sort((a, b) => a.label.localeCompare(b.label));

/** Look up a district's name by its numeric ID */
export function getDistrictName(districtId: number): string {
  const district = DISTRICTS.find(d => d.id === districtId);
  return district?.name || 'Unknown';
}
