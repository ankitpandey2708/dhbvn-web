# Twilio WhatsApp Bot - Quick Start Guide (15 Minutes)

Get your WhatsApp bot running in just 15 minutes using Twilio!

---

## 🚀 Step-by-Step Setup

### Step 1: Twilio Account (3 minutes)

1. **Sign up** at https://www.twilio.com/try-twilio
2. **Verify** your email and phone
3. You get **$15 free credit** to test

### Step 2: WhatsApp Sandbox (2 minutes)

1. Go to **Console** → **Messaging** → **Try it out** → **Send a WhatsApp message**
2. You'll see a **QR code** and **join code** like "join able-orange"
3. **Two ways to join:**
   - **Option A:** Scan the QR code with WhatsApp
   - **Option B:**
     - Open WhatsApp
     - Message **+1 415 523 8886** (Twilio's sandbox number)
     - Send the join code: **"join able-orange"** (use your specific code)
4. You'll receive: **"Congratulations! You've joined the sandbox."**

### Step 3: Get Credentials (2 minutes)

From your **Twilio Console Dashboard**, copy:

```
Account SID: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Auth Token: (click "View" to reveal)
WhatsApp Number: whatsapp:+14155238886
```

### Step 4: Configure Environment (3 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local file
cp .env.example .env.local

# 3. Edit .env.local with your Twilio credentials:
WHATSAPP_PROVIDER=twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
TWILIO_WEBHOOK_URL=https://dhbvn.vercel.app/api/whatsapp/webhook
CRON_SECRET=your_random_secret
NEXT_PUBLIC_BASE_URL=https://dhbvn.vercel.app
```

**Generate CRON_SECRET:**
```bash
openssl rand -base64 32
```

### Step 5: Database Setup (3 minutes)

**Option A: Vercel Postgres (Easiest)**

1. Go to your **Vercel project** → **Storage** → **Create Database** → **Postgres**
2. Vercel auto-sets environment variables
3. After deployment, run:
   ```bash
   # Connect and run schema
   vercel env pull .env.local
   psql $POSTGRES_URL -f lib/database/schema.sql
   ```

**Option B: Supabase (Free alternative)**

1. Create project at https://supabase.com
2. Go to **Project Settings** → **Database** → Copy connection string
3. Add to `.env.local`:
   ```
   POSTGRES_URL=postgres://...
   ```
4. Run schema:
   ```bash
   psql $POSTGRES_URL -f lib/database/schema.sql
   ```

### Step 6: Deploy to Vercel (2 minutes)

```bash
# Deploy
vercel --prod

# Add environment variables in Vercel dashboard
# Settings → Environment Variables → paste all from .env.local
```

### Step 7: Configure Webhook in Twilio (2 minutes)

1. Go to **Twilio Console** → **Messaging** → **Settings** → **WhatsApp sandbox settings**
2. Under **"When a message comes in"**:
   ```
   https://dhbvn.vercel.app/api/whatsapp/webhook
   ```
3. Method: **POST**
4. **Save**

### Step 8: Test! (2 minutes)

Send these messages to your Twilio WhatsApp number:

```
You: Hi
Bot: 👋 Welcome to DHBVN Outage Alerts!
     Please select your district:
     1. Jind
     2. Fatehabad
     ...

You: 10
Bot: ✅ Subscribed to Faridabad alerts!
     Current outages in Faridabad:
     [shows outages if any]

You: STATUS
Bot: [shows current outages]

You: STOP
Bot: ✅ You've been unsubscribed
```

---

## ✅ Success Checklist

- [x] Twilio account created
- [x] WhatsApp sandbox joined (received confirmation)
- [x] Credentials copied
- [x] Environment variables set
- [x] Database created and initialized
- [x] Deployed to Vercel
- [x] Webhook configured
- [x] Bot responds to "Hi"

---

## 🔍 Troubleshooting

### Bot not responding?

**Check Vercel logs:**
```bash
vercel logs --follow
```

**Common issues:**

1. **Webhook not configured**
   - Solution: Double-check webhook URL in Twilio settings
   - Must be: `https://dhbvn.vercel.app/api/whatsapp/webhook`

2. **Wrong environment variables**
   - Solution: Verify in Vercel dashboard → Settings → Environment Variables
   - Must include `WHATSAPP_PROVIDER=twilio`

3. **Database not initialized**
   - Solution: Run schema.sql
   ```bash
   psql $POSTGRES_URL -f lib/database/schema.sql
   ```

4. **Phone number format wrong**
   - Solution: Must include `whatsapp:` prefix
   - Correct: `whatsapp:+14155238886`

### Still not working?

1. **Test webhook directly:**
   ```bash
   curl -X POST https://dhbvn.vercel.app/api/whatsapp/webhook \
     -H "Content-Type: application/json" \
     -d '{"From":"whatsapp:+1234567890","Body":"Hi"}'
   ```

2. **Check database connection:**
   ```bash
   psql $POSTGRES_URL -c "SELECT COUNT(*) FROM whatsapp_subscriptions"
   ```

3. **Verify Twilio credentials:**
   - Dashboard shows Account SID and Auth Token
   - Test with Twilio's API Explorer

---

## 💰 Cost Estimate

### Twilio Pricing
- **Inbound messages:** $0.005 each
- **Outbound messages:** $0.02 each

### Example: 100 users, 3 outages/month
- Inbound: 100 users × 3 messages = 300 × $0.005 = **$1.50**
- Outbound: 100 users × 9 notifications = 900 × $0.02 = **$18**
- **Total: ~$20/month**

### For 1,000 users:
- **~$200/month**

**Note:** Your $15 free credit covers testing for months!

---

## 🎯 Next Steps

### Production Ready
- [ ] Request your own WhatsApp number from Twilio (instead of sandbox)
- [ ] Set up monitoring (Vercel logs, Sentry)
- [ ] Add error alerting
- [ ] Test with 10-20 real users first

### Optional Improvements
- [ ] Add Hindi/Punjabi language support
- [ ] Send daily summary at specific time
- [ ] Allow multiple district subscriptions
- [ ] Add feedback mechanism

### Migrate to Meta (When Ready)
When you reach 5,000+ users, consider migrating to Meta Cloud API:
- Lower costs ($264 vs $600 per 1,000 users)
- Better UX with interactive lists
- See `WHATSAPP_BOT_SETUP.md` for Meta setup guide

---

## 📱 WhatsApp Commands

Users can send these commands:

| Command | Description |
|---------|-------------|
| `HI` | Subscribe to alerts |
| `STATUS` | View current outages |
| `CHANGE` | Update district |
| `STOP` | Unsubscribe |
| `HELP` | Show help message |
| `1-12` | Select district by number |

---

## 🎓 What You Built

Congratulations! You now have:

✅ A fully functional WhatsApp bot
✅ Real-time outage notifications
✅ Smart change detection (no spam)
✅ Scheduled checks every 15 minutes
✅ Database to track subscribers
✅ Command-based interaction

**Share your Twilio sandbox number with friends and start getting feedback!**

---

## 📚 Additional Resources

- **Full Documentation:** `WHATSAPP_BOT_README.md`
- **Detailed Setup:** `WHATSAPP_BOT_SETUP.md`
- **Architecture:** `WHATSAPP_BOT_ARCHITECTURE.md`
- **Twilio Docs:** https://www.twilio.com/docs/whatsapp

---

**Questions?** Check the troubleshooting section or review the full setup guide!
