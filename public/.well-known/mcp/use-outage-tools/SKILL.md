# Use DHBVN Outage MCP Tools

This skill allows AI agents to use the DHBVN Outage Tracker MCP server to query live power outage data from Haryana, India.

## MCP Server Endpoint
- **URL:** `/.well-known/mcp/server-card.json`
- **Transport:** Streamable HTTP at `/api/mcp`

## Available Tools

### list-districts
Lists all 12 Haryana districts with their numeric IDs.

### get-outages
Fetches current power outages for a specific district. Parameters:
- `district`: District name (e.g., "Gurugram") or ID (e.g., "14")

### get-all-outages
Fetches current power outages for ALL districts simultaneously and returns a summary.

## Example Usage
```
# Get outages for Gurugram
get-outages("Gurugram")

# Get outages for all districts
get-all-outages()
```

## Notes
- Data is real-time from DHBVN's official portal
- All data is public - no authentication required
- Results are cached for up to 60 seconds
