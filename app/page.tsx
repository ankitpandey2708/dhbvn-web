'use client';

import { useEffect, useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef, Row } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface DHBVNData {
  area: string;
  feeder: string;
  start_time: string;
  restoration_time: string;
  reason: string;
}

const columns: ColumnDef<DHBVNData>[] = [
  {
    accessorKey: 'area',
    header: 'Area',
  },
  {
    accessorKey: 'feeder',
    header: 'Feeder',
  },
  {
    accessorKey: 'start_time',
    header: 'Start Time',
    cell: ({ row }: { row: Row<DHBVNData> }) => {
      try {
        const value = row.getValue('start_time') as string;
        // Handle the date format from Python script
        const [datePart, timePart] = value.split(' ');
        const [day, month, year] = datePart.split('-');
        const date = new Date(`${year}-${month}-${day} ${timePart}`);
        return format(date, 'PPpp');
      } catch {
        return row.getValue('start_time') as string;
      }
    },
  },
  {
    accessorKey: 'restoration_time',
    header: 'Expected Restoration',
    cell: ({ row }: { row: Row<DHBVNData> }) => {
      try {
        const value = row.getValue('restoration_time') as string;
        // Handle the date format from Python script
        const [datePart, timePart] = value.split(' ');
        const [day, month, year] = datePart.split('-');
        const date = new Date(`${year}-${month}-${day} ${timePart}`);
        return format(date, 'PPpp');
      } catch {
        return row.getValue('restoration_time') as string;
      }
    },
  },
  {
    accessorKey: 'reason',
    header: 'Reason',
  },
];

export default function Home() {
  const [data, setData] = useState<DHBVNData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/dhbvn');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch data');
        }
        const result = await response.json();
        setData(Array.isArray(result) ? result : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto py-10">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Faridabad Power Outage Information</h1>
        <p className="text-muted-foreground">
          Data refreshes every 5 minutes.
        </p>
        <DataTable columns={columns} data={data} />
      </div>
    </main>
  );
} 