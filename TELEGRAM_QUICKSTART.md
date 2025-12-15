# Telegram Bot - Quick Start Guide (5 Minutes) 🚀

Get your Telegram bot running in just 5 minutes - **100% FREE FOREVER!**

---

## 🎉 Why Telegram?

✅ **$0/month** - Completely free, no per-message costs
✅ **No limits** - Unlimited messages and users
✅ **5-minute setup** - Fastest messaging bot setup
✅ **No business verification** - Start immediately
✅ **Rich features** - Inline keyboards, HTML formatting, buttons
✅ **Great API** - Simple, well-documented, reliable

---

## 🚀 Step-by-Step Setup

### Step 1: Create Telegram Bot (2 minutes)

1. **Open Telegram** and search for [@BotFather](https://t.me/botfather)

2. **Start a chat** with BotFather and send:
   ```
   /newbot
   ```

3. **Follow the prompts:**
   - **Bot name:** `DHBVN Outage Alerts` (or any name you like)
   - **Bot username:** `dhbvn_outage_bot` (must end in `bot`, must be unique)

4. **Copy your bot token:** You'll receive something like:
   ```
   6363456789:AAHdqTcvCH1vGWJxfSe2qRkYGy-XTABCDEF
   ```
   **IMPORTANT:** Save this token - you'll need it!

5. **Test your bot:**
   - Click the link BotFather sends you (t.me/your_bot_name)
   - Send `/start` to your bot
   - It won't respond yet (that's normal!)

---

### Step 2: Database Setup (2 minutes)

**Option A: Vercel Postgres (Recommended)**

1. Go to your **Vercel project** → **Storage** tab
2. Click **Create Database** → **Postgres**
3. Click **Create**
4. Vercel will auto-set environment variables

**Option B: Supabase (Free alternative)**

1. Create project at https://supabase.com
2. Go to **Project Settings** → **Database**
3. Copy connection string (starts with `postgres://`)
4. Save for later

---

### Step 3: Configure Environment (1 minute)

```bash
# 1. Install dependencies (if not already done)
npm install

# 2. Create .env.local file
cp .env.example .env.local

# 3. Edit .env.local with your bot token:
TELEGRAM_BOT_TOKEN=6363456789:AAHdqTcvCH1vGWJxfSe2qRkYGy-XTABCDEF
NEXT_PUBLIC_BASE_URL=https://dhbvn.vercel.app
CRON_SECRET=your_random_secret

# If using Supabase, also add:
POSTGRES_URL=postgres://your_connection_string
```

**Generate CRON_SECRET:**
```bash
openssl rand -base64 32
```

---

### Step 4: Deploy (2 minutes)

```bash
# Deploy to Vercel
vercel --prod

# Add environment variables in Vercel dashboard
# Settings → Environment Variables → paste TELEGRAM_BOT_TOKEN and CRON_SECRET
```

---

### Step 5: Configure GitHub Actions (1 minute)

**Why GitHub Actions?** Vercel Hobby only allows daily cron jobs, but we need to check every 15 minutes. GitHub Actions is free and perfect for this!

1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**

2. Click **New repository secret** and add these 2 secrets:

   **Secret 1:**
   - Name: `APP_URL`
   - Value: `https://dhbvn.vercel.app`

   **Secret 2:**
   - Name: `CRON_SECRET`
   - Value: (same random string you generated earlier)

3. **That's it!** GitHub Actions will automatically run every 15 minutes after you push the code.

**To verify it's working:**
- Go to **Actions** tab in your repo
- You'll see "Check Outages and Send Notifications" workflow
- It runs every 15 minutes automatically

**Manual trigger (for testing):**
- Go to Actions → Select workflow → Click "Run workflow"

---

### Step 6: Set Webhook (30 seconds)

After deployment, set your webhook URL:

**Method A: Using curl (easiest)**
```bash
curl -X POST https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook \
  -d "url=https://dhbvn.vercel.app/api/telegram/webhook"
```

Replace `<YOUR_BOT_TOKEN>` with your actual token.

**Method B: Using browser**
Open in browser:
```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://dhbvn.vercel.app/api/telegram/webhook
```

**Verify webhook:**
```bash
curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo
```

You should see: `"url": "https://dhbvn.vercel.app/api/telegram/webhook"`

---

### Step 7: Initialize Database (30 seconds)

```bash
# Connect to your database and run the schema
psql $POSTGRES_URL -f lib/database/schema.sql
```

**Or** if using Vercel Postgres dashboard:
1. Go to Vercel → Storage → Your Database → Query
2. Copy contents of `lib/database/schema.sql`
3. Paste and execute

---

### Step 8: Test! (1 minute)

1. **Open your bot** in Telegram (link from BotFather)

2. **Send:** `/start`
   - **Bot responds:** Welcome message with district buttons

