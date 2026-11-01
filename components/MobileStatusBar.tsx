'use client';

import { useState, useCallback, useEffect } from 'react';
import { Download, ChevronDown, ChevronUp, Clock, History, Filter, X } from 'lucide-react';
import { DISTRICT_OPTIONS } from '@/lib/district';
import { DistrictBottomSheet } from '@/components/DistrictSelect';
import { UrgencyFilterChips } from '@/components/UrgencyFilterChips';
import { UrgencyLevel } from '@/lib/utils';
import { PulseDot } from '@/components/ui/PulseDot';

interface MobileStatusBarProps {
  selectedDistrict: string;
  onDistrictChange: (value: string) => void;
  feederCount: number;
  areasCount: number;
  onDownloadPDF: () => void;
  onViewHistory: () => void;
  urgencyCounts: Record<UrgencyLevel, number>;
  urgencyFilter: UrgencyLevel | null;
  onUrgencyFilterChange: (filter: UrgencyLevel | null) => void;
}

const URGENCY_LABEL: Record<UrgencyLevel, string> = { major: 'Major', moderate: 'Moderate', minor: 'Minor' };

export function MobileStatusBar({
  selectedDistrict,
  onDistrictChange,
  feederCount,
  areasCount,
  onDownloadPDF,
  onViewHistory,
  urgencyCounts,
  urgencyFilter,
  onUrgencyFilterChange,
}: MobileStatusBarProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [statsExpanded, setStatsExpanded] = useState(false);

  const currentDistrictName = DISTRICT_OPTIONS.find(d => d.value === selectedDistrict)?.label || 'Faridabad';

  // First-visit nudge
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.localStorage.getItem('dhbvn_seen') === '1') return;
    setShowHint(true);
    const t = setTimeout(() => {
      setShowHint(false);
      window.localStorage.setItem('dhbvn_seen', '1');
    }, 6000);
    return () => clearTimeout(t);
  }, []);

  // Collapse stats when district changes
  useEffect(() => {
    setStatsExpanded(false);
  }, [selectedDistrict]);

  const dismissHint = useCallback(() => {
    if (!showHint) return;
    setShowHint(false);
    if (typeof window !== 'undefined') window.localStorage.setItem('dhbvn_seen', '1');
  }, [showHint]);

  const handleDistrictSelect = useCallback((value: string) => {
    onDistrictChange(value);
    setSheetOpen(false);
  }, [onDistrictChange]);

  return (
    <>
      <div className="sticky top-0 z-40 -mx-4 sm:mx-0 px-4 board-panel border-b border-neutral-800 sm:hidden">
        {/* Row 1: District + actions */}
        <div className="flex items-center justify-between gap-2 py-2.5">
          <button
            onClick={() => { dismissHint(); setSheetOpen(true); }}
            className="relative flex items-center min-w-0 max-w-[60%] group min-h-11"
            aria-label="Select district"
          >
            {showHint && (
              <span className="pointer-events-none absolute -inset-1 rounded-sm border-2 border-primary-400/60 animate-ping" />
            )}
            <div className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-primary-500/10 border border-primary-500/25 transition-all group-hover:border-primary-500/45 group-hover:bg-primary-500/15 min-w-0">
              <span className="electric-text font-display text-base font-bold truncate">
                {currentDistrictName}
              </span>
              <ChevronDown className="w-4 h-4 text-primary-400 flex-shrink-0 transition-transform group-hover:text-primary-300" />
            </div>
          </button>

          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={onViewHistory}
              className="inline-flex items-center justify-center min-h-11 min-w-11 rounded-sm text-neutral-400 hover:text-primary-400 hover:bg-primary-500/10 transition-all"
              aria-label="View outage history"
            >
              <History className="w-4 h-4" />
            </button>
            <button
              onClick={onDownloadPDF}
              className="inline-flex items-center justify-center min-h-11 min-w-11 rounded-sm text-neutral-400 hover:text-primary-400 hover:bg-primary-500/10 transition-all"
              aria-label="Download PDF"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Row 2: Stats + filter entry — only when there are active outages */}
        {feederCount > 0 && (
        <div className="flex items-center justify-between gap-2 pb-2">
          <button
            onClick={() => setStatsExpanded(e => !e)}
            className="flex items-stretch gap-px min-w-0 min-h-9 rounded-sm overflow-hidden border border-neutral-800"
            aria-label={`${feederCount} feeders down, ${areasCount} areas affected — toggle filters`}
          >
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-900/70">
              <PulseDot size="xs" color="error" />
              <span className="font-mono text-sm font-semibold tabular text-foreground">{feederCount}</span>
              <span className="eyebrow text-neutral-500">feeders</span>
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-900/70">
              <Clock className="w-3 h-3 text-neutral-400 flex-shrink-0" />
              <span className="font-mono text-sm font-semibold tabular text-foreground">{areasCount}</span>
              <span className="eyebrow text-neutral-500">areas</span>
            </span>
          </button>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Active-filter pill — visible even when chips are collapsed, so filtering is never silent */}
            {urgencyFilter && (
              <button
                onClick={() => onUrgencyFilterChange(null)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-sm bg-primary-500/10 border border-primary-500/30 text-primary-400 eyebrow min-h-8"
                aria-label={`Clear ${URGENCY_LABEL[urgencyFilter]} filter`}
              >
                {URGENCY_LABEL[urgencyFilter]}
                <X className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={() => setStatsExpanded(e => !e)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-sm text-neutral-400 hover:text-foreground hover:bg-neutral-800/40 transition-all min-h-9"
              aria-label="Toggle urgency filters"
              aria-expanded={statsExpanded}
            >
              <Filter className="w-3.5 h-3.5" />
              <span className="eyebrow">Filter</span>
              {statsExpanded
                ? <ChevronUp className="w-3.5 h-3.5" />
                : <ChevronDown className="w-3.5 h-3.5" />
              }
            </button>
          </div>
        </div>
        )}

        {/* Row 3: Urgency chips — shown when expanded */}
        {statsExpanded && feederCount > 0 && (
          <div className="pb-3 animate-fade-in-up" style={{ animationFillMode: 'both', animationDelay: '50ms' }}>
            <UrgencyFilterChips
              urgencyCounts={urgencyCounts}
              urgencyFilter={urgencyFilter}
              onUrgencyFilterChange={onUrgencyFilterChange}
              size="sm"
            />
          </div>
        )}
      </div>

      <DistrictBottomSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        value={selectedDistrict}
        onChange={handleDistrictSelect}
      />
    </>
  );
}
