[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/ankitpandey2708/dhbvn-web)

# DHBVN Power Outage Tracker

Real-time information about power outages across Haryana districts powered by DHBVN data.

## Features

### Web Application
- **Multi-district support**: Track power outages across 12 Haryana districts (Faridabad, Gurugram, Hisar, Jind, Fatehabad, Sirsa, Bhiwani, Mahendargarh, Rewari, Nuh, Palwal, Charkhi Dadri)
- **District selector dropdown**: Easily switch between districts to view their outage data
- Search functionality to find outages by area or feeder
- Display of outage start time and expected restoration time
- Mobile-responsive design
- Downloadable PDF reports with district-specific titles
- Auto-refreshing data (every 5 minutes)
- Dynamic metadata and structured data based on selected district

### Telegram Bot 💬 NEW! **100% FREE**
- **Real-time notifications**: Get instant alerts on Telegram when power outages occur or are restored
- **District subscriptions**: Subscribe to alerts for your specific district
- **Interactive commands**: /start, /status, /change, /stop, and more
- **Smart notifications**: Only notified of actual changes (new outages or restorations)
- **Inline keyboards**: Beautiful button-based district selection
- **5-minute setup**: Fastest bot setup, completely free forever!
- **No limits**: Unlimited messages, unlimited users, $0/month

**Quick Start:**
- `https://t.me/dhbvn_bot`

## SEO Implementation

The application implements several SEO best practices:

- Comprehensive metadata in Next.js app router
- Open Graph and Twitter card support for better social sharing
- Structured data (JSON-LD) for rich search results
- Sitemap.xml for search engine crawling
- Robots.txt for crawler guidance
- PWA manifest for mobile device support
- Optimized page title and description with relevant keywords
- Semantic HTML structure
- Fast loading with Next.js app optimization

## Analytics

1. https://snipboard.io/TkCtHR.jpg (as of 26-03-2026)
2. https://snipboard.io/YuLIGT.jpg (as of 02-05-2026)
3. https://snipboard.io/sI5YNw.jpg (as of 21-05-2026)


## Appendix: Key DHBVN Data Sources

| # | Resource | URL |
|---|---|---|
| 1 | CIN Codes at Feeder Level (Circle-wise PDFs) | https://www.dhbvn.org.in/web/portal/cin-codes-at-feeder-level |
| 2 | Feeder List (Structured XLS) | https://mis.dhbvn.org.in/ListofFeedersbyDepartment.xlsx |
| 3 | Transformer Info (Damage Reports) | https://tims.dhbvn.org.in/DamageTransformer |
| 4 | Faridabad Circle RTS (Offices & Contacts) | https://www.dhbvn.org.in/staticContent/contactus/FRTRTS/RTS_Faridabad_Circle.pdf |
