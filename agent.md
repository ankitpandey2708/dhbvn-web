# Agent Context for DHBVN Web

## Project Overview
`dhbvn-web` is a Next.js application designed to interface with the DHBVN (Dakshin Haryana Bijli Vitran Nigam) system to track and notify about power outages. It includes a Telegram bot integration for delivering alerts.

## Tech Stack
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Postgres (implied by `@vercel/postgres` dependency)
- **Dependencies**: `xml2js`, `zod`, `date-fns`, `lucide-react`

## Key Components

### DHBVN API Integration (`lib/dhbvn-api.ts`)
- Fetches outage data from `https://chs.dhbvn.org.in/api/AppsavyServices/GetRelationalDataA`.
- Uses XML payloads for requests and parses XML responses.
- Normalizes data into `DHBVNData` structure (Area, Feeder, Start Time, Restoration Time).
- Includes logic to convert IST times to UTC for comparison.

### Telegram Client (`lib/messaging/telegram-client.ts`)
- `TelegramBotClient` class handles interactions with Telegram Bot API.
- Supports sending text messages and inline keyboards.
- Includes retry logic (`sendMessageWithRetry`) and batch sending capabilities (`sendBatchMessages`).
- Logs events to the database via `logTelegramEvent`.

### Database
- Uses `@vercel/postgres`.
- Schema likely defined in `lib/database/schema.sql` (observed in file list).

## Environment Variables
Key environment variables required for operation:
- **DHBVN API**: `DHBVN_FORM_ID`, `DHBVN_LOGIN`, `DHBVN_SOURCE_TYPE`, `DHBVN_VERSION`, `DHBVN_TOKEN`, `DHBVN_ROLE_ID`
- **Telegram**: `TELEGRAM_BOT_TOKEN`

## Scripts
- `dev`: `next dev`
- `build`: `next build`
- `start`: `next start`
- `lint`: `next lint`
