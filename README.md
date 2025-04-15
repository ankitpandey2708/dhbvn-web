Learnings
1. comparing dates within timezone was nightmare. The simple implementation was working fine on local but not on vercel.
2. In Next.js, API routes are cached by default, which is why we're wont see fresh data until redeploy.