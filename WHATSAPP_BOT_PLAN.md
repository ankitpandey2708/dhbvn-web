# WhatsApp Bot Implementation Plan for DHBVN

## Overview
Enable users to receive real-time power outage notifications for their district via WhatsApp.

---

## 📋 Complete User Flow

### Initial Setup Flow
```
User: "Hi"
Bot: "👋 Welcome to DHBVN Outage Alerts!

Get instant updates about power outages in your district.

Please select your district:"

[Interactive List with 12 districts]

User: Selects "Faridabad"
Bot: "✅ Subscribed to Faridabad alerts!

Current outages in Faridabad:
📍 Sector 16 (Feeder: 67aa)
⚡ Started: 16-Apr-2025 10:24
🔧 Expected restoration: 16-Apr-2025 12:44
📝 Reason: breakdown

---

You'll receive automatic notifications when:
- New outages are reported
- Outages are restored

Commands:
• CHANGE - Update your district
• STOP - Unsubscribe from alerts
• STATUS - View current outages"

User: Receives notifications automatically when outages occur
```

### Notification Flow
```
Bot (auto-sent): "⚠️ New Outage Alert - Faridabad

📍 Sector 15 (Feeder: ab412)
⚡ Started: 16-Apr-2025 13:24
🔧 Expected restoration: 17-Apr-2025 09:44
📝 Reason: line fault"
```

---

## 🔧 Technical Architecture

### Option 1: Twilio WhatsApp API (Recommended for Quick Start) ⭐
**Pros:**
- ✅ Instant setup (15 minutes with sandbox)
- ✅ Excellent documentation and support
- ✅ Reliable infrastructure (99.95% uptime)
- ✅ Great for testing and MVP
- ✅ Easy to upgrade to production number
- ✅ No business verification needed for sandbox

**Cons:**
- ❌ Costs: $0.005 per inbound, $0.02 per outbound message
- ❌ Sandbox has Twilio branding
- ❌ Text-based interactions only (no interactive lists)

**Best for:** Quick prototyping, testing, small to medium scale (< 5,000 users)

**💰 Cost for 1,000 users:** ~$600/month (3 notifications/user/month)

### Option 2: Meta WhatsApp Cloud API (Best for Scale)
**Pros:**
- ✅ Free tier: 1,000 conversations/month
- ✅ Official WhatsApp integration
- ✅ Interactive buttons & lists support
- ✅ Better branding (no provider watermark)
- ✅ Lower costs at scale

**Cons:**
- ❌ Requires Meta Business verification (2-3 days)
- ❌ More complex setup
- ❌ Stricter content policies

**Best for:** Production at scale (> 5,000 users), better user experience

**💰 Cost for 1,000 users:** ~$264/month (after free tier)

### Option 3: Baileys (Open Source Library) - ❌ NOT RECOMMENDED
**Pros:**
- Completely free
- Full WhatsApp Web API control

**Cons:**
- ❌ Against WhatsApp ToS (risk of ban)
- ❌ Requires constant QR code refresh
- ❌ Not suitable for production
- ❌ No support or reliability guarantees

