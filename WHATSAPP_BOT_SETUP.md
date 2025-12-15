# WhatsApp Bot Setup Guide

Complete step-by-step guide to deploy the DHBVN WhatsApp bot.

---

## Prerequisites

- Vercel account (free tier works)
- Meta Developer account OR Twilio account
- WhatsApp Business phone number

---

## 🚀 Quick Start (30 minutes)

### Step 1: Install Dependencies (2 minutes)

```bash
npm install
```

This will install the new dependencies:
- `@vercel/postgres` - Database connection
- `node-cache` - Rate limiting

### Step 2: Choose Your WhatsApp Provider

**Option A: Meta Cloud API (Recommended - Free tier)**
- ✅ 1,000 free conversations/month
- ✅ Interactive lists and buttons
- ❌ Requires business verification (takes 2-3 days)

**Option B: Twilio (Easier setup)**
- ✅ Quick setup (instant sandbox)
- ✅ Great for testing
- ❌ Costs $0.005-$0.02 per message

**👉 Choose Meta for production, Twilio for quick testing**

---

## 📱 Meta Cloud API Setup (Recommended)

### 1. Create Meta Business Account (5 minutes)

1. Go to https://developers.facebook.com/
2. Click "My Apps" → "Create App"
3. Select "Business" as app type
4. Fill in app details

### 2. Set Up WhatsApp Product (5 minutes)

1. In your app dashboard, click "Add Product"
2. Find "WhatsApp" and click "Set Up"
3. Go to "API Setup" section
4. You'll see a temporary access token and phone number ID

### 3. Get Your Credentials (2 minutes)

