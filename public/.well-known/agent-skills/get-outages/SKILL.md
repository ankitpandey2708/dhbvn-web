---
name: get-outages
description: Fetch real-time power outage data for a Haryana district. Returns a list of current outages with area, feeder, start time, expected restoration time, and reason.
---

# Get Outages

Fetch real-time power outage data from the DHBVN portal for any Haryana district.

## API Endpoint

`GET https://dhbvn.vercel.app/api/dhbvn?district={district_id}`

### Parameters

| Parameter  | Type   | Required | Description                                      |
|------------|--------|----------|--------------------------------------------------|
| `district` | string | No       | District ID (default: `10` for Faridabad)        |

### District IDs

| ID  | District        |
|-----|-----------------|
| 1   | Jind            |
| 2   | Fatehabad       |
| 3   | Sirsa           |
| 4   | Hisar           |
| 5   | Bhiwani         |
| 6   | Mahendargarh    |
| 7   | Rewari          |
| 8   | Gurugram        |
| 9   | Nuh             |
| 10  | Faridabad       |
| 11  | Palwal          |
| 12  | Charkhi Dadri   |

### Response

Returns a JSON array of outage objects:

```json
[
  {
    "area": "Sector 21",
    "feeder": "City Feeder 1",
    "start_time": "15-Apr-2025 10:24:00",
    "restoration_time": "15-Apr-2025 14:30:00",
    "reason": "Maintenance work"
  }
]
```

### Example

```bash
curl https://dhbvn.vercel.app/api/dhbvn?district=10
```

## Accept Headers

This endpoint supports content negotiation:

- `Accept: application/json` (default) — returns JSON
- `Accept: text/markdown` — returns a Markdown-formatted table of outages
