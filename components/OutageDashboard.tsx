'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { CheckCircle2, AlertCircle, Download, History, Zap, MapPin } from 'lucide-react';

import { DHBVNData } from '@/lib/dhbvn-api';
import { DISTRICT_OPTIONS } from '@/lib/district';
import { DistrictSelect } from '@/components/DistrictSelect';
import { MobileStatusBar } from '@/components/MobileStatusBar';
import { UrgencyFilterChips } from '@/components/UrgencyFilterChips';
import { BrowseTab } from '@/components/BrowseTab';
import { getUrgencyLevel, UrgencyLevel } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PulseDot } from '@/components/ui/PulseDot';
import { routeForDistrictId } from '@/lib/district-slug';
import { useRemoteData } from '@/lib/use-remote-data';

const FEED_REFRESH_MS = 5 * 60 * 1000;
const NO_OUTAGES: DHBVNData[] = [];

/**
 * What the live board is showing. Exposed as `data-feed-phase` on <main> for tests/agents.
 * loading → (error | clear | active); clear ⇄ active on each 5-min poll.
 */
type FeedPhase = 'loading' | 'error' | 'clear' | 'active';

interface OutageDashboardProps {
  initialDistrictId?: string;
}

export default function OutageDashboard({ initialDistrictId = '10' }: OutageDashboardProps): React.ReactElement {
  const router = useRouter();
  const [selectedDistrict, setSelectedDistrict] = useState(initialDistrictId);

  useEffect(() => {
    setSelectedDistrict(initialDistrictId);
  }, [initialDistrictId]);

  const handleDistrictChange = useCallback((id: string) => {
    setSelectedDistrict(id);
    const route = routeForDistrictId(Number(id));
    router.push(route);
  }, [router]);

  const historyRoute = (() => {
    const r = routeForDistrictId(Number(selectedDistrict));
    return r === '/' ? '/history' : `${r}/history`;
  })();

  const handleViewHistory = useCallback(() => {
    router.push(historyRoute);
  }, [router, historyRoute]);
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyLevel | null>(null);

  const currentDistrictName = DISTRICT_OPTIONS.find(d => d.value === selectedDistrict)?.label || 'Faridabad';

  // Live feed state machine — see lib/use-remote-data.ts. Polls every 5 min while visible.
  const [feed, retryFeed] = useRemoteData<DHBVNData[]>(
    `/api/dhbvn?district=${selectedDistrict}`,
    { refreshMs: FEED_REFRESH_MS },
  );
  const feedData = feed.status === 'loading' ? undefined : feed.data;
  const data = Array.isArray(feedData) ? feedData : NO_OUTAGES;
  const phase: FeedPhase =
    feed.status === 'loading' ? 'loading'
      : feed.status === 'error' && feedData === undefined ? 'error'
        : data.length === 0 ? 'clear' : 'active';
  const loading = phase === 'loading';
  const isClear = phase === 'clear';
  const error = phase === 'error' && feed.status === 'error' ? feed.error : null;
  // A background refresh failed but we still have this district's last good data.
  const staleError = phase !== 'error' && feed.status === 'error' ? feed.error : null;
  const updatedAt = feed.status === 'loading' ? undefined : feed.updatedAt;

  useEffect(() => {
    setUrgencyFilter(null);
  }, [selectedDistrict]);

  const urgencyCounts = useMemo(() => {
    const counts: Record<UrgencyLevel, number> = { major: 0, moderate: 0, minor: 0 };
    for (const item of data) counts[getUrgencyLevel(item.restoration_time)]++;
    return counts;
  }, [data]);

  const feederCount = data.length;
  const areasCount = useMemo(() => data.reduce((sum, d) => sum + d.areas.length, 0), [data]);

  const handleDownloadPDF = async () => {
    const { generateOutagePDF } = await import('@/lib/pdf-generator');
    generateOutagePDF({
      columns: [
        { header: 'Feeder' },
        { header: 'Areas Affected' },
        { header: 'Start Time' },
        { header: 'Expected Restoration' },
        { header: 'Reason' },
      ],
      data: data.map(row => [
        row.feeder,
        row.areas.join(', '),
        row.start_time,
        row.restoration_time,
        row.reason,
      ]),
      title: `${currentDistrictName} Power Outage Information`,
    });
  };

  return (
    <main
      className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-9 lg:py-12 relative"
      data-feed-phase={phase}
      aria-busy={loading}
    >

      {/* ═══ MOBILE (< sm) ═══ */}
      <MobileStatusBar
        selectedDistrict={selectedDistrict}
        onDistrictChange={handleDistrictChange}
        feederCount={feederCount}
        areasCount={areasCount}
        onDownloadPDF={handleDownloadPDF}
        onViewHistory={handleViewHistory}
        urgencyCounts={urgencyCounts}
        urgencyFilter={urgencyFilter}
        onUrgencyFilterChange={setUrgencyFilter}
      />

      <div className="sm:hidden mt-4">
        {error ? (
          <div className="text-center py-12 px-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-sm board-panel mb-4">
              <AlertCircle className="w-7 h-7 text-error-500" />
            </div>
            <p className="text-neutral-400 text-sm mb-4">{error}</p>
            <Button onClick={retryFeed} size="sm">Retry</Button>
          </div>
        ) : (
          isClear && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-sm board-panel w-full mb-4 animate-fade-in-up">
              <CheckCircle2 className="w-5 h-5 text-success-500 shrink-0" />
              <p className="text-sm text-neutral-300">
                <span className="text-success-500 font-semibold">All clear</span>
                <span className="text-neutral-500"> — no active outages in {currentDistrictName}</span>
              </p>
            </div>
          )
        )}
      </div>

      {/* ═══ DESKTOP (>= sm) ═══ */}
      <div className="hidden sm:block">
        <header className="mb-9 lg:mb-11 animate-fade-in-up relative">
          {/* Signal strip — eyebrow + actions */}
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-7">
            <div className="flex items-center gap-2.5 eyebrow text-primary-500">
              <span className="animate-flicker inline-flex items-center gap-2.5">
                <PulseDot size="sm" color="primary" />
                Live signal
              </span>
              <span className="text-neutral-700">/</span>
              <span className="text-neutral-500">DHBVN feed</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleViewHistory}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm eyebrow text-neutral-400 hover:text-primary-400 hover:bg-primary-500/10 transition-all"
                aria-label="View outage history"
              >
                <History className="w-3.5 h-3.5" />
                History
              </button>
              <button
                onClick={handleDownloadPDF}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm eyebrow text-neutral-400 hover:text-primary-400 hover:bg-primary-500/10 transition-all"
                aria-label="Export PDF"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
            </div>
          </div>

          {/* Marquee — district name as a board headline */}
          <div className="flex items-end gap-2">
            <MapPin className="w-6 h-6 lg:w-7 lg:h-7 text-neutral-600 mb-1.5 lg:mb-2 shrink-0" />
            <div className="text-4xl lg:text-5xl font-display font-bold tracking-tight leading-none">
              <DistrictSelect value={selectedDistrict} onChange={handleDistrictChange} />
            </div>
          </div>
          <p className="text-neutral-500 text-sm mt-3 max-w-2xl">
            Power outage status board · feeders, affected areas &amp; restoration windows · refreshed every 5&nbsp;minutes
            {updatedAt !== undefined && (
              <span className="text-neutral-600"> · updated {format(updatedAt, 'HH:mm')}</span>
            )}
          </p>

          {/* Status console — a control-room readout strip */}
          {!error && (
            <div
              className="mt-7 board-panel rounded-sm grid grid-cols-3 divide-x divide-neutral-800 stagger-2 animate-fade-in-up"
              style={{ animationFillMode: 'both' }}
            >
              {/* Overall status */}
              <div className="px-5 py-4">
                <p className="eyebrow text-neutral-500 mb-2">Status</p>
                <div className="flex items-center gap-2.5">
                  {isClear ? (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-success-500 shadow-[0_0_10px_-1px] shadow-success-500" />
                      <span className="text-xl font-display font-bold text-success-500 leading-none">ALL CLEAR</span>
                    </>
                  ) : (
                    <>
                      <PulseDot size="md" color="error" />
                      <span className="text-xl font-display font-bold text-primary-400 leading-none">
                        {loading ? '———' : 'ACTIVE'}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Feeders down */}
              <div className="px-5 py-4">
                <p className="eyebrow text-neutral-500 mb-2">Feeders down</p>
                <p className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-mono font-semibold tabular text-foreground leading-none">
                    {loading ? '··' : feederCount}
                  </span>
                  <Zap className="w-4 h-4 text-error-500 mb-0.5" />
                </p>
              </div>

              {/* Areas affected */}
              <div className="px-5 py-4">
                <p className="eyebrow text-neutral-500 mb-2">Areas affected</p>
                <p className="text-3xl font-mono font-semibold tabular text-foreground leading-none">
                  {loading ? '··' : areasCount}
                </p>
              </div>
            </div>
          )}

          {feederCount > 0 && !error && (
            <div className="mt-5">
              <UrgencyFilterChips
                urgencyCounts={urgencyCounts}
                urgencyFilter={urgencyFilter}
                onUrgencyFilterChange={setUrgencyFilter}
                size="md"
              />
            </div>
          )}
        </header>

        {error && (
          <div className="text-center py-16 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-sm board-panel mb-5">
              <AlertCircle className="w-8 h-8 text-error-500" />
            </div>
            <p className="text-neutral-400 mb-6 max-w-md mx-auto">{error}</p>
            <Button onClick={retryFeed}>Retry</Button>
          </div>
        )}

      </div>

      {!error && (
        <div className="pb-20 sm:pb-0 animate-fade-in-up stagger-3 min-h-screen" style={{ animationFillMode: 'both' }}>
          {staleError && updatedAt !== undefined && (
            <div role="status" className="flex items-center justify-between gap-3 px-4 py-2.5 mb-3 rounded-sm board-panel text-sm">
              <span className="flex items-center gap-2 text-neutral-400 min-w-0">
                <AlertCircle className="w-4 h-4 text-error-500 shrink-0" />
                <span className="truncate">Couldn&apos;t refresh — showing data from {format(updatedAt, 'HH:mm')}</span>
              </span>
              <Button onClick={retryFeed} size="sm">Retry</Button>
            </div>
          )}
          <BrowseTab
            liveData={data}
            liveReady={!loading}
            selectedDistrict={selectedDistrict}
            urgencyFilter={urgencyFilter}
          />
        </div>
      )}

      <footer className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-neutral-800 pb-20 sm:pb-0">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 eyebrow text-neutral-600">
          <p className="normal-case tracking-normal text-sm">
            Data sourced from{' '}
            <a href="https://dhbvn.org.in" target="_blank" rel="noopener noreferrer"
              className="text-primary-400 hover:text-primary-300 transition-colors">
              DHBVN
            </a>
            . Not affiliated with or endorsed by DHBVN.
          </p>
          <p className="text-neutral-700">District Signal · Haryana</p>
        </div>
      </footer>
    </main>
  );
}
