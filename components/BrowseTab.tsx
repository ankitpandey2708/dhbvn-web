'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ChevronDown, ChevronRight, Search, X } from 'lucide-react';
import { DHBVNData } from '@/lib/dhbvn-api';
import { DISTRICTS } from '@/lib/district';
import { format } from 'date-fns';
import { normalizeFeederName, stripFeederSuffix, getUrgencyLevel, getUrgencyColor, parseOutageDate, UrgencyLevel } from '@/lib/utils';
import { PulseDot } from '@/components/ui/PulseDot';

interface FeederEntry {
  division: string;
  sub_division: string;
  ss_name: string;
  feeder_name: string;
  cin_14: string;
}

// Module-level cache: circle name (lowercase) → fetched entries
const circleCache = new Map<string, Promise<FeederEntry[]>>();

function circleToPath(circle: string): string {
  return `/data/feeders/${circle.toLowerCase()}.json`;
}

function fetchCircle(circle: string): Promise<FeederEntry[]> {
  const key = circle.toLowerCase();
  if (circleCache.has(key)) return circleCache.get(key)!;
  const promise = fetch(circleToPath(circle))
    .then(res => res.ok ? res.json() as Promise<FeederEntry[]> : [])
    .catch(() => [] as FeederEntry[]);
  circleCache.set(key, promise);
  return promise;
}

interface Props {
  liveData: DHBVNData[];
  selectedDistrict: string;
  urgencyFilter?: UrgencyLevel | null;
}

const TH = 'text-left px-4 py-2.5 text-[11px] font-semibold text-neutral-500 uppercase tracking-[0.12em]';

// Cap rows rendered per expanded division to keep the DOM light on large catalogs.
// Active feeders are sorted first, so the cap only ever hides inactive catalog entries.
const COLLAPSED_LIMIT = 30;

function FeederTableHead() {
  return (
    <thead>
      <tr className="border-b border-neutral-800/50">
        <th className={`${TH} w-[22%]`}>Feeder</th>
        <th className={`${TH} w-[30%]`}>Areas Affected</th>
        <th className={`${TH} w-[14%]`}>Start Time</th>
        <th className={`${TH} w-[16%]`}>Expected Restoration</th>
        <th className={TH}>Reason</th>
      </tr>
    </thead>
  );
}

