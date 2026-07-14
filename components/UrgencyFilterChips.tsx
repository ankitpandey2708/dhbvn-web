'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { AlertTriangle, Timer, CheckCircle2, Info, X } from 'lucide-react';
import { UrgencyLevel } from '@/lib/utils';

interface UrgencyFilterChipsProps {
  urgencyCounts: Record<UrgencyLevel, number>;
  urgencyFilter: UrgencyLevel | null;
  onUrgencyFilterChange: (filter: UrgencyLevel | null) => void;
  size?: 'sm' | 'md';
}

const URGENCY_CHIP: Record<UrgencyLevel, {
  label: string;
  icon: typeof AlertTriangle;
  dotClass: string;
  activeClass: string;
  inactiveClass: string;
}> = {
  major: {
    label: 'Major',
    icon: AlertTriangle,
    dotClass: 'bg-error-500',
    activeClass: 'bg-error-500/15 border-error-500/40 text-error-400',
    inactiveClass: 'bg-neutral-800/40 border-neutral-700/40 text-neutral-500 hover:text-neutral-400',
  },
  moderate: {
    label: 'Moderate',
    icon: Timer,
    dotClass: 'bg-warning-500',
    activeClass: 'bg-warning-500/15 border-warning-500/40 text-warning-400',
    inactiveClass: 'bg-neutral-800/40 border-neutral-700/40 text-neutral-500 hover:text-neutral-400',
  },
  minor: {
    label: 'Minor',
    icon: CheckCircle2,
    dotClass: 'bg-success-500',
    activeClass: 'bg-success-500/15 border-success-500/40 text-success-400',
    inactiveClass: 'bg-neutral-800/40 border-neutral-700/40 text-neutral-500 hover:text-neutral-400',
  },
};

/** Urgency time-range definitions — single source of truth, derived from URGENCY_CHIP for label/color */
const URGENCY_DEFINITION: Record<UrgencyLevel, string> = {
  major: 'Restore >4h',
  moderate: 'Restore 1–4h',
  minor: 'Restore <1h',
};

export function UrgencyFilterChips({
  urgencyCounts,
  urgencyFilter,
  onUrgencyFilterChange,
  size = 'md',
}: UrgencyFilterChipsProps) {
  const isSm = size === 'sm';
  const [legendOpen, setLegendOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});

  // Calculate mobile popover position relative to viewport (fixed positioning)
  const updatePopoverPosition = useCallback(() => {
    if (!isSm || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setPopoverStyle({
      position: 'fixed',
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    });
  }, [isSm]);

  // Open popover and calculate position
  const handleToggle = useCallback(() => {
    setLegendOpen(o => !o);
    updatePopoverPosition();
  }, [updatePopoverPosition]);

  // Close popover on outside click or Escape key
  useEffect(() => {
    if (!legendOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setLegendOpen(false);
      }
    };
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLegendOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onEscape);
    };
  }, [legendOpen]);

  return (
    <div className="flex items-center gap-2">
      {/* Scrollable chip row — overflow container does NOT contain the popover */}
      <div className={`flex items-center gap-2 ${isSm ? 'flex-1 min-w-0 overflow-x-auto scrollbar-none' : ''}`}>
        {/* Urgency chips */}
        {(Object.keys(URGENCY_CHIP) as UrgencyLevel[]).map((level) => {
          const chip = URGENCY_CHIP[level];
          const count = urgencyCounts[level];
          const Icon = chip.icon;
          const isActive = urgencyFilter === level;

          return (
            <button
              key={level}
              onClick={() => onUrgencyFilterChange(isActive ? null : level)}
              className={`
                shrink-0 inline-flex items-center gap-1.5
                ${isSm ? 'text-xs px-3 py-2 min-h-9' : 'text-sm px-3.5 py-2 min-h-10'}
                font-semibold uppercase tracking-[0.12em] rounded-sm border transition-all
                ${isActive ? chip.activeClass : chip.inactiveClass}
              `}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? chip.dotClass : 'bg-neutral-600'}`} />
              <Icon className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
              {chip.label}
              <span className="font-mono text-[11px]">{count}</span>
            </button>
          );
        })}

        {/* Clear filter × button — only visible when a filter is active */}
        {urgencyFilter !== null && (
          <button
            onClick={() => onUrgencyFilterChange(null)}
            className={`
              shrink-0 inline-flex items-center justify-center
              ${isSm ? 'w-9 h-9' : 'w-10 h-10'}
              rounded-sm border border-neutral-700/40 bg-neutral-800/40
              text-neutral-500 hover:text-foreground hover:bg-neutral-700/50 hover:border-neutral-600/50
              transition-all
            `}
            aria-label="Clear filter — show all"
          >
            <X className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          </button>
        )}
      </div>

      {/* Info popover trigger — outside scroll container so popover isn't clipped */}
      <div className="relative shrink-0" ref={popoverRef}>
        <button
          ref={buttonRef}
          onClick={handleToggle}
          className={`inline-flex items-center justify-center min-h-9 min-w-9 p-2 rounded-sm text-neutral-600 hover:text-neutral-400 hover:bg-neutral-800/40 transition-all ${legendOpen ? 'text-neutral-400 bg-neutral-800/40' : ''}`}
          aria-label="Urgency definitions"
        >
          <Info className={isSm ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        </button>

        {legendOpen && (
          <div
            className={`
              ${isSm ? '' : 'absolute top-full mt-2 right-0'}
              z-50
              rounded-sm board-panel shadow-xl shadow-black/50
              ${isSm ? 'min-w-[170px]' : 'min-w-[210px]'}
              max-w-[calc(100vw-2rem)]
              animate-board-in
            `}
            style={isSm
              ? { ...popoverStyle, transformOrigin: 'top', animationFillMode: 'both' }
              : { transformOrigin: 'top right', animationFillMode: 'both' }}
          >
            <div className="p-3 space-y-2">
              {(Object.keys(URGENCY_CHIP) as UrgencyLevel[]).map((level) => {
                const chip = URGENCY_CHIP[level];
                return (
                  <div key={level} className="flex items-center gap-2.5">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${chip.dotClass}`} />
                    <span className="text-xs font-semibold text-foreground">{chip.label}</span>
                    <span className="text-[11px] text-neutral-500 ml-auto">{URGENCY_DEFINITION[level]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