3. **Click a district** (e.g., Faridabad)
   - **Bot responds:** Subscription confirmation + current outages

4. **Send:** `/status`
   - **Bot responds:** Current outages for your district

5. **Send:** `/help`
   - **Bot responds:** List of commands

---

## ✅ Success Checklist

- [x] Bot created with BotFather
- [x] Bot token saved
- [x] Database created and initialized
- [x] Environment variables set
- [x] Deployed to Vercel
- [x] Webhook configured
- [x] Bot responds to /start
- [x] District selection works
- [x] Notifications will be sent every 15 minutes

---

## 📱 Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Subscribe to alerts |
| `/status` | View current outages |
| `/change` | Update your district |
| `/stop` | Unsubscribe from alerts |
| `/help` | Show help message |

---

## 🔍 Troubleshooting

### Bot not responding?

**Check webhook status:**
```bash
curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo
```

**Expected output:**
```json
{
  "ok": true,
  "result": {
    "url": "https://dhbvn.vercel.app/api/telegram/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0
  }
}
```

**If webhook is not set:**
```bash
# Set it again
curl -X POST https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook \
  -d "url=https://dhbvn.vercel.app/api/telegram/webhook"
```

### Database errors?

**Check connection:**
```bash
psql $POSTGRES_URL -c "SELECT COUNT(*) FROM telegram_subscriptions"
```

**If table doesn't exist:**
```bash
psql $POSTGRES_URL -f lib/database/schema.sql
```

### Webhook errors?

**Check Vercel logs:**
```bash
vercel logs --follow
```

**Common issues:**
1. `TELEGRAM_BOT_TOKEN` not set → Add in Vercel dashboard
2. Database not initialized → Run schema.sql
3. Webhook URL wrong → Reset webhook with correct URL

---

## 💰 Cost Comparison

| Platform | Setup Time | Monthly Cost (1,000 users) |
|----------|------------|---------------------------|
| **Telegram** | **5 min** | **$0** ✅ |
| Twilio | 15 min | $180 |
| Meta WhatsApp | 2-3 days | $17 (after free tier) |

**Telegram wins on every metric!** 🎉

---

## 🎯 What You Built

Congratulations! You now have:

✅ A fully functional Telegram bot
✅ Real-time outage notifications
✅ Smart change detection (no spam)
✅ Scheduled checks every 15 minutes
✅ Database to track subscribers
✅ Interactive inline keyboards
✅ **100% FREE - No costs ever!**

---

## 📈 Next Steps

### Share Your Bot
```
https://t.me/your_bot_username
```
Share this link with users to let them subscribe!

### Optional Improvements
- [ ] Add Hindi/Punjabi language support
- [ ] Send daily summary at specific time
- [ ] Allow multiple district subscriptions
- [ ] Add feedback mechanism
- [ ] Create a channel for broadcast announcements

### Monitor Usage
```bash
# Check subscriber count
psql $POSTGRES_URL -c "SELECT COUNT(*) FROM telegram_subscriptions WHERE is_active = true"

# Check by district
psql $POSTGRES_URL -c "SELECT district_name, COUNT(*) as count FROM telegram_subscriptions WHERE is_active = true GROUP BY district_name"
```

---

## 🆘 Need Help?

### Telegram Bot API Docs
- Official API: https://core.telegram.org/bots/api
- BotFather commands: https://core.telegram.org/bots#botfather

### Your Bot Info
- Bot token: (saved in .env.local)
- Webhook URL: `https://dhbvn.vercel.app/api/telegram/webhook`
- Bot link: `https://t.me/your_bot_username`

### Test Commands
```bash
# Get bot info
curl https://api.telegram.org/bot<TOKEN>/getMe

# Get webhook info
curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo

# Send test message
curl -X POST https://api.telegram.org/bot<TOKEN>/sendMessage \
  -d "chat_id=YOUR_CHAT_ID&text=Test message"
```

---

## 🎉 You're Live!

Your bot is now running and ready to serve thousands of users - **completely free!**

**Share your bot link:**
```
https://t.me/your_bot_username
```

**Monitor it:**
```bash
vercel logs --follow
```

**Celebrate!** 🎊 You just built a production-ready notification system with zero ongoing costs!

---

## 💡 Pro Tips

1. **Set bot description** (users see this before starting):
   ```
   /setdescription @your_bot
   ```
   Then send: `Get instant power outage alerts for your DHBVN district`

2. **Set bot commands** (shows in menu):
   ```
   /setcommands @your_bot
   ```
   Then send:
   ```
   start - Subscribe to alerts
   status - View current outages
   change - Update district
   stop - Unsubscribe
   help - Show help
   ```

3. **Add bot profile picture:**
   ```
   /setuserpic @your_bot
   ```
   Then upload an image (lightning bolt ⚡ works great!)

---

**That's it! Your DHBVN Telegram bot is live and serving users - FOR FREE!** 🚀