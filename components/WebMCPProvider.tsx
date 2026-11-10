'use client';

import { useEffect, useRef } from 'react';

// ── Type declarations for the WebMCP API ───────────────────────────
// These are not yet part of the standard TypeScript DOM lib.
interface ModelContextTool {
  name: string;
  title?: string;
  description: string;
  inputSchema?: object;
  execute: (input: Record<string, unknown>) => Promise<unknown>;
  annotations?: {
    readOnlyHint?: boolean;
    untrustedContentHint?: boolean;
  };
}

interface ModelContextRegisterToolOptions {
  signal?: AbortSignal;
  exposedTo?: string[];
}

interface ModelContext {
  registerTool(
    tool: ModelContextTool,
    options?: ModelContextRegisterToolOptions,
  ): void;
  ontoolchange: ((this: ModelContext, ev: Event) => unknown) | null;
}

interface Navigator {
  modelContext?: ModelContext;
}

// ── Constants ──────────────────────────────────────────────────────
const DISTRICTS = [
  { id: 1, name: 'Jind' },
  { id: 2, name: 'Fatehabad' },
  { id: 3, name: 'Sirsa' },
  { id: 4, name: 'Hisar' },
  { id: 5, name: 'Bhiwani' },
  { id: 6, name: 'Mahendargarh' },
  { id: 7, name: 'Rewari' },
  { id: 8, name: 'Gurugram' },
  { id: 9, name: 'Nuh' },
  { id: 10, name: 'Faridabad' },
  { id: 11, name: 'Palwal' },
  { id: 12, name: 'Charkhi Dadri' },
] as const;

// ── Tool definitions ───────────────────────────────────────────────

const OUTAGES_TOOL: ModelContextTool = {
  name: 'get-outages',
  title: 'Get Power Outages',
  description:
    'Fetch real-time power outage data for a Haryana district. ' +
    'Returns active outages with area, feeder, start time, expected restoration time, and reason.',
  inputSchema: {
    type: 'object',
    properties: {
      district: {
        type: 'string',
        description:
          'District ID or name (default: "10" for Faridabad). ' +
          'Use "list-districts" to see all available IDs.',
      },
    },
  },
  execute: async (input: Record<string, unknown>) => {
    const district = (input?.district as string) || '10';
    const res = await fetch(`/api/dhbvn?district=${district}`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  },
  annotations: { readOnlyHint: true },
};

const SEARCH_TOOL: ModelContextTool = {
  name: 'search-outages',
  title: 'Search Outages',
  description:
    'Search power outages across a district by area name, feeder name, or reason. ' +
    'Returns matching outage records or an empty array if none found.',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search term to match against area, feeder, or reason.',
      },
      district: {
        type: 'string',
        description:
          'Optional district ID (default: "10" for Faridabad).',
      },
    },
    required: ['query'],
  },
  execute: async (input: Record<string, unknown>) => {
    const query = input?.query as string;
    if (!query || typeof query !== 'string' || !query.trim()) {
      throw new Error('A non-empty "query" parameter is required.');
    }
    const district = (input?.district as string) || '10';
    const res = await fetch(`/api/dhbvn?district=${district}`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    const data = (await res.json()) as Record<string, unknown>[];
    const lowerQuery = query.toLowerCase().trim();
    return data.filter(
      (item) =>
        (item.areas as string[]).some(a => a.toLowerCase().includes(lowerQuery)) ||
        String(item.feeder || '').toLowerCase().includes(lowerQuery) ||
        String(item.reason || '').toLowerCase().includes(lowerQuery),
    );
  },
  annotations: { readOnlyHint: true },
};

const DISTRICTS_TOOL: ModelContextTool = {
  name: 'list-districts',
  title: 'List Districts',
  description:
    'List all available Haryana districts that can be queried for power outage data. ' +
    'Returns an array of objects with id (number) and name (string).',
  execute: async () => {
    return DISTRICTS.map((d) => ({ id: d.id, name: d.name }));
  },
  annotations: { readOnlyHint: true },
};

const TELEGRAM_TOOL: ModelContextTool = {
  name: 'get-telegram-bot',
  title: 'Telegram Bot Info',
  description:
    'Get information about the DHBVN Telegram bot for subscribing to ' +
    'real-time power outage alerts. Returns the bot username and subscription instructions.',
  execute: async () => {
    return {
      bot_username: '@dhbvn_bot',
      url: 'https://t.me/dhbvn_bot',
      description:
        'Subscribe to real-time power outage alerts on Telegram. ' +
        'Send /start to choose your district and receive instant notifications ' +
        'when outages start or power is restored.',
      commands: [
        { command: '/start', description: 'Begin setup and choose a district' },
        { command: '/status', description: 'Check current subscription and recent outages' },
        { command: '/change', description: 'Switch to a different district' },
        { command: '/stop', description: 'Unsubscribe from all alerts' },
      ],
    };
  },
  annotations: { readOnlyHint: true },
};

const TOOLS: ModelContextTool[] = [
  OUTAGES_TOOL,
  SEARCH_TOOL,
  DISTRICTS_TOOL,
  TELEGRAM_TOOL,
];

// ── Provider Component ─────────────────────────────────────────────

export function WebMCPProvider() {
  const registered = useRef(false);

  useEffect(() => {
    // WebMCP is only available in secure contexts (HTTPS) with
    // the "tools" permission policy enabled.
    const mc = (navigator as Navigator).modelContext;
    if (!mc || registered.current) return;

    registered.current = true;

    // Register each tool with its own AbortController tied to this
    // effect's cleanup lifecycle. When the component unmounts, all
    // controllers are aborted and tools auto-unregister.
    const controllers = TOOLS.map((tool) => {
      const controller = new AbortController();
      try {
        mc.registerTool(tool, { signal: controller.signal });
      } catch (err) {
        // Silently skip: the API may not be available or a tool with
        // the same name may already be registered.
        if (process.env.NODE_ENV === 'development') {
          console.debug(`[WebMCP] Skipped "${tool.name}":`, err);
        }
      }
      return controller;
    });

    return () => {
      for (const ctrl of controllers) {
        ctrl.abort();
      }
      registered.current = false;
    };
  }, []);

  // This component renders nothing — it only registers tools.
  return null;
}
