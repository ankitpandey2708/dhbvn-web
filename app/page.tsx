// DHBVN Power Outage Tracker - Electro-Industrial Dashboard
'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef, Row } from '@tanstack/react-table';
import { format } from 'date-fns';
import { OutageLoadingSkeleton } from '@/components/ui/skeleton';
import Script from 'next/script';
import { Zap, Clock, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';

import { DHBVNData } from '@/lib/dhbvn-api';
import { DISTRICTS as DB_DISTRICTS } from '@/lib/database/subscriptions';
import { DistrictSelect } from '@/components/DistrictSelect';
import { SearchAndDownloadControls } from '@/components/SearchAndDownloadControls';
import { generateOutagePDF } from '@/lib/pdf-generator';
import { parseOutageDate, filterByAreaAndFeeder } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Table columns with monospace data formatting
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
      return (
        <span className="font-mono text-sm">
          {date ? format(date, 'dd-MMM-yyyy HH:mm') : value}
        </span>
      );
    },
  },
  {
    accessorKey: 'restoration_time',
    header: 'Expected Restoration',
    cell: ({ row }: { row: Row<DHBVNData> }) => {
      const value = row.getValue('restoration_time') as string;
      const date = parseOutageDate(value);
      return (
        <span className="font-mono text-sm">
          {date ? format(date, 'dd-MMM-yyyy HH:mm') : value}
        </span>
      );
    },
  },
  {
    accessorKey: 'reason',
    header: 'Reason',
  },
];

// District mapping
const DISTRICTS = DB_DISTRICTS.map(d => ({
  value: d.id.toString(),
  label: d.name
}));