export function BrowseTab({ liveData, selectedDistrict, urgencyFilter }: Props) {
  const [districtFeeders, setDistrictFeeders] = useState<FeederEntry[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [expandedDivisions, setExpandedDivisions] = useState<Set<string>>(new Set());
  const [initialized, setInitialized] = useState(false);
  const [search, setSearch] = useState('');
  const [fullDivisions, setFullDivisions] = useState<Set<string>>(new Set());
  const searchRef = useRef<HTMLInputElement>(null);

  const districtCircles = useMemo(() => {
    const district = DISTRICTS.find(d => String(d.id) === selectedDistrict);
    if (!district) return null;
    // circles absent → default to [district name]; circles null → no CIN data
    if ('circles' in district) {
      if (!district.circles) return null;
      return district.circles as string[];
    }
    return [district.name];
  }, [selectedDistrict]);

  // Fetch only the circles needed for this district, using module-level cache
  useEffect(() => {
    setInitialized(false);
    setExpandedDivisions(new Set());
    setDistrictFeeders([]);
    setFullDivisions(new Set());
    setSearch('');

    if (!districtCircles) {
      setCatalogLoading(false);
      return;
    }

    setCatalogLoading(true);
    Promise.all(districtCircles.map(fetchCircle))
      .then(results => setDistrictFeeders(results.flat()))
      .catch(() => { })
      .finally(() => setCatalogLoading(false));
  }, [districtCircles]);

  // Build lookup: normalized live feeder name → DHBVNData
  const liveIndex = useMemo(() => {
    const map = new Map<string, DHBVNData>();
    for (const item of liveData) {
      const norm = normalizeFeederName(item.feeder);
      map.set(norm, item);
      const stripped = stripFeederSuffix(norm);
      if (stripped !== norm) map.set(stripped, item);
    }
    return map;
  }, [liveData]);

  const getLive = useCallback((feederName: string): DHBVNData | undefined => {
    const norm = normalizeFeederName(feederName);
    return liveIndex.get(norm) ?? liveIndex.get(stripFeederSuffix(norm));
  }, [liveIndex]);

  // Find feeder names that appear more than once in the same division
  const ambiguous = useMemo(() => {
    const seen = new Map<string, number>();
    for (const f of districtFeeders) {
      const key = `${f.division}::${f.feeder_name}`;
      seen.set(key, (seen.get(key) ?? 0) + 1);
    }
    const set = new Set<string>();
    for (const [key, count] of seen) {
      if (count > 1) set.add(key);
    }
    return set;
  }, [districtFeeders]);

  const { grouped, unmatched } = useMemo(() => {
    const q = search.trim().toLowerCase();
    const matchedKeys = new Set<string>();

    const map = new Map<string, FeederEntry[]>();
    for (const f of districtFeeders) {
      const live = getLive(f.feeder_name);
      if (live) matchedKeys.add(normalizeFeederName(live.feeder));

      if (q) {
        const matchesFeeder = f.feeder_name.toLowerCase().includes(q);
        const matchesArea = live?.areas.some(a => a.toLowerCase().includes(q)) ?? false;
        if (!matchesFeeder && !matchesArea) continue;
      }

      // Urgency filter: only hides non-matching active feeders; inactive always shown
      if (urgencyFilter && live) {
        if (getUrgencyLevel(live.restoration_time) !== urgencyFilter) continue;
      }
      if (!map.has(f.division)) map.set(f.division, []);
      map.get(f.division)!.push(f);
    }

    const grouped = [...map.entries()]
      .map(([division, feeders]) => {
        const activeCount = new Set(feeders.map(f => getLive(f.feeder_name)?.feeder).filter(Boolean)).size;
        const sorted = [...feeders].sort((a, b) => {
          const aActive = getLive(a.feeder_name) ? 1 : 0;
          const bActive = getLive(b.feeder_name) ? 1 : 0;
          if (aActive !== bActive) return bActive - aActive;
          return a.feeder_name.localeCompare(b.feeder_name);
        });
        return { division, feeders: sorted, activeCount };
      })
      .sort((a, b) => b.activeCount - a.activeCount || a.division.localeCompare(b.division));

    // Live feeders with no CIN catalog match
    const unmatched = liveData.filter(item => {
      if (matchedKeys.has(normalizeFeederName(item.feeder))) return false;
      if (q) {
        return item.feeder.toLowerCase().includes(q) ||
          item.areas.some(a => a.toLowerCase().includes(q));
      }
      return true;
    });

    return { grouped, unmatched };
  }, [districtFeeders, getLive, liveData, search, urgencyFilter]);

  // Auto-expand divisions with active outages on first load
  useEffect(() => {
    if (!initialized && grouped.length > 0) {
      const withActive = grouped.filter(g => g.activeCount > 0).map(g => g.division);
      if (unmatched.length > 0) withActive.push('__unmatched__');
      setExpandedDivisions(new Set(withActive));
      setInitialized(true);
    }
  }, [grouped, unmatched, initialized]);

  const toggleDivision = (division: string) => {
    setExpandedDivisions(prev => {
      const next = new Set(prev);
      if (next.has(division)) next.delete(division);
      else next.add(division);
      return next;
    });
  };

  if (catalogLoading) {
    return (
      <div className="py-16 flex flex-col items-center gap-3 text-neutral-500">
        <span className="animate-flicker eyebrow text-primary-500">Loading feeder catalog</span>
        <span className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <span key={i} className="w-1.5 h-1.5 rounded-full bg-primary-500/60 animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
          ))}
        </span>
      </div>
    );
  }



  const isSearching = search.trim().length > 0;

  return (
    <div className="flex flex-col gap-3">
      {/* Search box */}
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-primary-500 transition-colors pointer-events-none" />
        <input
          ref={searchRef}
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search feeder or area in your division…"
          className="w-full pl-9 pr-8 py-2.5 rounded-sm bg-neutral-900/70 border border-neutral-800 text-sm text-foreground placeholder:text-neutral-600 focus:outline-none focus:border-primary-500/60 focus:bg-neutral-900 transition-colors"
        />
        {isSearching && (
          <button
            onClick={() => { setSearch(''); searchRef.current?.focus(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-primary-400 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isSearching && grouped.length === 0 && (
        <p className="text-center text-neutral-500 text-sm py-8 font-mono">No feeders match &ldquo;{search}&rdquo;</p>
      )}

      {grouped.map(({ division, feeders, activeCount }) => {
        const isExpanded = isSearching || expandedDivisions.has(division);
        const showAll = isSearching || fullDivisions.has(division);
        const visibleFeeders = showAll ? feeders : feeders.slice(0, COLLAPSED_LIMIT);
        const hiddenCount = feeders.length - visibleFeeders.length;

        return (
          <div key={division} className="rounded-sm board-panel overflow-hidden">
            <button
              onClick={() => toggleDivision(division)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-neutral-800/40 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                {isExpanded
                  ? <ChevronDown className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                  : <ChevronRight className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                }
                <span className="font-display font-semibold text-foreground text-sm tracking-wide truncate">{division}</span>
              </div>
              {activeCount > 0 && (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-error-500/12 border border-error-500/25 text-error-400 text-xs font-mono font-semibold tabular flex-shrink-0 ml-2">
                  <PulseDot size="xs" color="error" />
                  {activeCount}
                </span>
              )}
            </button>

            {isExpanded && (
              <div className="sm:hidden border-t border-neutral-800/50 divide-y divide-neutral-800/20">
                {visibleFeeders.map(f => {
                  const live = getLive(f.feeder_name);
                  const isAmbig = ambiguous.has(`${f.division}::${f.feeder_name}`);
                  const urgency = live ? getUrgencyLevel(live.restoration_time) : null;
                  const colors = urgency ? getUrgencyColor(urgency) : null;

                  const startDate = live ? parseOutageDate(live.start_time) : null;
                  const restoreDate = live ? parseOutageDate(live.restoration_time) : null;

                  return (
                    <div key={f.cin_14} className="px-4 py-2.5">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span className={`mt-1.5 flex-shrink-0 w-2 h-2 rounded-full ${live ? (colors?.dot ?? 'bg-error-500') : 'bg-neutral-700'}`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-foreground font-mono">
                            {f.feeder_name}
                            {isAmbig && (
                              <span className="text-xs text-neutral-500 ml-1.5">· {f.ss_name}</span>
                            )}
                          </p>
                          {live && (
                            <>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {live.areas.map(area => (
                                  <span key={area} className="font-mono text-[11px] text-neutral-300 bg-neutral-800/70 border border-neutral-800 px-1.5 py-0.5 rounded-sm">
                                    {area}
                                  </span>
                                ))}
                              </div>
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                <div>
                                  <p className="eyebrow text-neutral-500">Started</p>
                                  <p className="font-mono text-xs text-neutral-300">
                                    {startDate ? format(startDate, 'dd-MMM HH:mm') : live.start_time}
                                  </p>
                                </div>
                                <div>
                                  <p className="eyebrow text-neutral-500">Est. Restore</p>
                                  <p className={`font-mono text-xs ${colors?.text ?? 'text-neutral-300'}`}>
                                    {restoreDate ? format(restoreDate, 'dd-MMM HH:mm') : live.restoration_time}
                                  </p>
                                </div>
                              </div>
                              {live.reason && (
                                <p className="mt-1.5 text-xs text-neutral-500 line-clamp-2">{live.reason}</p>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {hiddenCount > 0 && (
                  <button
                    onClick={() => setFullDivisions(prev => new Set(prev).add(division))}
                    className="w-full px-4 py-3 text-xs font-medium text-primary-400 hover:bg-neutral-800/30 transition-colors"
                  >
                    Show all {feeders.length} feeders · {hiddenCount} more
                  </button>
                )}
              </div>
            )}

            {isExpanded && (
              <div className="hidden sm:block border-t border-neutral-800/50 overflow-x-auto">
                <table className="w-full text-sm">
                  <FeederTableHead />
                  <tbody className="divide-y divide-neutral-800/20">
                    {visibleFeeders.map(f => {
                      const live = getLive(f.feeder_name);
                      const isAmbig = ambiguous.has(`${f.division}::${f.feeder_name}`);
                      const urgency = live ? getUrgencyLevel(live.restoration_time) : null;
                      const colors = urgency ? getUrgencyColor(urgency) : null;

                      return (
                        <tr key={f.cin_14} className={`transition-colors ${live ? 'hover:bg-neutral-800/20' : 'opacity-40 hover:opacity-60'}`}>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <span className={`flex-shrink-0 w-2 h-2 rounded-full ${live ? (colors?.dot ?? 'bg-error-500') : 'bg-neutral-700'}`} />
                              <span className="text-foreground font-mono text-[13px]">
                                {f.feeder_name}
                                {isAmbig && <span className="text-xs text-neutral-500 ml-1">· {f.ss_name}</span>}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5">
                            {live ? (
                              <div className="flex flex-wrap gap-1">
                                {live.areas.map(area => (
                                  <span key={area} className="font-mono text-[11px] text-neutral-300 bg-neutral-800/70 border border-neutral-800 px-1.5 py-0.5 rounded-sm">
                                    {area}
                                  </span>
                                ))}
                              </div>
                            ) : <span className="text-neutral-600">—</span>}
                          </td>
                          <td className="px-4 py-2.5 text-neutral-400 font-mono text-xs">
                            {live ? live.start_time : <span className="text-neutral-600">—</span>}
                          </td>
                          <td className="px-4 py-2.5 font-mono text-xs">
                            {live ? (() => {
                              const d = parseOutageDate(live.restoration_time);
                              const label = d ? format(d, 'dd-MMM-yyyy HH:mm') : live.restoration_time;
                              return <span className={colors?.text ?? 'text-neutral-400'}>{label}</span>;
                            })() : <span className="text-neutral-600">—</span>}
                          </td>
                          <td className="px-4 py-2.5 text-neutral-400 text-xs max-w-[200px] truncate">
                            {live?.reason || <span className="text-neutral-600">—</span>}
                          </td>
                        </tr>
                      );
                    })}
                    {hiddenCount > 0 && (
                      <tr>
                        <td colSpan={5} className="p-0">
                          <button
                            onClick={() => setFullDivisions(prev => new Set(prev).add(division))}
                            className="w-full px-4 py-3 text-left text-xs font-medium text-primary-400 hover:bg-neutral-800/30 transition-colors"
                          >
                            Show all {feeders.length} feeders · {hiddenCount} more
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}

      {/* Orphan bucket: live feeders not in CIN catalog */}
      {(() => {
        const visibleUnmatched = urgencyFilter
          ? unmatched.filter(item => getUrgencyLevel(item.restoration_time) === urgencyFilter)
          : unmatched;
        if (visibleUnmatched.length === 0) return null;
        return <div className="rounded-sm board-panel overflow-hidden">
          <button
            onClick={() => toggleDivision('__unmatched__')}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-neutral-800/30 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              {expandedDivisions.has('__unmatched__')
                ? <ChevronDown className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                : <ChevronRight className="w-4 h-4 text-neutral-400 flex-shrink-0" />
              }
              <span className="font-display font-semibold text-foreground text-sm tracking-wide">Others</span>
            </div>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-error-500/12 border border-error-500/25 text-error-400 text-xs font-mono font-semibold tabular flex-shrink-0 ml-2">
              <PulseDot size="xs" color="error" />
              {visibleUnmatched.length}
            </span>
          </button>

          {(isSearching || expandedDivisions.has('__unmatched__')) && (
            <div className="sm:hidden border-t border-neutral-800/50 divide-y divide-neutral-800/20">
              {visibleUnmatched.map((item, idx) => {
                const urgency = getUrgencyLevel(item.restoration_time);
                const colors = getUrgencyColor(urgency);
                const startDate = parseOutageDate(item.start_time);
                const restoreDate = parseOutageDate(item.restoration_time);
                return (
                  <div key={`${item.feeder}-${idx}`} className="px-4 py-2.5">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span className={`mt-1.5 flex-shrink-0 w-2 h-2 rounded-full ${colors.dot}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-foreground font-mono">{item.feeder}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.areas.map(area => (
                            <span key={area} className="font-mono text-[11px] text-neutral-300 bg-neutral-800/70 border border-neutral-800 px-1.5 py-0.5 rounded-sm">{area}</span>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div>
                            <p className="eyebrow text-neutral-500">Started</p>
                            <p className="font-mono text-xs text-neutral-300">{startDate ? format(startDate, 'dd-MMM HH:mm') : item.start_time}</p>
                          </div>
                          <div>
                            <p className="eyebrow text-neutral-500">Est. Restore</p>
                            <p className={`font-mono text-xs ${colors.text}`}>{restoreDate ? format(restoreDate, 'dd-MMM HH:mm') : item.restoration_time}</p>
                          </div>
                        </div>
                        {item.reason && <p className="mt-1.5 text-xs text-neutral-500 line-clamp-2">{item.reason}</p>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {(isSearching || expandedDivisions.has('__unmatched__')) && (
            <div className="hidden sm:block border-t border-neutral-800/50 overflow-x-auto">
              <table className="w-full text-sm">
                <FeederTableHead />
                <tbody className="divide-y divide-neutral-800/20">
                  {visibleUnmatched.map((item, idx) => {
                    const urgency = getUrgencyLevel(item.restoration_time);
                    const colors = getUrgencyColor(urgency);
                    const d = parseOutageDate(item.restoration_time);
                    const label = d ? format(d, 'dd-MMM-yyyy HH:mm') : item.restoration_time;
                    return (
                      <tr key={`${item.feeder}-${idx}`} className="transition-colors hover:bg-neutral-800/20">
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className={`flex-shrink-0 w-2 h-2 rounded-full ${colors.dot}`} />
                            <span className="text-foreground font-mono text-[13px]">{item.feeder}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex flex-wrap gap-1">
                            {item.areas.map(area => (
                              <span key={area} className="font-mono text-[11px] text-neutral-300 bg-neutral-800/70 border border-neutral-800 px-1.5 py-0.5 rounded-sm">{area}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-neutral-400 font-mono text-xs">{item.start_time}</td>
                        <td className="px-4 py-2.5 font-mono text-xs"><span className={colors.text}>{label}</span></td>
                        <td className="px-4 py-2.5 text-neutral-400 text-xs max-w-[200px] truncate">{item.reason || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>;
      })()}
    </div>
  );
}
