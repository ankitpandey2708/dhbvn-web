import { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import { fetchDHBVNOutages } from './dhbvn-api';
import { SITE_URL } from './dhbvn-config';
import { DISTRICTS } from './district';
import type { CallToolResult } from '@modelcontextprotocol/server';

export function createMcpServer() {
  const server = new McpServer(
    {
      name: 'dhbvn-outage-tracker',
      version: '0.1.0',
      description: 'MCP server for DHBVN power outage data in Haryana, India',
      websiteUrl: SITE_URL,
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  // Tool 1: List districts
  server.registerTool(
    'list-districts',
    {
      title: 'List Districts',
      description: 'List all available Haryana districts for querying outage data',
      inputSchema: z.object({}),
    },
    async (): Promise<CallToolResult> => {
      const districtList = DISTRICTS.map(
        (d) => `- ${d.name} (ID: ${d.id})`,
      ).join('\n');
      return {
        content: [
          {
            type: 'text',
            text: `Available districts:\n${districtList}\n\nUse "get-outages" with a district name or ID to fetch current outages.`,
          },
        ],
      };
    },
  );

  // Tool 2: Get outages by district
  server.registerTool(
    'get-outages',
    {
      title: 'Get Outages',
      description:
        'Fetch current power outages for a specific district in Haryana. Returns a list of ongoing outages with area, feeder, start time, restoration time, and reason.',
      inputSchema: z.object({
        district: z
          .string()
          .describe(
            'District name (e.g., "Gurugram") or ID (e.g., "14"). Use list-districts to see all options.',
          ),
      }),
    },
    async ({ district }): Promise<CallToolResult> => {
      // Resolve district name to ID
      const districtEntry = DISTRICTS.find(
        (d) =>
          d.name.toLowerCase() === district.toLowerCase() ||
          String(d.id) === district,
      );

      if (!districtEntry) {
        return {
          content: [
            {
              type: 'text',
              text: `Invalid district: "${district}". Use the list-districts tool to see available options.`,
            },
          ],
          isError: true,
        };
      }

      try {
        const outages = await fetchDHBVNOutages(String(districtEntry.id));

        if (outages.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: `No ongoing power outages found for ${districtEntry.name}.`,
              },
            ],
          };
        }

        const outageLines = outages.map(
          (o, i) =>
            `${i + 1}. **${o.feeder}**\n   Areas: ${o.areas.join(', ')}\n   Start: ${o.start_time}\n   Restoration: ${o.restoration_time}\n   Reason: ${o.reason || 'Not specified'}`,
        );

        return {
          content: [
            {
              type: 'text',
              text: `Found ${outages.length} ongoing outage(s) in ${districtEntry.name}:\n\n${outageLines.join('\n\n')}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error fetching outages for ${districtEntry.name}: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // Tool 3: Get all districts outages (runs all districts in parallel)
  server.registerTool(
    'get-all-outages',
    {
      title: 'Get All Outages',
      description:
        'Fetch current power outages for ALL Haryana districts simultaneously. Returns a summary of total outages and per-district breakdown.',
      inputSchema: z.object({}),
    },
    async (): Promise<CallToolResult> => {
      const results = await Promise.allSettled(
        DISTRICTS.map(async (d) => {
          const outages = await fetchDHBVNOutages(String(d.id));
          return { district: d.name, outages };
        }),
      );

      const successful: { district: string; count: number }[] = [];
      const errors: { district: string; error: string }[] = [];
      let totalOutages = 0;

      for (const result of results) {
        if (result.status === 'fulfilled') {
          successful.push({
            district: result.value.district,
            count: result.value.outages.length,
          });
          totalOutages += result.value.outages.length;
        } else {
          errors.push({
            district: 'unknown',
            error: result.reason?.message || String(result.reason),
          });
        }
      }

      const lines = successful
        .sort((a, b) => b.count - a.count)
        .map((s) => `- ${s.district}: ${s.count} outage(s)`);

      let text = `**Total ongoing outages across Haryana: ${totalOutages}**\n\nPer-district breakdown:\n${lines.join('\n')}`;

      if (errors.length > 0) {
        text += `\n\nErrors: ${errors.length} district(s) failed to fetch.`;
      }

      return { content: [{ type: 'text', text }] };
    },
  );

  return server;
}
