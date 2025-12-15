# WhatsApp Bot Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY                             │
└─────────────────────────────────────────────────────────────────┘

User Phone                WhatsApp           Your Server           External APIs
    │                        │                    │                      │
    │  1. "Hi"              │                    │                      │
    ├──────────────────────>│                    │                      │
    │                        │  2. Webhook        │                      │
    │                        ├───────────────────>│                      │
    │                        │   POST /webhook    │                      │
    │                        │                    │                      │
    │                        │                    │ 3. Check DB          │
    │                        │                    │    (New user?)       │
    │                        │                    │                      │
    │                        │  4. District List  │                      │
    │  5. District List     │<───────────────────┤                      │
    │<──────────────────────┤   (Interactive)    │                      │
    │                        │                    │                      │
    │  6. Select "Faridabad"│                    │                      │
    ├──────────────────────>│                    │                      │
    │                        │  7. Webhook        │                      │
    │                        ├───────────────────>│                      │
    │                        │                    │                      │
    │                        │                    │ 8. Save to DB        │
    │                        │                    │    (phone + district)│
    │                        │                    │                      │
    │                        │                    │ 9. GET /api/dhbvn   │
    │                        │                    ├─────────────────────>│
    │                        │                    │    ?district=10      │
    │                        │                    │                      │
    │                        │                    │ 10. Outages JSON     │
    │                        │                    │<─────────────────────┤
    │                        │                    │                      │
    │                        │ 11. Confirmation   │                      │
    │  12. Confirmation     │<───────────────────┤    + Current Outages │
    │<──────────────────────┤                    │                      │
    │                        │                    │                      │
    │                        │                    │                      │
    │      ⏰ CRON JOB RUNS EVERY 15 MINUTES      │                      │
    │                        │                    │                      │
    │                        │                    │ 13. Check all        │
    │                        │                    │     districts        │
    │                        │                    ├─────────────────────>│
    │                        │                    │     (12 API calls)   │
    │                        │                    │                      │
    │                        │                    │ 14. Compare with     │
    │                        │                    │     last snapshot    │
    │                        │                    │     (Detect new)     │
    │                        │                    │                      │
    │                        │ 15. Notify users   │                      │
    │  16. Notification     │<───────────────────┤     (Bulk send)      │
    │<──────────────────────┤                    │                      │
    │  "New Outage Alert"   │                    │                      │
    │                        │                    │                      │
```

---

## Database Schema Diagram

```
┌────────────────────────────────────┐
│   whatsapp_subscriptions           │
├────────────────────────────────────┤
│ PK  id                             │
│ UQ  phone_number  VARCHAR(20)      │
│     district_id   INTEGER          │
│     district_name VARCHAR(50)      │
│     subscribed_at TIMESTAMP        │
│     last_notification TIMESTAMP    │
│     is_active     BOOLEAN          │
├────────────────────────────────────┤
│ Indexes:                           │
│  - idx_active_subscriptions        │
│  - idx_phone_lookup                │
└────────────────────────────────────┘
         │
         │ 1:N (one user, many snapshots tracked)
         ▼
┌────────────────────────────────────┐
│   outage_snapshots                 │
├────────────────────────────────────┤
│ PK  id                             │
│     district_id   INTEGER          │
│ UQ  outage_hash   VARCHAR(64)      │ ◄─── MD5(area+feeder+start_time)
│     area          VARCHAR(255)     │
│     feeder        VARCHAR(100)     │
│     start_time    TIMESTAMP        │
│     restoration_time TIMESTAMP     │
│     reason        TEXT             │
│     first_seen    TIMESTAMP        │
│     last_seen     TIMESTAMP        │
│     is_resolved   BOOLEAN          │
├────────────────────────────────────┤
│ Indexes:                           │
│  - idx_district_active             │
└────────────────────────────────────┘
```

---

## API Flow Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    API ROUTES STRUCTURE                       │
└──────────────────────────────────────────────────────────────┘

📁 app/api/
│
├── 📁 dhbvn/                          [EXISTING]
│   └── route.ts                       ✅ Already implemented
│       └── GET ?district=X → JSON[]
│
├── 📁 whatsapp/
│   ├── 📁 webhook/                    [NEW]
│   │   └── route.ts
│   │       ├── GET  → Verify webhook (Meta/Twilio)
│   │       └── POST → Handle incoming messages
│   │
│   ├── 📁 notify/                     [NEW]
│   │   └── route.ts
│   │       └── POST → Send bulk notifications
│   │
│   └── 📁 send/                       [NEW]
│       └── route.ts
│           └── POST → Send single message (utility)
│
└── 📁 cron/                           [NEW]
    └── 📁 check-outages/
        └── route.ts
            └── GET → Trigger notification check


📁 lib/
│
├── whatsapp/                          [NEW]
│   ├── client.ts                      WhatsApp API wrapper
│   ├── message-handler.ts             Conversation logic
│   ├── templates.ts                   Message templates
│   └── interactive.ts                 Buttons/Lists builder
│
├── database/                          [NEW]
│   ├── subscriptions.ts               User CRUD operations
│   ├── outages.ts                     Snapshot tracking
│   └── schema.sql                     Database schema
│
└── utils/                             [EXISTING]
    └── outage-detector.ts             [NEW] Change detection logic
```

