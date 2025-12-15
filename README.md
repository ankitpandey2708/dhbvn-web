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

### WhatsApp Bot 📱 NEW!
- **Real-time notifications**: Get instant alerts on WhatsApp when power outages occur or are restored
- **District subscriptions**: Subscribe to alerts for your specific district
- **Interactive commands**: STATUS, CHANGE, STOP, and more
- **Smart notifications**: Only notified of actual changes (new outages or restorations)
- **Multi-provider support**: Works with Twilio (recommended) or Meta Cloud API
- **Quick setup**: Get started in 15 minutes with Twilio

**Quick Start:**
- [15-Minute Twilio Setup](./TWILIO_QUICKSTART.md) ⭐ (Recommended for testing)
- [Complete Documentation](./WHATSAPP_BOT_README.md) (Full guide for both providers)

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

## Learnings

1. Vibecoding via cursor.
2. Comparing dates within timezone was nightmare. The simple implementation was working fine on local but not on vercel.
3. In Next.js, API routes are cached by default, which is why we're wont see fresh data until redeploy.
