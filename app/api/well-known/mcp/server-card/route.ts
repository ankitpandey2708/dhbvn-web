import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  // Construct the base URL from the request
  const baseUrl = new URL(request.url).origin;

  const serverCard = {
    $schema: 'https://static.modelcontextprotocol.io/schemas/mcp-server-card/v1.json',
    version: '1.0',
    protocolVersion: '2025-06-18',
    serverInfo: {
      name: 'io.dhbvn.outage-tracker',
      title: 'DHBVN Outage Tracker',
      version: '0.1.0',
    },
    description:
      'MCP server for querying live power outage data from DHBVN (Dakshin Haryana Bijli Vitran Nigam). Provides tools to list districts, fetch outages by district, and get a statewide outage summary.',
    websiteUrl: baseUrl,
    documentationUrl: `${baseUrl}/.well-known/api-catalog`,
    iconUrl: `${baseUrl}/favicon.ico`,
    transport: {
      type: 'streamable-http',
      endpoint: '/api/mcp',
    },
    capabilities: {
      tools: {
        listChanged: false,
      },
    },
    authentication: {
      required: false,
      schemes: [],
    },
    instructions:
      'This MCP server provides three tools:\n' +
      '- list-districts: Lists all 12 Haryana districts with their IDs\n' +
      '- get-outages: Fetches current power outages for a specific district\n' +
      '- get-all-outages: Fetches outage data for all districts simultaneously\n\n' +
      'All data is public and real-time from DHBVN\'s official portal.',
    resources: ['dynamic'] as unknown as string[],
    tools: ['dynamic'] as unknown as string[],
    prompts: ['dynamic'] as unknown as string[],
  };

  return new Response(JSON.stringify(serverCard, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
