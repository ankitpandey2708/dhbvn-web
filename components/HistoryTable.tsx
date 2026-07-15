'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, Download, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Database, ArrowLeft } from 'lucide-react';
import { routeForDistrictId } from '@/lib/district-slug';

interface HistoryRow {
  id: number;
  districtId: number;
  feeder: string;
  startTime: string;
  restorationTime: string;
  reason: string;
  createdAt: string;
}

interface HistoryResponse {
  rows: HistoryRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface Props {
  districtId: number;
  districtName: string;
}

type SortField = 'feeder' | 'start_time' | 'restoration_time' | 'reason' | 'created_at';

const PAGE_SIZES = [25, 50, 100];

function toCSV(rows: HistoryRow[]): string {
  const header = 'Feeder,Start Time,Restoration Time,Reason,Collected At';
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = rows.map(r =>
    [r.feeder, r.startTime, r.restorationTime, r.reason, r.createdAt]
      .map(escape).join(',')
  );
  return [header, ...lines].join('\n');
}

function downloadCSV(rows: HistoryRow[], districtName: string) {
  const csv = toCSV(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${districtName.toLowerCase().replace(/\s+/g, '-')}-outage-history.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function HistoryTable({ districtId, districtName }: Props) {
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sort, setSort] = useState<SortField>('start_time');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      district: String(districtId),
      page: String(page),
      pageSize: String(pageSize),
      sort,
      order,
    });
    if (debouncedSearch) params.set('search', debouncedSearch);

