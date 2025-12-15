// This is a Next.js client component for displaying power outage information for Faridabad
'use client';

// Import necessary React hooks and UI components
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef, Row } from '@tanstack/react-table';
import { format } from 'date-fns';
import { OutageLoadingSkeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Script from 'next/script';

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
  try {
    console.log('Generating PDF with data:', { columns, data, title });
    
    const headers = Array.isArray(columns)
      ? columns.map((col: any) => (typeof col === 'string' ? col : col.header))
      : [];
    const tableData = data.map((row: any) =>
      Array.isArray(row) ? row : Object.values(row)
    );
    
    console.log('Processed data for PDF:', { headers, tableData });
    
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
    
    console.log('PDF generated successfully, saving...');
    doc.save('power-outage-report.pdf');
    console.log('PDF saved successfully');
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Failed to generate PDF. Please try again.');
  }
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
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" aria-hidden="true" />
        <Input
          ref={searchInputRef}
          type="search"
          inputMode="search"
          placeholder="Search area or feeder..."
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="pl-11"
          aria-label="Search by area or feeder"
        />
      </div>
      <Button
        onClick={handleDownloadPDF}
        variant="secondary"
        size="default"
        className="shrink-0 ml-3"
        aria-label="Download filtered results as PDF"
      >
        <Download className="h-5 w-5 mr-2" />
        <span className="hidden sm:inline">Export PDF</span>
      </Button>
    </div>
  );
}

// District mapping for dropdown
const DISTRICTS = [
  { value: '1', label: 'Jind' },
  { value: '2', label: 'Fatehabad' },
  { value: '3', label: 'Sirsa' },
  { value: '4', label: 'Hisar' },
  { value: '5', label: 'Bhiwani' },
  { value: '6', label: 'Mahendargarh' },
  { value: '7', label: 'Rewari' },
  { value: '8', label: 'Gurugram' },
  { value: '9', label: 'Nuh' },
  { value: '10', label: 'Faridabad' },
  { value: '11', label: 'Palwal' },
  { value: '12', label: 'Charkhi Dadri' },
] as const;

export default function Home(): React.ReactElement {
  // State for selected district (default to "10" - Faridabad)
  const [selectedDistrict, setSelectedDistrict] = useState('10');
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

  // Get the current district name
  const currentDistrictName = DISTRICTS.find(d => d.value === selectedDistrict)?.label || 'Faridabad';

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
        const response = await fetch(`/api/dhbvn?district=${selectedDistrict}`);
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
  }, [selectedDistrict]);

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
      title: `${currentDistrictName} Power Outage Information`,
    });
  };

  // Generate JSON-LD structured data for this page
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${currentDistrictName} Power Outage Information`,
    description: `Real-time information about power outages in ${currentDistrictName} with location details`,
    url: 'https://dhbvn.vercel.app',
    mainEntity: {
      '@type': 'Dataset',
      name: `${currentDistrictName} Power Outage Dataset`,
      description: `Collection of current power outages in ${currentDistrictName} with details including affected areas, feeders, outage start times, and expected restoration times.`,
      keywords: `${currentDistrictName} power outage, ${currentDistrictName} electricity outage, power cut ${currentDistrictName}, ${currentDistrictName} electricity status, ${currentDistrictName} electricity updates,power restoration ${currentDistrictName}`,
      temporal: 'Real-time data, updated every 5 minutes',
      spatialCoverage: `${currentDistrictName}, Haryana, India`,
      publisher: {
        '@type': 'Organization',
        name: 'DHBVN Information Portal',
        url: 'https://dhbvn.vercel.app'
      }
    }
  };

  // Show loading skeleton while fetching data
  if (loading) {
    return <OutageLoadingSkeleton />;
  }

  // Show error message if data fetch fails
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-error-50 to-error-100 mb-4">
            <svg className="w-8 h-8 text-error-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2 tracking-tight">Error Loading Data</h2>
          <p className="text-neutral-600">{error}</p>
        </div>
      </div>
    );
  }

  // Main UI rendering
  return (
    <>
      <Script id="structured-data" type="application/ld+json">
        {JSON.stringify(structuredData)}
      </Script>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col gap-6">
          {/* District Selector */}
          <div className="w-full sm:w-auto">
            <label htmlFor="district-select" className="block text-sm font-medium text-neutral-700 mb-2">
              Select District
            </label>
            <select
              id="district-select"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 border border-neutral-300 rounded-lg bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              {DISTRICTS.map((district) => (
                <option key={district.value} value={district.value}>
                  {district.label}
                </option>
              ))}
            </select>
          </div>
          {/* Page Title and Subtitle */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-bold text-neutral-950 tracking-tight">{currentDistrictName} Power Outage Information</h1>
            {data.length > 0 && (
              <p className="text-base text-neutral-600 max-w-prose">
                Real-time outage data, automatically refreshed every 5 minutes.
              </p>
            )}
          </div>
          {/* Show no data message if there is no data at all (mobile and desktop) */}
          {data.length === 0 && (
            <div className="text-center py-24 px-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-success-50 to-success-100 mb-6">
                <svg className="w-8 h-8 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-neutral-600">No power outages reported by DHBVN</p>
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
                <div
                  key={idx}
                  className="rounded-xl border border-neutral-200/60 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between mb-4 gap-3">
                    <span className="font-semibold text-base text-neutral-900 truncate">{item.area}</span>
                    <span className="font-medium text-sm text-neutral-700 px-3 py-1 bg-neutral-100 rounded-full truncate">{item.feeder}</span>
                  </div>
                  <div className="flex items-start justify-between text-sm gap-4">
                    <div className="flex-1">
                      <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Period</span>
                      <p className="font-medium text-neutral-900 mt-1">{item.start_time} -<br />{item.restoration_time}</p>
                    </div>
                    <div className="text-right flex-1">
                      <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Reason</span>
                      <p className="font-medium text-neutral-900 mt-1">{item.reason}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Show no results message if search yields no data but there is data (mobile only) */}
          {data.length > 0 && filteredData.length === 0 && (
            <div className="text-center py-16 block sm:hidden">
              <p className="text-neutral-600">No results found for your search.</p>
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
                <div className="text-center py-16">
                  <p className="text-neutral-600">No results found for your search.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
} 
