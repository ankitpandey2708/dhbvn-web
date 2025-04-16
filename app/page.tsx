'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef, Row } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Download } from 'lucide-react';
import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

// Utility: filterByAreaAndFeeder
function filterByAreaAndFeeder<T extends { area: string; feeder: string }>(
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

// Utility: generateOutagePDF
function generateOutagePDF({
  columns,
  data,
  title = 'Faridabad Power Outage Information',
}: {
  columns: { header: string }[] | string[];
  data: any[];
  title?: string;
}) {
  const headers = Array.isArray(columns)
    ? columns.map((col: any) => (typeof col === 'string' ? col : col.header))
    : [];
  const tableData = data.map((row: any) =>
    Array.isArray(row) ? row : Object.values(row)
  );
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(title, 14, 15);
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);
  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: 30,
    theme: 'grid',
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 30 },
      2: { cellWidth: 40 },
      3: { cellWidth: 40 },
      4: { cellWidth: 40 },
    },
  });
  doc.save('power-outage-report.pdf');
}

export default function Home() {
  const [data, setData] = useState<DHBVNData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (process.env.NODE_ENV !== 'production') {
        // Use dummy data in development
        setData([
          {
            area: 'Sector 16',
            feeder: '67aa',
            start_time: '16-Apr-2025 10:24:00',
            restoration_time: '16-Apr-2025 12:44:00',
            reason: 'breakdown',
          },
          {
            area: 'Sector 15',
            feeder: 'ab412',
            start_time: '16-Apr-2025 13:24:00',
            restoration_time: '17-Apr-2025 09:44:00',
            reason: 'line fault',
          }
        ]);
        setLoading(false);
        return;
      }
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

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [data]);

  const filteredData = useMemo(
    () => filterByAreaAndFeeder(data, globalFilter),
    [data, globalFilter]
  );

  const handleDownloadPDF = () => {
    generateOutagePDF({
      columns: [
        { header: 'Area' },
        { header: 'Feeder' },
        { header: 'Start Time' },
        { header: 'Expected Restoration' },
        { header: 'Reason' },
      ],
      data: filteredData.map(row => [
        row.area,
        row.feeder,
        row.start_time,
        row.restoration_time,
        row.reason,
      ]),
    });
  };

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
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left">Faridabad Power Outage Information</h1>
        <p className="text-muted-foreground text-center sm:text-left">
          Data refreshes every 5 minutes.
        </p>
        {/* Search and Download Controls - Mobile */}
        {filteredData.length > 0 && (
          <div className="flex items-center justify-between py-4 block sm:hidden">
            <div className="relative w-40">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                placeholder="Search..."
                value={globalFilter}
                onChange={(event) => setGlobalFilter(event.target.value)}
                className="pl-8 text-sm"
              />
            </div>
            <Button
              onClick={handleDownloadPDF}
              variant="outline"
              size="sm"
              className="shrink-0 ml-2"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        )}
        {/* Mobile Card Layout */}
        {filteredData.length > 0 && (
          <div className="flex flex-col gap-4 block sm:hidden">
            {filteredData.map((item, idx) => (
              <div key={idx} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold text-base truncate">{item.area}</span>
                  <span className="font-semibold text-base truncate">{item.feeder}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div>
                    Period<br />
                    <span className="font-medium text-foreground">{item.start_time} -<br />{item.restoration_time}</span>
                  </div>
                  <div className="text-right">
                    Reason<br />
                    <span className="font-medium text-foreground">{item.reason}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Desktop Table Layout */}
        <div className="overflow-x-auto -mx-4 sm:mx-0 hidden sm:block">
          <div className="min-w-[800px] sm:min-w-0">
            {/* Search and Download Controls - Desktop */}
            {filteredData.length > 0 && (
              <div className="flex items-center justify-between py-4">
                <div className="relative w-40 sm:w-72">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    ref={searchInputRef}
                    placeholder="Search..."
                    value={globalFilter}
                    onChange={(event) => setGlobalFilter(event.target.value)}
                    className="pl-8 text-sm"
                  />
                </div>
                <Button
                  onClick={handleDownloadPDF}
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            )}
            <DataTable columns={columns} data={filteredData} />
          </div>
        </div>
      </div>
    </main>
  );
} 