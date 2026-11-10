'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';

/**
 * Lifecycle of one remote JSON resource, identified by its URL.
 *
 *            ┌──────── ok ────────┐
 *   loading ─┤                    ▼
 *            └─ fail ─► error ◄─ ready ◄──┐
 *                         │       │       │ ok
 *                         │       └─ poll / retry / URL change (keepPrevious)
 *                         │               ready{refreshing: true}
 *                         └─ retry ─► loading (or ready{refreshing} if data is kept)
 *
 * - `loading`  — nothing to show for this URL yet.
 * - `ready`    — `data` is the last good response. `refreshing` means a request is
 *                in flight; with `keepPrevious`, `data` may belong to the previous URL.
 * - `error`    — the latest request failed. `data` is the last good response for
 *                THIS URL (e.g. a background poll failed), if there was one.
 *
 * Out-of-order responses are impossible: every request is aborted when its URL
 * changes, a retry fires, or the component unmounts.
 */
type RemoteState<T> =
  | { status: 'loading' }
  | { status: 'ready'; data: T; updatedAt: number; refreshing: boolean }
  | { status: 'error'; error: string; data?: T; updatedAt?: number };

interface Options {
  /** Re-fetch on this interval while the tab is visible (and on return to the tab when overdue). */
  refreshMs?: number;
  /** Keep showing the previous URL's data while the next URL loads (pagination, sorting). */
  keepPrevious?: boolean;
}

interface Internal<T> {
  key: string | null;      // URL of the latest request
  dataKey: string | null;  // URL that `data` came from
  data?: T;
  updatedAt?: number;
  error?: string;
  inFlight: boolean;
}

type Action<T> =
  | { type: 'start'; key: string }
  | { type: 'success'; key: string; data: T; at: number }
  | { type: 'failure'; key: string; error: string };

function reducer<T>(s: Internal<T>, a: Action<T>): Internal<T> {
  switch (a.type) {
    case 'start':
      return { ...s, key: a.key, inFlight: true, error: undefined };
    case 'success':
      if (a.key !== s.key) return s;
      return { key: a.key, dataKey: a.key, data: a.data, updatedAt: a.at, inFlight: false };
    case 'failure':
      if (a.key !== s.key) return s;
      return { ...s, inFlight: false, error: a.error };
  }
}

/** Derive the public state. Pure, and correct even in the render before the fetch effect runs. */
function project<T>(s: Internal<T>, key: string, keepPrevious: boolean): RemoteState<T> {
  const sameKey = s.dataKey === key;
  if (s.key === key && s.error !== undefined) {
    return sameKey
      ? { status: 'error', error: s.error, data: s.data, updatedAt: s.updatedAt }
      : { status: 'error', error: s.error };
  }
  if (s.data !== undefined && s.updatedAt !== undefined && (sameKey || keepPrevious)) {
    return { status: 'ready', data: s.data, updatedAt: s.updatedAt, refreshing: s.inFlight || s.key !== key || !sameKey };
  }
  return { status: 'loading' };
}

async function fetchJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || body.error || `Request failed (${res.status} ${res.statusText})`);
  }
  return res.json() as Promise<T>;
}

const INITIAL: Internal<never> = { key: null, dataKey: null, inFlight: false };

/** Fetch JSON from `url` as an explicit state machine. Returns `[state, retry]`. */
export function useRemoteData<T>(url: string, { refreshMs, keepPrevious = false }: Options = {}) {
  const [internal, dispatch] = useReducer(reducer<T>, INITIAL as Internal<T>);
  const [attempt, setAttempt] = useState(0);
  const lastStartRef = useRef(0);

  useEffect(() => {
    const controller = new AbortController();
    lastStartRef.current = Date.now();
    dispatch({ type: 'start', key: url });
    fetchJson<T>(url, controller.signal).then(
      data => {
        if (!controller.signal.aborted) dispatch({ type: 'success', key: url, data, at: Date.now() });
      },
      err => {
        if (controller.signal.aborted) return;
        dispatch({ type: 'failure', key: url, error: err instanceof Error ? err.message : 'An error occurred' });
      },
    );
    return () => controller.abort();
  }, [url, attempt]);

  // Polling: only while visible, so background tabs cost nothing. Restarts on URL change.
  useEffect(() => {
    if (!refreshMs) return;
    const refreshIfDue = () => {
      if (document.visibilityState !== 'visible') return;
      // 1s slack so timer jitter never skips a tick; a recent manual retry does.
      if (Date.now() - lastStartRef.current >= refreshMs - 1000) setAttempt(n => n + 1);
    };
    const id = setInterval(refreshIfDue, refreshMs);
    document.addEventListener('visibilitychange', refreshIfDue);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', refreshIfDue);
    };
  }, [refreshMs, url]);

  const retry = useCallback(() => setAttempt(n => n + 1), []);

  return [project(internal, url, keepPrevious), retry] as const;
}