---

## Message Flow State Machine

```
┌─────────────────────────────────────────────────────────────┐
│                    CONVERSATION STATES                       │
└─────────────────────────────────────────────────────────────┘

    ┌─────────────┐
    │   START     │
    │  (No user)  │
    └──────┬──────┘
           │
           │ Message: "Hi"
           ▼
    ┌─────────────┐
    │  WELCOME    │──────────┐
    │ Send intro  │          │ User sends
    │ Show menu   │          │ district list
    └──────┬──────┘          │
           │                 │
           │ Auto-send       │
           │ district list   │
           ▼                 │
    ┌─────────────┐          │
    │  AWAITING   │◄─────────┘
    │  DISTRICT   │
    │  (Pending)  │
    └──────┬──────┘
           │
           │ User selects
           │ district
           ▼
    ┌─────────────┐
    │  CONFIRM    │
    │ Save to DB  │
    │ Show outages│
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │  SUBSCRIBED │ ◄──────┐
    │  (Active)   │        │
    │             │        │
    └──────┬──────┘        │
           │               │
           │               │ Command: "CHANGE"
           ├───────────────┘
           │
           │ Command: "STATUS"
           ├──────────────────> (Show current outages)
           │                    └──> Return to SUBSCRIBED
           │
           │ Command: "STOP"
           ▼
    ┌─────────────┐
    │ UNSUBSCRIBED│
    │ (Inactive)  │
    └─────────────┘
```

---

## Change Detection Algorithm

```
┌──────────────────────────────────────────────────────────────┐
│           OUTAGE CHANGE DETECTION FLOW                        │
└──────────────────────────────────────────────────────────────┘

function detectChanges(districtId) {

  1. Fetch Current Data
     ├─> GET /api/dhbvn?district=${districtId}
     └─> Returns: DHBVNData[]

  2. Generate Hashes
     ├─> For each outage: hash = MD5(area + feeder + start_time)
     └─> Creates unique identifier per outage

  3. Query Database
     ├─> SELECT * FROM outage_snapshots
     │   WHERE district_id = ${districtId}
     │   AND is_resolved = false
     └─> Returns: Existing outages

  4. Compare Sets
     ├─> Current hashes vs Existing hashes
     │
     ├─> NEW OUTAGES (in current, not in existing)
     │   └─> Action: Send notification to users
     │       └─> INSERT INTO outage_snapshots
     │
     ├─> RESOLVED OUTAGES (in existing, not in current)
     │   └─> Action: Send restoration notification
     │       └─> UPDATE is_resolved = true
     │
     └─> ONGOING OUTAGES (in both)
         └─> Action: Update last_seen timestamp
             └─> UPDATE last_seen = NOW()

  5. Return Changes
     └─> { new: [], resolved: [], ongoing: [] }
}
```

---

## Notification Batch Processing

```
┌──────────────────────────────────────────────────────────────┐
│             CRON JOB NOTIFICATION FLOW                        │
└──────────────────────────────────────────────────────────────┘

Every 15 minutes:

┌─────────────────────────────────────────────────────────────┐
│ 1. GET /api/cron/check-outages                              │
│    (Triggered by Vercel Cron or GitHub Actions)             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. For each district (1-12):                                │
│    ├─> detectChanges(districtId)                            │
│    └─> Store results                                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Group notifications by district:                         │
│    district10: { new: [outage1, outage2], resolved: [] }    │
│    district8:  { new: [], resolved: [outage3] }             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Query subscribed users:                                  │
│    SELECT phone_number FROM whatsapp_subscriptions          │
│    WHERE district_id = X AND is_active = true               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Send messages in batches:                                │
│    ├─> Rate limit: 80 messages/second (Meta API limit)      │
│    ├─> Batch size: 50 users                                 │
│    └─> Retry failed sends (3 attempts)                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Update last_notification_sent for each user              │
└─────────────────────────────────────────────────────────────┘
```

---

## Security & Rate Limiting

