import { NextResponse } from 'next/server';
import { SITE_URL as BASE_URL } from '@/lib/dhbvn-config';

export const dynamic = 'force-dynamic';

/**
 * Agent Skills Discovery Index — v0.2.0
 * Published at /.well-known/agent-skills/index.json
 *
 * Lists the skills this site exposes so agents can discover and invoke them.
 */
export async function GET() {
  const index = {
    $schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json',
    skills: [
      {
        name: 'get-outages',
        type: 'skill-md',
        description:
          'Fetch real-time power outage data for a Haryana district. Returns a list of current outages with area, feeder, start time, expected restoration time, and reason.',
        url: `${BASE_URL}/.well-known/agent-skills/get-outages/SKILL.md`,
        digest:
          'sha256:24e6d00e965bc7aebf2bb47ae90bdf8f56d7274f90d03901b45463e263f39dca',
      },
      {
        name: 'subscribe-telegram',
        type: 'skill-md',
        description:
          'Guide an agent or user to subscribe to Telegram notifications for power outage alerts in a specific Haryana district.',
        url: `${BASE_URL}/.well-known/agent-skills/subscribe-telegram/SKILL.md`,
        digest:
          'sha256:03ceaba5415a2811aa0cc3cb3c93659273324886a044cbaa43ac361353c0a368',
      },
      {
        name: 'use-outage-tools',
        type: 'skill-md',
        description:
          'Use the MCP server for DHBVN power outage data. Provides tools to list districts, fetch outages by district, and get a statewide outage summary via the Streamable HTTP MCP server.',
        url: `${BASE_URL}/.well-known/mcp/use-outage-tools/SKILL.md`,
        digest:
          'sha256:e77c18439d12f5bc42e7619070e4b2a8aa377e926fbdcc0e15c16355e10347d5',
      },
    ],
  };

  return new NextResponse(JSON.stringify(index, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