---

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE whatsapp_subscriptions (
  id SERIAL PRIMARY KEY,
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  district_id INTEGER NOT NULL,
  district_name VARCHAR(50) NOT NULL,
  subscribed_at TIMESTAMP DEFAULT NOW(),
  last_notification_sent TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_active_subscriptions ON whatsapp_subscriptions(is_active, district_id);
CREATE INDEX idx_phone_lookup ON whatsapp_subscriptions(phone_number);
```

### Outage Tracking Table (for change detection)
```sql
CREATE TABLE outage_snapshots (
  id SERIAL PRIMARY KEY,
  district_id INTEGER NOT NULL,
  outage_hash VARCHAR(64) NOT NULL, -- MD5 hash of outage details
  area VARCHAR(255) NOT NULL,
  feeder VARCHAR(100) NOT NULL,
  start_time TIMESTAMP NOT NULL,
  restoration_time TIMESTAMP NOT NULL,
  reason TEXT,
  first_seen TIMESTAMP DEFAULT NOW(),
  last_seen TIMESTAMP DEFAULT NOW(),
  is_resolved BOOLEAN DEFAULT false,
  UNIQUE(district_id, outage_hash)
);

CREATE INDEX idx_district_active ON outage_snapshots(district_id, is_resolved);
```

---

## 🚀 Implementation Steps

### Step 1: Choose Provider & Setup (1-2 days)

#### For Meta Cloud API:
1. Create Meta Business Account: https://business.facebook.com
2. Set up WhatsApp Business App: https://developers.facebook.com/apps
3. Get Phone Number ID, Access Token, Webhook Verify Token
4. Configure webhook URL: `https://dhbvn.vercel.app/api/whatsapp/webhook`

#### For Twilio:
1. Sign up: https://www.twilio.com/try-twilio
2. Get WhatsApp Sandbox number (instant) or register business number
3. Get Account SID, Auth Token, WhatsApp number
4. Configure webhook: `https://dhbvn.vercel.app/api/whatsapp/webhook`

---

### Step 2: Database Setup (1 day)

**Recommended Options:**

#### Option A: Vercel Postgres (Easiest)
```bash
npm install @vercel/postgres
```
- Integrated with Vercel
- 256MB free tier
- Automatic connection pooling

#### Option B: Supabase (Best Free Tier)
```bash
npm install @supabase/supabase-js
```
- 500MB database free
- Built-in auth & real-time features
- Dashboard UI

#### Option C: Neon (Serverless Postgres)
```bash
npm install @neondatabase/serverless
```
- Generous free tier
- True serverless (scales to zero)

---

### Step 3: API Endpoints (2-3 days)

Create 3 new API routes:

#### 1. `/api/whatsapp/webhook` (Receive messages)
```typescript
// Handles incoming WhatsApp messages
POST /api/whatsapp/webhook
- Verify webhook signature
- Parse message type (text/interactive)
- Route to conversation handler
- Send response via WhatsApp API
```

#### 2. `/api/whatsapp/notify` (Send notifications)
```typescript
// Triggered by cron job to check outages
POST /api/whatsapp/notify
- Fetch all active subscriptions
- For each district, call /api/dhbvn?district=X
- Compare with previous snapshot (outage_snapshots table)
- Detect new outages or restorations
- Send WhatsApp messages to subscribers
- Update outage_snapshots
```

#### 3. `/api/cron/check-outages` (Scheduled job)
```typescript
// Vercel Cron: runs every 15 minutes
GET /api/cron/check-outages
- Calls /api/whatsapp/notify
- Protected by cron secret token
```

---

### Step 4: Conversation Handler Logic (2 days)

```typescript
// Simplified flow logic
const handleMessage = async (phone: string, message: string) => {
  const user = await getUser(phone);
  const normalizedMsg = message.trim().toUpperCase();

  // Command handling
  if (normalizedMsg === 'STOP') {
    await unsubscribe(phone);
    return "You've been unsubscribed. Send HI to subscribe again.";
  }

  if (normalizedMsg === 'STATUS') {
    return await getCurrentOutages(user.district_id);
  }

  if (normalizedMsg === 'CHANGE') {
    return await sendDistrictSelector(phone);
  }

  // New user flow
  if (!user && (normalizedMsg === 'HI' || normalizedMsg === 'HELLO')) {
    return await sendWelcomeMessage(phone);
  }

  // Default response
  return "Send HI to get started, STATUS for current outages, or CHANGE to update your district.";
};
```

---

### Step 5: Notification Scheduler (1 day)

**Option A: Vercel Cron (Recommended)**
```json
// vercel.json
{
  "crons": [{
    "path": "/api/cron/check-outages",
    "schedule": "*/15 * * * *"  // Every 15 minutes
  }]
}
```

**Option B: GitHub Actions (Free alternative)**
```yaml
# .github/workflows/check-outages.yml
name: Check Outages
on:
  schedule:
    - cron: '*/15 * * * *'
jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - run: curl -X POST https://dhbvn.vercel.app/api/whatsapp/notify
        env:
          CRON_SECRET: ${{ secrets.CRON_SECRET }}
```

---

### Step 6: Message Templates

```typescript
// Message formatting utilities
const formatOutageMessage = (outage: DHBVNData) => `
📍 ${outage.area} (Feeder: ${outage.feeder})
⚡ Started: ${outage.start_time}
🔧 Expected restoration: ${outage.restoration_time}
📝 Reason: ${outage.reason}
`;

const formatMultipleOutages = (outages: DHBVNData[], district: string) => `
⚠️ ${outages.length} Active Outages - ${district}

${outages.map((o, i) => `${i + 1}. ${formatOutageMessage(o)}`).join('\n---\n')}
`;
```

---

## 💰 Cost Estimation

### Twilio Pricing (Recommended for Start)
- **Inbound messages:** $0.005/message
- **Outbound messages:** $0.02/message
- **Free trial:** $15 credit (covers ~750 outbound messages)

**Cost by User Scale:**

| Users | Monthly Messages | Cost/Month | Notes |
|-------|-----------------|------------|-------|
| 10 | ~90 | **$1.80** | Free trial covers months |
| 100 | ~900 | **$18** | Great for testing |
| 1,000 | ~9,000 | **$180** | Consider Meta at this scale |
| 5,000 | ~45,000 | **$900** | Migrate to Meta recommended |

*Assumes 3 outages/user/month + setup messages*

**Best for:** Testing, MVP, < 1,000 users

### Meta Cloud API Pricing (Best for Scale)
- **First 1,000 conversations/month:** **Free**
- **Business-initiated:** $0.0088/conversation
- **User-initiated:** Free

**Cost by User Scale:**

| Users | Monthly Conversations | Cost/Month | Notes |
|-------|---------------------|------------|-------|
| 10 | ~30 | **Free** | Under free tier |
| 100 | ~300 | **Free** | Under free tier |
| 1,000 | ~3,000 | **$17.60** | After free tier |
| 5,000 | ~15,000 | **$123.20** | Much cheaper than Twilio |

**Best for:** Production, > 1,000 users, cost optimization

### Infrastructure Costs (Both Providers)
- **Vercel:** **Free** on Hobby tier (sufficient for < 10,000 users)
- **Database:** **Free** tier (Vercel Postgres or Supabase)
  - Vercel Postgres: 256MB free (~ 5,000 users)
  - Supabase: 500MB free (~ 10,000 users)

### 💡 Cost Optimization Strategy

1. **Start (0-100 users):** Twilio - Easy setup, free trial covers costs
2. **Growth (100-1,000 users):** Twilio - $180/month is manageable
3. **Scale (1,000+ users):** Migrate to Meta - Save ~85% on messaging costs
4. **Enterprise (10,000+ users):** Meta + optimize cron frequency

---

## 🔒 Security Considerations

1. **Webhook Verification**
   - Validate Meta/Twilio signatures on every request
   - Use environment variables for secrets

2. **Rate Limiting**
   - Prevent spam: Max 5 messages/minute per user
   - Use Vercel Edge Config or Redis for tracking

3. **Phone Number Privacy**
   - Store hashed phone numbers
   - GDPR compliance: Allow data deletion

4. **Cron Job Protection**
   - Secret token in header: `x-cron-secret`
   - Only allow calls from Vercel IPs

---

## 📈 Scaling Strategy

### Phase 1: MVP (0-500 users)
- Manual WhatsApp number (Twilio sandbox)
- Single Vercel serverless function
- Free database tier

### Phase 2: Growth (500-5,000 users)
- Meta Cloud API with verified business
- Database upgrade (Supabase Pro: $25/month)
- Optimize cron to check only changed districts

### Phase 3: Scale (5,000+ users)
- Move to dedicated WhatsApp Business API provider
- Add Redis cache for outage snapshots
- Implement message queuing (BullMQ/Inngest)
- Multi-region database replication

---

## 🧪 Testing Checklist

- [ ] Webhook receives messages correctly
- [ ] District selection works (interactive buttons)
- [ ] Subscription stored in database
- [ ] Current outages fetched and formatted
- [ ] Cron job runs on schedule
- [ ] New outages trigger notifications
- [ ] Restored outages send completion message
- [ ] STOP command unsubscribes user
- [ ] CHANGE command updates district
- [ ] Error handling for API failures

---

## 🚦 Implementation Timeline

| Phase | Tasks | Duration |
|-------|-------|----------|
| **Week 1** | Provider setup, Database schema, Webhook endpoint | 3-4 days |
| **Week 2** | Conversation handler, Message templates, Testing | 4-5 days |
| **Week 3** | Notification scheduler, Change detection, Deployment | 3-4 days |
| **Week 4** | End-to-end testing, Bug fixes, Documentation | 3-4 days |

**Total: 3-4 weeks for production-ready bot**

---

## 🎯 Recommended Tech Stack

### For Quick Start & Testing
```json
{
  "whatsapp": "Twilio",
  "database": "Vercel Postgres",
  "scheduler": "Vercel Cron",
  "deployment": "Vercel (existing)",
  "additional-deps": [
    "@vercel/postgres",  // Database
    "node-cache",  // Rate limiting
    "zod"  // Already installed - validation
  ]
}
```

**Why Twilio?**
- ✅ 15-minute setup with sandbox
- ✅ No business verification needed
- ✅ $15 free trial credit
- ✅ Perfect for testing and MVP

### For Production Scale (1,000+ users)
```json
{
  "whatsapp": "Meta Cloud API",
  "database": "Vercel Postgres or Supabase",
  "scheduler": "Vercel Cron",
  "deployment": "Vercel (existing)",
  "additional-deps": [
    "@vercel/postgres",  // Database
    "node-cache",  // Rate limiting
    "zod"  // Already installed - validation
  ]
}
```

**Why Meta?**
- ✅ 1,000 free conversations/month
- ✅ Interactive lists and buttons
- ✅ Lower costs at scale (~85% cheaper)
- ✅ Better user experience
```

---

## 📝 Next Steps

1. **Decide on WhatsApp provider** (Meta Cloud API recommended)
2. **Set up database** (Vercel Postgres for simplicity)
3. **Create webhook endpoint** (Start with message echo test)
4. **Implement conversation flow** (District selection first)
5. **Build notification system** (Cron + change detection)
6. **Deploy and test** (Use sandbox/test numbers)

---

## 📚 Useful Resources

- [Meta Cloud API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Twilio WhatsApp Docs](https://www.twilio.com/docs/whatsapp)
- [Vercel Postgres Guide](https://vercel.com/docs/storage/vercel-postgres)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)

---

**Questions or need help with implementation? Let me know which provider you'd like to use and I'll start building!**