```
┌──────────────────────────────────────────────────────────────┐
│                   SECURITY LAYERS                             │
└──────────────────────────────────────────────────────────────┘

📥 Incoming Webhook Request
    │
    ├─> 1. Verify Signature
    │   ├─> Meta: X-Hub-Signature-256 header
    │   └─> Twilio: X-Twilio-Signature header
    │
    ├─> 2. Rate Limit by Phone Number
    │   ├─> Max 5 messages/minute/user
    │   └─> Use in-memory cache (node-cache)
    │
    ├─> 3. Validate Payload Schema
    │   └─> Zod validation (already in project)
    │
    └─> 4. Process Message
        └─> Handle conversation

📤 Outgoing Notifications
    │
    ├─> 1. Verify Cron Secret
    │   └─> x-cron-secret header check
    │
    ├─> 2. Check Subscription Status
    │   └─> Only send to is_active = true
    │
    └─> 3. Respect WhatsApp Limits
        ├─> 80 messages/second (Meta)
        └─> Implement exponential backoff
```

---

## Cost Optimization Strategies

```
┌──────────────────────────────────────────────────────────────┐
│                 OPTIMIZATION TECHNIQUES                       │
└──────────────────────────────────────────────────────────────┘

1. Smart Polling
   ├─> Don't check all 12 districts if no subscribers
   └─> Query: SELECT DISTINCT district_id FROM subscriptions
       WHERE is_active = true

2. Deduplication
   ├─> Use outage_hash to prevent duplicate notifications
   └─> Check if hash exists before sending

3. Batch Notifications
   ├─> Group multiple outages per district
   └─> Send 1 message instead of N messages per user

4. Off-Peak Checking
   ├─> Reduce frequency during low-outage hours (11 PM - 6 AM)
   └─> Adaptive cron: */15 (peak) vs */30 (off-peak)

5. Notification Throttling
   ├─> Max 3 notifications per user per hour
   └─> Batch updates if multiple outages occur rapidly

6. Database Indexing
   ├─> Index on (district_id, is_active)
   └─> Index on (phone_number) for fast lookups
```

---

## Scalability Roadmap

```
Phase 1: 0-500 Users
├─> Single serverless function
├─> Free database tier
└─> Manual testing

Phase 2: 500-5,000 Users
├─> Optimize SQL queries (add indexes)
├─> Implement Redis cache for snapshots
└─> Meta Cloud API (cost-effective)

Phase 3: 5,000-50,000 Users
├─> Separate microservices
│   ├─> Webhook handler
│   ├─> Notification sender
│   └─> Outage detector
├─> Message queue (BullMQ/Inngest)
└─> Database read replicas

Phase 4: 50,000+ Users
├─> Multi-region deployment
├─> CDN for API responses
├─> Dedicated WhatsApp BSP (Business Solution Provider)
└─> Real-time WebSocket updates
```

---

## Error Handling Strategy

```
Error Type                   | Action
─────────────────────────────┼────────────────────────────────
DHBVN API timeout           │ Retry 3x, then skip district
DHBVN API 500 error         │ Use cached data (if < 1 hour old)
WhatsApp API rate limit     │ Queue messages, retry later
Database connection failed   │ Circuit breaker, alert admin
Invalid phone number        │ Mark subscription as invalid
User blocks bot             │ Set is_active = false
Webhook signature invalid   │ Reject request, log security event
```

---

## Monitoring & Alerts

```
Key Metrics to Track:
├─> Active subscriptions count
├─> Messages sent per hour
├─> API success rate (DHBVN)
├─> WhatsApp delivery rate
├─> Webhook response time
├─> Cron job execution time
└─> Database query performance

Alert Thresholds:
├─> DHBVN API fails > 5 consecutive times
├─> WhatsApp delivery rate < 95%
├─> Webhook response time > 5 seconds
├─> Database query time > 2 seconds
└─> Cron job execution time > 5 minutes
```

---

## Quick Start Commands

```bash
# 1. Install dependencies
npm install whatsapp-api-js @vercel/postgres node-cache

# 2. Set environment variables
WHATSAPP_PHONE_NUMBER_ID=your_phone_id
WHATSAPP_ACCESS_TOKEN=your_token
WHATSAPP_VERIFY_TOKEN=random_secret
DATABASE_URL=postgres://...
CRON_SECRET=random_secret

# 3. Create database tables
psql $DATABASE_URL -f lib/database/schema.sql

# 4. Deploy to Vercel
vercel --prod

# 5. Configure webhook URL in Meta/Twilio
# URL: https://dhbvn.vercel.app/api/whatsapp/webhook
```

---

**Ready to implement? Let me know which component you'd like to build first!**