export default function Home(): React.ReactElement {
  const [selectedDistrict, setSelectedDistrict] = useState('10');
  const [data, setData] = useState<DHBVNData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const currentDistrictName = DISTRICTS.find(d => d.value === selectedDistrict)?.label || 'Faridabad';

  // Fetch outage data
  useEffect(() => {
    const fetchData = async () => {
      if (process.env.NODE_ENV !== 'production') {
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
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [selectedDistrict]);

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
      title: `${currentDistrictName} Power Outage Information`,
    });
  };

  // Structured data for SEO
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
      keywords: `${currentDistrictName} power outage, ${currentDistrictName} electricity outage, power cut ${currentDistrictName}, ${currentDistrictName} electricity status`,
      temporal: 'Real-time data, updated every 5 minutes',
      spatialCoverage: `${currentDistrictName}, Haryana, India`,
      publisher: {
        '@type': 'Organization',
        name: 'DHBVN Information Portal',
        url: 'https://dhbvn.vercel.app'
      }
    }
  };

  if (loading) {
    return <OutageLoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl glass mb-6">
            <AlertCircle className="w-10 h-10 text-error-500" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3 tracking-tight">
            Connection Error
          </h2>
          <p className="text-neutral-400 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>
            <Zap className="w-4 h-4 mr-2" />
            Retry Connection
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script id="structured-data" type="application/ld+json">
        {JSON.stringify(structuredData)}
      </Script>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative">
        {/* Hero Section */}
        <header className="mb-8 sm:mb-12 animate-fade-in-up">
          {/* Live Status Badge */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-medium text-primary-400 uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
              Live Data
            </div>
            <span className="text-neutral-500 text-sm">
              Auto-refresh every 5 min
            </span>
          </div>

          {/* Title with District Selector */}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              <DistrictSelect
                value={selectedDistrict}
                onChange={setSelectedDistrict}
              />
              <span className="text-foreground">Power Outages</span>
            </h1>
            <p className="text-neutral-400 text-lg max-w-2xl">
              Real-time outage tracking powered by DHBVN data
            </p>
          </div>

          {/* Stats Row */}
          {data.length > 0 && (
            <div className="flex flex-wrap gap-4 mt-8 stagger-2" style={{ animationFillMode: 'both' }}>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl glass">
                <div className="p-2 rounded-lg bg-error-500/10">
                  <Zap className="w-5 h-5 text-error-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground font-mono">{data.length}</p>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider">Active Outages</p>
                </div>
              </div>

              <div className="flex items-center gap-3 px-4 py-3 rounded-xl glass">
                <div className="p-2 rounded-lg bg-primary-500/10">
                  <MapPin className="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground font-mono">
                    {new Set(data.map(d => d.area)).size}
                  </p>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider">Areas Affected</p>
                </div>
              </div>

              <div className="flex items-center gap-3 px-4 py-3 rounded-xl glass">
                <div className="p-2 rounded-lg bg-accent-500/10">
                  <Clock className="w-5 h-5 text-accent-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground font-mono">
                    {new Set(data.map(d => d.feeder)).size}
                  </p>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider">Feeders</p>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* No Outages State */}
        {data.length === 0 && (
          <div className="text-center py-24 px-6 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl glass mb-8">
              <CheckCircle2 className="w-12 h-12 text-success-500" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">All Systems Operational</h2>
            <p className="text-neutral-400 max-w-md mx-auto">
              No power outages currently reported by DHBVN for {currentDistrictName}
            </p>
          </div>
        )}

        {/* Mobile Search Controls */}
        {data.length > 0 && (
          <SearchAndDownloadControls
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            handleDownloadPDF={handleDownloadPDF}
            searchInputRef={searchInputRef}
            className="block sm:hidden mb-6"
          />
        )}

        {/* Mobile Card Layout */}
        {filteredData.length > 0 && (
          <div className="flex flex-col gap-4 sm:hidden">
            {filteredData.map((item, idx) => (
              <article
                key={idx}
                className="rounded-xl glass p-5 transition-all duration-300 hover:border-primary-500/30 animate-fade-in-up"
                style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'both' }}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary-500/10">
                      <MapPin className="w-4 h-4 text-primary-500" />
                    </div>
                    <span className="font-semibold text-foreground">{item.area}</span>
                  </div>
                  <span className="font-mono text-sm text-primary-400 px-2.5 py-1 rounded-lg bg-primary-500/10">
                    {item.feeder}
                  </span>
                </div>

                {/* Time Information */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Started</p>
                    <p className="font-mono text-sm text-foreground">{item.start_time}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Est. Restore</p>
                    <p className="font-mono text-sm text-foreground">{item.restoration_time}</p>
                  </div>
                </div>

                {/* Reason */}
                <div className="pt-3 border-t border-neutral-800">
                  <span className="inline-flex items-center gap-1.5 text-sm text-neutral-400">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {item.reason}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Mobile No Results */}
        {data.length > 0 && filteredData.length === 0 && (
          <div className="text-center py-16 sm:hidden">
            <p className="text-neutral-500">No results match your search</p>
          </div>
        )}

        {/* Desktop Layout */}
        <div className="hidden sm:block">
          {data.length > 0 && (
            <SearchAndDownloadControls
              globalFilter={globalFilter}
              setGlobalFilter={setGlobalFilter}
              handleDownloadPDF={handleDownloadPDF}
              searchInputRef={searchInputRef}
              className="mb-6"
            />
          )}

          {filteredData.length > 0 && (
            <div className="animate-fade-in-up stagger-3" style={{ animationFillMode: 'both' }}>
              <DataTable columns={columns} data={filteredData} />
            </div>
          )}

          {data.length > 0 && filteredData.length === 0 && (
            <div className="text-center py-16">
              <p className="text-neutral-500">No results match your search</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-neutral-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-neutral-500">
            <p>
              Data sourced from{' '}
              <a
                href="https://dhbvn.org.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-400 hover:text-primary-300 transition-colors"
              >
                DHBVN
              </a>
              . Not affiliated with or endorsed by DHBVN.
            </p>
            <a
              href="https://github.com/ankitpandey2708/dhbvn-web"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-neutral-400 hover:text-primary-400 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
          </div>
        </footer>
      </main>
    </>
  );
}
