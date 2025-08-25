[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/ankitpandey2708/dhbvn-web)

# DHBVN Power Outage Tracker

Real-time information about power outages in Faridabad powered by DHBVN data.

## Features

- Real-time tracking of power outages in Faridabad
- Search functionality to find outages by area or feeder
- Display of outage start time and expected restoration time
- Mobile-responsive design
- Downloadable PDF reports
- Auto-refreshing data (every 5 minutes)

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
