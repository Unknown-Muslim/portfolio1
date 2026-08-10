import { NextRequest, NextResponse } from 'next/server';

// Proper nonce-based CSP instead of 'unsafe-inline' for scripts.
//
// What broke last time: Next.js's App Router bootstraps hydration with
// small inline <script> tags it injects into the HTML itself (the RSC
// payload push scripts). A CSP with script-src 'self' and no 'unsafe-inline'
// and no nonce blocks those scripts outright - the browser refuses to run
// them, so React never hydrates, and every 'use client' component (Intro,
// ProcessStack, WorkCarousel, the FAQ accordion, all of it) never attaches
// its behaviour. The DOM that shipped from the server just sits there,
// unstyled by JS, never interactive.
//
// The fix isn't to loosen the policy to 'unsafe-inline' (that defeats most
// of the point of having a script CSP at all) - it's to generate a random
// nonce per request, allow only scripts carrying that exact nonce, and let
// Next.js automatically apply it to its own inline scripts. 'strict-dynamic'
// lets those nonce'd scripts load further chunks (Next.js's code-splitting)
// without having to individually allowlist every chunk URL.
//
// Second CSP bug (dev-mode only): three.js/Draco use WebAssembly to decode
// the compressed GLB geometry (`WebAssembly.instantiate`). Compiling WASM
// counts as "eval" under CSP's script-src, so without 'wasm-unsafe-eval' the
// browser refuses to compile it and the whole book scene silently fails to
// render. React's dev-mode debugging tools (Fast Refresh, component stack
// reconstruction) additionally call plain eval() - production React never
// does this, so 'unsafe-eval' itself is only added outside production,
// keeping the production policy exactly as tight as before.
const isDev = process.env.NODE_ENV === 'development';

export function proxy(request: NextRequest) {
  // crypto.randomUUID() directly, not wrapped in Buffer/base64 - Buffer
  // isn't guaranteed available in the Edge Runtime middleware runs on, and
  // a UUID string is already unique/random enough to serve as a nonce on
  // its own without needing encoding.
  const nonce = crypto.randomUUID();

  const scriptSrc = [
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'wasm-unsafe-eval'`,
    isDev ? `'unsafe-eval'` : '',
  ].filter(Boolean).join(' ');

  const csp = `
    default-src 'self';
    ${scriptSrc};
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: blob: https://picsum.photos;
    font-src 'self' data:;
    connect-src 'self' https://formspree.io${isDev ? ' ws://localhost:* http://localhost:*' : ''};
    form-action 'self' https://formspree.io;
    frame-ancestors 'none';
    base-uri 'self';
    object-src 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set('Content-Security-Policy', csp);

  return response;
}

export const config = {
  matcher: [
    // Run on everything except static assets and image optimisation, which
    // don't need a CSP header and don't benefit from the nonce.
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
