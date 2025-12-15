// This is a Next.js client component for displaying power outage information for Faridabad
'use client';

// Import necessary React hooks and UI components
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef, Row } from '@tanstack/react-table';
import { format } from 'date-fns';
import { OutageLoadingSkeleton } from '@/components/ui/skeleton';
import Script from 'next/script';

import { DHBVNData } from '@/lib/dhbvn-api';
import { DISTRICTS as DB_DISTRICTS } from '@/lib/database/subscriptions';
import { DistrictSelect } from '@/components/DistrictSelect';
import { SearchAndDownloadControls } from '@/components/SearchAndDownloadControls';
import { generateOutagePDF } from '@/lib/pdf-generator';
import { parseOutageDate, filterByAreaAndFeeder } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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
      const value = row.getValue('start_time') as string;
      const date = parseOutageDate(value);
      return date ? format(date, 'PPpp') : value;
    },
  },
  {
    accessorKey: 'restoration_time',
    header: 'Expected Restoration',
    cell: ({ row }: { row: Row<DHBVNData> }) => {
      const value = row.getValue('restoration_time') as string;
      const date = parseOutageDate(value);
      return date ? format(date, 'PPpp') : value;
    },
  },
  {
    accessorKey: 'reason',
    header: 'Reason',
  },
];

// District mapping for dropdown
const DISTRICTS = DB_DISTRICTS.map(d => ({
  value: d.id.toString(),
  label: d.name
}));

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
      // NOTE: Remove development dummy data in real production build if API is always available
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
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
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
          {/* Page Title with District Selector */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-bold text-neutral-950 tracking-tight">
              <DistrictSelect
                value={selectedDistrict}
                onChange={setSelectedDistrict}
              />
              Power Outage Information
            </h1>
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