Copy these values (you'll need them later):

```
Phone Number ID: Found in "API Setup"
Access Token: Click "Generate Token" (temporary for testing)
App Secret: Settings → Basic → App Secret
```

### 4. Configure Webhook (5 minutes)

1. In WhatsApp → Configuration
2. Click "Edit" next to Webhook
3. Enter your webhook URL:
   ```
   https://dhbvn.vercel.app/api/whatsapp/webhook
   ```
4. Enter a verify token (make up a random string):
   ```
   my_secret_verify_token_123
   ```
5. Subscribe to "messages" field

### 5. Get Permanent Access Token (for production)

For testing, the temporary token works. For production:

1. Go to Settings → Basic
2. Create a System User in Business Settings
3. Generate a permanent token with `whatsapp_business_messaging` permission

---

## 📞 Twilio Setup (Alternative)

### 1. Create Twilio Account

1. Sign up at https://www.twilio.com/try-twilio
2. Verify your email and phone number

### 2. Enable WhatsApp Sandbox

1. Go to Console → Messaging → Try it out → Send a WhatsApp message
2. Follow instructions to join your WhatsApp sandbox
3. Send the code (e.g., "join xyz-123") to the Twilio number

### 3. Get Your Credentials

```
Account SID: Found in console dashboard
Auth Token: Found in console dashboard
WhatsApp Number: e.g., whatsapp:+14155238886
```

### 4. Configure Webhook

1. Go to Console → Messaging → Settings → WhatsApp sandbox settings
2. Enter your webhook URL:
   ```
   https://dhbvn.vercel.app/api/whatsapp/webhook
   ```

---

## 🗄️ Database Setup (5 minutes)

### Option A: Vercel Postgres (Easiest)

1. Go to your Vercel project dashboard
2. Click "Storage" tab
3. Click "Create Database" → "Postgres"
4. Click "Create"
5. Vercel will automatically set environment variables

### Option B: Supabase (Best free tier)

1. Go to https://supabase.com/
2. Create new project
3. Copy the connection string
4. Add to Vercel environment variables as `POSTGRES_URL`

### Initialize Database Tables

After deploying (see Step 4), run this command locally or in Vercel:

```bash
# If using local Postgres
psql $POSTGRES_URL -f lib/database/schema.sql

# Or connect to Vercel Postgres and run the SQL manually
```

**Alternatively**, use the Vercel Postgres dashboard to run the SQL from `lib/database/schema.sql` directly.

---

## ⚙️ Environment Variables Setup (5 minutes)

### 1. Copy the example file

```bash
cp .env.example .env.local
```

### 2. Fill in all values

#### For Meta Cloud API:

```env
# Application
NEXT_PUBLIC_BASE_URL=https://dhbvn.vercel.app

# WhatsApp Provider
WHATSAPP_PROVIDER=meta

# Meta Credentials
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxx
WHATSAPP_VERIFY_TOKEN=my_secret_verify_token_123
WHATSAPP_APP_SECRET=abc123def456

# Cron Security
CRON_SECRET=generate_random_string_here

# Database (automatically set by Vercel if using Vercel Postgres)
# POSTGRES_URL=postgres://...
```

#### For Twilio:

```env
# Application
NEXT_PUBLIC_BASE_URL=https://dhbvn.vercel.app

# WhatsApp Provider
WHATSAPP_PROVIDER=twilio

# Twilio Credentials
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Cron Security
CRON_SECRET=generate_random_string_here

# Database
# POSTGRES_URL=postgres://...
```

### 3. Generate CRON_SECRET

```bash
# On Mac/Linux
openssl rand -base64 32

# Or use any random string generator
```

---

## 🚀 Deploy to Vercel (5 minutes)

### 1. Commit your changes

```bash
git add .
git commit -m "Add WhatsApp bot functionality"
git push origin claude/whatsapp-bot-setup-ABzvU
```

### 2. Deploy to Vercel

If not already connected to Vercel:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Or push to GitHub and Vercel will auto-deploy.

### 3. Add Environment Variables in Vercel

1. Go to your project in Vercel dashboard
2. Settings → Environment Variables
3. Add all variables from your `.env.local`
4. Redeploy for changes to take effect

### 4. Verify Cron Job

1. In Vercel dashboard, go to "Cron Jobs" tab
2. You should see: `/api/cron/check-outages` running every 15 minutes
3. Check logs to ensure it's running

---

## ✅ Testing the Bot (10 minutes)

### 1. Test Webhook Verification

```bash
curl "https://dhbvn.vercel.app/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=YOUR_VERIFY_TOKEN&hub.challenge=test123"

# Should return: test123
```

### 2. Test WhatsApp Conversation

#### Basic Flow:
1. **Send:** `Hi`
   - **Receive:** Welcome message + district selector

2. **Select:** District (e.g., "10" or click from list)
   - **Receive:** Confirmation + current outages

3. **Send:** `STATUS`
   - **Receive:** Current outages for your district

4. **Send:** `CHANGE`
   - **Receive:** District selector again

5. **Send:** `STOP`
   - **Receive:** Unsubscribe confirmation

### 3. Test Cron Job Manually

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
     https://dhbvn.vercel.app/api/cron/check-outages

# Should return JSON with status and stats
```

### 4. Check Database

```sql
-- View subscriptions
SELECT * FROM whatsapp_subscriptions;

-- View outage snapshots
SELECT * FROM outage_snapshots;

-- Check stats
SELECT district_name, COUNT(*) as subscribers
FROM whatsapp_subscriptions
WHERE is_active = true
GROUP BY district_name;
```

---

## 🔧 Troubleshooting

### Issue: Webhook not receiving messages

**Check:**
1. Webhook URL is correct in Meta/Twilio dashboard
2. Verify token matches environment variable
3. Check Vercel logs for errors: `vercel logs`
4. Ensure webhook is subscribed to "messages" field (Meta only)

**Solution:**
```bash
# Test webhook locally with ngrok
ngrok http 3000
# Update webhook URL to ngrok URL temporarily
```

### Issue: Messages not sending

**Check:**
1. Access token is valid (Meta tokens expire)
2. Phone number has whatsapp: prefix (Twilio)
3. Phone number is in E.164 format (+1234567890)
4. Check rate limits (5 messages/minute per user)

**Solution:**
```bash
# Check logs
vercel logs --follow

# Test client directly
node -e "require('./lib/whatsapp/client').sendWhatsAppMessage('+1234567890', 'test')"
```

### Issue: Cron job not running

**Check:**
1. vercel.json has correct cron configuration
2. Project is on Vercel Pro plan (free tier limited to 60 executions/day)
3. Check "Cron Jobs" tab in Vercel dashboard
4. CRON_SECRET environment variable is set

**Solution:**
```bash
# Manually trigger cron
curl -H "Authorization: Bearer $CRON_SECRET" https://dhbvn.vercel.app/api/cron/check-outages
```

### Issue: Database connection failed

**Check:**
1. POSTGRES_URL environment variable is set
2. Database is accessible from Vercel
3. Tables are created (run schema.sql)

**Solution:**
```bash
# Test connection
psql $POSTGRES_URL -c "SELECT 1"

# Re-run schema
psql $POSTGRES_URL -f lib/database/schema.sql
```

### Issue: Rate limiting false positives

**Problem:** Users getting rate limited when they shouldn't be

**Solution:** Adjust rate limit in `app/api/whatsapp/webhook/route.ts`:
```typescript
const RATE_LIMIT_WINDOW = 60000; // Increase to 2 minutes
const MAX_MESSAGES_PER_WINDOW = 10; // Increase limit
```

---

## 📊 Monitoring & Maintenance

### Daily Checks

1. **Check cron job logs:**
   ```bash
   vercel logs --follow | grep "check-outages"
   ```

2. **Monitor subscription growth:**
   ```sql
   SELECT COUNT(*) FROM whatsapp_subscriptions WHERE is_active = true;
   ```

3. **Check notification success rate:**
   ```sql
   SELECT district_name, COUNT(*) as total_sent
   FROM whatsapp_subscriptions
   WHERE last_notification_sent > NOW() - INTERVAL '1 day'
   GROUP BY district_name;
   ```

### Weekly Maintenance

1. **Clean up old outages:**
   ```sql
   DELETE FROM outage_snapshots
   WHERE is_resolved = true AND last_seen < NOW() - INTERVAL '30 days';
   ```

2. **Review failed notifications:**
   - Check Vercel logs for send failures
   - Investigate phone numbers with repeated failures

### Monthly Review

1. **Cost analysis:**
   - Meta: Check usage in Business Manager
   - Twilio: Check billing dashboard
   - Vercel: Check function execution counts

2. **User engagement:**
   ```sql
   -- Active users by district
   SELECT district_name, COUNT(*) as users
   FROM whatsapp_subscriptions
   WHERE is_active = true
   GROUP BY district_name;

   -- Unsubscribe rate
   SELECT
     COUNT(*) FILTER (WHERE is_active = false) * 100.0 / COUNT(*) as unsubscribe_rate
   FROM whatsapp_subscriptions;
   ```

---

## 🎯 Next Steps & Enhancements

### Phase 1 Improvements (Optional)

- [ ] Add user onboarding analytics
- [ ] Implement admin dashboard (view stats)
- [ ] Add multi-language support (Hindi/Punjabi)
- [ ] Send daily summary at specific time

### Phase 2 Scaling (When > 1,000 users)

- [ ] Add Redis cache for rate limiting
- [ ] Implement message queue (BullMQ/Inngest)
- [ ] Add retry logic for failed notifications
- [ ] Set up monitoring (Sentry/Datadog)

### Phase 3 Features (Future)

- [ ] Allow users to subscribe to multiple districts
- [ ] Add area-specific subscriptions (not just district)
- [ ] Send notifications only during specific hours
- [ ] Add feedback mechanism ("Was this helpful?")

---

## 📚 Useful Commands

```bash
# Development
npm run dev

# Build and test
npm run build
npm run start

# Deploy
vercel --prod

# View logs
vercel logs --follow

# Database operations
psql $POSTGRES_URL

# Test webhook
curl -X POST https://dhbvn.vercel.app/api/whatsapp/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Test cron manually
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://dhbvn.vercel.app/api/cron/check-outages
```

---

## 🆘 Getting Help

### Documentation Links

- [Meta Cloud API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Twilio WhatsApp Docs](https://www.twilio.com/docs/whatsapp)
- [Vercel Postgres Docs](https://vercel.com/docs/storage/vercel-postgres)
- [Vercel Cron Jobs Docs](https://vercel.com/docs/cron-jobs)

### Support

- Check the implementation plan: `WHATSAPP_BOT_PLAN.md`
- Review architecture: `WHATSAPP_BOT_ARCHITECTURE.md`
- Open an issue on GitHub
- Contact Vercel support for deployment issues

---

## 🎉 Success Checklist

- [x] Dependencies installed
- [x] WhatsApp provider configured
- [x] Database created and initialized
- [x] Environment variables set
- [x] Deployed to Vercel
- [x] Webhook verified
- [x] Bot responds to messages
- [x] Cron job running
- [x] Notifications sending correctly

**You're all set! Your WhatsApp bot is live! 🚀**

Users can now message your WhatsApp number and receive power outage alerts.

---

**Pro Tip:** Test with a few friends first before announcing to a larger audience. This helps catch any edge cases or issues.
