# DHBVN WhatsApp Bot

Real-time power outage notifications for DHBVN customers via WhatsApp.

## Overview

This WhatsApp bot allows users to subscribe to power outage alerts for their district. Users receive instant notifications when:
- New outages are detected
- Power is restored

## Features

✅ **District-based subscriptions** - Users select their district to receive relevant alerts
✅ **Real-time notifications** - Automatic alerts every 15 minutes when outages change
✅ **Interactive commands** - STATUS, CHANGE, STOP, and more
✅ **Smart change detection** - Only notifies on new outages or restorations
✅ **Rate limiting** - Prevents spam and abuse
✅ **Multi-provider support** - Works with Meta Cloud API or Twilio

## User Flow

```
1. User sends "Hi" to WhatsApp number
2. Bot asks user to select district
3. User selects district (e.g., Faridabad)
4. Bot confirms subscription and shows current outages
5. User receives automatic notifications when outages occur/resolve
```

## Available Commands

- **HI** - Subscribe to alerts
- **STATUS** - View current outages
- **CHANGE** - Update your district
- **STOP** - Unsubscribe from alerts
- **HELP** - Show help message

## Architecture

```
User WhatsApp
    ↓
WhatsApp API (Meta/Twilio)
    ↓
Webhook Endpoint (/api/whatsapp/webhook)
    ↓
Message Handler (conversation logic)
    ↓
Database (Postgres)

Cron Job (every 15 min)
    ↓
Check Outages (/api/cron/check-outages)
    ↓
Detect Changes (compare with snapshots)
    ↓
Send Notifications (batch to subscribers)
```

## Tech Stack

- **Framework:** Next.js 16
- **Database:** Vercel Postgres / Supabase
- **WhatsApp:** Meta Cloud API or Twilio
- **Scheduler:** Vercel Cron Jobs
- **Deployment:** Vercel

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Fill in your WhatsApp and database credentials
   ```

3. **Initialize database:**
   ```bash
   psql $POSTGRES_URL -f lib/database/schema.sql
   ```

4. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

5. **Configure webhook** in Meta/Twilio dashboard:
   ```
   https://dhbvn.vercel.app/api/whatsapp/webhook
   ```

## Documentation

- **Setup Guide:** [WHATSAPP_BOT_SETUP.md](./WHATSAPP_BOT_SETUP.md) - Complete step-by-step deployment guide
- **Implementation Plan:** [WHATSAPP_BOT_PLAN.md](./WHATSAPP_BOT_PLAN.md) - Technical specs and design decisions
- **Architecture:** [WHATSAPP_BOT_ARCHITECTURE.md](./WHATSAPP_BOT_ARCHITECTURE.md) - System diagrams and flows

## File Structure

```
app/api/
├── dhbvn/route.ts                    # Existing outage API
├── whatsapp/webhook/route.ts         # Webhook endpoint
└── cron/check-outages/route.ts       # Notification scheduler

lib/
├── database/
│   ├── schema.sql                    # Database schema
│   ├── subscriptions.ts              # User management
│   └── outages.ts                    # Outage tracking
└── whatsapp/
    ├── client.ts                     # WhatsApp API wrapper
    ├── message-handler.ts            # Conversation logic
    └── templates.ts                  # Message templates

vercel.json                           # Cron job configuration
```

## Environment Variables

Required environment variables:

```env
# WhatsApp Provider
WHATSAPP_PROVIDER=meta                # or 'twilio'

# Meta Cloud API
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_VERIFY_TOKEN=...
WHATSAPP_APP_SECRET=...

# OR Twilio
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=...

# Database (auto-set by Vercel Postgres)
POSTGRES_URL=...

# Security
CRON_SECRET=...
```

## Testing

### Test the bot:
1. Send "Hi" to your WhatsApp number
2. Select a district
3. Send "STATUS" to see current outages

### Test cron job manually:
```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://dhbvn.vercel.app/api/cron/check-outages
```

## Database Schema

### whatsapp_subscriptions
Stores user subscriptions with phone number, district, and active status.

### outage_snapshots
Tracks outages over time to detect new/resolved outages.

## Scaling Considerations

- **0-500 users:** Free tier works perfectly
- **500-5,000 users:** Upgrade database, optimize queries
- **5,000+ users:** Add Redis cache, message queue, multi-region

## Cost Estimates

### Meta Cloud API
- First 1,000 conversations: **Free**
- Additional: $0.0088 per conversation
- **Estimated:** ~$264/month for 1,000 active users

### Twilio
- Inbound: $0.005/message
- Outbound: $0.02/message
- **Estimated:** ~$600/month for 1,000 active users

### Infrastructure
- Vercel: Free tier (Hobby plan) for < 100 cron executions/day
- Database: Free tier supports ~5,000 users

## Support

For issues or questions:
1. Check [WHATSAPP_BOT_SETUP.md](./WHATSAPP_BOT_SETUP.md) troubleshooting section
2. Review Vercel logs: `vercel logs --follow`
3. Check database connections and environment variables

## License

This project is built on top of the DHBVN web application.

---

**Made with ❤️ for DHBVN customers**
