import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/server';
import { createMcpServer } from '@/lib/mcp-server';
import { NextRequest } from 'next/server';

// Explicitly use Node.js runtime (not Edge) since MCP SDK requires Node.js APIs
export const runtime = 'nodejs';

// Create the MCP server instance (lazy singleton)
let serverPromise: ReturnType<typeof createMcpServerAndConnect> | null = null;

async function createMcpServerAndConnect() {
  const server = createMcpServer();
  const transport = new WebStandardStreamableHTTPServerTransport();
  await server.connect(transport);
  return { server, transport };
}

async function getOrCreateServer() {
  if (!serverPromise) {
    serverPromise = createMcpServerAndConnect();
  }
  return serverPromise;
}

export async function GET(request: NextRequest) {
  const { transport } = await getOrCreateServer();
  return transport.handleRequest(request);
}

export async function POST(request: NextRequest) {
  const { transport } = await getOrCreateServer();
  return transport.handleRequest(request);
}

export async function OPTIONS(_request: NextRequest) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers':
        'Content-Type, mcp-session-id, last-event-id, mcp-protocol-version',
      'Access-Control-Expose-Headers':
        'mcp-session-id, mcp-protocol-version, last-event-id',
    },
  });
}
