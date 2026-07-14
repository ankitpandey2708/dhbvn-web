import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Check if an outage restoration time (given as an IST date string e.g.
 * "16-Apr-2025 10:24:00") has passed. Returns true if the outage is expired.
 * This is server-timezone-independent — it explicitly converts IST → UTC epoch.
 */
export function isOutageExpired(restorationTimeStr: string): boolean {
  const [datePart, timePart] = restorationTimeStr.split(' ');
  if (!datePart || !timePart) return true;

  const [day, month, year] = datePart.split('-');
  const [hh, mm, ss] = timePart.split(':');
  if (!day || !month || !year || hh === undefined || mm === undefined) return true;

  const monthIndex = MONTHS.indexOf(month.toUpperCase());
  if (monthIndex < 0) return true;

  // Treat the parsed components as IST and convert to UTC epoch for comparison
  const istEpoch = Date.UTC(Number(year), monthIndex, Number(day), Number(hh), Number(mm), Number(ss ?? 0));
  const utcEpoch = istEpoch - 330 * 60 * 1000;

  return utcEpoch <= Date.now();
}


export function normalizeFeederName(s: string): string {
  return s.trim().replace(/\s+/g, ' ').toUpperCase();
}

// strips trailing parenthetical suffix e.g. "(U)", "(MU)", "(RURAL AP)"
export function stripFeederSuffix(s: string): string {
  return s.replace(/\s*\([^)]*\)\s*$/, '').trim();
}


const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

// Format: "16-Apr-2025 10:24:00". Built numerically to avoid relying on
// engine-specific parsing of the non-standard "2025-Apr-16" string form.
export function parseOutageDate(dateStr: string): Date | null {
  const [datePart, timePart] = dateStr.split(' ');
  if (!datePart || !timePart) return null;

  const [day, month, year] = datePart.split('-');
  const [hh, mm, ss] = timePart.split(':');
  if (!day || !month || !year || hh === undefined || mm === undefined) return null;

  const monthIdx = MONTHS.indexOf(month.toUpperCase());
  if (monthIdx < 0) return null;

  const date = new Date(
    Number(year), monthIdx, Number(day),
    Number(hh), Number(mm), Number(ss ?? 0)
  );

  if (isNaN(date.getTime())) return null;
  return date;
}


export type UrgencyLevel = 'major' | 'moderate' | 'minor';


/**
 * Determine urgency level based on time remaining until restoration.
 * major = >4h or no restoration time, moderate = 1–4h, minor = <1h
 */
export function getUrgencyLevel(restorationTimeStr: string): UrgencyLevel {
  const date = parseOutageDate(restorationTimeStr);
  if (!date) return 'major';

  const now = new Date();
  const diffMs = date.getTime() - now.getTime();

  if (diffMs <= 0) return 'major';

  const totalMinutes = Math.floor(diffMs / 60000);

  if (totalMinutes <= 60) return 'minor';
  if (totalMinutes <= 240) return 'moderate';
  return 'major';
}

/**
 * Get the CSS color class for an urgency level
 */
export function getUrgencyColor(urgency: UrgencyLevel): { text: string; bg: string; dot: string } {
  switch (urgency) {
    case 'minor':
      return {
        text: 'text-success-500',
        bg: 'bg-success-500/10',
        dot: 'bg-success-500',
      };
    case 'moderate':
      return {
        text: 'text-warning-500',
        bg: 'bg-warning-500/10',
        dot: 'bg-warning-500',
      };
    case 'major':
      return {
        text: 'text-error-500',
        bg: 'bg-error-500/10',
        dot: 'bg-error-500',
      };
  }
}
