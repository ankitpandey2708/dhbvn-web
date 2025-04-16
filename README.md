Learnings
1. vibecoding via cursor.
2. comparing dates within timezone was nightmare. The simple implementation was working fine on local but not on vercel.
3. In Next.js, API routes are cached by default, which is why we're wont see fresh data until redeploy.