// This is a Next.js client component for displaying power outage information for Faridabad
'use client';

// Import necessary React hooks and UI components
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

// Define the data structure for outage information
interface DHBVNData {
  area: string;
  feeder: string;
  start_time: string;
  restoration_time: string;
  reason: string;
}

// Define the columns for the DataTable, including custom cell renderers for date formatting
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
        // Parse and format the date string from the backend (Python script)
        const [datePart, timePart] = value.split(' ');
        const [day, month, year] = datePart.split('-');
        const date = new Date(`${year}-${month}-${day} ${timePart}`);
        return format(date, 'PPpp');
      } catch {
        // Fallback to raw value if parsing fails
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
        // Parse and format the date string from the backend (Python script)
        const [datePart, timePart] = value.split(' ');
        const [day, month, year] = datePart.split('-');
        const date = new Date(`${year}-${month}-${day} ${timePart}`);
        return format(date, 'PPpp');
      } catch {
        // Fallback to raw value if parsing fails
        return row.getValue('restoration_time') as string;
      }
    },
  },
  {
    accessorKey: 'reason',
    header: 'Reason',
  },
];

// Utility function to filter data by area or feeder based on a search string
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

// Utility function to generate a PDF report of the outage data
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

// Reusable component for search input and download button controls
function SearchAndDownloadControls({
  globalFilter,
  setGlobalFilter,
  handleDownloadPDF,
  searchInputRef,
  className = "",
}: {
  globalFilter: string;
  setGlobalFilter: (v: string) => void;
  handleDownloadPDF: () => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between py-4 ${className}`}>
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
        className="shrink-0 ml-2"
      >
        <Download className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default function Home() {
  // State for fetched outage data
  const [data, setData] = useState<DHBVNData[]>([]);
  // Loading state for data fetch
  const [loading, setLoading] = useState(true);
  // Error state for fetch failures
  const [error, setError] = useState<string | null>(null);
  // State for global search filter
  const [globalFilter, setGlobalFilter] = useState('');
  // Ref for search input (to focus on data load)
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch outage data from API or use dummy data in development
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
    // Set up interval to refresh data every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Focus the search input when data changes
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [data]);

  // Memoized filtered data based on area/feeder search
  const filteredData = useMemo(
    () => filterByAreaAndFeeder(data, globalFilter),
    [data, globalFilter]
  );

  // Handler to trigger PDF download of filtered data
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

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Show error message if data fetch fails
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

  // Main UI rendering
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="flex flex-col gap-4">
        {/* Page Title and Subtitle */}
        <h1 className="text-2xl sm:text-3xl font-bold text-left">Faridabad Power Outage Information</h1>
        {/* Show no data message if there is no data at all (mobile and desktop) */}
        {data.length > 0 && (
          <p className="text-muted-foreground text-left sm:text-left">
          Data refreshes every 5 minutes.
        </p>
        )}
        {data.length === 0 && (
          <div className="text-center text-muted-foreground py-16 text-lg font-medium">
            No power outages reported by DHBVN
          </div>
        )}
        {/* Search and Download Controls - Mobile */}
        {data.length > 0 && (
          <SearchAndDownloadControls
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            handleDownloadPDF={handleDownloadPDF}
            searchInputRef={searchInputRef}
            className="block sm:hidden"
          />
        )}
        {/* Mobile Card Layout */}
        {filteredData.length > 0 && (
          <div className="flex flex-col gap-4 block sm:hidden">
            {/* Render each outage as a card for mobile view */}
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
        {/* Show no results message if search yields no data but there is data (mobile only) */}
        {data.length > 0 && filteredData.length === 0 && (
          <div className="text-center text-muted-foreground py-8 block sm:hidden">
            No results found for your search.
          </div>
        )}
        {/* Desktop Table Layout */}
        <div className="overflow-x-auto -mx-4 sm:mx-0 hidden sm:block">
          <div className="min-w-[800px] sm:min-w-0">
            {/* Search and Download Controls - Desktop */}
            {data.length > 0 && (
              <SearchAndDownloadControls
                globalFilter={globalFilter}
                setGlobalFilter={setGlobalFilter}
                handleDownloadPDF={handleDownloadPDF}
                searchInputRef={searchInputRef}
                className="hidden sm:flex"
              />
            )}
            {/* Render the data table for desktop view if there are filtered results */}
            {filteredData.length > 0 && (
              <DataTable columns={columns} data={filteredData} />
            )}
            {/* Show no results message if search yields no data but there is data (desktop only) */}
            {data.length > 0 && filteredData.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No results found for your search.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 