    try {
      const res = await fetch(`/api/dhbvn/history?${params}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(body.detail || body.error || `API ${res.status}`);
      }
      const data: HistoryResponse = await res.json();
      setRows(data.rows);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (e) {
      console.error('History fetch error:', e);
      const msg = e instanceof Error ? e.message : 'Failed to load history';
      setError(msg);
      setRows([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [districtId, page, pageSize, sort, order, debouncedSearch]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function toggleSort(field: SortField) {
    if (sort === field) {
      setOrder(o => o === 'asc' ? 'desc' : 'asc');
    } else {
      setSort(field);
      setOrder('desc');
    }
    setPage(1);
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sort !== field) return <ArrowUpDown className="w-3 h-3 opacity-30" />;
    return order === 'asc'
      ? <ArrowUp className="w-3 h-3 text-primary-400" />
      : <ArrowDown className="w-3 h-3 text-primary-400" />;
  }

  const thClass = 'px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500 cursor-pointer hover:text-primary-400 transition-colors select-none whitespace-nowrap';
  const tdClass = 'px-4 py-3 text-sm text-foreground';
  const cols: [SortField, string][] = [['feeder', 'Feeder'], ['start_time', 'Started'], ['restoration_time', 'Restoration'], ['reason', 'Reason'], ['created_at', 'Collected']];

  const liveRoute = routeForDistrictId(districtId);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back link */}
        <Link
          href={liveRoute}
          className="inline-flex items-center gap-1.5 eyebrow text-neutral-400 hover:text-primary-400 transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Live board
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 border-b border-neutral-800 pb-5">
          <div>
            <p className="eyebrow text-primary-500 mb-2">Archive · {districtName}</p>
            <h1 className="text-3xl font-display font-bold text-foreground tracking-tight leading-none">
              Outage History
            </h1>
            <p className="text-sm text-neutral-500 mt-2.5">
              <span className="font-mono tabular text-neutral-300">{total.toLocaleString()}</span> records collected
            </p>
          </div>
          <button onClick={() => rows.length > 0 && downloadCSV(rows, districtName)} disabled={rows.length === 0}
            aria-label="Download CSV"
            className="inline-flex items-center justify-center gap-2 min-h-10 px-3.5 rounded-sm border border-neutral-800 bg-neutral-900/70 eyebrow text-neutral-300 hover:text-primary-400 hover:border-primary-500/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Search + Page Size */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by feeder or reason..."
              className="w-full pl-9 pr-4 py-2.5 rounded-sm bg-neutral-900/70 border border-neutral-800 text-sm text-foreground placeholder:text-neutral-500 focus:outline-none focus:border-primary-500/50" />
          </div>
          {/* Mobile sort — the card view has no sortable headers, so expose sorting here */}
          <select
            value={`${sort}:${order}`}
            onChange={e => {
              const [f, o] = e.target.value.split(':') as [SortField, 'asc' | 'desc'];
              setSort(f); setOrder(o); setPage(1);
            }}
            aria-label="Sort records"
            className="md:hidden px-3 py-2.5 rounded-sm bg-neutral-900/70 border border-neutral-800 text-sm text-foreground focus:outline-none focus:border-primary-500/50">
            <option value="start_time:desc">Newest first</option>
            <option value="start_time:asc">Oldest first</option>
            <option value="feeder:asc">Feeder A–Z</option>
            <option value="restoration_time:desc">Restoration time</option>
            <option value="created_at:desc">Recently collected</option>
          </select>
          <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="px-3 py-2.5 rounded-sm bg-neutral-900/70 border border-neutral-800 text-sm text-foreground focus:outline-none focus:border-primary-500/50">
            {PAGE_SIZES.map(s => <option key={s} value={s}>{s} per page</option>)}
          </select>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto rounded-sm board-panel">
          <table className="w-full">
            <thead className="border-b border-neutral-800 bg-neutral-900/40">
              <tr>
                {cols.map(([field, label]) => (
                  <th key={field} className={thClass} onClick={() => toggleSort(field)}>
                    <span className="inline-flex items-center gap-1.5">{label}<SortIcon field={field} /></span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-4 py-3.5">
                      <div className="h-4 w-full rounded bg-neutral-800/60 animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : error ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center">
                  <Database className="w-8 h-8 mx-auto text-error-500/60 mb-2" />
                  <p className="text-error-400 text-sm font-medium uppercase">Failed to load history</p>
                  <p className="text-neutral-500 text-xs mt-1">{error}</p>
                </td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center">
                  <Database className="w-8 h-8 mx-auto text-neutral-600 mb-2" />
                  <p className="text-neutral-500 text-sm">No records found</p>
                  <p className="text-neutral-600 text-xs mt-1">Data is collected in the background as outages are reported</p>
                </td></tr>
              ) : rows.map(row => (
                <tr key={row.id} className="hover:bg-primary-500/[0.04] transition-colors">
                  <td className={tdClass + ' font-mono text-[13px]'}>{row.feeder}</td>
                                  <td className={tdClass + ' whitespace-nowrap font-mono text-xs'}>{row.startTime}</td>
                  <td className={tdClass + ' whitespace-nowrap font-mono text-xs'}>{row.restorationTime}</td>
                  <td className={tdClass + ' max-w-xs truncate text-neutral-400 text-xs'} title={row.reason}>{row.reason}</td>
                  <td className={tdClass + ' whitespace-nowrap font-mono text-xs text-neutral-500'}>{row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-IN') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-sm board-panel p-4 animate-pulse">
                <div className="h-4 w-32 rounded bg-neutral-800 mb-3" />
                <div className="h-3 w-48 rounded bg-neutral-800/70 mb-1.5" />
                <div className="h-3 w-40 rounded bg-neutral-800/70" />
              </div>
            ))
          ) : error ? (
            <div className="text-center py-12">
              <Database className="w-8 h-8 mx-auto text-error-500/60 mb-2" />
              <p className="text-error-400 text-sm font-medium uppercase">Failed to load history</p>
              <p className="text-neutral-500 text-xs mt-1">{error}</p>
            </div>
          ) : rows.length === 0 ? (
            <div className="text-center py-12">
              <Database className="w-8 h-8 mx-auto text-neutral-600 mb-2" />
              <p className="text-neutral-500 text-sm">No records found</p>
            </div>
          ) : rows.map(row => (
            <div key={row.id} className="rounded-sm board-panel p-4">
              <p className="font-mono text-foreground text-[13px] mb-2">{row.feeder}</p>
              <div className="space-y-1 text-xs text-neutral-400">
                <p><span className="text-neutral-500">Started:</span> <span className="font-mono">{row.startTime}</span></p>
                <p><span className="text-neutral-500">Restoration:</span> <span className="font-mono">{row.restorationTime}</span></p>
                {row.reason && <p><span className="text-neutral-500">Reason:</span> {row.reason}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="eyebrow text-neutral-500">
              Page <span className="font-mono tabular text-neutral-300">{page}</span> / {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                aria-label="Previous page"
                className="inline-flex items-center justify-center min-h-10 min-w-10 rounded-sm border border-neutral-800 text-neutral-400 hover:text-primary-400 hover:border-primary-500/40 disabled:opacity-20 disabled:cursor-not-allowed transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                const p = start + i;
                if (p > totalPages) return null;
                return (
                  <button key={p} onClick={() => setPage(p)}
                    aria-label={`Page ${p}`} aria-current={p === page ? 'page' : undefined}
                    className={`inline-flex items-center justify-center w-10 h-10 rounded-sm text-sm font-mono tabular transition-all ${p === page ? 'bg-primary-500/15 text-primary-400 border border-primary-500/40' : 'text-neutral-400 border border-transparent hover:bg-neutral-800/50'}`}>
                    {p}
                  </button>
                );
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                aria-label="Next page"
                className="inline-flex items-center justify-center min-h-10 min-w-10 rounded-sm border border-neutral-800 text-neutral-400 hover:text-primary-400 hover:border-primary-500/40 disabled:opacity-20 disabled:cursor-not-allowed transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}