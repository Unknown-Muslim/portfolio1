// Content-Security-Policy is set dynamically per-request in proxy.ts
// (needs a random nonce each request, so it can't live in this static
// config). Everything below doesn't need per-request dynamism, so it's
// fine as a static header list here.
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
  // Vercel adds HSTS automatically, but setting it here too means it still
  // applies if this ever gets deployed somewhere else.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

module.exports = {
  reactStrictMode: true,
  // Stops the app from advertising "X-Powered-By: Next.js" on every
  // response - low-severity on its own, but it's free reconnaissance for
  // an attacker and costs nothing to turn off.
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
