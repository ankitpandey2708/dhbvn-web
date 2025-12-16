import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseOutageDate(dateStr: string): Date | null {
  try {
    // Parse and format the date string from the backend (Python script)
    // Format: "16-Apr-2025 10:24:00"
    const [datePart, timePart] = dateStr.split(' ');
    if (!datePart || !timePart) return null;

    const [day, month, year] = datePart.split('-');
    return new Date(`${year}-${month}-${day} ${timePart}`);
  } catch {
    return null;
  }
}

export function filterByAreaAndFeeder<T extends { area: string; feeder: string }>(
  data: T[],
  filterValue: string
): T[] {
  const lowerFilter = filterValue.toLowerCase();
  return data.filter(item =>
    [item.area, item.feeder].some(val =>
      String(val).toLowerCase().includes(lowerFilter)
    )
  );
}
